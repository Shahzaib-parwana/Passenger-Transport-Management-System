# from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404

from .models import CompanyDetail
from .serializers import CompanyDetailSerializer
# views.py
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import get_user_model, authenticate
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import (
    PassengerRegisterSerializer,
    CompanyInitialRegisterSerializer,
    UserSerializer,
    MyTokenObtainPairSerializer
)


User = get_user_model()

# Role mapping for frontend (if you had legacy names like "shaka"/"saim")
ROLE_MAP = {
    "shaka": "company",
    "saim": "passenger",
    "admin": "admin"
}

# -------------------
# Helper to set cookies
# -------------------
def set_token_cookies(response, access_token=None, refresh_token=None):
    """
    Set access & refresh cookies on a Response.
    If tokens are None, this function will not generate new tokens (we generate tokens in the view).
    """
    # set access cookie
    if access_token:
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,  # True in production (HTTPS)
            samesite="Lax",
            max_age=60 * 30,  # 30 minutes
        )
    # set refresh cookie
    if refresh_token:
        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=7 * 24 * 60 * 60,
        )
    return response


# -------------------
# Auth Views
# -------------------
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class PassengerRegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = PassengerRegisterSerializer
    queryset = User.objects.all()

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = ser.save()
        # generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        resp = Response({
            "message": "Passenger registered successfully",
            "user": UserSerializer(user).data,
            "role": ROLE_MAP.get(user.role, user.role),
            "access": access_token,
            "refresh": refresh_token,
        }, status=status.HTTP_201_CREATED)

        return set_token_cookies(resp, access_token=access_token, refresh_token=refresh_token)


class CompanyInitialRegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    serializer_class = CompanyInitialRegisterSerializer

    def create(self, request, *args, **kwargs):
        ser = self.get_serializer(data=request.data)
        ser.is_valid(raise_exception=True)
        company = ser.save()
        user = company.user

        # generate tokens for the created user (if you want to auto-login them on register)
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        resp = Response({
            "message": "Company registered (initial). Pending admin approval.",
            "company_id": company.id,
            "role": ROLE_MAP.get(user.role, user.role),
            "access": access_token,
            "refresh": refresh_token,
        }, status=status.HTTP_201_CREATED)

        return set_token_cookies(resp, access_token=access_token, refresh_token=refresh_token)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username_or_email = request.data.get("username") or request.data.get("email")
        password = request.data.get("password")
        user = None

        if username_or_email and password:
            try:
                # try to find by email first, then by username
                found_user = User.objects.filter(email__iexact=username_or_email).first()
                if found_user:
                    user = authenticate(request, username=found_user.username, password=password)
                else:
                    user = authenticate(request, username=username_or_email, password=password)
            except Exception:
                user = None

        if user is None:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # map role to friendly name
        role_name = ROLE_MAP.get(user.role, user.role)

        # generate tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # default: no status (for passengers/admin)
        status_value = None
        if role_name == "company":
            # related_name in your model is company_profile
            company_profile = getattr(user, "company_profile", None)
            # company_profile = getattr(user, "company_detail", None)
            if company_profile:
                status_value = company_profile.status  # 'approved' / 'pending' / 'rejected'

        resp_data = {
            "message": "Login successful",
            "user": UserSerializer(user).data,
            "role": role_name,
            "access": access_token,
            "refresh": refresh_token,
        }
        if status_value is not None:
            resp_data["status"] = status_value

        resp = Response(resp_data)
        return set_token_cookies(resp, access_token=access_token, refresh_token=refresh_token)


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"detail": "Refresh token missing"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            token = RefreshToken(refresh_token)
            new_access = token.access_token
            resp = Response({"access": str(new_access)})
            resp.set_cookie(
                key="access_token",
                value=str(new_access),
                httponly=True,
                secure=False,
                samesite="Lax",
                max_age=60 * 30,
            )
            return resp
        except Exception:
            return Response({"detail": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    def post(self, request):
        resp = Response({"message": "Logged out"}, status=status.HTTP_200_OK)
        resp.delete_cookie("access_token")
        resp.delete_cookie("refresh_token")
        return resp


# -------------------
# Dashboard Views
# -------------------
class PassengerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "message": "Welcome to Passenger Dashboard",
            "username": request.user.username,
            "role": "passenger"
        })


class CompanyDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "message": "Welcome to Company Dashboard",
            "username": request.user.username,
            "role": "company"
        })
#################################

# company form
##################################

# users/views.py
import re
import json
import random
import string

from django.contrib.auth import get_user_model

from rest_framework import generics, permissions
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework import status

