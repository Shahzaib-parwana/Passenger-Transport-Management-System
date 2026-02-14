from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.conf import settings


# ============================
# Custom User
# ============================
class User(AbstractUser):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("company", "Company"),
        ("passenger", "Passenger"),
    )

    username = models.CharField(
        max_length=150,
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^[\w.@+\- ]+$',
                message="Username may contain letters, numbers, spaces, and @/./+/-/_ characters."
            )
        ]
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="passenger")
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


# ============================
# Passenger Profile (Extended)
# ============================
class PassengerProfile(models.Model):
    GENDER_CHOICES = (("male", "Male"), ("female", "Female"))
    MARITAL_STATUS = (("married", "Married"), ("unmarried", "Unmarried"))
    CURRENT_STATUS = (
        ("student", "Student"),
        ("govt_job", "Government Job"),
        ("private_job", "Private Job"),
        ("labor_former", "Labor/Former"),
        ("business_man", "Business Man"),
        ("no_job", "No Job"),
    )
    SPECIAL_PERSON = (("yes", "Yes"), ("no", "No"))

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="passenger_profile")
    cnic_or_passport = models.CharField(max_length=50)
    address = models.CharField(max_length=255, blank=True)

    # 🆕 Additional Fields
    profile_picture = models.ImageField(upload_to="passenger_profiles/", null=True, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    living_status = models.CharField(max_length=20, choices=MARITAL_STATUS, blank=True, null=True)
    current_status = models.CharField(max_length=50, choices=CURRENT_STATUS, blank=True, null=True)
    special_person = models.CharField(max_length=10, choices=SPECIAL_PERSON, blank=True, null=True)
    additional_info = models.TextField(blank=True, null=True)

    # For notifications
    notification_enabled = models.BooleanField(default=True)

    def __str__(self):
        return f"PassengerProfile: {self.user.username}"


# ============================
# Company Profile
# ============================
class CompanyProfile(models.Model):
    STATUS_CHOICES = (("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected"))

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="company_profile")
    company_name = models.CharField(max_length=150, blank=True)
    registration_id = models.CharField(max_length=100)
    contact_no = models.CharField(max_length=30)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    address = models.CharField(max_length=255, blank=True)
    license_number = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"CompanyProfile: {self.company_name} ({self.status})"


# ============================
# Company Detail
# ============================
class CompanyDetail(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="company_detail", unique=True)
    company_name = models.CharField(max_length=150)
    company_logo = models.ImageField(upload_to="company_logo/", null=True, blank=True)
    company_banner = models.ImageField(upload_to="company_banners/", null=True, blank=True)
    registration_id = models.CharField(max_length=50)
    company_email = models.EmailField(default="")
    contact_number_1 = models.CharField(max_length=20, default="")
    contact_number_2 = models.CharField(max_length=20, blank=True, null=True)

    COMPANY_TYPE_CHOICES = [
        ("offer_vehicle", "Offer Vehicle"),
        ("offer_seats", "Offer Seats"),
    ]
    company_type = models.CharField(max_length=20, choices=COMPANY_TYPE_CHOICES)
    main_office_location = models.CharField(max_length=200)
    Passenger_instruction = models.CharField(max_length=1000, null=True, blank=True)
    
    # Owner Info
    owner_name = models.CharField(max_length=150, default="")
    owner_email = models.EmailField(default="")
    owner_contact_number = models.CharField(max_length=20, default="")
    owner_cnic = models.CharField(max_length=20, default="")
    owner_address = models.TextField(default="")

    # ////////////////////////////

    # PAYMENT INFO

    PAYMENT_CHOICES = [
        ("ADVANCE", "Advance Payment Only"),
        ("CASH", "Cash Only at Counter"),
        ("BOTH", "Both Advance & Cash Payment"),
    ]
    payment_type = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default="BOTH", blank=True, null=True)

    # Easypaisa
    easypaisa_name = models.CharField(max_length=100, blank=True, null=True)
    easypaisa_number = models.CharField(max_length=20, blank=True, null=True)

    # JazzCash
    jazzcash_name = models.CharField(max_length=100, blank=True, null=True)
    jazzcash_number = models.CharField(max_length=20, blank=True, null=True)

    # Bank
    bank_name = models.CharField(max_length=100, blank=True, null=True)
    bank_account_title = models.CharField(max_length=150, blank=True, null=True)
    bank_account_number = models.CharField(max_length=50, blank=True, null=True)
    bank_iban = models.CharField(max_length=100, blank=True, null=True)

    # Agreement & Status
    agreement_accepted = models.BooleanField(default=False)
    is_submitted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.company_name


