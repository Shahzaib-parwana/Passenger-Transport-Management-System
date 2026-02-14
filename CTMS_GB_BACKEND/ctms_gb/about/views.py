# about/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from .models import *
from .serializers import *


class AboutPageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for About Page configuration
    """
    queryset = AboutPage.objects.all()
    serializer_class = AboutPageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        return AboutPage.objects.filter(is_active=True)
    
 
    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        about_page = self.get_queryset().first()
        if not about_page:
            return Response({
                "message": "No active about page configuration found",
                "statistics": [],
                "features": [],
                "team_members": [],
                "values": [],
                "process_steps": [],
                "contact_info": [],
                "hero_images": []
            })
        
        # Pass request context
        serializer = self.get_serializer(about_page, context={'request': request})
        return Response(serializer.data)        
        
        
        


class StatisticViewSet(viewsets.ModelViewSet):
    queryset = Statistic.objects.filter(is_active=True).order_by('order')
    serializer_class = StatisticSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class FeatureViewSet(viewsets.ModelViewSet):
    queryset = Feature.objects.filter(is_active=True).order_by('order')
    serializer_class = FeatureSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class TeamMemberViewSet(viewsets.ModelViewSet):
    queryset = TeamMember.objects.filter(is_active=True).order_by('order')
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ValueViewSet(viewsets.ModelViewSet):
    queryset = Value.objects.filter(is_active=True).order_by('order')
    serializer_class = ValueSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ProcessStepViewSet(viewsets.ModelViewSet):
    queryset = ProcessStep.objects.filter(is_active=True).order_by('order')
    serializer_class = ProcessStepSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


class ContactInfoViewSet(viewsets.ModelViewSet):
    queryset = ContactInfo.objects.filter(is_active=True).order_by('order')
    serializer_class = ContactInfoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]