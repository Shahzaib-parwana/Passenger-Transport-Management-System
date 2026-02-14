# about/admin.py
from django.contrib import admin
from .models import *

@admin.register(AboutPage)
class AboutPageAdmin(admin.ModelAdmin):
    list_display = ('hero_title', 'is_active', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('hero_title', 'hero_subtitle')


@admin.register(Statistic)
class StatisticAdmin(admin.ModelAdmin):
    list_display = ('title', 'value', 'icon', 'color', 'order', 'is_active')
    list_filter = ('is_active', 'color')
    list_editable = ('order', 'is_active')
    search_fields = ('title', 'description')


@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ('title', 'icon', 'order', 'is_active')
    list_filter = ('is_active', 'icon')
    list_editable = ('order', 'is_active')
    search_fields = ('title', 'description')


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'email', 'order', 'is_active')
    list_filter = ('is_active',)
    list_editable = ('order', 'is_active')
    search_fields = ('name', 'role', 'bio')


@admin.register(Value)
class ValueAdmin(admin.ModelAdmin):
    list_display = ('title', 'icon', 'order', 'is_active')
    list_filter = ('is_active',)
    list_editable = ('order', 'is_active')
    search_fields = ('title', 'description')


@admin.register(ProcessStep)
class ProcessStepAdmin(admin.ModelAdmin):
    list_display = ('step_number', 'title', 'color', 'order', 'is_active')
    list_filter = ('is_active', 'color')
    list_editable = ('order', 'is_active')
    search_fields = ('title', 'subtitle')
    inlines = []


@admin.register(ContactInfo)
class ContactInfoAdmin(admin.ModelAdmin):
    list_display = ('title', 'detail', 'icon', 'order', 'is_active')
    list_filter = ('is_active', 'icon')
    list_editable = ('order', 'is_active')
    search_fields = ('title', 'description', 'detail')


@admin.register(HeroImage)
class HeroImageAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'is_active')
    list_filter = ('is_active',)
    list_editable = ('order', 'is_active')


@admin.register(StepItem)
class StepItemAdmin(admin.ModelAdmin):
    list_display = ('text', 'process_step', 'order')
    list_filter = ('process_step',)
    list_editable = ('order',)
    search_fields = ('text',)