from django.conf import settings
from django.conf.urls.static import static
from .views import CompanyDetailCreateView, CompanyDetailRetrieveView
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
# from .views import CompanyDetailCreateView

from .views import (
    PassengerRegisterView,
    CompanyInitialRegisterView,
    LoginView,
    RefreshTokenView,
    LogoutView,
    MyTokenObtainPairView,
    PassengerDashboardView,
    CompanyDashboardView,
    MyCompanyDetailView,
    CompanyDetailMeView,
    ProfileView,
    ProfileUpdateView,
    UserProfileUpdateView,
    DriverListCreateView,
    DriverRetrieveUpdateDestroyView,
    DriverSerializer
)
from .views import PassengerProfileView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer
from .views import VehicleListCreateView, VehicleRetrieveUpdateDestroyView
from .views import VerifyPasswordView,ChangePasswordView
from .views import UpdateMyCompanyDetailView

from .views import forgot_password,verify_reset_otp,reset_password
from .views import send_status_email, send_ticket_email



urlpatterns = [
    path("register/passenger/", PassengerRegisterView.as_view(), name="register-passenger"),
    path("register/company/", CompanyInitialRegisterView.as_view(), name="register-company"),
    # path("login/", LoginView.as_view(), name="login"),
    path("login/", MyTokenObtainPairView.as_view(), name="login"),
    path("token/refresh/", RefreshTokenView.as_view(), name="token-refresh"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("dashboard/passenger/", PassengerDashboardView.as_view(), name="passenger-dashboard"),
    path("dashboard/company/", CompanyDashboardView.as_view(), name="company-dashboard"),
    path("CompanyDetail/", CompanyDetailCreateView.as_view(), name="company-detail-create"),
    path("CompanyDetail/", CompanyDetailRetrieveView.as_view(), name="company-detail"),
    path("CompanyDetail/me/", MyCompanyDetailView.as_view(), name="my-company-detail"),
    path("my-company-detail/", MyCompanyDetailView.as_view(), name="my-company-detail"),
    path("update-my-company-detail/", UpdateMyCompanyDetailView.as_view(), name="my-company-detail"),

    # path("CompanyDetail/", CompanyDetailMeView.as_view(), name="company-detail-me"),
    path("auth/profile/", ProfileView.as_view(), name="profile"),
    path("auth/profile/update/", ProfileUpdateView.as_view(), name="profile-update"),
    path("me/", UserProfileUpdateView.as_view(), name="user-profile"),
    path('passenger/profile/', PassengerProfileView.as_view(), name='passenger-profile'),
    path("passenger/verify-password/", VerifyPasswordView.as_view(), name="verify-password"),
    path("passenger/change-password/", ChangePasswordView.as_view(), name="change-password"),

    path("drivers/", DriverListCreateView.as_view(), name="driver-list-create"),
    path("drivers/<int:pk>/", DriverRetrieveUpdateDestroyView.as_view(), name="driver-detail"),
    path("my-drivers/", DriverListCreateView.as_view(), name="my-drivers"),

    # ... your existing routes ...
    path("vehicles/", VehicleListCreateView.as_view(), name="vehicle-list-create"),
    path("vehicles/<int:pk>/", VehicleRetrieveUpdateDestroyView.as_view(), name="vehicle-detail"),


    path('forgot-password/', forgot_password, name='forgot_password'),
    path('verify-reset-otp/', verify_reset_otp, name='verify_reset_otp'),
    path('reset-password/', reset_password, name='reset_password'),
    path('notifications/send-status-email/', send_status_email, name='send_status_email'),
    path('notifications/send-ticket-email/', send_ticket_email, name='send_ticket_email'),

      ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


