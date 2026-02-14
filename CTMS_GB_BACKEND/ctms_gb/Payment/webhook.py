# chackout/webhook.py
import stripe
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.db import transaction
from .models import Booking, Payment, Transaction, SeatHold
from passenger_tickets.models import Ticket
from decimal import Decimal
import json

stripe.api_key = settings.STRIPE_SECRET_KEY
endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
    event = None

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError as e:
        # Invalid payload
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError as e:
        return HttpResponse(status=400)

    # Handle the checkout.session.completed event
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata", {})
        booking_id = metadata.get("booking_id")
        payment_id = metadata.get("payment_id")
        with transaction.atomic():
            try:
                booking = Booking.objects.select_for_update().get(pk=booking_id)
                payment = Payment.objects.select_for_update().get(pk=payment_id)
            except Booking.DoesNotExist:
                return HttpResponse(status=404)

            # Mark payment as paid
            payment.status = Payment.PAID
            # Set amount_paid reading session total_amount
            amount = session.get("amount_total")
            if amount:
                # amount is in cents/paise
                payment.amount_paid = Decimal(int(amount) / 100)
            payment.provider_charge_id = session.get("payment_intent") or session.get("id")
            payment.save()

            # Create transaction record
            Transaction.objects.create(
                booking=booking,
                payment_record=payment,
                amount=payment.amount_paid or booking.total_amount,
                transaction_type=Transaction.TYPE_PAYMENT,
                provider="Stripe",
                provider_txn_id=payment.provider_charge_id,
                status=Transaction.SUCCESS,
            )

            # Confirm booking
            booking.booking_status = Booking.CONFIRMED
            booking.hold_expires_at = None
            # Create a Ticket if you have Ticket model structure
            # ticket = Ticket.objects.create(...)
            # booking.ticket = ticket
            booking.save()

    # Handle other events (payment_intent.payment_failed, charge.refunded, etc.) as needed.
    return HttpResponse(status=200)
