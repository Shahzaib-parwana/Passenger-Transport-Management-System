from django.contrib import admin
from .models import *
# Register your models here.
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user','is_full_vehicle','passenger_name','passenger_email','passenger_cnic','passenger_phone','company', 'vehicle', 'booking_status', 'created_at')
    search_fields = ('user__username', 'companydetail__name', 'vehicle__vehicle_number')
    list_filter = ('booking_status', 'created_at')

class PaymentAdmin(admin.ModelAdmin):
    def passenger_name(self, obj):
        # obj is the current Payment object
        if obj.booking:
            return obj.booking.passenger_name
        return "N/A"
    
    # Configure how the column header appears in the Admin UI
    passenger_name.short_description = 'Passenger Name'
    list_display = ('id', 'booking','passenger_name', 'amount_paid', 'status', 'created_at','confirmed_by')
    search_fields = ('booking__id',)
    list_filter = ('status', 'created_at')

class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'payment_record', 'transaction_type', 'amount', 'status')
    search_fields = ('payment_record__id',)
    list_filter = ('transaction_type', 'status', 'created_at')

class SeatHoldAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'reserved_seats', 'expires_at')
    search_fields = ('booking__id', 'reserved_seats')
    list_filter = ('expires_at','reserved_seats')

admin.site.register(Booking, BookingAdmin)
admin.site.register(Payment, PaymentAdmin)
admin.site.register(Transaction, TransactionAdmin)
admin.site.register(SeatHold,SeatHoldAdmin)