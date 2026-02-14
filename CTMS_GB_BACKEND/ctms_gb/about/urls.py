# about/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *

router = DefaultRouter()
router.register(r'about-page', AboutPageViewSet, basename='about-page')
router.register(r'statistics', StatisticViewSet)
router.register(r'features', FeatureViewSet)
router.register(r'team-members', TeamMemberViewSet)
router.register(r'values', ValueViewSet)
router.register(r'process-steps', ProcessStepViewSet)
router.register(r'contact-info', ContactInfoViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('active/', AboutPageViewSet.as_view({'get': 'active'}), name='about-page-active'),
]