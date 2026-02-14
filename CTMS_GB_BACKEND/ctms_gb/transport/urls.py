# transport/urls.py (FINALIZED)
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.routers import DefaultRouter
# --- Import all required views ---
from .views import (
    # Public Facing APIs
    SeatBookingCompaniesAPIView, 
    VehicleBookingCompaniesAPIView,
    CompanyTransportListView, # New transport list view
    TransportSearchView,
    # Company Dashboard APIs (CRUD for company's resources)
    RouteListCreateView,
    VehicleListCreateView,
    DriverListCreateView,
    TransportListCreateView, # Transport CRUD List/Create
    TransportDetailView,     # Transport CRUD Retrieve/Update/Destroy
    TransportViewSet,
    # Utility/Test Views
    MyCompanyProfileTestView,
    CompanyVehiclesAPIView,
    all_drivers,
    TransportStatusUpdateView,
)
# from .views import SeatBookingOffersList, VehicleRentalOffersList,AllTransportsOffersList
# NOTE: DefaultRouter and TransportViewSet removed as Generics are used.
# Router for ViewSets
router = DefaultRouter()
router.register(r"transports", TransportViewSet, basename="transport")
urlpatterns = [
    # router = DefaultRouter()
    # 1. PUBLIC FACING APIs (Company Listings)
    path('companies/seat-booking/', SeatBookingCompaniesAPIView.as_view(), name='seat-companies-list'),
    path('companies/vehicle-booking/', VehicleBookingCompaniesAPIView.as_view(), name='vehicle-companies-list'),
    
    # 2. PUBLIC FACING APIs (Transport Listings by Company)
    # Frontend URL: /company/:company_id/transports/ ya /company/:company_id/vehicles/
    path('companies/<int:company_id>/transports/', CompanyTransportListView.as_view(), name='company-transports-list'),
    
    # 3. AUTHENTICATION (JWT)
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # 4. COMPANY DASHBOARD APIs (CRUD for logged-in company)
    path("routes/", RouteListCreateView.as_view(), name="route-list-create"),
    path("vehicles/", VehicleListCreateView.as_view(), name="vehicle-list-create"),
    path("drivers/", DriverListCreateView.as_view(), name="driver-list-create"),
    
    # Transport CRUD (List, Create)
    path("transports/", TransportListCreateView.as_view(), name="transport-list-create"),
    path("search/", TransportSearchView.as_view(), name="transport-search"),
    path("transports/<int:pk>/", TransportDetailView.as_view(), name="transport-detail"),

    # 5. UTILITY / TEST Endpoints (can be removed later)
    path("test/my-company/", MyCompanyProfileTestView.as_view(), name="my-company-test"),
    path("test/all-drivers/", all_drivers, name="all-drivers"),
    path("",include(router.urls)),
    path("company/<int:company_id>/vehicles/", CompanyVehiclesAPIView.as_view()),
     path('transports/<int:transport_id>/status/', TransportStatusUpdateView.as_view(), name='transport-status-update'),

]
