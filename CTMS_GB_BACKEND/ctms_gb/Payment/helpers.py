# payments/helpers.py

from django.db import transaction
from .models import Booking, Payment, Transaction, SeatHold
# Assuming your ticket generation helper is available here
from .webhook import generate_ticket_for_booking 

def finalize_booking_and_log(payment, confirmer_user=None):
    """
    Unified function to finalize a payment, confirm the booking, 
    generate the ticket, log the transaction, and clear the seat hold.
    
    Args:
        payment (Payment): The Payment object being confirmed.
        confirmer_user (User): The user who confirmed the payment (only for Cash).
    
    Returns:
        Booking: The fully confirmed booking object.
    """
    booking = payment.booking
    
    # Use atomic block for safety
    with transaction.atomic():
        # 1. Update Payment Record
        if payment.status != Payment.PAID:
            payment.status = Payment.PAID
            if confirmer_user:
                payment.confirmed_by = confirmer_user # Only set for cash
            payment.save()

        # 2. Update Booking Status & Generate Ticket
        booking.booking_status = Booking.CONFIRMED
        
        # Generate ticket
        generate_ticket_for_booking(booking, payment) 
        
        booking.save()

        # 3. Create Transaction Log
        Transaction.objects.create(
            booking=booking,
            payment_record=payment,
            amount=payment.amount_paid,
            transaction_type=Transaction.TYPE_PAYMENT,
            provider=payment.method,
            status=Transaction.SUCCESS,
            processed_by=confirmer_user, # Will be None for Stripe webhook
            provider_txn_id=payment.provider_charge_id or payment.provider_intent_id,
        )

        # 4. Remove Concurrency Lock
        SeatHold.objects.filter(booking=booking).delete()
        
    return booking