from django.urls import path
# from .views import create_ticket
from . import views
from .views import CompanyTicketListView

urlpatterns = [
    # path("create/", create_ticket, name="create_ticket"),
    path("transport/<int:transport_id>/", views.tickets_by_transport, name="tickets_by_transport"),
    path("my-tickets/", views.my_tickets, name="my-tickets"),
    path('company-tickets/', CompanyTicketListView.as_view(), name='company-tickets'),

    # New URLs for full vehicle booking
    path('full-vehicle-booking/', views.full_vehicle_booking_with_ticket, name='full_vehicle_booking'),
    path('ticket/<int:ticket_id>/', views.get_ticket, name='get_ticket'),
    path('update-payment-status/<int:ticket_id>/', views.update_payment_status, name='update_payment_status'),
    path('debug-tickets/', views.debug_all_tickets, name='debug_tickets'),
]
