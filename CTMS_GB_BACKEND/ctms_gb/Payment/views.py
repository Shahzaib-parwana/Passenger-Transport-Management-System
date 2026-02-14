from decimal import Decimal
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import Booking, Payment
from users.models import Vehicle, CompanyDetail, Driver
from passenger_tickets.models import Ticket
from transport.models import Transport  # import Transport model
from .serializers import BookingSerializer
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .serializers import BookingAdminListSerializer, BookingStatusUpdateSerializer
from passenger_tickets.models import Ticket
from .models import Transaction
from datetime import datetime, timedelta



# 🔄 NEW CONSOLIDATED CLASS: Handles both GET (List/Filter) and POST (Create)
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from decimal import Decimal

from .models import Booking, Vehicle, Payment, CompanyDetail
from transport.models import Transport
from passenger_tickets.models import Ticket
from .serializers import BookingSerializer


class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    # permission_classes = [permissions.IsAuthenticated]


    def get_permissions(self):
        """
        GET method: AllowAny (no authentication required)
        POST method: IsAuthenticated (authentication required)
        """
        if self.request.method == 'GET':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    # =====================================================
    # GET → FETCH BOOKED SEATS (VEHICLE + DATE + TIME)
    # =====================================================
    def get_queryset(self):
        vehicle_id = self.request.query_params.get("vehicle_id")
        arrival_date = self.request.query_params.get("arrival_date")
        arrival_time = self.request.query_params.get("arrival_time")

        if not (vehicle_id and arrival_date and arrival_time):
            return Booking.objects.none()

        return Booking.objects.filter(
            vehicle_id=vehicle_id,
            arrival_date=arrival_date,
            arrival_time=arrival_time,
            booking_status__in=[Booking.RESERVED, Booking.CONFIRMED]
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        booked_seats = set()

        for booking in queryset:
            if isinstance(booking.seat_numbers, list):
                booked_seats.update(booking.seat_numbers)

        return Response(list(booked_seats), status=status.HTTP_200_OK)

    # =====================================================
    # POST → CREATE BOOKING + AUTO TICKET + PAYMENT SCREENSHOT
    # =====================================================
    def create(self, request, *args, **kwargs):
        data = request.data

        vehicle_id = data.get("vehicle_id")
        company_id = data.get("company_id")
        arrival_date = data.get("arrival_date")
        arrival_time = data.get("arrival_time")

        if not all([vehicle_id, company_id, arrival_date, arrival_time]):
            return Response({"detail": "Missing required fields"}, status=400)

        seat_numbers = data.get("seat_numbers", [])
        if hasattr(request.data, "getlist"):
            seat_numbers = request.data.getlist("seat_numbers")

        try:
            seat_numbers = [int(s) for s in seat_numbers]
        except:
            return Response({"detail": "Invalid seat numbers"}, status=400)

        if not seat_numbers:
            return Response({"detail": "No seats selected"}, status=400)

        total_amount = Decimal(str(data.get("total_amount", 0)))

        vehicle = get_object_or_404(Vehicle, id=vehicle_id)
        company = get_object_or_404(CompanyDetail, id=company_id)

        with transaction.atomic():
            # ================= ATOMIC SEAT LOCK =================
            existing = Booking.objects.select_for_update().filter(
                vehicle=vehicle,
                arrival_date=arrival_date,
                arrival_time=arrival_time,
                booking_status__in=[Booking.RESERVED, Booking.CONFIRMED]
            )

            already_taken = []
            for b in existing:
                if isinstance(b.seat_numbers, list):
                    already_taken += b.seat_numbers

            conflict = set(already_taken).intersection(seat_numbers)
            if conflict:
                return Response(
                    {"detail": "Seats already booked", "seats": list(conflict)},
                    status=409
                )
            

            # ================= CREATE BOOKING =================
            booking = Booking.objects.create(
                user=request.user,
                vehicle=vehicle,
                company=company,
                passenger_name=data.get("passenger_name"),
                passenger_email=data.get("passenger_email"),
                passenger_cnic=data.get("passenger_cnic"),
                passenger_phone=data.get("passenger_phone"),
                seat_numbers=seat_numbers,
                seats_booked=len(seat_numbers),
                total_amount=total_amount,
                currency="PKR",
                arrival_date=arrival_date,
                arrival_time=arrival_time,
                from_location=data.get("from_location"),
                to_location=data.get("to_location"),
                booking_status=Booking.RESERVED,
                hold_expires_at=timezone.now() + timezone.timedelta(minutes=15),
            )

            # ================= CREATE TICKET =================
            ticket = Ticket.objects.create(
                booking=booking,
                user=request.user,
                passenger_name=booking.passenger_name,
                passenger_cnic=booking.passenger_cnic,
                passenger_contact=booking.passenger_phone,
                passenger_email=booking.passenger_email,
                seats=seat_numbers,
                transport_company=company.company_name,
                vehicle_number=vehicle.vehicle_number,
                driver_name=vehicle.driver_name if hasattr(vehicle, 'driver_name') else "N/A",
                route_from=data.get("from_location"),
                route_to=data.get("to_location"),
                arrival_date=arrival_date,
                arrival_time=arrival_time,
                price_per_seat=total_amount / len(seat_numbers),
                payment_type=data.get("method", "Cash"),
                status="Reserved",
            )

            # ================= PAYMENT =================
            payment = Payment.objects.create(
                booking=booking,
                amount_paid=0,
                currency="PKR",
                method=data.get("method", "Cash"),
                status=Payment.UNPAID,
            )

            # Handle manual payment screenshot if exists
            if "screenshot" in data and data["screenshot"]:
                payment.screenshot = data["screenshot"]  # FileField / InMemoryUploadedFile
                payment.save()

            # ================= RESPONSE =================
            serializer = BookingSerializer(booking)
            response = serializer.data
            response["ticket_id"] = ticket.id

            return Response(response, status=status.HTTP_201_CREATED)



# __________________________________________________________________________________
#                               FULLL VEHICLE BOOKING VIEW SET
# _________________________________________________________________________________
# chackout/views.py
class FullVehicleBookingViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        data = request.data
        user = request.user

        print("📦 Full Vehicle Booking Request Data:", data)

        # ------------------
        # ✅ VALIDATION
        # ------------------
        required_fields = [
            "vehicle_id", "company_id", "arrival_date", "arrival_time",
            "passenger_name", "passenger_phone", "total_amount",
            "driver_name", "driver_contact"
        ]

        for field in required_fields:
            if field not in data:
                return Response(
                    {"detail": f"Required field '{field}' is missing in the payload."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        try:
            total_amount = Decimal(str(data.get("total_amount")))
        except Exception:
            return Response({"detail": "Invalid total_amount format."}, status=status.HTTP_400_BAD_REQUEST)

        # ------------------
        # ✅ FETCH OBJECTS
        # ------------------
        vehicle = get_object_or_404(Vehicle, pk=data["vehicle_id"])
        company = get_object_or_404(CompanyDetail, pk=data["company_id"])
        
        driver_name_payload = data.get("driver_name", "N/A")
        driver_contact_payload = data.get("driver_contact", "N/A")
        
        payment_method = data.get("payment_method", Payment.CASH)
        
        valid_payment_methods = [Payment.CASH, Payment.MANUAL]
        if payment_method not in valid_payment_methods:
            payment_method = Payment.CASH
            
        screenshot = data.get("screenshot", None)
        transaction_id = data.get("transaction_id", "")
        
        # ------------------
        # ✅ CALCULATE HOLD_EXPIRES_AT (FULL VEHICLE BOOKING)
        # ------------------
        try:
            arrival_datetime_str = f"{data.get('arrival_date')} {data.get('arrival_time')}"
            arrival_datetime = datetime.strptime(arrival_datetime_str, "%Y-%m-%d %H:%M") 
            duration_type = data.get("duration_type", "hourly")
            duration_value = int(data.get("duration_value", 1))
            
            if duration_type == "hourly":
                delta = timedelta(hours=duration_value)
            elif duration_type == "daily":
                delta = timedelta(days=duration_value)
            elif duration_type == "weekly":
                delta = timedelta(weeks=duration_value)
            else:
                delta = timedelta(minutes=30)
            hold_expires_at = arrival_datetime + delta
            hold_expires_at = timezone.make_aware(hold_expires_at)
            
        except Exception as e:
            print(f"❌ Error calculating hold_expires_at: {str(e)}")
            hold_expires_at = timezone.now() + timezone.timedelta(minutes=30)

        # ------------------
        # ✅ CREATE BOOKING
        # ------------------
        try:
            with transaction.atomic():
                booking = Booking.objects.create(
                    user=user,
                    passenger_name=data.get("passenger_name"),
                    passenger_email=data.get("passenger_email", ""),
                    passenger_cnic=data.get("passenger_cnic", ""),
                    passenger_phone=data.get("passenger_phone"),
                    from_location=data.get("from_location", ""),
                    to_location=data.get("to_location", ""),
                    arrival_date=data.get("arrival_date"),
                    arrival_time=data.get("arrival_time"),
                    company=company,
                    vehicle=vehicle,
                    is_full_vehicle=True,
                    seats_booked=0,
                    seat_numbers=[],  # No seats for full vehicle
                    total_amount=total_amount,
                    currency=data.get("currency", "PKR"),
                    booking_status=Booking.RESERVED,
                    hold_expires_at=hold_expires_at,  # UPDATED: arrival + duration
                    notes="Full vehicle booking",
                )

                print(f"✅ Booking Created: {booking.id}")

                # ------------------
                # ✅ CREATE PAYMENT
                # ------------------
                payment_data = {
                    'booking': booking,
                    'amount_paid': total_amount if payment_method == Payment.MANUAL else Decimal("0.00"),
                    'currency': booking.currency,
                    'method': payment_method,
                    'status': Payment.UNPAID,
                }
                
                if transaction_id:
                    payment_data['meta'] = {'transaction_id': transaction_id}
                    
                payment = Payment.objects.create(**payment_data)
                
                print(f"✅ Payment Created: {payment.id}, Method: {payment.method}")

                # Handle screenshot if provided
                if screenshot and payment_method == Payment.MANUAL:
                    try:
                        import base64
                        from django.core.files.base import ContentFile
                        
                        print("🔄 Processing screenshot...")
                        
                        if isinstance(screenshot, str) and ',' in screenshot:
                            format, imgstr = screenshot.split(';base64,')
                            ext = format.split('/')[-1]
                            
                            filename = f"payment_{booking.id}_{transaction_id or 'proof'}.{ext}"
                            
                            data = base64.b64decode(imgstr)
                            payment.screenshot.save(
                                filename,
                                ContentFile(data),
                                save=True
                            )
                            
                            print(f"✅ Screenshot saved: {payment.screenshot.url if payment.screenshot else 'No URL'}")
                        else:
                            print("⚠️ Screenshot is not in expected base64 format")
                    except Exception as e:
                        print(f"❌ Error saving screenshot: {str(e)}")

                # ------------------
                # ✅ CREATE TRANSACTION
                # ------------------
                Transaction.objects.create(
                    booking=booking,
                    payment_record=payment,
                    amount=total_amount,
                    transaction_type=Transaction.TYPE_PAYMENT,
                    provider="Cash" if payment_method == Payment.CASH else "Manual",
                    status=Transaction.PENDING,
                    processed_by=user,
                    meta={
                        'info': f'{payment_method} payment - {transaction_id}' if transaction_id else f'{payment_method} payment',
                        'transaction_id': transaction_id
                    },
                )
                
                print("✅ Transaction Created")

                # ------------------
                # ✅ CREATE TICKET
                # ------------------
                try:
                    transport_obj = Transport.objects.filter(vehicle=vehicle).first()
                    
                    if payment_method == Payment.CASH:
                        ticket_payment_type = "Cash"
                    elif payment_method == Payment.MANUAL:
                        ticket_payment_type = "Manual"
                    else:
                        ticket_payment_type = "Cash"
                    
                    ticket = Ticket.objects.create(
                        booking=booking,
                        user=user,
                        passenger_name=data.get("passenger_name"),
                        passenger_cnic=data.get("passenger_cnic", ""),
                        passenger_contact=data.get("passenger_phone"),
                        passenger_email=data.get("passenger_email", ""),
                        seats=[],
                        transport_company=data.get("company_name", company.company_name),
                        vehicle_number=vehicle.vehicle_number,
                        driver_name=driver_name_payload,
                        driver_contect=driver_contact_payload,
                        route_from=data.get("from_location", ""),
                        route_to=data.get("to_location", ""),
                        arrival_date=data.get("arrival_date"),
                        arrival_time=data.get("arrival_time"),
                        price_per_seat=total_amount,
                        payment_type=ticket_payment_type,
                        ticket_type=Ticket.FULLVEHICLE,
                        status="Reserved",
                        payment_status="UNPAID",
                        transport=transport_obj,
                    )
                    
                    print(f"✅ Ticket Created: {ticket.id}")
                    
                except Exception as e:
                    print(f"⚠️ Ticket creation error: {str(e)}")

                return Response(
                    {
                        "detail": "Full vehicle booking created successfully.",
                        "booking_id": str(booking.id),
                        "payment_id": str(payment.id),
                        "payment_method": payment.method,
                        "payment_status": payment.status,
                        "screenshot_saved": bool(payment.screenshot),
                        "ticket_created": True,
                        "hold_expires_at": hold_expires_at,
                    },
                    status=status.HTTP_201_CREATED
                )
            
        except Exception as e:
            print(f"❌ Booking creation error: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            
            return Response(
                {"detail": "An error occurred during booking creation.", "error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# --- NEW ADMIN MANAGEMENT VIEWSET ---
class BookingManagementViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Handles listing of all bookings for admin dashboard and status updates.
    Endpoint: /api/admin/bookings/
    """
    # Eagerly load related data for efficiency
    queryset = Booking.objects.select_related('vehicle', 'payment_record').all()
    serializer_class = BookingAdminListSerializer
    permission_classes = [permissions.IsAuthenticated] # Add IsAdminUser or IsStaff permission

    # Override list to allow simple list display
    def list(self, request, *args, **kwargs):
        user = request.user

        if user.role == "company":
            company_detail = user.company_detail
            queryset = self.get_queryset().filter(company=company_detail)
        else:
            # If a passenger tries to access -> return empty list or error
            return Response({"error": "Only company users can access this data."}, status=403)

        queryset = self.filter_queryset(queryset)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    @action(detail=True, methods=['patch'], url_path='status')


    def update_status(self, request, pk=None):
        
        # 🛑 1. AUTHENTICATION CHECK & USER RETRIEVAL
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication is required to update booking status."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        confirming_user = request.user 
        
        # 1. Fetch Booking Data
        try:
            # Booking ko uski payment_record ke saath fetch karein
            booking = get_object_or_404(
                Booking.objects.select_related('payment_record').prefetch_related('ticket'), # 🛑 ADD: prefetch ticket
                pk=pk
            )
        except Exception:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        # 1. Validate incoming data (Frontend se aaya hua data)
        serializer = BookingStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_booking_status = serializer.validated_data.get('booking_status')
        new_payment_status = serializer.validated_data.get('new_payment_status')

        try:
            with transaction.atomic():
                
                # --- 2. Update Booking Status (BOOKING MODEL) ---
                # ... [existing booking status update logic] ...
                if new_booking_status and new_booking_status != booking.booking_status:
                    booking.booking_status = new_booking_status
                    booking.save(update_fields=['booking_status', 'updated_at'])

                # --- 3. Update or Create Payment Status and Financials (PAYMENT MODEL) ---
                
                # ... [existing payment object retrieval/creation logic] ...
                try:
                    payment = Payment.objects.select_for_update().get(booking=booking)
                except Payment.DoesNotExist:
                    # Agar Payment record nahi hai, toh naya banayein
                    payment = Payment.objects.create(
                        booking=booking,
                        amount_paid=Decimal("0.00"), 
                        currency=booking.currency,
                        method=Payment.CASH, 
                        status=Payment.UNPAID
                    )

                # ... [existing payment status update and status-specific logic for PAID/UNPAID/REFUNDED] ...
                fields_to_update = ['status', 'updated_at']
                payment.status = new_payment_status
                
                if new_payment_status == payment.PAID:
                    # 🚀 Jab payment PAID ho: CONFIRMATION LOGIC
                    
                    # 3.1: total_amount ko amount_paid mein set karein
                    if payment.amount_paid != booking.total_amount:
                        payment.amount_paid = booking.total_amount
                        fields_to_update.append('amount_paid')
                    
                    # 3.2: Payment method set karein (agar set nahi hai)
                    if not payment.method:
                        payment.method = Payment.CASH
                        fields_to_update.append('method')
                    
                    # 🛑 3.3: confirmed_by mein Company Admin ko save karein
                    if payment.method == payment.CASH:
                        current_confirmed_by_pk = payment.confirmed_by.pk if payment.confirmed_by else None
                        
                        # Save karein agar confirmed_by field empty hai YA agar woh user nahi hai
                        if current_confirmed_by_pk is None or current_confirmed_by_pk != confirming_user.pk: 
                            payment.confirmed_by = confirming_user 
                            fields_to_update.append('confirmed_by') 
                
                elif new_payment_status == payment.UNPAID or new_payment_status == payment.REFUNDED:
                    # ⏪ Jab payment UNPAID ya REFUNDED ho: RESET LOGIC
                    
                    amount_changed = payment.amount_paid is not None and payment.amount_paid > Decimal("0.00")
                    confirmed_by_changed = payment.confirmed_by is not None
                    
                    # Amount ko 0.00 par reset karein
                    if amount_changed:
                        payment.amount_paid = Decimal("0.00") 
                        fields_to_update.append('amount_paid')
                    
                    # confirmed_by ko None (NULL) karein
                    if confirmed_by_changed:
                        payment.confirmed_by = None
                        fields_to_update.append('confirmed_by') 
                
                payment.save(update_fields=fields_to_update)
                # ------------------------------------------------------------------------

                # --- 4. Update Ticket Status (TICKET MODEL) --- 🛑 NEW STEP
                # Ticket model ko fetch karein using the OneToOneField relationship
                try:
                    ticket = booking.ticket # booking object se related ticket fetch karein
                    
                    # 4.1: Booking Status ko Ticket Status mein map karein
                    # Assuming a mapping: CONFIRMED -> Booked, CANCELLED -> Cancelled, etc.
                    # Note: You should confirm the exact mapping logic based on your business rules.
                    if new_booking_status == 'CONFIRMED':
                        new_ticket_status = 'Booked' # Or 'Completed' if the journey is done
                    elif new_booking_status == 'CANCELLED':
                        new_ticket_status = 'Cancelled'
                    elif new_booking_status == 'RESERVED':
                        new_ticket_status = 'Reserved'
                    else:
                        # Fallback or other status mapping (e.g., PENDING -> Reserved)
                        new_ticket_status = 'Reserved'

                    # 4.2: Payment Status ko Ticket Payment Status mein map karein
                    # The Payment model's statuses (PAID, UNPAID, REFUNDED) directly match the Ticket model's statuses
                    new_ticket_payment_status = new_payment_status

                    # 4.3: Agar status change hua hai, toh Ticket ko update karein
                    ticket_fields_to_update = []
                    if ticket.status != new_ticket_status:
                        ticket.status = new_ticket_status
                        ticket_fields_to_update.append('status')

                    if ticket.payment_status != new_ticket_payment_status:
                        ticket.payment_status = new_ticket_payment_status
                        ticket_fields_to_update.append('payment_status')

                    if ticket_fields_to_update:
                        ticket.save(update_fields=ticket_fields_to_update)
                        
                except Ticket.DoesNotExist:
                    # Agar kisi wajah se Ticket record nahi mila, toh skip karein ya error log karein
                    # Since Booking has a OneToOne relationship with Ticket, it should ideally exist.
                    pass
                # ------------------------------------------------------------------------

                # 5. Return the updated data 🛑 RE-INDEXED
                response_booking = Booking.objects.select_related('payment_record', 'ticket').get(pk=booking.pk) # 🛑 ADD: include ticket in select_related
                response_serializer = BookingAdminListSerializer(response_booking)
                return Response(response_serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            # Debugging ke liye server console mein error dekhein
            return Response(
                {"detail": f"Update failed due to a server error: {type(e).__name__} - {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )      
            


from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from decimal import Decimal
from .models import Booking, Payment
from passenger_tickets.models import Ticket  # Add this import
from .serializers import BookingAdminListSerializer, BookingStatusUpdateSerializer


class ManualPaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Lists only MANUAL payment bookings and allows updating booking + payment status.
    Endpoint: /api/admin/manual-bookings/
    """
    serializer_class = BookingAdminListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # Check if user has company_detail attribute
        if not hasattr(user, 'company_detail') and user.role == "company":
            return Booking.objects.none()

        # Base queryset: filter bookings where related payment has method="MANUAL"
        qs = Booking.objects.select_related(
            "vehicle", "payment_record", "company"
        ).filter(payment_record__method=Payment.MANUAL)

        # Company user → only its own data
        if user.role == "company":
            return qs.filter(company=user.company_detail)

        # Admin user can see all
        if user.is_staff or user.is_superuser:
            return qs

        # Passenger not allowed
        return Booking.objects.none()

    def get_serializer_context(self):
        """Add request to serializer context for building absolute URLs"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    # -------- STATUS UPDATE ACTION -------- #
    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        # Authentication check
        if not request.user.is_authenticated:
            return Response({"detail": "Authentication required."}, status=401)

        confirming_user = request.user

        # Fetch booking
        try:
            booking = Booking.objects.select_related(
                "payment_record", "vehicle", "company"
            ).prefetch_related("ticket").get(pk=pk)
            
            # Check if payment record exists and is MANUAL
            if not hasattr(booking, 'payment_record') or booking.payment_record.method != Payment.MANUAL:
                return Response({"detail": "This booking is not a MANUAL payment booking."}, status=403)
                
            # Check permissions
            if confirming_user.role == "company" and booking.company != confirming_user.company_detail:
                return Response({"detail": "You don't have permission to update this booking."}, status=403)
                
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found."}, status=404)

        # Validate incoming data
        serializer = BookingStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_booking_status = serializer.validated_data.get("booking_status")
        new_payment_status = serializer.validated_data.get("new_payment_status")

        try:
            with transaction.atomic():
                # --- UPDATE BOOKING STATUS ---
                if new_booking_status and new_booking_status != booking.booking_status:
                    booking.booking_status = new_booking_status
                    booking.save(update_fields=["booking_status", "updated_at"])

                # --- UPDATE PAYMENT RECORD ---
                # Get or create payment record
                payment, created = Payment.objects.get_or_create(
                    booking=booking,
                    defaults={
                        'amount_paid': Decimal("0.00"),
                        'currency': booking.currency,
                        'method': Payment.MANUAL,
                        'status': Payment.UNPAID
                    }
                )
                
                # If payment was just created, we need to fetch it with select_for_update
                if not created:
                    payment = Payment.objects.select_for_update().get(booking=booking)
                
                fields_to_update = ["status", "updated_at"]
                payment.status = new_payment_status

                if new_payment_status == Payment.PAID:
                    # Set amount_paid to total_amount if paid
                    if payment.amount_paid != booking.total_amount:
                        payment.amount_paid = booking.total_amount
                        fields_to_update.append("amount_paid")

                    # Ensure method is MANUAL
                    if not payment.method:
                        payment.method = Payment.MANUAL
                        fields_to_update.append("method")

                    # Set confirmed_by
                    if not payment.confirmed_by or payment.confirmed_by.pk != confirming_user.pk:
                        payment.confirmed_by = confirming_user
                        fields_to_update.append("confirmed_by")

                elif new_payment_status in [Payment.UNPAID, Payment.REFUNDED]:
                    # Reset amount if unpaid or refunded
                    if payment.amount_paid > Decimal("0.00"):
                        payment.amount_paid = Decimal("0.00")
                        fields_to_update.append("amount_paid")

                    # Clear confirmed_by
                    if payment.confirmed_by:
                        payment.confirmed_by = None
                        fields_to_update.append("confirmed_by")

                payment.save(update_fields=fields_to_update)

                # -------- UPDATE TICKET -------- #
                try:
                    ticket = booking.ticket
                    # Map booking status to ticket status
                    if new_booking_status == "CONFIRMED":
                        ticket_status = "Booked"
                    elif new_booking_status == "CANCELLED":
                        ticket_status = "Cancelled"
                    else:
                        ticket_status = "Reserved"

                    ticket_fields = []
                    
                    # Only update if changed
                    if hasattr(ticket, 'status') and ticket.status != ticket_status:
                        ticket.status = ticket_status
                        ticket_fields.append("status")
                    
                    # Only update if payment_status field exists
                    if hasattr(ticket, 'payment_status') and ticket.payment_status != new_payment_status:
                        ticket.payment_status = new_payment_status
                        ticket_fields.append("payment_status")

                    if ticket_fields:
                        ticket.save(update_fields=ticket_fields)

                except Ticket.DoesNotExist:
                    # Ticket might not exist yet, that's okay
                    pass

                # Return updated booking with all related data
                updated = Booking.objects.select_related(
                    "payment_record", "ticket", "vehicle", "company"
                ).get(pk=booking.pk)
                
                response_serializer = BookingAdminListSerializer(updated, context={'request': request})
                return Response(response_serializer.data, status=200)

        except Exception as e:
            # Log the actual error for debugging
            import traceback
            print(f"Error in update_status: {str(e)}")
            print(traceback.format_exc())
            
            return Response(
                {"detail": f"Error: {type(e).__name__} - {str(e)}"},
                status=400
            )