from .models import CompanyDetail
from .serializers import CompanyDetailSerializer

User = get_user_model()


# users/views.py (sirf create method update)
class CompanyDetailCreateView(generics.CreateAPIView):
    serializer_class = CompanyDetailSerializer
    queryset = CompanyDetail.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        data = request.data
        files = request.FILES
        user = request.user  

        def try_parse_json(val):
            if val is None:
                return []
            if isinstance(val, str):
                try:
                    return json.loads(val)
                except Exception:
                    return []
            return val or []

        routes = try_parse_json(data.get("routes"))
        vehicles = try_parse_json(data.get("vehicles"))
        drivers = try_parse_json(data.get("drivers"))

        existing = CompanyDetail.objects.filter(user=user).first()

        # ✅ Vehicles handle
        for i, v in enumerate(vehicles):
            img = files.get(f"vehicles[{i}][image]") or files.get(f"vehicle_images_{i}")
            if img:
                v["image"] = img
            else:
                # Agar naya image nahi aaya to purana hi rehne do
                try:
                    existing_vehicle = existing.vehicles.all()[i]
                    v["image"] = existing_vehicle.image  # Purana assign kar do
                except:
                    pass


        # ✅ Drivers handle
        for i, d in enumerate(drivers):
            img = files.get(f"drivers[{i}][image]") or files.get(f"driver_images_{i}")
            if img:
                d["image"] = img
            else:
                try:
                    existing_driver = existing.drivers.all()[i]
                    d["image"] = existing_driver.image
                except:
                    pass


        payload = {
    "company_name": data.get("company_name", ""),
    "registration_id": data.get("registration_id", ""),
    "company_email": data.get("company_email", ""),
    "contact_number_1": data.get("contact_number_1", ""),
    "contact_number_2": data.get("contact_number_2") or None,
    "company_type": data.get("company_type", "") or "offer_vehicle",
    "main_office_location": data.get("main_office_location", ""),
    "Passenger_instruction": data.get("Passenger_instruction", ""),
    "company_logo": files.get("company_logo"),
    "owner_name": data.get("owner_name", ""),
    "owner_email": data.get("owner_email", ""),
    "owner_contact_number": data.get("owner_contact_number", ""),
    "owner_cnic": data.get("owner_cnic", ""),
    "owner_address": data.get("owner_address", ""),
    "agreement_accepted": str(data.get("agreement_accepted", "")).lower() in ("true", "1", "yes"),
    "is_submitted": str(data.get("is_submitted", "")).lower() in ("true", "1", "yes"),
    "routes": routes,
    "vehicles": vehicles,
    "drivers": drivers,
}


        if existing:
            serializer = self.get_serializer(existing, data=payload, partial=True)
        else:
            serializer = self.get_serializer(data=payload)

        serializer.is_valid(raise_exception=True)
        instance = serializer.save(user=user)

        return Response(serializer.data, status=status.HTTP_200_OK if existing else status.HTTP_201_CREATED)



from rest_framework import generics, permissions
from .models import CompanyDetail
from .serializers import CompanyDetailSerializer

class CompanyDetailRetrieveView(generics.RetrieveAPIView):
    serializer_class = CompanyDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Return company detail of logged-in user
        return CompanyDetail.objects.filter(user=self.request.user).first()



# //////////////////////////////////


# //////////////////////////////////
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CompanyDetail
from .serializers import CompanyDetailSerializer



