from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import (
    PassengerProfile, CompanyProfile, CompanyDetail,
    Route, Vehicle, Driver, VehicleChoice 
)
from django.urls import reverse
from django.utils.html import format_html
from transport.models import Transport   # Transport bhi import karo

User = get_user_model()

# ----- Custom Filter for Vehicle Type -----
class VehicleTypeFilter(admin.SimpleListFilter):
    title = "Vehicle type"
    parameter_name = "vehicle_type"

    def lookups(self, request, model_admin):
        return list(getattr(Vehicle, "VEHICLE_TYPE_CHOICES", []))

    def queryset(self, request, queryset):
        value = self.value()
        if value:
            return queryset.filter(vehicles__vehicle_type=value).distinct()
        return queryset

# ---------------- Inline Sections ----------------
class RouteInline(admin.TabularInline):
    model = Route
    extra = 1
    fields = ("from_location", "to_location")

class VehicleInline(admin.TabularInline):
    model = Vehicle
    extra = 1
    fields = ("vehicle_type", "vehicle_number", "number_of_seats", "image")

class DriverInline(admin.TabularInline):
    model = Driver
    extra = 1
    fields = ("driver_name", "driver_contact_number", "driver_cnic", "driving_license_no", "image")

# ---------------- User Admin ----------------
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email", "is_active", "is_staff")
    search_fields = ("username", "email")
    ordering = ("username",)

# ---------------- Passenger Profile ----------------
@admin.register(PassengerProfile)
class PassengerProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "cnic_or_passport", "address")
    search_fields = ("user__username", "cnic_or_passport")

# ---------------- Company Profile ----------------
@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "company_name", "contact_no", "status")
    search_fields = ("company_name", "user__username")

# ---------------- Company Detail (With Inlines) ----------------
@admin.register(CompanyDetail)
class CompanyDetailAdmin(admin.ModelAdmin):
    list_display = (
        "user","company_name", "company_email", "company_type", "owner_name",
        "agreement_accepted", "is_submitted", "created_at"
    )
    list_filter = ("company_type", "agreement_accepted", "is_submitted", VehicleTypeFilter)
    search_fields = ("company_name", "registration_id", "owner_name", "owner_cnic")
    ordering = ("-created_at",)
    inlines = [RouteInline, VehicleInline, DriverInline]

# ---------------- Vehicle Choice ----------------
def get_vehicle_type_list():
    return list(getattr(Vehicle, "VEHICLE_TYPE_CHOICES", []))

VTYPES = [c[0] for c in get_vehicle_type_list()]
VTYPES_LABELS = {c[0]: c[1] for c in get_vehicle_type_list()}

class VehicleChoiceAdmin(admin.ModelAdmin):
    list_display = ("company_name", "vehicle_type_display", "vehicle_number", "number_of_seats", "open_company")
    list_filter = ("vehicle_type", "company")
    search_fields = ("company__company_name", "vehicle_number")
    ordering = ("company__company_name",)
    list_select_related = ("company",)

    def vehicle_type_display(self, obj):
        return obj.get_vehicle_type_display()
    vehicle_type_display.short_description = "Vehicle Type"

    def company_name(self, obj):
        return obj.company.company_name if obj.company else "-"
    company_name.short_description = "Company"

    def open_company(self, obj):
        if obj.company_id:
            app_label = obj.company._meta.app_label
            model_name = obj.company._meta.model_name
            url = reverse(f"admin:{app_label}_{model_name}_change", args=(obj.company_id,))
            return format_html('<a href="{}" target="_blank">Open</a>', url)
        return "-"
    open_company.short_description = "Company Detail"

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context["vtypes"] = [(v, VTYPES_LABELS.get(v, v.title())) for v in VTYPES]
        return super().changelist_view(request, extra_context=extra_context)

admin.site.register(VehicleChoice, VehicleChoiceAdmin)

from django.utils.html import format_html

# ---------------- Transport ----------------
@admin.register(Transport)
class TransportAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "company",
        "get_route",
        "get_vehicle_number",
        "get_driver_name",
        "offer_type",
        "price_per_seat",
        "arrival_date",
        "arrival_time",
        "reserve_seats_display",
        "vehicle_image_tag",
        "driver_image_tag",
    )
    search_fields = (
        "company__company_name",
        "route__from_location",
        "route__to_location",
        "vehicle__vehicle_number",
        "driver__driver_name",
        "vehicle_number_snapshot",
        "driver_name_snapshot",
    )
    list_filter = ("company", "offer_type", "arrival_date")
    ordering = ("-created_at",)

    # ✅ Route snapshot show
    def get_route(self, obj):
        if obj.route_from and obj.route_to:
            return f"{obj.route_from} → {obj.route_to}"
        return "-"
    get_route.short_description = "Route"

    # ✅ Vehicle number (live first, then snapshot)
    def get_vehicle_number(self, obj):
        if obj.vehicle and obj.vehicle.vehicle_number:
            return obj.vehicle.vehicle_number
        return obj.vehicle_number_snapshot or "-"
    get_vehicle_number.short_description = "Vehicle Number"

    # ✅ Driver name (live first, then snapshot)
    def get_driver_name(self, obj):
        if obj.driver and obj.driver.driver_name:
            return obj.driver.driver_name
        return obj.driver_name_snapshot or "-"
    get_driver_name.short_description = "Driver Name"

    # ✅ Reserved seats display
    def reserve_seats_display(self, obj):
        if obj.reserve_seats and len(obj.reserve_seats) > 0:
            return ", ".join(map(str, obj.reserve_seats))
        return "None"
    reserve_seats_display.short_description = "Reserved Seats"

    # ✅ Vehicle image tag (snapshot fallback included)
    def vehicle_image_tag(self, obj):
        if obj.vehicle_image:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover;"/>',
                obj.vehicle_image.url,
            )
        elif hasattr(obj.vehicle, "image") and obj.vehicle.image:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover;"/>',
                obj.vehicle.image.url,
            )
        return "-"
    vehicle_image_tag.short_description = "Vehicle Image"

    # ✅ Driver image tag (snapshot fallback included)
    def driver_image_tag(self, obj):
        if obj.driver_image:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover;"/>',
                obj.driver_image.url,
            )
        elif hasattr(obj.driver, "image") and obj.driver.image:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover;"/>',
                obj.driver.image.url,
            )
        return "-"
    driver_image_tag.short_description = "Driver Image"


from django.contrib import admin
from passenger_tickets.models import Ticket

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ("booking_id", "passenger_name", "transport_company", "arrival_date", "payment_type")
    search_fields = ("passenger_name", "passenger_cnic", "booking_id")


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "vehicle_type",
        "vehicle_number",
        "company",
        "number_of_seats",
    )
    search_fields = ("vehicle_number", "company__company_name")
    list_filter = ("vehicle_type", "company")
