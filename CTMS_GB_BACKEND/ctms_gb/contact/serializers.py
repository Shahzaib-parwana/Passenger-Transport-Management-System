# contact/serializers.py

from rest_framework import serializers
from .models import ContactSubmission, DepartmentContact, FAQ, ContactSettings
import re

class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = [
            'id', 'name', 'email', 'subject', 'message', 'category',
            'status', 'created_at'
        ]
        read_only_fields = ['id', 'status', 'created_at']
    
    def validate_email(self, value):
        # Basic email validation
        email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(email_regex, value):
            raise serializers.ValidationError("Please enter a valid email address.")
        return value
    
    def validate_message(self, value):
        if len(value.strip()) < 10:
            raise serializers.ValidationError("Message must be at least 10 characters long.")
        if len(value) > 5000:
            raise serializers.ValidationError("Message cannot exceed 5000 characters.")
        return value
    
    def create(self, validated_data):
        # Get request context
        request = self.context.get('request')
        
        # Add IP address and user agent if available
        if request:
            validated_data['ip_address'] = request.META.get('REMOTE_ADDR')
            validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
            
            # Set priority based on category
            category = validated_data.get('category', 'general')
            priority_map = {
                'emergency': 4,
                'technical': 3,
                'company': 2,
                'passenger': 2,
                'feedback': 1,
                'general': 1
            }
            validated_data['priority'] = priority_map.get(category, 1)
        
        return super().create(validated_data)

class DepartmentContactSerializer(serializers.ModelSerializer):
    department_display = serializers.CharField(source='get_department_name_display', read_only=True)
    
    class Meta:
        model = DepartmentContact
        fields = [
            'id', 'department_name', 'department_display', 'contact_person',
            'email', 'phone', 'whatsapp_number', 'office_location',
            'working_hours', 'description', 'is_active'
        ]

class FAQSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = FAQ
        fields = [
            'id', 'question', 'answer', 'category', 'category_display',
            'display_order', 'is_active', 'created_at'
        ]

class ContactSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSettings
        fields = '__all__'
        read_only_fields = ['updated_at']

class ContactFormSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200, required=True)
    email = serializers.EmailField(required=True)
    subject = serializers.CharField(max_length=200, required=True)
    message = serializers.CharField(required=True)
    category = serializers.ChoiceField(
        choices=[
            ('general', 'General Inquiry'),
            ('passenger', 'Passenger Support'),
            ('company', 'Company Registration'),
            ('technical', 'Technical Support'),
            ('feedback', 'Feedback & Suggestions'),
            ('emergency', 'Emergency Assistance'),
        ],
        default='general'
    )
    
    def validate(self, data):
        # Spam check - simple honeypot (if implemented in frontend)
        # You can add more sophisticated spam detection here
        return data