class CompanyDetailMeView(APIView):
    """
    GET  /api/auth/CompanyDetail/   → fetch current user's detail
    POST /api/auth/CompanyDetail/   → create or update (upsert)
    PUT  /api/auth/CompanyDetail/   → full update
    PATCH /api/auth/CompanyDetail/  → partial update
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self, request):
        try:
            return request.user.company_detail
        except CompanyDetail.DoesNotExist:
            return None

    def get(self, request):
        obj = self.get_object(request)
        if not obj:
            return Response(
                {"detail": "No company profile exists yet.", "id": None},
                status=status.HTTP_200_OK,
            )
        ser = CompanyDetailSerializer(obj, context={"request": request})
        return Response(ser.data, status=status.HTTP_200_OK)

    def post(self, request):
        obj = self.get_object(request)
        if obj:
            # ✅ Update existing
            ser = CompanyDetailSerializer(obj, data=request.data, context={"request": request}, partial=True)
        else:
            # ✅ Create new (linked to logged-in user)
            ser = CompanyDetailSerializer(data=request.data, context={"request": request})

        ser.is_valid(raise_exception=True)
        instance = ser.save(user=request.user)
        return Response(CompanyDetailSerializer(instance, context={"request": request}).data)

    def put(self, request):
        return self.post(request)

    def patch(self, request):
        obj = self.get_object(request)
        if not obj:
            return Response({"detail": "No profile exists yet."}, status=status.HTTP_404_NOT_FOUND)
        ser = CompanyDetailSerializer(obj, data=request.data, context={"request": request}, partial=True)
        ser.is_valid(raise_exception=True)
        instance = ser.save(user=request.user)
        return Response(CompanyDetailSerializer(instance, context={"request": request}).data)

from rest_framework.generics import RetrieveAPIView
class MyCompanyDetailView(generics.RetrieveAPIView):
    serializer_class = CompanyDetailSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        # Current logged-in user ka company detail return kare
        try:
            return self.request.user.company_detail
        except CompanyDetail.DoesNotExist:
            # Agar record nahi hai to 404 return kare
            from rest_framework.exceptions import NotFound
            raise NotFound("Company detail not found for this user")
 
        
class CompanyDetailAdminView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CompanyDetail.objects.all()
    serializer_class = CompanyDetailSerializer
    permission_classes = [permissions.IsAdminUser]


# ///////////////////////////

# views.py
from rest_framework import generics, permissions
from rest_framework.response import Response
from .serializers import CompanyBasicUpdateSerializer

class UpdateMyCompanyDetailView(generics.UpdateAPIView):
    serializer_class = CompanyBasicUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.company_detail

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)



# ????\\\\/////////////////////////////////

# ////////////////////////////////////////////

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate

class VerifyPasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        password = request.data.get("password")
        user = request.user

        if not password:
            return Response({"detail": "Password is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate user with current password
        user_auth = authenticate(username=user.username, password=password)
        if user_auth is None:
            return Response({"detail": "Incorrect password"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({"detail": "Password verified"}, status=status.HTTP_200_OK)
    

# users/views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")

        if not old_password or not new_password:
            return Response({"detail": "Both old and new password are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check old password
        if not user.check_password(old_password):
            return Response({"detail": "Incorrect current password."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate new password length
        if len(new_password) < 8:
            return Response({"detail": "Password must be at least 8 characters."}, status=status.HTTP_400_BAD_REQUEST)

        # Set new password
        user.set_password(new_password)
        user.save()

        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)


from rest_framework import generics, permissions
from users.serializers import UserSerializer  # serializer mein username, email, phone_number, cnic_or_passport hone chahiye

class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ProfileUpdateView(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# //////////////////////////////////////////////



User = get_user_model()

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer

class UserProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserProfileSerializer, UserUpdateSerializer

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import PassengerProfile
from .serializers import PassengerProfileSerializer

class PassengerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = PassengerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return PassengerProfile.objects.get(user=self.request.user)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = instance.user

        # ---------- USER UPDATE ----------
        user_fields = ["username", "email", "phone_number"]
        for field in user_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        user.save()

        # ---------- PROFILE UPDATE ----------
        profile_fields = [
            "cnic_or_passport",
            "address",
            "gender",
            "date_of_birth",
            "living_status",
            "current_status",
            "special_person",
            "additional_info",
        ]
        for field in profile_fields:
            if field in request.data:
                setattr(instance, field, request.data[field])

        # boolean fix
        if "notification_enabled" in request.data:
            instance.notification_enabled = request.data["notification_enabled"] in ["true", "1", True]

        # image
        if "profile_picture" in request.FILES:
            instance.profile_picture = request.FILES["profile_picture"]

        instance.save()
        return Response(PassengerProfileSerializer(instance).data)

        def to_bool(val):
            if str(val).lower() in ["true", "1", "yes"]:
                return True
            return False


# ////////////////////////////////
# ===============================
# DRIVER CRUD VIEWS
# ===============================
# ////////////////////////////////
# ============================
# Driver CRUD APIs
# ============================
from rest_framework import generics, permissions
from .models import Driver
from .serializers import DriverSerializer
from rest_framework.exceptions import PermissionDenied

class DriverListCreateView(generics.ListCreateAPIView):
    serializer_class = DriverSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        company = getattr(user, "company_detail", None)
        if company:
            return Driver.objects.filter(company=company)
        return Driver.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        company = getattr(user, "company_detail", None)
        if not company:
            raise PermissionDenied("You must create a company profile first.")
        serializer.save(company=company)



class DriverDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DriverSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # ✅ Ensure company can only modify their own drivers
        return Driver.objects.filter(company__user=self.request.user)


class DriverRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DriverSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        company = CompanyDetail.objects.filter(user=self.request.user).first()
        return Driver.objects.filter(company=company)


# views.py
from rest_framework import generics, permissions
from .models import Vehicle
from .serializers import VehicleSerializer
from rest_framework import serializers


class VehicleListCreateView(generics.ListCreateAPIView):
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # CompanyDetail me user relation check
        return Vehicle.objects.filter(company__user=user)

    def perform_create(self, serializer):
        user = self.request.user
        company = getattr(user, "companydetail", None)  # safe relation
        if not company:
            raise serializers.ValidationError("No company associated with this user.")
        serializer.save(company=company)


class VehicleRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Vehicle.objects.filter(company__user=user)
#  ////////////////////////////////////////////////////////////////////////////   
# Email to passenger

from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.conf import settings
import json
from datetime import datetime
import logging

# Setup logger
logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_status_email(request):
    """
    Send email notification to passenger when booking status is updated
    """
    try:
        data = request.data
        logger.info(f"📧 Email request received: {data}")
        
        # Extract data from request
        booking_id = data.get('booking_id')
        passenger_name = data.get('passenger_name')
        passenger_email = data.get('passenger_email')
        vehicle_number = data.get('vehicle_number')
        route = data.get('route')
        date = data.get('date')
        time = data.get('time')
        previous_status = data.get('previous_status', 'N/A')
        new_status = data.get('new_status')
        new_payment_status = data.get('new_payment_status', 'N/A')
        amount = data.get('amount', 0)
        booking_type = data.get('booking_type', 'Booking')
        seats = data.get('seats', 'N/A')
        
        # Validate required fields
        if not passenger_email:
            logger.warning("No passenger email provided")
            return Response({
                'success': False,
                'message': 'Passenger email is required'
            }, status=400)
        
        # SIMPLE EMAIL FOR TESTING - Remove HTML templates
        subject = f"Booking Status Updated - {booking_id}"
        
        # Plain text email message
        message = f"""
        Dear {passenger_name},
        
        Your booking status has been updated.
        
        Booking Details:
        - Booking ID: {booking_id}
        - Vehicle: {vehicle_number}
        - Route: {route}
        - Date: {date}
        - Time: {time}
        - Previous Status: {previous_status}
        - New Status: {new_status}
        - Payment Status: {new_payment_status}
        - Amount: Rs. {amount}
        - Booking Type: {booking_type}
        - Seats: {seats}
        
        Thank you for choosing our service!
        
        Best regards,
        Transport Management System
        """
        
        # Check email settings
        logger.info(f"Email settings - Backend: {settings.EMAIL_BACKEND}")
        logger.info(f"From email: {settings.DEFAULT_FROM_EMAIL}")
        logger.info(f"Sending to: {passenger_email}")
        
        try:
            # Try sending with SMTP
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[passenger_email],
                fail_silently=False,
            )
            logger.info(f"✅ Email sent successfully to {passenger_email}")
            
            return Response({
                'success': True,
                'message': 'Email notification sent successfully',
                'data': {
                    'recipient': passenger_email,
                    'booking_id': booking_id,
                    'status': new_status
                }
            })
            
        except Exception as e:
            logger.error(f"SMTP email failed: {str(e)}")
            
            # Fallback: Log to console (for development)
            print("\n" + "="*50)
            print("📧 EMAIL NOTIFICATION (Console Preview)")
            print("="*50)
            print(f"To: {passenger_email}")
            print(f"Subject: {subject}")
            print(f"Message:\n{message}")
            print("="*50)
            
            # For development, we can return success even if email fails
            # Remove this in production
            return Response({
                'success': True,
                'message': 'Email would be sent in production. See console for preview.',
                'data': {
                    'recipient': passenger_email,
                    'booking_id': booking_id,
                    'status': new_status,
                    'preview': 'Check Django console for email preview'
                }
            })
        
    except Exception as e:
        logger.error(f"Error in send_status_email: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return Response({
            'success': False,
            'message': f'Failed to send email: {str(e)}'
        }, status=500)
    
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_ticket_email(request):
    """
    Send ticket email to passenger
    """
    try:
        data = request.data
        
        passenger_email = data.get('passenger_email')
        ticket_data = data.get('ticket_data')
        
        if not passenger_email or not ticket_data:
            return Response({
                'success': False,
                'message': 'Passenger email and ticket data are required'
            }, status=400)
        
        # Prepare email
        subject = f"Your E-Ticket - Booking ID: {ticket_data.get('booking_id')}"
        
        context = {
            **ticket_data,
            'current_date': datetime.now().strftime("%d %B, %Y"),
            'company_name': 'Transport Management System'
        }
        
        html_message = render_to_string('emails/ticket_email.html', context)
        plain_message = strip_tags(html_message)
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[passenger_email]
        )
        email.attach_alternative(html_message, "text/html")
        
        email.send()
        
        return Response({
            'success': True,
            'message': 'Ticket email sent successfully'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=500)



# /////////////////////////////////////////////////////////////////////////////////////////////
# Reset Pasword 

import time
from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth.hashers import make_password
import random
import json
import os

# Simple in-memory storage for development
# In production, use Django cache or Redis
_reset_store = {}

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """Send OTP to user's email for password reset"""
    
    email = request.data.get('email')
    
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        from .models import User
        
        # Find user by email
        user = User.objects.filter(email=email).first()
        
        if not user:
            # For security, don't reveal if email exists
            return Response({
                'message': 'If your email is registered, you will receive a reset code shortly.'
            }, status=status.HTTP_200_OK)
        
        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))
        
        # Store OTP in simple dictionary (for development only)
        # In production, use Django cache or Redis
        _reset_store[f'otp_{user.id}'] = {
            'otp': otp,
            'timestamp': time.time()
        }
        
        print(f"\n{'='*60}")
        print(f"DEBUG: Password Reset OTP for {email}")
        print(f"OTP: {otp}")
        print(f"User ID: {user.id}")
        print(f"{'='*60}\n")
        
        # Try to send email (optional for development)
        try:
            EMAIL_BACKEND = getattr(settings, 'EMAIL_BACKEND', '')
            if EMAIL_BACKEND != 'django.core.mail.backends.console.EmailBackend':
                subject = 'Password Reset OTP - Travel App'
                message = f'Your OTP is: {otp}'
                from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@travelapp.com')
                
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=from_email,
                    recipient_list=[email],
                    fail_silently=True,
                )
        except:
            pass  # Email sending is optional for development
        
        return Response({
            'message': 'Reset code sent to your email',
            'user_id': user.id
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error in forgot_password: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return Response(
            {'error': 'Failed to send reset code'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_reset_otp(request):
    """Verify OTP for password reset"""
    import time
    
    user_id = request.data.get('user_id')
    otp = request.data.get('otp')
    
    if not all([user_id, otp]):
        return Response(
            {'error': 'User ID and OTP are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Get stored OTP from simple dictionary
        store_key = f'otp_{user_id}'
        stored_data = _reset_store.get(store_key)
        
        if not stored_data:
            return Response(
                {'error': 'OTP expired or invalid. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if OTP is expired (10 minutes = 600 seconds)
        if time.time() - stored_data['timestamp'] > 600:
            del _reset_store[store_key]
            return Response(
                {'error': 'OTP has expired. Please request a new one.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if stored_data['otp'] != otp:
            return Response(
                {'error': 'Invalid OTP code. Please try again.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # OTP verified successfully
        # Generate a verification token
        import uuid
        reset_token = str(uuid.uuid4())
        
        # Store reset token
        _reset_store[f'token_{user_id}'] = {
            'token': reset_token,
            'timestamp': time.time()
        }
        
        # Remove OTP after successful verification
        del _reset_store[store_key]
        
        return Response({
            'message': 'OTP verified successfully',
            'reset_token': reset_token
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Error in verify_reset_otp: {str(e)}")
        return Response(
            {'error': 'Verification failed. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """Reset password with verification token"""
    import time
    
    user_id = request.data.get('user_id')
    reset_token = request.data.get('reset_token')
    new_password = request.data.get('new_password')
    
    if not all([user_id, reset_token, new_password]):
        return Response(
            {'error': 'All fields are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate password strength
    if len(new_password) < 8:
        return Response(
            {'error': 'Password must be at least 8 characters long'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        from .models import User
        
        # Verify reset token
        store_key = f'token_{user_id}'
        stored_data = _reset_store.get(store_key)
        
        if not stored_data or stored_data['token'] != reset_token:
            return Response(
                {'error': 'Invalid or expired reset token. Please start the process again.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if token is expired (10 minutes = 600 seconds)
        if time.time() - stored_data['timestamp'] > 600:
            del _reset_store[store_key]
            return Response(
                {'error': 'Reset token has expired. Please start the process again.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get user and update password
        user = User.objects.get(id=user_id)
        user.set_password(new_password)
        user.save()
        
        # Clear the reset token
        del _reset_store[store_key]
        
        return Response({
            'message': 'Password has been reset successfully. You can now login with your new password.'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        print(f"Error in reset_password: {str(e)}")
        return Response(
            {'error': 'Failed to reset password. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )