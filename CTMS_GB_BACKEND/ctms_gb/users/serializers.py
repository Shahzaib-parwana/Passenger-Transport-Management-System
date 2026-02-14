from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import PassengerProfile, CompanyProfile

# accounts/serializers.py
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Custom claims
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add extra fields to response
        data['role'] = self.user.role
        data['username'] = self.user.username
        return data


User = get_user_model()

class PassengerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirmation = serializers.CharField(write_only=True)
    cnic_or_passport = serializers.CharField(write_only=True)
    address = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone_number = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ("username", "email", "phone_number", "cnic_or_passport", "address", "password", "password_confirmation")

    def validate(self, data):
        if data["password"] != data["password_confirmation"]:
            raise serializers.ValidationError({"password": "Password and confirmation do not match."})
        return data

    def create(self, validated_data):
        cnic = validated_data.pop("cnic_or_passport")
        validated_data.pop("password_confirmation", None)
        password = validated_data.pop("password")
        user = User.objects.create(
            username=validated_data["username"],
            email=validated_data["email"],
            phone_number=validated_data.get("phone_number"),
            role="passenger",
            is_active=True,
        )
        user.set_password(password)
        user.save()
        PassengerProfile.objects.create(user=user, cnic_or_passport=cnic, address=validated_data.get("address", ""))
        return user


class CompanyInitialRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirmation = serializers.CharField(write_only=True)

    class Meta:
        model = CompanyProfile
        fields = ("company_name", "registration_id", "contact_no", "password", "password_confirmation", "user_email", "user_username")
        # We'll accept user_username and user_email via extra fields

    user_username = serializers.CharField(write_only=True, required=True)
    user_email = serializers.EmailField(write_only=True)

    def validate(self, data):
        if data["password"] != data["password_confirmation"]:
            raise serializers.ValidationError({"password": "Password and confirmation do not match."})
        return data

    def create(self, validated_data):
        username = validated_data.pop("user_username")
        email = validated_data.pop("user_email")
        password = validated_data.pop("password")
        validated_data.pop("password_confirmation", None)

        # create user
        user = User.objects.create(username=username, email=email, role="company", is_active=True)
        user.set_password(password)
        user.save()

        company = CompanyProfile.objects.create(
            user=user,
            company_name=validated_data.get("company_name"),
            registration_id=validated_data.get("registration_id"),
            contact_no=validated_data.get("contact_no"),
            status="pending",
        )
        return company


class UserSerializer(serializers.ModelSerializer):
    cnic_or_passport = serializers.CharField(source="passenger_profile.cnic_or_passport", read_only=True)
    address = serializers.CharField(source="passenger_profile.address", read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "role", "phone_number", "cnic_or_passport", "address")

#####################################

# COMPany form

#####################################

# serializers.py (append)
from .models import CompanyDetail, Route, Vehicle, Driver

class CompanyDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyDetail
        fields = '__all__'  # ensure 'user' is included

class CompanyBasicUpdateSerializer(serializers.ModelSerializer):
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    company_logo_url = serializers.SerializerMethodField()
    company_banner_url = serializers.SerializerMethodField()

    class Meta:
        model = CompanyDetail
        fields = [
            "company_name", "user", "registration_id", "company_email",
            "contact_number_1", "contact_number_2", "company_type",
            "main_office_location", "Passenger_instruction",
            "company_logo", "company_logo_url",
            "owner_name", "owner_email", "owner_contact_number",
            "owner_cnic", "owner_address",
            "company_banner", "company_banner_url",
            # Payment Info
            "payment_type",
            "easypaisa_name", "easypaisa_number",
            "jazzcash_name", "jazzcash_number",
            "bank_name", "bank_account_title",
            "bank_account_number", "bank_iban",

            "agreement_accepted", "is_submitted",
        ]
        # extra_kwargs = {
        #     "company_name": {"required": False, "allow_blank": True},
        #     "registration_id": {"required": False, "allow_blank": True},
        #     "company_email": {"required": False, "allow_blank": True},
        #     "contact_number_1": {"required": False, "allow_blank": True},
        #     "company_type": {"required": False, "allow_blank": True},
        #     "main_office_location": {"required": False, "allow_blank": True},
        #     "Passenger_instruction": {"required": False, "allow_blank": True},
        #     "owner_name": {"required": False, "allow_blank": True},
        #     "owner_email": {"required": False, "allow_blank": True},
        #     "owner_contact_number": {"required": False, "allow_blank": True},
        #     "owner_cnic": {"required": False, "allow_blank": True},
        #     "owner_address": {"required": False, "allow_blank": True},
        #     "agreement_accepted": {"required": False},
        # }


    # def get_company_logo_url(self, obj):
    #     request = self.context.get("request")
    #     if obj.company_logo:
    #         return request.build_absolute_uri(obj.company_logo.url)
    #     return None
    def get_company_logo_url(self, obj):
        return obj.company_logo.url if obj.company_logo else None

    def get_company_banner_url(self, obj):
        return obj.company_banner.url if obj.company_banner else None
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class DriverSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Driver
        fields = [
            "id", "driver_name", "driver_contact_number",
            "driver_cnic", "driving_license_no",
            "image", "image_url"
        ]
        extra_kwargs = {
            "image": {"required": False, "allow_null": True}
        }

    def get_image_url(self, obj):
        request = self.context.get("request")
        try:
            if obj.image and obj.image.name:   # ✅ safe check
                return request.build_absolute_uri(obj.image.url)
        except Exception:
            return None
        return None



