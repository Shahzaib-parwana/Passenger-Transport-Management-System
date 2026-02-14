from rest_framework import serializers
from .models import Transport
from users.models import CompanyDetail, VehicleReview


class VehicleReviewSerializer(serializers.ModelSerializer):
    passenger_name = serializers.CharField(source="passenger.user.username", read_only=True)

    class Meta:
        model = VehicleReview
        fields = ["passenger_name", "rating", "comment", "created_at"]


class TransportSerializer(serializers.ModelSerializer):
    # --- Company ---
    company_name = serializers.CharField(source="company.company_name", read_only=True)
    company_contact_1 = serializers.CharField(source="company.contact_number_1", read_only=True)
    company_contact_2 = serializers.CharField(source="company.contact_number_2", read_only=True)
    # ----------Payment-------------
    payment_type = serializers.CharField(source="company.payment_type", read_only=True)
    easypaisa_name = serializers.CharField(source = "company.easypaisa_name",read_only=True)
    easypaisa_number = serializers.CharField(source = "company.easypaisa_number",read_only=True)
    jazzcash_name = serializers.CharField(source = "company.jazzcash_name",read_only=True)
    jazzcash_number = serializers.CharField(source = "company.jazzcash_number",read_only=True)

    bank_name = serializers.CharField(source = "company.bank_name",read_only=True)
    bank_account_title = serializers.CharField(source = "company.bank_account_title",read_only=True)
    bank_account_number = serializers.CharField(source = "company.bank_account_number",read_only=True)
    bank_iban = serializers.CharField(source = "company.bank_iban",read_only=True)

    company_logo_url = serializers.SerializerMethodField()

    # --- Route ---
    route_display = serializers.SerializerMethodField()

    # --- Vehicle ---
    vehicle_number = serializers.ReadOnlyField(source="vehicle_number_snapshot")
    vehicle_type = serializers.SerializerMethodField()
    vehicle_seats = serializers.SerializerMethodField()
    vehicle_image = serializers.SerializerMethodField()
    vehicle_features = serializers.SerializerMethodField()
    vehicle_details = serializers.SerializerMethodField()
    vehicle_reviews = serializers.SerializerMethodField()

    # --- Driver ---
    driver_name = serializers.ReadOnlyField(source="driver_name_snapshot")
    driver_contact = serializers.ReadOnlyField(source="driver_contact_snapshot")
    driver_image = serializers.SerializerMethodField()

    # ✅ NEW: Enhanced pricing properties
    pricing_summary = serializers.ReadOnlyField()
    service_types = serializers.ReadOnlyField()

    class Meta:
        model = Transport
        fields = "__all__"
        read_only_fields = ("company", "created_at", "pricing_summary", "service_types")

    # ---------------- GETTERS ----------------
    def get_company_logo_url(self, obj):
        request = self.context.get("request")
        if obj.company and obj.company.company_logo:
            url = obj.company.company_logo.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_route_display(self, obj):
        if obj.route:
            return f"{obj.route.from_location} → {obj.route.to_location}"
        if obj.route_from and obj.route_to:
            return f"{obj.route_from} → {obj.route_to}"
        return "N/A"

    # ---- Vehicle ----
    def get_vehicle_type(self, obj):
        if obj.vehicle and obj.vehicle.vehicle_type:
            return obj.vehicle.vehicle_type
        return getattr(obj, "vehicle_type_snapshot", None) or "N/A"

    def get_vehicle_seats(self, obj):
        if obj.vehicle and obj.vehicle.number_of_seats:
            return obj.vehicle.number_of_seats
        return getattr(obj, "vehicle_seats_snapshot", None) or "N/A"

    def get_vehicle_image(self, obj):
        request = self.context.get("request")
        if obj.vehicle and obj.vehicle.image:
            url = obj.vehicle.image.url
        elif obj.vehicle_image:
            url = obj.vehicle_image.url
        else:
            return None
        return request.build_absolute_uri(url) if request else url

    def get_vehicle_features(self, obj):
        if obj.vehicle and obj.vehicle.features:
            return obj.vehicle.features
        return {}

    def get_vehicle_details(self, obj):
        if obj.vehicle and obj.vehicle.details:
            return obj.vehicle.details
        return None

    def get_vehicle_reviews(self, obj):
        if obj.vehicle:
            reviews = obj.vehicle.reviews.all()
            return VehicleReviewSerializer(reviews, many=True, context=self.context).data
        return []

    # ---- Driver ----
    def get_driver_image(self, obj):
        request = self.context.get("request")
        if obj.driver and obj.driver.image:
            url = obj.driver.image.url
        elif obj.driver_image:
            url = obj.driver_image.url
        else:
            return None
        return request.build_absolute_uri(url) if request else None

    # ---------- VALIDATION METHODS ----------
    def validate(self, data):
        """
        Smart validation: Price per seat sirf tab check karo jab offer create ho raha ho ya price change ho raha ho
        Ya phir jab is_active=True kiya ja raha ho (lekin sirf seat offers ke liye)
        """
        # Instance = existing object (update case), None = create case
        instance = getattr(self, 'instance', None)
        offer_type = data.get('offer_type', getattr(instance, 'offer_type', None))

        # Agar seat booking offer hai
        if offer_type == 'offer_sets':
            # Case 1: Naya offer create ho raha hai → price_per_seat zaruri hai
            if not instance:  # create
                if not data.get('price_per_seat'):
                    raise serializers.ValidationError({
                        "price_per_seat": "Price per seat is required for seat booking offers."
                    })

            # Case 2: Update chal raha hai
            else:
                # Agar user price_per_seat bhej raha hai → validate karo
                if 'price_per_seat' in data and not data['price_per_seat']:
                    raise serializers.ValidationError({
                        "price_per_seat": "Price per seat cannot be empty."
                    })

                # Agar user is_active=True kar raha hai lekin price nahi hai → block karo
                if data.get('is_active') is True:
                    current_price = data.get('price_per_seat', getattr(instance, 'price_per_seat', None))
                    if not current_price:
                        raise serializers.ValidationError({
                            "price_per_seat": "Price per seat is required to activate this seat booking offer."
                        })

        # Whole hire validation (tera wala sahi hai)
        elif offer_type == 'whole_hire':
            if data.get('is_long_drive') and not any([
                data.get('per_day_rate'),
                data.get('per_hour_rate'),
                data.get('weekly_rate'),
                data.get('allow_custom_quote', False)
            ]):
                # Existing instance se bhi check kar sakte hain agar kuch nahi bheja
                if instance:
                    existing_rates = [
                        getattr(instance, 'per_day_rate', None),
                        getattr(instance, 'per_hour_rate', None),
                        getattr(instance, 'weekly_rate', None),
                        getattr(instance, 'allow_custom_quote', False)
                    ]
                    if not any(existing_rates):
                        raise serializers.ValidationError({
                            "pricing": "For long drive offers, provide at least one pricing option or enable custom quotes."
                        })
                else:
                    raise serializers.ValidationError({
                        "pricing": "For long drive offers, please provide at least one pricing option or enable custom quotes."
                    })

        return data

        # ---------- CREATE OVERRIDE ----------
    def create(self, validated_data):
            """
            Handle creation with enhanced pricing fields
            """
            # Ensure company is set from context
            if 'company' not in validated_data:
                request = self.context.get('request')
                if request and hasattr(request.user, 'company_detail'):
                    validated_data['company'] = request.user.company_detail
            
            transport = super().create(validated_data)
            
            # Trigger snapshot updates
            transport.save()
            
            return transport

        # ---------- UPDATE OVERRIDE ----------
    def update(self, instance, validated_data):
            """
            Enhanced update to handle new pricing fields and maintain snapshots
            """
            # Keep old relations if not updated
            for field in ["route", "vehicle", "driver"]:
                if field not in validated_data or validated_data.get(field) is None:
                    validated_data[field] = getattr(instance, field)

            instance = super().update(instance, validated_data)

            # Refresh related data snapshots
            if instance.route:
                instance.route_from = instance.route.from_location
                instance.route_to = instance.route.to_location

            if instance.vehicle:
                instance.vehicle_number_snapshot = instance.vehicle.vehicle_number
                instance.vehicle_type_snapshot = instance.vehicle.vehicle_type
                instance.vehicle_seats_snapshot = instance.vehicle.number_of_seats
                if instance.vehicle.image:
                    instance.vehicle_image = instance.vehicle.image

            if instance.driver:
                instance.driver_name_snapshot = instance.driver.driver_name
                instance.driver_contact_snapshot = instance.driver.driver_contact_number
                if instance.driver.image:
                    instance.driver_image = instance.driver.image

            instance.save()
            return instance


