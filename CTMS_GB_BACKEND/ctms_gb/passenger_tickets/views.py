# passenger_tickets/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from .models import Ticket
from .serializers import TicketSerializer
import logging
import base64
from django.core.files.base import ContentFile
from datetime import datetime

# Import required models
from Payment.models import Booking
from transport.models import Transport
from users.models import CompanyDetail

logger = logging.getLogger(__name__)

# ------------------------------------------------------------
# VIEW 1: Get tickets by transport ID
# ------------------------------------------------------------
@api_view(["GET"])
def tickets_by_transport(request, transport_id):
    try:
        tickets = Ticket.objects.filter(transport_id=transport_id)
        serializer = TicketSerializer(tickets, many=True)
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Error fetching tickets by transport: {str(e)}")
        return Response(
            {"error": "Failed to fetch tickets"}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ------------------------------------------------------------
# VIEW 2: Get user's tickets (passenger, company, admin)
# ------------------------------------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_tickets(request):
    try:
        user = request.user

        if user.role == "passenger":
            tickets = Ticket.objects.filter(user=user)

        elif user.role == "company":
            try:
                company_detail = user.company_detail
                tickets = Ticket.objects.filter(transport__company=company_detail)
            except Exception:
                return Response(
                    {"error": "Company detail not found for this user."}, 
                    status=status.HTTP_404_NOT_FOUND
                )

        elif user.role == "admin":
            tickets = Ticket.objects.all()

        else:
            return Response(
                {"error": "Invalid user role."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        tickets = tickets.order_by("-created_at")
        serializer = TicketSerializer(tickets, many=True, context={"request": request})
        
        return Response({
            "success": True,
            "count": tickets.count(),
            "data": serializer.data
        })
        
    except Exception as e:
        logger.error(f"Error in my_tickets: {str(e)}")
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ------------------------------------------------------------
# VIEW 3: Cancel ticket
# ------------------------------------------------------------
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def cancel_ticket(request, ticket_id):
    try:
        ticket = Ticket.objects.get(id=ticket_id, user=request.user)
        ticket.status = "Cancelled"
        ticket.save()
        
        return Response({
            "success": True,
            "message": "Ticket cancelled successfully",
            "ticket_id": ticket_id
        })
        
    except Ticket.DoesNotExist:
        return Response(
            {"error": "Ticket not found or you don't have permission to cancel it"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error cancelling ticket: {str(e)}")
        return Response(
            {"error": str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ------------------------------------------------------------
# VIEW 4: Company tickets list view
# ------------------------------------------------------------
class CompanyTicketListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = request.user
            
            logger.info(f"🎯 CompanyTicketListView accessed by user: {user.username}, Role: {user.role}")
            
            # Check if user is a company
            if user.role != "company":
                return Response(
                    {"error": "Only company users can view tickets."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Get company details
            try:
                company = user.company_detail
                company_name = company.company_name
                logger.info(f"🏢 Company found: {company_name}")
            except Exception as e:
                logger.error(f"❌ Company detail error: {str(e)}")
                return Response(
                    {"error": "Company detail not found. Please complete your company profile."},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get tickets in TWO ways:
            from django.db.models import Q
            
            # Method 1: Through transport relation
            tickets_via_transport = Ticket.objects.filter(
                transport__company=company
            ).select_related('transport')
            
            # Method 2: Direct field match
            tickets_via_direct = Ticket.objects.filter(
                transport_company=company_name
            )
            
            # Combine both querysets
            tickets = (tickets_via_transport | tickets_via_direct).distinct().order_by('-created_at')
            
            logger.info(f"📊 Total tickets found: {tickets.count()}")
            
            # Check if any data exists
            if not tickets.exists():
                return Response({
                    "success": True,
                    "message": "No bookings found for your company.",
                    "data": [],
                    "count": 0
                }, status=status.HTTP_200_OK)
            
            # Serialize data
            serializer = TicketSerializer(tickets, many=True, context={'request': request})
            
            return Response({
                "success": True,
                "count": tickets.count(),
                "company": company_name,
                "data": serializer.data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error in CompanyTicketListView: {str(e)}")
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ------------------------------------------------------------
# VIEW 5: FULL VEHICLE BOOKING WITH TICKET CREATION (NEW)
# ------------------------------------------------------------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def full_vehicle_booking_with_ticket(request):
    """
    Handle full vehicle booking and create ticket automatically
    Supports both JSON and FormData
    """
    try:
        logger.info("🎯 Full Vehicle Booking API called")
        
        # Initialize variables
        data = {}
        screenshot_base64 = None
        
        # Determine if request is FormData or JSON
        if request.content_type == 'multipart/form-data':
            # Handle FormData (for manual payment with screenshot)
            data = request.POST.dict()
            
            # Handle screenshot if present
            if 'screenshot' in request.FILES:
                screenshot_file = request.FILES['screenshot']
                # Convert file to base64
                screenshot_base64 = base64.b64encode(screenshot_file.read()).decode('utf-8')
                data['screenshot'] = f"data:{screenshot_file.content_type};base64,{screenshot_base64}"
                
        else:
            # Handle JSON
            data = request.data.copy()
            screenshot_base64 = data.get('screenshot')
        
        logger.info(f"💰 Payment method: {data.get('payment_method')}")
        logger.info(f"📸 Has screenshot: {'screenshot' in data}")
        
        # ========== VALIDATE REQUIRED FIELDS ==========
        required_fields = [
            'vehicle_id', 'company_id', 'driver_id', 
            'total_amount', 'passenger_name', 'passenger_phone',
            'from_location', 'to_location', 'arrival_date', 'arrival_time'
        ]
        
        missing_fields = []
        for field in required_fields:
            if field not in data or not data[field]:
                missing_fields.append(field)
        
        if missing_fields:
            return Response({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # ========== CREATE BOOKING ==========
        try:
            # Extract screenshot
            screenshot_base64 = data.pop('screenshot', None)
            
            # Prepare booking data
            booking_data = {
                'vehicle_id': int(data['vehicle_id']),
                'company_id': int(data['company_id']),
                'driver_id': int(data['driver_id']),
                'from_location': data['from_location'],
                'to_location': data['to_location'],
                'arrival_date': data['arrival_date'],
                'arrival_time': data['arrival_time'],
                'total_amount': float(data['total_amount']),
                'passenger_name': data['passenger_name'],
                'passenger_phone': data['passenger_phone'],
                'passenger_cnic': data.get('passenger_cnic', ''),
                'passenger_email': data.get('passenger_email', ''),
                'payment_method': data.get('payment_method', 'CASH'),
                'is_full_vehicle': True,
                'screenshot': screenshot_base64,
                'currency': data.get('currency', 'PKR'),
                'booking_reference': f"FULL-{datetime.now().strftime('%Y%m%d-%H%M%S')}",
            }
            
            # Create booking
            booking = Booking.objects.create(**booking_data)
            logger.info(f"✅ Booking created: {booking.id}")
            
        except Exception as e:
            logger.error(f"❌ Error creating booking: {str(e)}")
            return Response({
                "error": f"Failed to create booking: {str(e)}"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # ========== CREATE TICKET ==========
        try:
            # Get related objects
            transport = None
            company = None
            
            try:
                transport = Transport.objects.get(id=data['vehicle_id'])
                logger.info(f"🚗 Transport found: {transport.id}")
            except Transport.DoesNotExist:
                logger.warning("⚠️ Transport not found")
            
            try:
                company = CompanyDetail.objects.get(id=data['company_id'])
                logger.info(f"🏢 Company found: {company.company_name}")
            except CompanyDetail.DoesNotExist:
                logger.warning("⚠️ Company not found")
            
            # Determine payment status
            payment_method = data.get('payment_method', 'CASH')
            if payment_method == 'CASH':
                payment_status = 'PAID'
            elif payment_method == 'MANUAL':
                payment_status = 'UNPAID'  # Manual payment needs verification
            else:
                payment_status = 'UNPAID'
            
            # Prepare ticket data
            ticket_data = {
                'booking': booking,
                'user': request.user,
                'passenger_name': data['passenger_name'],
                'passenger_cnic': data.get('passenger_cnic', ''),
                'passenger_contact': data['passenger_phone'],
                'passenger_email': data.get('passenger_email', ''),
                'seats': [],  # Empty for full vehicle
                'transport_company': company.company_name if company else data.get('company_name', 'Unknown'),
                'vehicle_number': data.get('vehicle_number', ''),
                'driver_name': data.get('driver_name', ''),
                'driver_contect': data.get('driver_contact', ''),
                'route_from': data['from_location'],
                'route_to': data['to_location'],
                'arrival_date': data['arrival_date'],
                'arrival_time': data['arrival_time'],
                'price_per_seat': float(data['total_amount']),  # Use total amount as price
                'payment_type': payment_method,
                'ticket_type': 'FULLVEHICLE',
                'status': 'Booked',
                'payment_status': payment_status,
                'transport': transport,
            }
            
            # Create ticket
            ticket = Ticket.objects.create(**ticket_data)
            logger.info(f"✅ Ticket created: {ticket.id} for booking {booking.id}")
            
        except Exception as e:
            logger.error(f"❌ Error creating ticket: {str(e)}")
            # Don't fail the booking if ticket creation fails
            ticket = None
        
        # ========== PREPARE RESPONSE ==========
        response_data = {
            'success': True,
            'message': 'Booking created successfully',
            'booking_id': booking.id,
            'booking_reference': booking.booking_reference,
            'ticket_id': ticket.id if ticket else None,
            'payment_method': data.get('payment_method'),
            'total_amount': data['total_amount'],
            'passenger_name': data['passenger_name'],
            'ticket_type': 'FULLVEHICLE',
            'payment_status': payment_status if ticket else 'UNKNOWN',
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"❌ Error in full_vehicle_booking: {str(e)}", exc_info=True)
        return Response({
            "error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# ------------------------------------------------------------
# VIEW 6: Get ticket by ID
# ------------------------------------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_ticket(request, ticket_id):
    try:
        ticket = Ticket.objects.get(id=ticket_id)
        
        # Check permissions
        user = request.user
        if user.role == "passenger" and ticket.user != user:
            return Response(
                {"error": "You don't have permission to view this ticket"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = TicketSerializer(ticket, context={'request': request})
        return Response(serializer.data)
        
    except Ticket.DoesNotExist:
        return Response(
            {"error": "Ticket not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error getting ticket: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ------------------------------------------------------------
# VIEW 7: Update ticket payment status (for manual payment verification)
# ------------------------------------------------------------
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_payment_status(request, ticket_id):
    try:
        # Only company or admin can update payment status
        user = request.user
        if user.role not in ["company", "admin"]:
            return Response(
                {"error": "Only company or admin can update payment status"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        ticket = Ticket.objects.get(id=ticket_id)
        new_status = request.data.get('payment_status')
        
        if new_status not in ['PAID', 'UNPAID', 'REFUNDED']:
            return Response(
                {"error": "Invalid payment status"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        ticket.payment_status = new_status
        ticket.save()
        
        return Response({
            "success": True,
            "message": f"Payment status updated to {new_status}",
            "ticket_id": ticket_id,
            "payment_status": new_status
        })
        
    except Ticket.DoesNotExist:
        return Response(
            {"error": "Ticket not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error updating payment status: {str(e)}")
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ------------------------------------------------------------
# VIEW 8: Debug endpoint to check all tickets
# ------------------------------------------------------------
@api_view(["GET"])
def debug_all_tickets(request):
    """
    Debug endpoint to see all tickets and their status
    """
    try:
        tickets = Ticket.objects.all().order_by('-created_at')
        
        data = []
        for ticket in tickets:
            data.append({
                'id': ticket.id,
                'ticket_type': ticket.ticket_type,
                'payment_type': ticket.payment_type,
                'payment_status': ticket.payment_status,
                'passenger_name': ticket.passenger_name,
                'vehicle_number': ticket.vehicle_number,
                'route': f"{ticket.route_from} → {ticket.route_to}",
                'booking_id': ticket.booking.id if ticket.booking else None,
                'transport_id': ticket.transport.id if ticket.transport else None,
                'created_at': ticket.created_at,
            })
        
        return Response({
            'success': True,
            'count': tickets.count(),
            'full_vehicle_tickets': tickets.filter(ticket_type='FULLVEHICLE').count(),
            'seat_tickets': tickets.filter(ticket_type='SEATBOOKING').count(),
            'data': data[:50]  # Limit to 50 records
        })
        
    except Exception as e:
        logger.error(f"Error in debug_all_tickets: {str(e)}")
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)