# serializers.py

class VehicleSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    features = serializers.JSONField(required=False)
    vehicle_id = serializers.IntegerField(source="vehicle.id", read_only=True)
    # company_id = serializers.IntegerField(source="company.id", read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            "id",
            "vehicle_type",
            "vehicle_id",
            # "company_id",
            "vehicle_number",
            "number_of_seats",
            "image",
            "image_url",
            "features",
            "details",
        ]
        extra_kwargs = {
            "image": {"required": False, "allow_null": True},
            "features": {"required": False},
            "details": {"required": False, "allow_blank": True},
        }

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            return request.build_absolute_uri(obj.image.url)
        return None





class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ["id","from_location", "to_location"]


class CompanyDetailSerializer(serializers.ModelSerializer):
    drivers = DriverSerializer(many=True, required=False)
    vehicles = VehicleSerializer(many=True, required=False)
    routes = RouteSerializer(many=True, required=False)

    user = serializers.HiddenField(default=serializers.CurrentUserDefault())
    company_logo_url = serializers.SerializerMethodField()
    # company_banner_url = serializers.SerializerMethodField()


    class Meta:
        model = CompanyDetail
        fields = [
            "company_name", "user", "registration_id", "company_email",
            "contact_number_1", "contact_number_2", "company_type",
            "main_office_location", "Passenger_instruction",
            "company_logo", "company_logo_url",
            "company_banner",

         
            # payment fields
            "payment_type",
            "easypaisa_name", "easypaisa_number",
            "jazzcash_name", "jazzcash_number",
            "bank_name", "bank_account_title",
            "bank_account_number", "bank_iban",

            "owner_name", "owner_email", "owner_contact_number",
            "owner_cnic", "owner_address",
            "agreement_accepted", "is_submitted",
            "drivers", "vehicles", "routes"
        ]
        extra_kwargs = {
            "company_name": {"required": False, "allow_blank": True},
            "registration_id": {"required": False, "allow_blank": True},
            "company_email": {"required": False, "allow_blank": True},
            "contact_number_1": {"required": False, "allow_blank": True},
            "company_type": {"required": False, "allow_blank": True},
            "main_office_location": {"required": False, "allow_blank": True},
            "Passenger_instruction": {"required": False, "allow_blank": True},
            "owner_name": {"required": False, "allow_blank": True},
            "owner_email": {"required": False, "allow_blank": True},
            "owner_contact_number": {"required": False, "allow_blank": True},
            "owner_cnic": {"required": False, "allow_blank": True},
            "owner_address": {"required": False, "allow_blank": True},
            "agreement_accepted": {"required": False},
        }

    def get_company_logo_url(self, obj):
        request = self.context.get("request")
        if obj.company_logo:
            return request.build_absolute_uri(obj.company_logo.url)
        return None
    
    def get_company_banner_url(self, obj):
        request = self.context.get("request")
        if obj.company_banner:
            return request.build_absolute_uri(obj.company_banner.url)
        return None



    def validate(self, data):
        """
        Agar is_submitted=True ho, to sari required fields validate karo.
        Agar draft hai (is_submitted=False), to koi required field ka check nahi hoga.
        """
        if data.get("is_submitted", False):
            required_fields = [
                "company_name", "registration_id", "company_email",
                "contact_number_1", "company_type",
                "main_office_location", "owner_name", "owner_email",
                "owner_contact_number", "owner_cnic", "owner_address",
                "agreement_accepted"
            ]
            for field in required_fields:
                if not data.get(field):
                    raise serializers.ValidationError(
                        {field: "This field is required for submission."}
                    )
        return data

    def create(self, validated_data):
        drivers_data = validated_data.pop("drivers", [])
        vehicles_data = validated_data.pop("vehicles", [])
        routes_data = validated_data.pop("routes", [])

        company = CompanyDetail.objects.create(**validated_data)

        for driver in drivers_data:
            Driver.objects.create(company=company, **driver)
        for vehicle in vehicles_data:
            Vehicle.objects.create(company=company, **vehicle)
        for route in routes_data:
            Route.objects.create(company=company, **route)

        return company

    def update(self, instance, validated_data):
        drivers_data = validated_data.pop("drivers", [])
        vehicles_data = validated_data.pop("vehicles", [])
        routes_data = validated_data.pop("routes", [])

        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # ✅ Drivers update
        instance.drivers.all().delete()  # purane delete karo
        for driver in drivers_data:
            Driver.objects.create(company=instance, **driver)

        # ✅ Vehicles update
        instance.vehicles.all().delete()
        for vehicle in vehicles_data:
            Vehicle.objects.create(company=instance, **vehicle)

        # ✅ Routes update
        instance.routes.all().delete()
        for route in routes_data:
            Route.objects.create(company=instance, **route)

        return instance


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        token['email'] = user.email
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        data['role'] = user.role
        data['username'] = user.username
        data['email'] = user.email
        
        if user.role == "passenger":
            passenger_profile = getattr(user, "passenger_profile", None)
            data["cnic_or_passport"] = passenger_profile.cnic_or_passport if passenger_profile else None
            data["phone_number"] = user.phone_number



        # ✅ Company specific fields
        if user.role == "company":
            company_profile = getattr(user, "company_profile", None)
            data["status"] = company_profile.status if company_profile else "unknown"
            data["phone_number"] = company_profile.contact_no if company_profile else None

        return data

