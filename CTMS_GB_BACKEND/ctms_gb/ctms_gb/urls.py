from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.views.static import serve

# ctms_gb/urls.py

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("transport.urls")),
    path("api/auth/", include("users.urls")),
    path("api/tickets/", include("passenger_tickets.urls")),
    path("api/checkout/", include("Payment.urls")),
    path("api/contact/", include("contact.urls")),
    path('api/about/', include('about.urls')),
    
    # PWA Files (Root mapping)
    path('sw.js', serve, {'document_root': settings.STATICFILES_DIRS[0], 'path': 'sw.js'}),
    path('service-worker.js', serve, {'document_root': settings.STATICFILES_DIRS[0], 'path': 'sw.js'}),
    path('registerSW.js', serve, {'document_root': settings.STATICFILES_DIRS[0], 'path': 'registerSW.js'}),
    path('manifest.webmanifest', serve, {'document_root': settings.STATICFILES_DIRS[0], 'path': 'manifest.webmanifest'}),
    
    # Workbox Fix
    re_path(r'^(?P<path>workbox-.*\.js)$', serve, {'document_root': settings.STATICFILES_DIRS[0]}),

    # Standard static files handler
    re_path(r'^static/(?P<path>.*)$', serve, {'document_root': settings.STATICFILES_DIRS[0]}),
]

# --- MEDIA HANDLER: Ise Catch-all se PEHLE hona chahiye ---
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# --- CATCH-ALL: Ise HAMESHA AAKHIR mein hona chahiye ---
urlpatterns += [
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]