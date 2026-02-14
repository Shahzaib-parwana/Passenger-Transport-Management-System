# contact/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'submissions', views.ContactSubmissionViewSet, basename='submission')
router.register(r'departments', views.DepartmentContactViewSet, basename='department')
router.register(r'faqs', views.FAQViewSet, basename='faq')

urlpatterns = [
    # API endpoints
    path('', include(router.urls)),
    
    # Contact page data
    path('contact-data/', views.contact_page_data, name='contact-page-data'),
    
    # Contact settings
    path('settings/', views.ContactSettingsView.as_view(), name='contact-settings'),
    
    # Submit contact form
    path('submit/', views.ContactSubmissionViewSet.as_view({'post': 'create'}), name='submit-contact'),
]