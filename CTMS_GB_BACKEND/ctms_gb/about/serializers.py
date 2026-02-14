# about/serializers.py
from rest_framework import serializers
from .models import *


class StatisticSerializer(serializers.ModelSerializer):
    class Meta:
        model = Statistic
        fields = '__all__'


class FeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feature
        fields = '__all__'


# about/serializers.py
class TeamMemberSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = TeamMember
        fields = '__all__'
    
    def get_image_url(self, obj):
        if obj.image:
            # Get the request from context
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            # Fallback: Construct absolute URL
            return f"http://localhost:8000{obj.image.url}"
        return None

class ValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Value
        fields = '__all__'


class StepItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = StepItem
        fields = '__all__'


class ProcessStepSerializer(serializers.ModelSerializer):
    items = StepItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = ProcessStep
        fields = '__all__'


class ContactInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInfo
        fields = '__all__'


class HeroImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = HeroImage
        fields = '__all__'
    
    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None


class AboutPageSerializer(serializers.ModelSerializer):
    statistics = serializers.SerializerMethodField()
    features = serializers.SerializerMethodField()
    team_members = serializers.SerializerMethodField()
    values = serializers.SerializerMethodField()
    process_steps = serializers.SerializerMethodField()
    contact_info = serializers.SerializerMethodField()
    hero_images = serializers.SerializerMethodField()
    
    class Meta:
        model = AboutPage
        fields = '__all__'
    
    def get_statistics(self, obj):
        stats = Statistic.objects.filter(is_active=True).order_by('order')
        return StatisticSerializer(stats, many=True).data
    
    def get_features(self, obj):
        features = Feature.objects.filter(is_active=True).order_by('order')
        return FeatureSerializer(features, many=True).data
    
    def get_team_members(self, obj):
        members = TeamMember.objects.filter(is_active=True).order_by('order')
        return TeamMemberSerializer(members, many=True).data
    
    def get_values(self, obj):
        values = Value.objects.filter(is_active=True).order_by('order')
        return ValueSerializer(values, many=True).data
    
    def get_process_steps(self, obj):
        steps = ProcessStep.objects.filter(is_active=True).order_by('order')
        return ProcessStepSerializer(steps, many=True).data
    
    def get_contact_info(self, obj):
        contacts = ContactInfo.objects.filter(is_active=True).order_by('order')
        return ContactInfoSerializer(contacts, many=True).data
    
    def get_hero_images(self, obj):
        images = HeroImage.objects.filter(is_active=True).order_by('order')
        return HeroImageSerializer(images, many=True).data