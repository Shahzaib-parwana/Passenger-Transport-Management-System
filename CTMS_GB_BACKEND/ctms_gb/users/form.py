from django import forms
from .models import CompanyDetail

class CompanyDetailForm(forms.ModelForm):
    class Meta:
        model = CompanyDetail
        fields = [
            "company_name", "registration_id", "company_email",
            "contact_number_1", "contact_number_2", "company_type",
            "main_office_location", "owner_name", "owner_email",
            "owner_contact_number", "owner_cnic", "owner_address",
            "agreement_accepted", "is_submitted"
        ]
        widgets = {
            "owner_address": forms.Textarea(attrs={"rows": 3}),
        }
