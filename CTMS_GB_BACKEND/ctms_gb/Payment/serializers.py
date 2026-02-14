# chackout/serializers.py
import json
from rest_framework import serializers
from .models import Booking, Payment, Transaction, SeatHold  # adjust import path to your models file location
from users.models import CompanyDetail, Vehicle
from passenger_tickets.models import Ticket
from django.conf import settings
from users.serializers import UserProfileSerializer
from passenger_tickets.serializers import TicketSerializer


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at", "provider_intent_id", "provider_charge_id")



class BookingSerializer(serializers.ModelSerializer):
    ticket = TicketSerializer(read_only=True)
    class Meta:
        model = Booking
        fields = "__all__"
        read_only_fields = ["id", "booking_status", "created_at","ticket"]


        def validate_seat_numbers(self, value):
            if isinstance(value, str):
                try:
                    parsed_value = json.loads(value)
                    print(f"Parsed seat_numbers from string: {parsed_value}")
                    return parsed_value
                except json.JSONDecodeError:
                    raise serializers.ValidationError("Invalid JSON format for seat_numbers.")
            if not isinstance(value, list):
                raise serializers.ValidationError("Seat numbers must be a list.")
            
            if len(value) == 0:
                raise serializers.ValidationError("Seat numbers must be a non-empty list.")
            
            return value
        
    def to_internal_value(self, data):
        if 'seat_numbers' in data and isinstance(data['seat_numbers'], str):
            try:
                data_copy = data.copy()
                data_copy['seat_numbers'] = json.loads(data['seat_numbers'])
                return super().to_internal_value(data_copy)
            except json.JSONDecodeError:
                pass
        return super().to_internal_value(data)
    
    def create(self, validated_data):
        return super().create(validated_data)
    
        
class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


class SeatHoldSerializer(serializers.ModelSerializer):
    class Meta:
        model = SeatHold
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")


# _______________________________________________________________________

# --- NEW Serializer for Admin Booking List ---
class BookingAdminListSerializer(serializers.ModelSerializer):
    payment_status = serializers.SerializerMethodField()
    vehicle_number = serializers.SerializerMethodField()
    payment_method = serializers.SerializerMethodField()
    screenshot_url = serializers.SerializerMethodField()
    confirmed_by_name = serializers.SerializerMethodField()
    payment_id = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'vehicle_number', 'passenger_name', "passenger_phone", 'total_amount', 
            'booking_status', 'payment_status', 'payment_method', 'screenshot_url',
            'confirmed_by_name', 'payment_id', 'created_at', 'seat_numbers',
            'is_full_vehicle', 'seats_booked', 'passenger_email', 'passenger_cnic',
            'company', 'vehicle', 'notes'
        ]

    def get_payment_status(self, obj):
        if hasattr(obj, 'payment_record') and obj.payment_record:
            return obj.payment_record.status
        return "UNKNOWN"
    
    def get_vehicle_number(self, obj):
        if hasattr(obj, 'vehicle') and obj.vehicle:
            return obj.vehicle.vehicle_number
        return "UNKNOWN"
    
    def get_payment_method(self, obj):
        if hasattr(obj, 'payment_record') and obj.payment_record:
            return obj.payment_record.method
        return "UNKNOWN"
    
    def get_screenshot_url(self, obj):
        if hasattr(obj, 'payment_record') and obj.payment_record and obj.payment_record.screenshot:
            request = self.context.get('request')
            # Return the full URL for the screenshot
            if request and obj.payment_record.screenshot:
                # This returns a proper URL like: http://localhost:8000/media/payment_screenshots/filename.jpg
                return request.build_absolute_uri(obj.payment_record.screenshot.url)
        return None
    
    def get_confirmed_by_name(self, obj):
        if (hasattr(obj, 'payment_record') and obj.payment_record and 
            obj.payment_record.confirmed_by):
            return obj.payment_record.confirmed_by.get_full_name() or obj.payment_record.confirmed_by.username
        return None
    
    def get_payment_id(self, obj):
        if hasattr(obj, 'payment_record') and obj.payment_record:
            return str(obj.payment_record.id)
        return None  


# --- NEW Serializer for Combined Status Update (PATCH) ---
class BookingStatusUpdateSerializer(serializers.Serializer):
    # The booking_status is the main field to update
    booking_status = serializers.ChoiceField(
        choices=Booking.BOOKING_STATUS_CHOICES, 
        required=True
    )
    # We expect the new payment status to be passed
    new_payment_status = serializers.ChoiceField(
        choices=Payment.PAYMENT_STATUS_CHOICES, 
        required=True
    )