# ------------------ COMPANY DETAIL SERIALIZER ------------------ #
class CompanyDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for CompanyDetail, deriving offered services from Transport entries.
    """
    company_logo_url = serializers.SerializerMethodField()
    company_banner_url = serializers.SerializerMethodField()
    main_office_city = serializers.CharField(source="main_office_location", read_only=True)
    services_offered = serializers.SerializerMethodField()
    
    # ✅ NEW: Active transport counts
    active_seat_offers = serializers.SerializerMethodField()
    active_hire_offers = serializers.SerializerMethodField()

    class Meta:
        model = CompanyDetail
        fields = [
            "id",
            "company_name",
            "company_logo_url",
            "company_banner_url",
            "main_office_city",
            "services_offered",
            "active_seat_offers",
            "active_hire_offers",
            "company_email",        # ✅ add email
            "contact_number_1",     # ✅ add primary contact
            "contact_number_2",     # ✅ add secondary contact
        ]

    def get_company_logo_url(self, obj):
        request = self.context.get("request")
        if obj.company_logo:
            url = obj.company_logo.url
            return request.build_absolute_uri(url) if request else url
        return "https://via.placeholder.com/200?text=No+Logo"
    
    def get_company_banner_url(self, obj):
        request = self.context.get("request")
        if obj.company_banner:
            url = obj.company_banner.url
            return request.build_absolute_uri(url) if request else url
        return "https://via.placeholder.com/1920x960?text=No+Banner"


    def get_services_offered(self, obj):
        services = set()
        if obj.transports.filter(offer_type="offer_sets", is_active=True).exists():
            services.add("Seat Booking")
        if obj.transports.filter(offer_type="whole_hire", is_active=True).exists():
            services.add("Vehicle Rental")
        return ", ".join(services) if services else "No Active Services"

    def get_active_seat_offers(self, obj):
        """Get count of active seat booking offers"""
        return obj.transports.filter(offer_type="offer_sets", is_active=True).count()

    def get_active_hire_offers(self, obj):
        """Get count of active vehicle hire offers"""
        return obj.transports.filter(offer_type="whole_hire", is_active=True).count()