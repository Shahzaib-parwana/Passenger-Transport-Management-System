from django.db import models
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
from users.models import CompanyDetail ,Vehicle 
from django.db import models
from django.utils import timezone
import uuid
class UUIDModel(models.Model):
    """
    Abstract base class providing a UUID primary key.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True

class TimeStampedModel(models.Model):
    """
    Abstract base class providing created_at and updated_at fields.
    """
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

User = settings.AUTH_USER_MODEL

# --- Core Booking Model ---

class Booking(UUIDModel, TimeStampedModel):
    """
    Represents the reservation and state of a customer's requested trip.
    This model focuses on the product/service being reserved.
    """
    # Booking Statuses (for reservation/seat holding)
    PENDING = "PENDING"      
    RESERVED = "RESERVED"     
    CONFIRMED = "CONFIRMED"  
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"      
    FAILED = "FAILED"
    
    BOOKING_STATUS_CHOICES = [
        (PENDING, "Pending"),
        (RESERVED, "Reserved"),
        (CONFIRMED, "Confirmed"),
        (CANCELLED, "Cancelled"),
        (EXPIRED, "Expired"),
        (FAILED, "Failed"),
    ]
    # passenger or user details
    user = models.ForeignKey(User, related_name="bookings", on_delete=models.CASCADE, 
                             help_text="The customer who placed the booking.")
    passenger_name = models.CharField(max_length=100, null=True, blank=True)
    passenger_email = models.EmailField(null=True, blank=True)
    passenger_cnic = models.CharField(max_length=13, null=True, blank=True)
    passenger_phone = models.CharField(max_length=12, null=True, blank=True)
    # trip detail 
    from_location = models.CharField(max_length=255, null=True,blank=True, help_text="Starting point of the journey.")
    to_location = models.CharField(max_length=255, null=True,blank=True,help_text="Destination point of the journey.")
    arrival_date = models.DateField(null=True, blank=True,help_text="Scheduled date of arrival/trip start.")
    arrival_time = models.TimeField(null=True,blank=True, help_text="Scheduled time of arrival/trip start.")
    # rate_per_km = models.DecimalField(max_digits=8, decimal_places=2, help_text="Snapshot of rate at booking time.")
    
    company = models.ForeignKey(CompanyDetail, related_name="bookings", on_delete=models.PROTECT)
    vehicle = models.ForeignKey(Vehicle, related_name="bookings", on_delete=models.PROTECT, 
                                help_text="Typo corrected from 'vachiel'") # Field name corrected

    # Service Details
    is_full_vehicle = models.BooleanField(default=False, help_text="True if the entire vehicle is booked.")
    seats_booked = models.PositiveIntegerField(default=0, help_text="Number of seats booked (if not full vehicle).")
    seat_numbers =models.JSONField(default=list , blank=True)
    # Financial Details
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    currency = models.CharField(max_length=5, default="USD", help_text="ISO 4217 currency code.") 

    # Status
    booking_status = models.CharField(max_length=20, choices=BOOKING_STATUS_CHOICES, default=PENDING)
    
    # Hold Management
    hold_expires_at = models.DateTimeField(blank=True, null=True, 
                                           help_text="Time the reservation is held until payment/confirmation.")
    notes = models.TextField(blank=True, null=True)
    

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "Bookings"

    def is_hold_active(self):
        """Checks if the temporary reservation hold is still valid."""
        return self.hold_expires_at and (timezone.now() < self.hold_expires_at)


# --- Dedicated Payment Model ---

class Payment(UUIDModel, TimeStampedModel):
    """
    Records a successful or attempted monetary payment against a Booking.
    Decouples payment *method/status* from the core Booking state.
    """
    CASH = "CASH"
    MANUAL = "MANUAL"

    PAYMENT_METHOD_CHOICES = [
        (CASH, "Cash"),
        (MANUAL, "Manual"),
    ]

    UNPAID = "UNPAID"
    PAID = "PAID"
    REFUNDED = "REFUNDED"
    
    PAYMENT_STATUS_CHOICES = [
        (UNPAID, "Unpaid"),
        (PAID, "Paid"),
        (REFUNDED, "Refunded"),
    ]
    
    # Relationships
    booking = models.OneToOneField(Booking, related_name="payment_record", on_delete=models.PROTECT,
                                   help_text="One-to-one link to the booking this payment satisfies.")
    
    # Details
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=5, default="USD")

    method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default=UNPAID)

    # Provider/Cash Specific Fields
    provider_intent_id = models.CharField(max_length=255, blank=True, null=True, 
                                          help_text="Stripe Payment Intent ID or similar external ID.")
    provider_charge_id = models.CharField(max_length=255, blank=True, null=True, 
                                          help_text="Final charge/transaction ID.")
    
    # For cash payments verified internally
    confirmed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                     related_name='cash_confirmations', 
                                     help_text="Staff user who confirmed cash receipt.")
    
    screenshot = models.ImageField(
                upload_to="payment_screenshots/",null=True,blank=True,
                help_text="User uploaded payment screenshot for manual verification.")

    class Meta:
        verbose_name_plural = "Payments"
        
# --- Financial Audit Trail ---

class Transaction(UUIDModel, TimeStampedModel):
    """
    Records every single money movement (charge, refund, fee, cash confirmation)
    for detailed financial history and reconciliation.
    """
    TYPE_PAYMENT = "PAYMENT"
    TYPE_REFUND = "REFUND"
    TYPE_ADJUSTMENT = "ADJUSTMENT"
    
    TRANSACTION_TYPES = [
        (TYPE_PAYMENT, "Payment"),
        (TYPE_REFUND, "Refund"),
        (TYPE_ADJUSTMENT, "Adjustment"),
    ]

    # Statuses
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    PENDING = "PENDING"
    
    STATUS_CHOICES = [
        (SUCCESS, "Success"),
        (FAILED, "Failed"),
        (PENDING, "Pending"),
    ]
    
    # Relationships
    booking = models.ForeignKey(Booking, related_name="transactions", on_delete=models.CASCADE)
    payment_record = models.ForeignKey(Payment, related_name="related_transactions", on_delete=models.SET_NULL, null=True, blank=True,
                                       help_text="Link to the main Payment record, if applicable.")
    
    # Details
    amount = models.DecimalField(max_digits=10, decimal_places=2, help_text="Positive for payment, negative for refund.")
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPES)
    provider = models.CharField(max_length=50, help_text='e.g., "Stripe", "Cash", "Admin"')
    provider_txn_id = models.CharField(max_length=255, blank=True, null=True, 
                                       help_text="The external ID specific to the provider (e.g., Stripe Charge ID).")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)
    
    processed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                     related_name='processed_transactions',
                                     help_text="Staff user who initiated/confirmed the transaction.")
    meta = models.JSONField(default=dict, blank=True, help_text="Store raw response data from the provider.")
    def __str__(self):
        return f"{self.transaction_type} - {self.amount} ({self.status})"


# --- Concurrency Management ---

class SeatHold(UUIDModel, TimeStampedModel): 
    """
    Temporary lock on seats to prevent double-booking before payment finalizes.
    Linked to the Booking for easy cleanup/resolution.
    """
    booking = models.OneToOneField(Booking, related_name="seat_hold", on_delete=models.CASCADE)
    reserved_seats = models.PositiveIntegerField(default=0)
    expires_at = models.DateTimeField(help_text="The absolute time this hold must be released.")

    def is_expired(self):
        """Checks if the seat hold has passed its expiry time."""
        return timezone.now() >= self.expires_at