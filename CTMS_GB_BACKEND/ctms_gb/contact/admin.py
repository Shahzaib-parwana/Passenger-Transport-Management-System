# contact/admin.py

from django.contrib import admin
from django.utils.html import format_html
from .models import ContactSubmission, DepartmentContact, FAQ, ContactSettings

@admin.register(ContactSubmission)
class ContactSubmissionAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'category', 'status', 'priority', 'created_at']
    list_filter = ['status', 'category', 'priority', 'created_at']
    search_fields = ['name', 'email', 'subject', 'message']
    readonly_fields = ['created_at', 'updated_at', 'ip_address', 'user_agent']
    list_per_page = 20
    
    fieldsets = (
        ('Contact Information', {
            'fields': ('name', 'email', 'subject', 'message', 'category')
        }),
        ('System Information', {
            'fields': ('status', 'priority', 'ip_address', 'user_agent')
        }),
        ('Response Tracking', {
            'fields': ('admin_notes', 'response_sent', 'response_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'resolved_at')
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing an existing object
            return self.readonly_fields + ['name', 'email', 'subject', 'message', 'category']
        return self.readonly_fields
    
    actions = ['mark_as_resolved', 'mark_as_pending', 'mark_as_high_priority']
    
    def mark_as_resolved(self, request, queryset):
        updated = queryset.update(status='resolved')
        self.message_user(request, f"{updated} submissions marked as resolved.")
    mark_as_resolved.short_description = "Mark selected as resolved"
    
    def mark_as_pending(self, request, queryset):
        updated = queryset.update(status='pending')
        self.message_user(request, f"{updated} submissions marked as pending.")
    mark_as_pending.short_description = "Mark selected as pending"
    
    def mark_as_high_priority(self, request, queryset):
        updated = queryset.update(priority=3)
        self.message_user(request, f"{updated} submissions marked as high priority.")
    mark_as_high_priority.short_description = "Mark selected as high priority"

@admin.register(DepartmentContact)
class DepartmentContactAdmin(admin.ModelAdmin):
    list_display = ['department_name', 'contact_person', 'email', 'phone', 'is_active', 'display_order']
    list_filter = ['department_name', 'is_active']
    search_fields = ['contact_person', 'email', 'phone']
    list_editable = ['is_active', 'display_order']
    
    fieldsets = (
        ('Department Information', {
            'fields': ('department_name', 'contact_person', 'description')
        }),
        ('Contact Details', {
            'fields': ('email', 'phone', 'whatsapp_number', 'office_location', 'working_hours')
        }),
        ('Display Settings', {
            'fields': ('is_active', 'display_order')
        }),
    )

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['question_short', 'category', 'display_order', 'is_active', 'created_at']
    list_filter = ['category', 'is_active']
    search_fields = ['question', 'answer']
    list_editable = ['category', 'display_order', 'is_active']
    
    fieldsets = (
        ('Question & Answer', {
            'fields': ('question', 'answer', 'category')
        }),
        ('Display Settings', {
            'fields': ('display_order', 'is_active')
        }),
    )
    
    def question_short(self, obj):
        return obj.question[:100] + '...' if len(obj.question) > 100 else obj.question
    question_short.short_description = 'Question'

@admin.register(ContactSettings)
class ContactSettingsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        # Only allow one settings object
        return not ContactSettings.objects.exists()
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('site_name', 'office_address', 'working_hours')
        }),
        ('Contact Details', {
            'fields': ('primary_email', 'secondary_email', 'primary_phone', 'secondary_phone', 'emergency_phone')
        }),
        ('Social Media', {
            'fields': ('facebook_url', 'twitter_url', 'instagram_url', 'youtube_url', 'linkedin_url')
        }),
        ('Location', {
            'fields': ('google_maps_embed', 'latitude', 'longitude')
        }),
        ('Email Settings', {
            'fields': ('notification_email', 'email_signature')
        }),
        ('Auto-response Settings', {
            'fields': ('auto_response_enabled', 'auto_response_subject', 'auto_response_message')
        }),
    )