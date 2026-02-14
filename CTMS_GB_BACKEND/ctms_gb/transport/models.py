from django.db import models
from django.utils import timezone
from users.models import CompanyDetail, Vehicle, Driver, Route


class Transport(models.Model):
    company = models.ForeignKey(
        CompanyDetail, on_delete=models.CASCADE, related_name="transports"
    )

    OFFER_CHOICES = [
        ("offer_sets", "Offer Sets"),
        ("whole_hire", "Whole Vehicle Hire"),
    ]
    offer_type = models.CharField(max_length=20, choices=OFFER_CHOICES, default="offer_sets")

    route = models.ForeignKey(
        Route, on_delete=models.SET_NULL, null=True, blank=True, related_name="transports"
    )
    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.SET_NULL, null=True, blank=True, related_name="transports"
    )
    driver = models.ForeignKey(
        Driver, on_delete=models.SET_NULL, null=True, blank=True, related_name="transports"
    )

    route_from = models.CharField(max_length=100, blank=True, null=True)
    route_to = models.CharField(max_length=100, blank=True, null=True)

    vehicle_number_snapshot = models.CharField(max_length=50, blank=True, null=True)
    vehicle_type_snapshot = models.CharField(max_length=50, blank=True, null=True)
    vehicle_seats_snapshot = models.IntegerField(blank=True, null=True)

    driver_name_snapshot = models.CharField(max_length=150, blank=True, null=True)
    driver_contact_snapshot = models.CharField(max_length=50, blank=True, null=True)

    # ✅ EXISTING Seat Booking Fields (unchanged)
    price_per_seat = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    arrival_date = models.DateField(null=True, blank=True)
    arrival_time = models.TimeField(null=True, blank=True)
    reserve_seats = models.JSONField(default=list, blank=True)

    # ✅ EXISTING Whole Hire Fields (unchanged)
    rate_per_km = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    location_address = models.CharField(max_length=255, blank=True, null=True)

    is_long_drive = models.BooleanField(default=False)
    is_specific_route = models.BooleanField(default=False)

    from_location = models.CharField(max_length=100, blank=True, null=True)
    to_location = models.CharField(max_length=100, blank=True, null=True)

    # ✅ NEW: Enhanced Pricing Fields for Whole Hire
    fixed_fare = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, 
                                    help_text="Fixed price for specific route")
    distance = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True,
                                  help_text="Estimated distance in km for specific route")
    
    # Time-based pricing
    per_hour_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
                                       help_text="Rate per hour for long drive")
    per_day_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
                                      help_text="Rate per day for long drive")
    weekly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
                                     help_text="Weekly package rate for long drive")
    
    # Additional charges
    night_charge = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
                                      help_text="Additional charge per night")
    mountain_surcharge = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True,
                                            help_text="Additional charge for mountain areas")
    
    # Custom quote option
    allow_custom_quote = models.BooleanField(default=False,
                                            help_text="Allow customers to request custom quotes")

    # ✅ EXISTING Image fields (unchanged)
    vehicle_image = models.ImageField(upload_to="transports/vehicles/", blank=True, null=True)
    driver_image = models.ImageField(upload_to="transports/drivers/", blank=True, null=True)
    
    # ✅ NEW: Status field
    is_active = models.BooleanField(default=True, help_text="Whether this offer is active")

    created_at = models.DateTimeField(default=timezone.now, editable=False)

    def save(self, *args, **kwargs):
        """Always update snapshot fields before saving."""

        # --- Driver snapshot ---
        if self.driver_id:
            driver = Driver.objects.filter(id=self.driver_id).first()
            if driver:
                self.driver_name_snapshot = driver.driver_name or ""
                self.driver_contact_snapshot = driver.driver_contact_number or ""
                if not self.driver_image and driver.image:
                    self.driver_image = driver.image

        # --- Vehicle snapshot ---
        if self.vehicle_id:
            vehicle = Vehicle.objects.filter(id=self.vehicle_id).first()
            if vehicle:
                self.vehicle_number_snapshot = vehicle.vehicle_number or ""
                self.vehicle_type_snapshot = vehicle.vehicle_type or ""
                self.vehicle_seats_snapshot = vehicle.number_of_seats or 0
                if not self.vehicle_image and vehicle.image:
                    self.vehicle_image = vehicle.image

        # --- Route / Location snapshot ---
        if self.offer_type == "offer_sets":
            if self.route:
                self.route_from = self.route.from_location
                self.route_to = self.route.to_location
            # Clear whole hire specific fields for seat booking
            self.rate_per_km = None
            self.location_address = ""
            self.is_long_drive = False
            self.is_specific_route = False
            self.from_location = ""
            self.to_location = ""
            # Clear enhanced pricing fields
            self._clear_whole_hire_pricing_fields()
        else:
            # Whole hire offer
            self.route = None
            self.price_per_seat = None
            self.arrival_date = None
            self.arrival_time = None
            self.reserve_seats = []
            
            if self.is_specific_route:
                self.route_from = self.from_location
                self.route_to = self.to_location
                # For specific route, we might want to clear some long drive fields
                if not self.fixed_fare and self.per_day_rate:
                    # If no fixed fare but has per day rate, it's a hybrid offer
                    pass
            else:
                self.route_from = self.location_address or "Whole Vehicle Base"
                self.route_to = "Flexible/N/A"
                # For long drive, clear specific route fields if needed
                self.from_location = ""
                self.to_location = ""

        super().save(*args, **kwargs)

    def _clear_whole_hire_pricing_fields(self):
        """Clear whole hire pricing fields for seat booking offers"""
        self.fixed_fare = None
        self.distance = None
        self.per_hour_rate = None
        self.per_day_rate = None
        self.weekly_rate = None
        self.night_charge = None
        self.mountain_surcharge = None
        self.allow_custom_quote = False

    def __str__(self):
        if self.offer_type == "whole_hire":
            base_location = self.location_address or self.route_from or "Whole Hire Offer"
            pricing_info = self._get_pricing_display()
            return f"WHOLE HIRE: {base_location} | {pricing_info}"
        return f"{self.route_from or 'N/A'} → {self.route_to or 'N/A'} | {self.vehicle_number_snapshot or 'No Vehicle'}"

    def _get_pricing_display(self):
        """Get display string for pricing based on available fields"""
        if self.fixed_fare:
            return f"Fixed: Rs.{self.fixed_fare}"
        elif self.per_day_rate:
            return f"Daily: Rs.{self.per_day_rate}"
        elif self.rate_per_km:
            return f"Rate: Rs.{self.rate_per_km}/km"
        elif self.allow_custom_quote:
            return "Custom Quote"
        return "Price on request"

    # --- Helper properties for serializers / UI ---
    @property
    def route_display(self):
        return f"{self.route_from or 'N/A'} → {self.route_to or 'N/A'}"

    @property
    def vehicle_number(self):
        return self.vehicle_number_snapshot or "N/A"

    @property
    def driver_name(self):
        return self.driver_name_snapshot or "N/A"

    @property
    def driver_contact(self):
        return self.driver_contact_snapshot or "N/A"

    @property
    def vehicle_type(self):
        return self.vehicle_type_snapshot or "N/A"

    @property
    def vehicle_seats(self):
        return self.vehicle_seats_snapshot or "N/A"

    @property
    def vehicle_image_url(self):
        return self.vehicle_image.url if self.vehicle_image else "Nill"

    @property
    def driver_image_url(self):
        return self.driver_image.url if self.driver_image else "Nill"

    # ✅ NEW: Enhanced pricing properties
    @property
    def pricing_summary(self):
        """Get a summary of pricing for display"""
        if self.offer_type == "offer_sets":
            return f"Rs.{self.price_per_seat}/seat" if self.price_per_seat else "Price N/A"
        
        # Whole hire pricing summary
        parts = []
        if self.fixed_fare:
            parts.append(f"Fixed: Rs.{self.fixed_fare}")
        if self.per_day_rate:
            parts.append(f"Daily: Rs.{self.per_day_rate}")
        if self.rate_per_km:
            parts.append(f"Rate: Rs.{self.rate_per_km}/km")
        if self.per_hour_rate:
            parts.append(f"Hourly: Rs.{self.per_hour_rate}")
        if self.weekly_rate:
            parts.append(f"Weekly: Rs.{self.weekly_rate}")
        if self.allow_custom_quote and not parts:
            parts.append("Custom Quote Available")
        
        return " + ".join(parts) if parts else "Contact for pricing"

    @property
    def service_types(self):
        """Get service types for whole hire"""
        if self.offer_type != "whole_hire":
            return []
        
        services = []
        if self.is_long_drive:
            services.append("Long Drive")
        if self.is_specific_route:
            services.append("Specific Route")
        # if self.is_taxi_service:
        #     services.append("Taxi Service")
        return services

    class Meta:
        ordering = ['-created_at']