# ============================
# Routes
# ============================
class Route(models.Model):
    ROUTE_CHOICES = [
        ("Skardu", "Skardu"),
        ("Gilgit", "Gilgit"),
        ("Shigar", "Shigar"),
        ("Hunza", "Hunza"),
        ("Nagar", "Nagar"),
        ("Khaplu", "Khaplu"),
        ("Chilas", "Chilas"),
        ("Astor", "Astor"),
        ("Islamabad/Rawalpindi", "Islamabad/Rawalpindi"),
        ("Gizer", "Gizer"),
    ]
    company = models.ForeignKey(CompanyDetail, on_delete=models.CASCADE, related_name="routes")
    from_location = models.CharField(max_length=100, choices=ROUTE_CHOICES)
    to_location = models.CharField(max_length=100, choices=ROUTE_CHOICES)

    def __str__(self):
        return f"{self.from_location} → {self.to_location}"


# ============================
# Vehicles (Extended)
# ============================
class Vehicle(models.Model):
    company = models.ForeignKey(CompanyDetail, on_delete=models.CASCADE, related_name="vehicles")

    VEHICLE_TYPE_CHOICES = [
        ("bus", "Bus"),
        ("coaster", "Coaster"),
        ("car", "Car"),
        ("hiace", "Hiace"),
    ]
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES)
    vehicle_number = models.CharField(max_length=50, default=" ")
    number_of_seats = models.PositiveIntegerField(default=0)
    image = models.ImageField(upload_to="vehicles/", blank=True, null=True)
    comment = models.CharField(max_length=200, default=" ",null=True)
    vehical_rate= models.PositiveIntegerField(default=5)
    is_veical_active = models.BooleanField(default=True)

    # 🆕 Additional Fields
    features = models.JSONField(default=dict, blank=True)  
    # Example: {"AC": True, "WiFi": False, "Reclining Seats": True, "Charging Ports": True, "Free Water Bottle": True}
    details = models.TextField(blank=True, null=True)  # Vehicle Description or Notes

    def __str__(self):
        return f"{self.vehicle_type} - {self.vehicle_number}"


# ============================
# Driver
# ============================
class Driver(models.Model):
    company = models.ForeignKey(CompanyDetail, on_delete=models.CASCADE, related_name="drivers")
    driver_name = models.CharField(max_length=150)
    driver_contact_number = models.CharField(max_length=20, default="")
    driver_cnic = models.CharField(max_length=20, default="")
    driving_license_no = models.CharField(max_length=50)
    is_driver_active = models.BooleanField(default=True)
    image = models.ImageField(upload_to="drivers/", null=True, blank=True)


    def __str__(self):
        return self.driver_name


# ============================
# Passenger Reviews
# ============================
class VehicleReview(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name="reviews")
    passenger = models.ForeignKey(PassengerProfile, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField(default=5)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.passenger.user.username} ({self.rating}/5)"


# ============================
# Vehicle Choice Proxy
# ============================
class VehicleChoice(Vehicle):
    class Meta:
        proxy = True
        verbose_name = "Vehicle Choice"
        verbose_name_plural = "Vehicle Choices"


from django.db.models.signals import post_save
from django.dispatch import receiver

# ============================
# Sync: CompanyDetail → CompanyProfile
# ============================
@receiver(post_save, sender=CompanyDetail)
def sync_detail_to_profile(sender, instance, **kwargs):
    try:
        company_profile = instance.user.company_profile
        if company_profile:
            company_profile.company_name = instance.company_name
            company_profile.registration_id = instance.registration_id
            company_profile.contact_no = instance.contact_number_1
            company_profile.address = instance.main_office_location
            company_profile.save()
    except CompanyProfile.DoesNotExist:
        pass


# ============================
# Auto-create: CompanyDetail when CompanyProfile created
# ============================
@receiver(post_save, sender=CompanyProfile)
def create_detail_from_profile(sender, instance, created, **kwargs):
    if created:  # jab naya CompanyProfile banta hai
        CompanyDetail.objects.create(
            user=instance.user,
            company_name=instance.company_name,
            registration_id=instance.registration_id,
            contact_number_1=instance.contact_no,
            main_office_location=instance.address,
            is_submitted=False  # draft by default
        )
