# transport/views.py (UPDATED FOR NEW PRICING SYSTEM)

from rest_framework import generics, permissions, viewsets,status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Q
from django.utils import timezone


# Models and Serializers
from users.models import CompanyDetail, Route, Vehicle, Driver
from .models import Transport
from .serializers import CompanyDetailSerializer, TransportSerializer
from users.serializers import RouteSerializer, VehicleSerializer, DriverSerializer
from rest_framework.permissions import AllowAny

# ------------------------------------------------------------------------------
# 1. PUBLIC FACING VIEWS (Company Listing & Transport Listing) - NO CHANGES NEEDED
# ------------------------------------------------------------------------------

# Helper function (Existing - No changes)
def get_approved_submitted_company_ids():
    """Returns a list of CompanyDetail IDs that are approved and submitted."""
    return CompanyDetail.objects.filter(
        user__company_profile__status='approved',
        is_submitted=True
    ).values_list('id', flat=True)


class SeatBookingCompaniesAPIView(generics.ListAPIView):
    serializer_class = CompanyDetailSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        # Get company IDs who are offering seat booking
        company_ids = Transport.objects.filter(
            offer_type='offer_sets'
        ).values_list('company_id', flat=True).distinct()

        # Send all companies who have seat offers
        return CompanyDetail.objects.filter(id__in=company_ids).order_by('company_name')

    def get_serializer_context(self):
        return {"request": self.request}


class VehicleBookingCompaniesAPIView(generics.ListAPIView):
    serializer_class = CompanyDetailSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        # List ONLY companies who have whole-vehicle offers
        company_ids = Transport.objects.filter(
            offer_type='whole_hire'
        ).values_list('company_id', flat=True).distinct()
        
        return CompanyDetail.objects.filter(id__in=company_ids).order_by('company_name')

    def get_serializer_context(self):
        return {'request': self.request}


class CompanyTransportListView(generics.ListAPIView):
    serializer_class = TransportSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        company_id = self.kwargs['company_id']
        offer_type = self.request.query_params.get('type', None)
        now = timezone.now()

        # Base queryset with arrival time filter
        queryset = Transport.objects.filter(
            company_id=company_id,
            is_active=True
        ).exclude(
            Q(arrival_date__lt=now.date()) |
            Q(arrival_date=now.date(), arrival_time__lt=now.time())
        )

        # Agar type diya hai to filter karo
        if offer_type in ['offer_sets', 'whole_hire']:
            queryset = queryset.filter(offer_type=offer_type)
        elif offer_type is not None:
            # Agar koi invalid type bheja to kuch na dikhao
            return Transport.objects.none()

        # Sorting – upcoming transports first
        return queryset.order_by('arrival_date', 'arrival_time')
        
# ------------------------------------------------------------------------------
# 2. COMPANY DASHBOARD VIEWS (Requires Authentication) - MINOR UPDATES
# ------------------------------------------------------------------------------

# ------- CRUD Views for Company Resources (Using Generics) - NO CHANGES -------

class RouteListCreateView(generics.ListCreateAPIView):
    """List & Create Routes for the authenticated company."""
    serializer_class = RouteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Route.objects.filter(company=self.request.user.company_detail)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company_detail)


class VehicleListCreateView(generics.ListCreateAPIView):
    """List & Create Vehicles for the authenticated company."""
    serializer_class = VehicleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Vehicle.objects.filter(company=self.request.user.company_detail)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company_detail)


class DriverListCreateView(generics.ListCreateAPIView):
    """List & Create Drivers for the authenticated company."""
    serializer_class = DriverSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Driver.objects.filter(company=self.request.user.company_detail)

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company_detail)


# ------- Transport Views (CRUD for authenticated company) - MINOR UPDATES -------

class TransportListCreateView(generics.ListCreateAPIView):
    """List & Create Transports for the authenticated company."""
    serializer_class = TransportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # ✅ UPDATED: Show ALL transports for company (active and inactive)
        self.serializer_class.context = {'request': self.request}
        return Transport.objects.filter(
            company=self.request.user.company_detail
        ).order_by('-created_at')

    def perform_create(self, serializer):
        transport = serializer.save(company=self.request.user.company_detail)
        transport.save() # Call save() on model instance to trigger snapshotting


class TransportDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, Update, or Destroy a specific Transport instance."""
    serializer_class = TransportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # ✅ UPDATED: Allow access to ALL company transports
        self.serializer_class.context = {'request': self.request}
        return Transport.objects.filter(company=self.request.user.company_detail)
        
    def perform_update(self, serializer):
        transport = serializer.save()
        transport.save() # Call save() on model instance to trigger snapshotting


# ------------------------------------------------------------------------------
# 3. ENHANCED TRANSPORT VIEWS (With new pricing system)
# ------------------------------------------------------------------------------

class TransportViewSet(viewsets.ModelViewSet):
    queryset = Transport.objects.all().order_by("-created_at")
    serializer_class = TransportSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and hasattr(user, "company_detail"):
            # ✅ UPDATED: Company users see ALL their transports
            return Transport.objects.filter(company=user.company_detail)
        else:
            # ✅ UPDATED: Public users only see ACTIVE transports
            return Transport.objects.filter(is_active=True)

    def get_serializer_context(self):
        return {"request": self.request}

    def perform_create(self, serializer):
        user = self.request.user
        if hasattr(user, "company_detail"):
            transport = serializer.save(company=user.company_detail)
            transport.save()
        else:
            raise PermissionError("Only company users can add transports")


class TransportSearchView(generics.ListAPIView):
    serializer_class = TransportSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        now = timezone.now()  # current datetime

        # --- Base: Only active vehicles & arrival not passed ---
        queryset = Transport.objects.filter(
            is_active=True
        ).exclude(
            arrival_date__isnull=False,
            arrival_time__isnull=False,
            arrival_date__lt=now.date()
        ).exclude(
            # same day arrival but time passed
            arrival_date=now.date(),
            arrival_time__lt=now.time()
        )

        # --- Offer Type ---
        offer_type = self.request.query_params.get("offer_type")
        if offer_type in ["offer_sets", "whole_hire"]:
            queryset = queryset.filter(offer_type=offer_type)

        # --- Filter by Service Type ---
        if self.request.query_params.get("is_specific_route") == "true":
            queryset = queryset.filter(is_specific_route=True)
        if self.request.query_params.get("is_long_drive") == "true":
            queryset = queryset.filter(is_long_drive=True)

        # --- Location filters ---
        from_location = self.request.query_params.get("from_location")
        to_location = self.request.query_params.get("to_location")
        if from_location and to_location:
            queryset = queryset.filter(
                from_location__icontains=from_location,
                to_location__icontains=to_location,
            )

        location_address = self.request.query_params.get("location_address")
        if location_address:
            queryset = queryset.filter(
                Q(location_address__icontains=location_address)
                | Q(from_location__icontains=location_address)
                | Q(to_location__icontains=location_address)
            )

        # --- Price range filtering ---
        min_price = self.request.query_params.get("min_price")
        max_price = self.request.query_params.get("max_price")
        if min_price or max_price:
            price_filters = Q()

            if min_price and max_price:
                price_filters |= Q(fixed_fare__range=(min_price, max_price))
                price_filters |= Q(per_day_rate__range=(min_price, max_price))
            elif min_price:
                price_filters |= Q(fixed_fare__gte=min_price)
                price_filters |= Q(per_day_rate__gte=min_price)
            elif max_price:
                price_filters |= Q(fixed_fare__lte=max_price)
                price_filters |= Q(per_day_rate__lte=max_price)

            queryset = queryset.filter(price_filters)

        # --- Vehicle type filtering ---
        vehicle_type = self.request.query_params.get("vehicle_type")
        if vehicle_type:
            queryset = queryset.filter(vehicle_type_snapshot__icontains=vehicle_type)

        return queryset.order_by("-created_at")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)

class CompanyVehiclesAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, company_id):
        now = timezone.now()
        
        # ✅ Only show ACTIVE transports AND arrival time not passed
        transports = Transport.objects.filter(
            company_id=company_id, 
            is_active=True
        ).exclude(
            # Exclude transports where arrival date is in past
            Q(arrival_date__lt=now.date()) |
            # Exclude transports where arrival date is today but time has passed
            Q(arrival_date=now.date(), arrival_time__lt=now.time())
        ).order_by('arrival_date', 'arrival_time')
        
        serializer = TransportSerializer(transports, many=True, context={"request": request})
        return Response(serializer.data)
# ------------------------------------------------------------------------------
# 4. UTILITY/DEBUG VIEWS (Optional, can be removed in production) - NO CHANGES
# ------------------------------------------------------------------------------

class MyCompanyProfileTestView(APIView):
    """Test view to check company user context."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            company = request.user.company_detail
            return Response({
                "user": request.user.username,
                "company_id": company.id,
                "company_name": company.company_name,
                "company_email": company.company_email,
                "owner_name": company.owner_name,
            })
        except Exception as e:
            return Response({"error": str(e)}, status=403)

@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def all_drivers(request):
    """Test view to list all drivers for the authenticated company."""
    try:
        company = request.user.company_detail
        drivers = Driver.objects.filter(company=company)
        serializer = DriverSerializer(drivers, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# ------------------------------------------------------------------------------
# 5. NEW VIEWS FOR STATUS MANAGEMENT (Optional but recommended)
# ------------------------------------------------------------------------------

class TransportStatusUpdateView(APIView):
    """Update transport active status - QUICK FIX"""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, transport_id):
        try:
            # 1. Transport object fetch karein
            transport = Transport.objects.get(
                id=transport_id, 
                company=request.user.company_detail
            )
        except Transport.DoesNotExist:
            return Response({'error': 'Transport not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # 2. Direct is_active field update karein
        is_active = request.data.get('is_active')
        
        if is_active is None:
            return Response({
                'error': 'is_active field is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Direct database update
            transport.is_active = is_active
            transport.save()
            
            return Response({
                'message': f'Transport status updated to {"active" if transport.is_active else "inactive"}',
                'is_active': transport.is_active
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'An error occurred: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