# //////////////////////////////////////////


# //////////////////////////////////////////
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


# ---- GET Profile Serializer ----
class UserProfileSerializer(serializers.ModelSerializer):
    cnic_or_passport = serializers.CharField(source="passenger_profile.cnic_or_passport", read_only=True)
    address = serializers.CharField(source="passenger_profile.address", read_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "phone_number", "cnic_or_passport", "address"]


# ---- UPDATE Profile Serializer ----
class UserUpdateSerializer(serializers.ModelSerializer):
    old_password = serializers.CharField(write_only=True, required=False)
    new_password = serializers.CharField(write_only=True, required=False)

    cnic_or_passport = serializers.CharField(source="passenger_profile.cnic_or_passport", required=False)
    address = serializers.CharField(source="passenger_profile.address", required=False)

    class Meta:
        model = User
        fields = ["username", "email", "phone_number", "cnic_or_passport", "address", "old_password", "new_password"]

    def update(self, instance, validated_data):
        passenger_data = validated_data.pop("passenger_profile", {})
        old_password = validated_data.pop("old_password", None)
        new_password = validated_data.pop("new_password", None)

        # ✅ Update user basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # ✅ Update passenger profile
        if hasattr(instance, "passenger_profile"):
            for attr, value in passenger_data.items():
                setattr(instance.passenger_profile, attr, value)
            instance.passenger_profile.save()

        # ✅ Password change
        if old_password and new_password:
            if not instance.check_password(old_password):
                raise serializers.ValidationError({"old_password": "Old password is incorrect"})
            instance.set_password(new_password)
            instance.save()

        return instance

# //////////////////////////////
from rest_framework import serializers
from .models import PassengerProfile, User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'phone_number']

class PassengerProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = PassengerProfile
        fields = [
            'user', 'cnic_or_passport', 'address', 'profile_picture', 'gender',
            'date_of_birth', 'living_status', 'current_status', 'special_person',
            'additional_info', 'notification_enabled'
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
