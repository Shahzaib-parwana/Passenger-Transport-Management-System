# contact/models.py

from django.db import models
from django.core.validators import EmailValidator
from django.utils import timezone

class ContactSubmission(models.Model):
    CATEGORY_CHOICES = [
        ('general', 'General Inquiry'),
        ('passenger', 'Passenger Support'),
        ('company', 'Company Registration'),
        ('technical', 'Technical Support'),
        ('feedback', 'Feedback & Suggestions'),
        ('emergency', 'Emergency Assistance'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    # Contact Information
    name = models.CharField(max_length=200)
    email = models.EmailField(validators=[EmailValidator()])
    subject = models.CharField(max_length=200)
    message = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    
    # System Fields
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.IntegerField(default=1)  # 1=Low, 2=Medium, 3=High, 4=Critical
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    # Response Tracking
    admin_notes = models.TextField(blank=True)
    response_sent = models.BooleanField(default=False)
    response_notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Contact Submission'
        verbose_name_plural = 'Contact Submissions'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['category']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.subject} ({self.get_category_display()})"
    
    def mark_as_resolved(self):
        self.status = 'resolved'
        self.resolved_at = timezone.now()
        self.save()
    
    def get_priority_display(self):
        priority_map = {
            1: "Low",
            2: "Medium", 
            3: "High",
            4: "Critical"
        }
        return priority_map.get(self.priority, "Unknown")

class DepartmentContact(models.Model):
    DEPARTMENT_CHOICES = [
        ('passenger_support', 'Passenger Support'),
        ('company_registration', 'Company Registration'),
        ('technical_support', 'Technical Support'),
        ('customer_care', 'Customer Care'),
        ('emergency', 'Emergency Support'),
    ]
    
    department_name = models.CharField(max_length=100, choices=DEPARTMENT_CHOICES)
    contact_person = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    whatsapp_number = models.CharField(max_length=20, blank=True)
    office_location = models.CharField(max_length=300, blank=True)
    working_hours = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['display_order', 'department_name']
        verbose_name = 'Department Contact'
        verbose_name_plural = 'Department Contacts'
    
    def __str__(self):
        return f"{self.get_department_name_display()} - {self.contact_person}"

class FAQ(models.Model):
    CATEGORY_CHOICES = [
        ('general', 'General'),
        ('passenger', 'Passenger'),
        ('company', 'Company'),
        ('technical', 'Technical'),
        ('payment', 'Payment'),
        ('safety', 'Safety & Security'),
    ]
    
    question = models.CharField(max_length=500)
    answer = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['display_order', 'category', '-created_at']
        verbose_name = 'FAQ'
        verbose_name_plural = 'FAQs'
    
    def __str__(self):
        return self.question[:100]

class ContactSettings(models.Model):
    site_name = models.CharField(max_length=100, default="PTMS Gilgit-Baltistan")
    office_address = models.TextField()
    primary_email = models.EmailField()
    secondary_email = models.EmailField(blank=True)
    primary_phone = models.CharField(max_length=20)
    secondary_phone = models.CharField(max_length=20, blank=True)
    emergency_phone = models.CharField(max_length=20)
    working_hours = models.TextField()
    
    # Social Media
    facebook_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    instagram_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    
    # Google Maps
    google_maps_embed = models.TextField(blank=True, help_text="Google Maps iframe code")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    
    # Email Settings
    notification_email = models.EmailField(blank=True)
    email_signature = models.TextField(blank=True)
    
    # Auto-response
    auto_response_enabled = models.BooleanField(default=True)
    auto_response_subject = models.CharField(max_length=200, blank=True)
    auto_response_message = models.TextField(blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = 'Contact Settings'
        verbose_name_plural = 'Contact Settings'
    
    def __str__(self):
        return f"Contact Settings - {self.site_name}"