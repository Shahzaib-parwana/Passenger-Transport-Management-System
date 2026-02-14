# passenger_tickets/serializers.py
from rest_framework import serializers
from .models import Ticket
from transport.models import Transport
from users.models import CompanyDetail

class TicketSerializer(serializers.ModelSerializer):
    # For backward compatibility - ensure all frontend fields are available
    booking_id = serializers.SerializerMethodField()
    vehicle_number = serializers.CharField(source='transport.vehicle_number', read_only=True, allow_null=True)
    route_from = serializers.CharField(source='transport.route_from', read_only=True, allow_null=True)
    route_to = serializers.CharField(source='transport.route_to', read_only=True, allow_null=True)
    arrival_date = serializers.DateField(source='transport.arrival_date', read_only=True, allow_null=True)
    arrival_time = serializers.TimeField(source='transport.arrival_time', read_only=True, allow_null=True)
    
    # Fallback to direct fields if transport relation doesn't exist
    def get_vehicle_number(self, obj):
        if obj.transport and obj.transport.vehicle_number:
            return obj.transport.vehicle_number
        return obj.vehicle_number or "N/A"
    
    def get_route_from(self, obj):
        if obj.transport and obj.transport.route_from:
            return obj.transport.route_from
        return obj.route_from or "N/A"
    
    def get_route_to(self, obj):
        if obj.transport and obj.transport.route_to:
            return obj.transport.route_to
        return obj.route_to or "N/A"
    
    def get_arrival_date(self, obj):
        if obj.transport and obj.transport.arrival_date:
            return obj.transport.arrival_date
        return obj.arrival_date or "N/A"
    
    def get_arrival_time(self, obj):
        if obj.transport and obj.transport.arrival_time:
            return obj.transport.arrival_time
        return obj.arrival_time or "N/A"
    
    def get_booking_id(self, obj):
        if obj.booking:
            return obj.booking.id
        return obj.id
    
    class Meta:
        model = Ticket
        fields = [
            'id', 'booking_id', 'passenger_name', 'passenger_cnic', 
            'passenger_contact', 'passenger_email', 'seats',
            'vehicle_number', 'route_from', 'route_to', 
            'arrival_date', 'arrival_time', 'price_per_seat',
            'payment_type', 'ticket_type', 'status', 'payment_status',
            'created_at', 'transport', 'transport_company',
            'driver_name', 'driver_contect'
        ]
    
    def to_representation(self, instance):
        # Get default representation
        data = super().to_representation(instance)
        
        # Ensure all required frontend fields are present
        data['booking'] = data.get('booking_id') or f"TKT-{instance.id}"
        data['passenger_name'] = data.get('passenger_name') or "Unknown"
        data['passenger_cnic'] = data.get('passenger_cnic') or "N/A"
        data['passenger_contact'] = data.get('passenger_contact') or "N/A"
        data['seats'] = data.get('seats') or []
        
        # Ensure vehicle_number is present
        if not data.get('vehicle_number'):
            data['vehicle_number'] = instance.vehicle_number or "Unknown"
        
        # Ensure route info is present
        if not data.get('route_from'):
            data['route_from'] = instance.route_from or "Unknown"
        if not data.get('route_to'):
            data['route_to'] = instance.route_to or "Unknown"
        
        # Ensure date/time is present
        if not data.get('arrival_date'):
            data['arrival_date'] = instance.arrival_date or "Unknown"
        if not data.get('arrival_time'):
            data['arrival_time'] = instance.arrival_time or "Unknown"
        
        # Ensure price is present
        data['price_per_seat'] = data.get('price_per_seat') or 0
        
        return data