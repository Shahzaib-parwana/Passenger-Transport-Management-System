# contact/views.py

from rest_framework import viewsets, status, generics, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags
from django.db.models import Count, Q
from datetime import datetime, timedelta
import logging
from django.template.exceptions import TemplateDoesNotExist

from .models import ContactSubmission, DepartmentContact, FAQ, ContactSettings
from .serializers import (
    ContactSubmissionSerializer, DepartmentContactSerializer,
    FAQSerializer, ContactSettingsSerializer, ContactFormSerializer
)

logger = logging.getLogger(__name__)

class ContactSubmissionViewSet(viewsets.ModelViewSet):
    queryset = ContactSubmission.objects.all().order_by('-created_at')
    serializer_class = ContactSubmissionSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'list']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def create(self, request, *args, **kwargs):
        serializer = ContactFormSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            # Create contact submission
            contact_data = serializer.validated_data
            submission = ContactSubmission.objects.create(**contact_data)
            
            # Send email notifications
            self.send_notification_emails(submission)
            
            # Send auto-response if enabled
            if self.should_send_auto_response(submission):
                self.send_auto_response(submission)
            
            return Response({
                'success': True,
                'message': 'Thank you for contacting us. We will get back to you soon.',
                'submission_id': submission.id
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def send_notification_emails(self, submission):
        """Send email notifications to admin"""
        try:
            # Check if we have email settings
            if not hasattr(settings, 'DEFAULT_FROM_EMAIL') or not settings.DEFAULT_FROM_EMAIL:
                logger.warning("DEFAULT_FROM_EMAIL not configured")
                return
                
            subject = f"New Contact Form Submission: {submission.subject}"
            
            # Get site URL safely
            site_url = getattr(settings, 'SITE_URL', 'http://localhost:8000')
            context = {
                'submission': submission,
                'site_name': getattr(settings, 'SITE_NAME', 'PTMS GB'),
                'current_year': datetime.now().year,
                'admin_url': f"{site_url}/admin/contact/contactsubmission/{submission.id}/change/"
            }
            
            # Render HTML message
            try:
                html_message = render_to_string('contact/email_notification.html', context)
            except TemplateDoesNotExist as e:
                logger.error(f"Template not found: {str(e)}")
                # Create a simple HTML email as fallback
                html_message = f"""
                <html>
                <body>
                    <h2>New Contact Form Submission</h2>
                    <p><strong>Name:</strong> {submission.name}</p>
                    <p><strong>Email:</strong> {submission.email}</p>
                    <p><strong>Category:</strong> {submission.get_category_display()}</p>
                    <p><strong>Subject:</strong> {submission.subject}</p>
                    <p><strong>Message:</strong></p>
                    <pre>{submission.message}</pre>
                    <p><strong>Submitted at:</strong> {submission.created_at}</p>
                    <p><a href="{context['admin_url']}">View in Admin Panel</a></p>
                </body>
                </html>
                """
            
            plain_message = strip_tags(html_message)
            from_email = settings.DEFAULT_FROM_EMAIL
            
            # Get recipient emails - Improved logic
            recipient_emails = []
            
            # 1. Get emails from ContactSettings
            try:
                contact_settings = ContactSettings.objects.first()
                if contact_settings:
                    # Collect all email fields
                    email_fields = [
                        contact_settings.primary_email,
                        contact_settings.secondary_email,
                        contact_settings.notification_email
                    ]
                    for email in email_fields:
                        if email and email.strip():  # Check if not empty
                            recipient_emails.append(email.strip())
            except Exception as e:
                logger.error(f"Error getting ContactSettings: {str(e)}")
            
            # 2. Get emails from settings.ADMIN_EMAILS
            admin_emails = getattr(settings, 'ADMIN_EMAILS', [])
            if admin_emails:
                if isinstance(admin_emails, str):
                    if admin_emails.strip():
                        recipient_emails.append(admin_emails.strip())
                elif isinstance(admin_emails, (list, tuple)):
                    for email in admin_emails:
                        if email and str(email).strip():
                            recipient_emails.append(str(email).strip())
            
            # 3. Fallback to superuser emails
            if not recipient_emails:
                try:
                    from django.contrib.auth import get_user_model
                    User = get_user_model()
                    superusers = User.objects.filter(
                        is_superuser=True, 
                        email__isnull=False
                    ).exclude(email__exact='').values_list('email', flat=True)
                    if superusers:
                        recipient_emails = list(superusers)
                except Exception as e:
                    logger.error(f"Error getting superuser emails: {str(e)}")
            
            # 4. Final fallback
            if not recipient_emails:
                recipient_emails = [from_email]
            
            # Clean up emails (remove duplicates, validate)
            recipient_emails = list(set([
                email.lower().strip() for email in recipient_emails 
                if email and '@' in str(email)
            ]))
            
            logger.info(f"Attempting to send notification emails to: {recipient_emails}")
            
            if not recipient_emails:
                logger.error("No valid recipient emails found")
                return
            
            # Send emails
            for email_address in recipient_emails:
                try:
                    email = EmailMultiAlternatives(
                        subject=subject,
                        body=plain_message,
                        from_email=from_email,
                        to=[email_address],
                        reply_to=[submission.email]  # So admin can reply directly
                    )
                    email.attach_alternative(html_message, "text/html")
                    email.send(fail_silently=False)  # Set to False to see errors
                    logger.info(f"✓ Notification email sent to {email_address}")
                except Exception as e:
                    logger.error(f"✗ Failed to send email to {email_address}: {str(e)}")
        
        except Exception as e:
            logger.error(f"Failed to send notification email: {str(e)}", exc_info=True)
   
   
    def send_auto_response(self, submission):
        """Send auto-response to the user"""
        try:
            try:
                contact_settings = ContactSettings.objects.first()
                if not contact_settings or not contact_settings.auto_response_enabled:
                    return
                
                subject = contact_settings.auto_response_subject or "Thank you for contacting PTMS GB"
                message_template = contact_settings.auto_response_message
            except Exception as e:
                logger.error(f"Error getting contact settings: {str(e)}")
                # Default auto-response
                subject = "Thank you for contacting PTMS GB"
                message_template = None
            
            # Create context dictionary
            context = {
                'username': submission.name,  # Add username for template
                'name': submission.name,
                'subject': submission.subject,
                'category': submission.get_category_display(),
                'site_name': getattr(settings, 'SITE_NAME', 'PTMS GB'),
                'support_email': getattr(settings, 'SUPPORT_EMAIL', 'support@ptmsgb.pk'),
                'current_year': datetime.now().year,
                'submission': submission,  # Pass the full submission object
            }
            
            if message_template:
                try:
                    # Replace placeholders using a safer method
                    html_message = message_template
                    # Replace all possible placeholders
                    for key, value in context.items():
                        placeholder = f'{{{key}}}'
                        if placeholder in html_message:
                            html_message = html_message.replace(placeholder, str(value))
                except Exception as e:
                    logger.error(f"Error formatting template: {str(e)}")
                    # Fallback to default template
                    html_message = render_to_string('contact/auto_response.html', context)
            else:
                # Use default template
                html_message = render_to_string('contact/auto_response.html', context)
            
            plain_message = strip_tags(html_message)
            
            try:
                email = EmailMultiAlternatives(
                    subject=subject,
                    body=plain_message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[submission.email],
                    reply_to=[getattr(settings, 'SUPPORT_EMAIL', 'support@ptmsgb.pk')]
                )
                email.attach_alternative(html_message, "text/html")
                email.send(fail_silently=False)
                
                submission.response_sent = True
                submission.save(update_fields=['response_sent'])
                
                logger.info(f"Auto-response sent to {submission.email}")
            
            except Exception as e:
                logger.error(f"Failed to send auto-response email: {str(e)}")
        
        except Exception as e:
            logger.error(f"Failed in send_auto_response: {str(e)}", exc_info=True)   
    def should_send_auto_response(self, submission):
        """Check if auto-response should be sent"""
        # Don't send auto-response for emergency contacts (they need personal response)
        if submission.category == 'emergency':
            return False
        
        # Check if user has submitted multiple times in last 24 hours
        recent_submissions = ContactSubmission.objects.filter(
            email=submission.email,
            created_at__gte=datetime.now() - timedelta(hours=24)
        ).count()
        
        return recent_submissions <= 3  # Limit to 3 auto-responses per day
    
    @action(detail=True, methods=['post'])
    def mark_resolved(self, request, pk=None):
        """Mark a submission as resolved"""
        submission = self.get_object()
        submission.mark_as_resolved()
        return Response({'success': True, 'message': 'Submission marked as resolved'})
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get contact form statistics"""
        total = ContactSubmission.objects.count()
        pending = ContactSubmission.objects.filter(status='pending').count()
        resolved = ContactSubmission.objects.filter(status='resolved').count()
        
        # Category breakdown
        category_stats = ContactSubmission.objects.values('category').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Recent activity
        today = datetime.now().date()
        today_count = ContactSubmission.objects.filter(
            created_at__date=today
        ).count()
        
        return Response({
            'total': total,
            'pending': pending,
            'resolved': resolved,
            'today': today_count,
            'categories': list(category_stats)
        })

class DepartmentContactViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DepartmentContact.objects.filter(is_active=True).order_by('display_order')
    serializer_class = DepartmentContactSerializer
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def active_departments(self, request):
        """Get all active departments"""
        departments = self.get_queryset()
        serializer = self.get_serializer(departments, many=True)
        return Response(serializer.data)

class FAQViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FAQ.objects.filter(is_active=True).order_by('display_order', 'category')
    serializer_class = FAQSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category', None)
        
        if category:
            queryset = queryset.filter(category=category)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get distinct FAQ categories"""
        categories = FAQ.objects.filter(is_active=True).values_list(
            'category', flat=True
        ).distinct()
        
        # Map category codes to display names
        category_choices = dict(FAQ.CATEGORY_CHOICES)
        result = [
            {
                'value': cat,
                'label': category_choices.get(cat, cat),
                'count': FAQ.objects.filter(category=cat, is_active=True).count()
            }
            for cat in categories
        ]
        
        return Response(result)

class ContactSettingsView(generics.RetrieveAPIView):
    queryset = ContactSettings.objects.all()
    serializer_class = ContactSettingsSerializer
    permission_classes = [AllowAny]
    
    def get_object(self):
        # Return first settings or create default
        try:
            return ContactSettings.objects.first()
        except:
            # Create default settings
            return ContactSettings.objects.create(
                site_name="PTMS Gilgit-Baltistan",
                office_address="PTMS GB Headquarters, Jutial Road, Gilgit, Gilgit-Baltistan",
                primary_email="support@ptmsgb.pk",
                primary_phone="+92 5811 123456",
                emergency_phone="+92 300 1234567",
                working_hours="Mon - Sat: 8:00 AM - 8:00 PM\nSunday: 9:00 AM - 6:00 PM"
            )

# contact/views.py - Update the contact_page_data function COMPLETELY
@api_view(['GET'])
@permission_classes([AllowAny])
def contact_page_data(request):
    """Get all data needed for contact page in one request"""
    try:
        # DIRECTLY get from database - NO CREATION
        settings = ContactSettings.objects.first()
        
        # Debug: Log what we're getting
        if settings:
            print(f"✅ Database se settings mil gaya: ID={settings.id}")
            print(f"   Office Address: {settings.office_address}")
            print(f"   Site Name: {settings.site_name}")
            print(f"   Primary Email: {settings.primary_email}")
            print(f"   Secondary Email: {settings.secondary_email}")
            print(f"   Primary Phone: {settings.primary_phone}")
            print(f"   Secondary Phone: {settings.secondary_phone}")
            print(f"   Emergency Phone: {settings.emergency_phone}")
            print(f"   The address: {settings.google_maps_embed}")
        else:
            print("❌ Database me koi settings nahi hai")
            # Return empty settings, DO NOT CREATE
            settings_data = {}
        
        departments = DepartmentContact.objects.filter(is_active=True).order_by('display_order')
        faqs = FAQ.objects.filter(is_active=True).order_by('display_order', 'category')[:10]
        
        # Prepare response
        response_data = {
            'success': True,
            'settings': ContactSettingsSerializer(settings).data if settings else {},
            'departments': DepartmentContactSerializer(departments, many=True).data,
            'faqs': FAQSerializer(faqs, many=True).data,
            'categories': [
                {'value': 'general', 'label': 'General Inquiry'},
                {'value': 'passenger', 'label': 'Passenger Support'},
                {'value': 'company', 'label': 'Company Registration'},
                {'value': 'technical', 'label': 'Technical Support'},
                {'value': 'feedback', 'label': 'Feedback & Suggestions'},
                {'value': 'emergency', 'label': 'Emergency Assistance'},
            ]
        }
        
        # Debug: Check what's being returned
        print(f"📦 API Response me bhej rahe hain:")
        print(f"   Settings data: {bool(response_data['settings'])}")
        if response_data['settings']:
            print(f"   Office address in response: {response_data['settings'].get('office_address')}")
        
        return Response(response_data)
    
    except Exception as e:
        print(f"❌ Error in contact_page_data: {str(e)}")
        return Response({
            'success': False,
            'error': 'Failed to load contact page data'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)        
        
        
        
        
        