# about/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from django.utils.text import slugify
import uuid

User = get_user_model()


class AboutPage(models.Model):
    """Main About Page configuration"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hero_title = models.CharField(max_length=200)
    hero_subtitle = models.TextField()
    mission_statement = models.TextField()
    vision_statement = models.TextField()
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "About Page Configuration"
        verbose_name_plural = "About Page Configuration"
    
    def __str__(self):
        return "About Page Configuration"


class Statistic(models.Model):
    """Statistics/numbers displayed on the page"""
    ICON_CHOICES = [
        ('shield', 'Shield'),
        ('users', 'Users'),
        ('map-pin', 'Map Pin'),
        ('calendar', 'Calendar'),
        ('truck', 'Truck'),
        ('award', 'Award'),
        ('star', 'Star'),
        ('clock', 'Clock'),
    ]
    
    COLOR_CHOICES = [
        ('blue', 'Blue'),
        ('green', 'Green'),
        ('purple', 'Purple'),
        ('orange', 'Orange'),
        ('red', 'Red'),
        ('indigo', 'Indigo'),
    ]
    
    title = models.CharField(max_length=100)
    value = models.IntegerField(validators=[MinValueValidator(0)])
    suffix = models.CharField(max_length=10, default="+", help_text="E.g., +, %, etc.")
    description = models.TextField()
    icon = models.CharField(max_length=50, choices=ICON_CHOICES)
    color = models.CharField(max_length=20, choices=COLOR_CHOICES)
    order = models.IntegerField(default=0, help_text="Display order")
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['order']
        verbose_name = "Statistic"
        verbose_name_plural = "Statistics"
    
    def __str__(self):
        return f"{self.title}: {self.value}"


class Feature(models.Model):
    """Platform features"""
    ICON_CHOICES = [
        ('truck', 'Truck'),
        ('users', 'Users'),
        ('cloud', 'Cloud'),
        ('shield', 'Shield'),
        ('navigation', 'Navigation'),
        ('globe', 'Globe'),
        ('check-circle', 'Check Circle'),
        ('phone', 'Phone'),
        ('mail', 'Mail'),
        ('map', 'Map'),
        ('award', 'Award'),
        ('star', 'Star'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.CharField(max_length=50, choices=ICON_CHOICES)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['order']
        verbose_name = "Feature"
        verbose_name_plural = "Features"
    
    def __str__(self):
        return self.title


class TeamMember(models.Model):
    """Team members section"""
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    bio = models.TextField()
    image = models.ImageField(upload_to='team/')
    email = models.EmailField()
    linkedin_url = models.URLField(blank=True, null=True)
    twitter_url = models.URLField(blank=True, null=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['order']
        verbose_name = "Team Member"
        verbose_name_plural = "Team Members"
    
    def __str__(self):
        return f"{self.name} - {self.role}"


class Value(models.Model):
    """Company values"""
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50, choices=Feature.ICON_CHOICES)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['order']
        verbose_name = "Company Value"
        verbose_name_plural = "Company Values"
    
    def __str__(self):
        return self.title


class ProcessStep(models.Model):
    """How It Works steps"""
    COLOR_CHOICES = [
        ('blue', 'Blue'),
        ('green', 'Green'),
        ('purple', 'Purple'),
        ('orange', 'Orange'),
    ]
    
    step_number = models.CharField(max_length=10, help_text="E.g., 01, 02, 03")
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=200)
    color = models.CharField(max_length=20, choices=COLOR_CHOICES)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['order']
        verbose_name = "Process Step"
        verbose_name_plural = "Process Steps"
    
    def __str__(self):
        return f"Step {self.step_number}: {self.title}"


class StepItem(models.Model):
    """Items within each process step"""
    process_step = models.ForeignKey(ProcessStep, on_delete=models.CASCADE, related_name='items')
    text = models.CharField(max_length=200)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        verbose_name = "Step Item"
        verbose_name_plural = "Step Items"
    
    def __str__(self):
        return self.text[:50]


class ContactInfo(models.Model):
    """Contact information"""
    ICON_CHOICES = [
        ('phone', 'Phone'),
        ('mail', 'Mail'),
        ('map', 'Map'),
    ]
    
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=200)
    detail = models.CharField(max_length=200)
    icon = models.CharField(max_length=50, choices=ICON_CHOICES)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['order']
        verbose_name = "Contact Information"
        verbose_name_plural = "Contact Information"
    
    def __str__(self):
        return self.title


class HeroImage(models.Model):
    """Hero section background images"""
    title = models.CharField(max_length=100)
    image = models.ImageField(upload_to='about/hero/')
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['order']
        verbose_name = "Hero Image"
        verbose_name_plural = "Hero Images"
    
    def __str__(self):
        return self.title