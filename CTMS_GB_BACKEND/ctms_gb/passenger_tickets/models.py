# passenger_tickets/models.py
import uuid
from django.db import models
from transport.models import Transport
from Payment.models import Booking
from django.conf import settings  # import add karo

class Ticket(models.Model):
    STATUS_CHOICES = [
        ("Booked", "Booked"),
        ("Reserved", "Reserved"),
        ("Cancelled", "Cancelled"),
        ("Completed", "Completed"),
    ]
    UNPAID = "UNPAID"
    PAID = "PAID"
    REFUNDED = "REFUNDED"
    
    PAYMENT_STATUS_CHOICES = [
        (UNPAID, "Unpaid"),
        (PAID, "Paid"),
        (REFUNDED, "Refunded"),
    ]
    FULLVEHICLE = "FULLVEHICLE"
    SEATBOOKING = "SEATBOOKING"
    ticket_choices = [
        (FULLVEHICLE, "FULLVEHICLE"),
        (SEATBOOKING, "SEATBOOKING")
    ]

    booking = models.OneToOneField(
        Booking, on_delete=models.CASCADE, related_name="ticket", null=True, blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tickets",
        null=True,
        blank=True
    )
    passenger_name = models.CharField(max_length=100)
    passenger_cnic = models.CharField(max_length=20)
    passenger_contact = models.CharField(max_length=20)
    passenger_email = models.EmailField()
    seats = models.JSONField(default=list, null=True,blank=True)

    transport_company = models.CharField(max_length=100)
    vehicle_number = models.CharField(max_length=50)
    driver_name = models.CharField(max_length=100)
    driver_contect = models.CharField(max_length=50 ,null = True,blank=True )
    route_from = models.CharField(max_length=100)
    route_to = models.CharField(max_length=100)
    arrival_date = models.DateField()
    arrival_time = models.TimeField()
    price_per_seat = models.DecimalField(max_digits=10, decimal_places=2, null=True,blank=True)

    payment_type = models.CharField(max_length=50)
    ticket_type = models.CharField(max_length=50, choices=ticket_choices,null=True,blank=True)

    # 👇 new field
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Booked"
    )
    payment_status = models.CharField(
            max_length=20,
            choices=PAYMENT_STATUS_CHOICES,
            default=UNPAID
        )

    created_at = models.DateTimeField(auto_now_add=True)
    transport = models.ForeignKey(
        Transport, on_delete=models.CASCADE, related_name="tickets", null=True, blank=True
    )

    def __str__(self):
        booking_id = self.booking.id if self.booking else "NoBooking"
        return f"Ticket {booking_id} - {self.passenger_name}"

