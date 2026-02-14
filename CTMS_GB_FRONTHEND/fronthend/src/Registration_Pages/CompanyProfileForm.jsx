// CompanyProfilePage.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { 
  X, Plus, Trash, Upload, AlertCircle, Save, Send, 
  Building, User, Map, Car, Users, FileCheck, ChevronRight,
  CheckCircle, Info, Phone, Mail, MapPin, IdCard, Shield
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import apiPrivate from "../api/apiprivate";

/** MUST match backend choices/values */
const PLACES = ["Skardu","Gilgit","Shigar","Hunza","Nagar","Khaplu","Chilas","Astor","Islamabad/Rawalpindi","Gizer"];
const VEHICLE_TYPES = ["bus","coaster","car","hiace"];

const alphaSpaceOnly = (s) => /^[A-Za-z ]*$/.test(s || "");
const under250kb = (f) => f && f.size <= 250 * 1024;

/** Match Django field names */
const emptyForm = {
  id: null,
  company_name: "",
  registration_id: "",
  company_email: "",
  contact_number_1: "",
  contact_number_2: "",
  company_type: "offer_vehicle",
  main_office_location: "",
  Passenger_instruction: "",
  company_logo: null,
  owner_name: "",
  owner_email: "",
  owner_contact_number: "",
  owner_cnic: "",
  owner_address: "",
  routes: [],
  vehicles: [],
  drivers: [],
  is_submitted: false,
  agreement_accepted: false,
};

// Step tracker component
const StepIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, label: "Company Info", icon: Building },
    { number: 2, label: "Owner Info", icon: User },
    { number: 3, label: "Routes", icon: Map },
    { number: 4, label: "Vehicles", icon: Car },
    { number: 5, label: "Drivers", icon: Users },
    { number: 6, label: "Agreement", icon: FileCheck },
  ];

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-2">
            <Building className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">Company Registration</h1>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;
              
              return (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive 
                      ? 'bg-indigo-600 border-indigo-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-100 border-green-500 text-green-600'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : step.number}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    isActive ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                  {index < steps.length - 1 && (
                    <ChevronRight className="mx-2 h-5 w-5 text-gray-300" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="md:hidden">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-bold">{currentStep}</span>
              </div>
              <span className="ml-2 text-sm font-medium text-gray-700">
                Step {currentStep} of 6
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CompanyProfilePage() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // mini-modals state
  const [routeModal, setRouteModal] = useState(null);
  const [vehicleModal, setVehicleModal] = useState(null);
  const [driverModal, setDriverModal] = useState(null);

  const formRefs = useRef([]);

  // Load existing draft on mount
  useEffect(() => {
    const fetchCompanyDetail = async () => {
      try {
        const response = await apiPrivate.get("/auth/my-company-detail/");
        if (response.data) {
          setForm(f => ({
            ...f,
            ...response.data,
            company_logo: response.data.company_logo || null,
          }));
        }
      } catch (error) {
        setForm(emptyForm);
      }
    };
    fetchCompanyDetail();
  }, []);

  // Message fade-out effect
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(""), 5000);
      return () => clearTimeout(timer);
    }
    if (error) {
      const timer = setTimeout(() => setError(""), 7000);
      return () => clearTimeout(timer);
    }
  }, [msg, error]);

  // Update step based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (let i = 0; i < formRefs.current.length; i++) {
        const element = formRefs.current[i];
        if (element) {
          const { top, height } = element.getBoundingClientRect();
          const elementTop = top + window.scrollY;
          
          if (scrollPosition >= elementTop && scrollPosition < elementTop + height) {
            setCurrentStep(i + 1);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (step) => {
    if (formRefs.current[step - 1]) {
      formRefs.current[step - 1].scrollIntoView({ behavior: 'smooth' });
    }
  };

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // ---------- add/remove ----------
  const saveRouteFromModal = () => {
    if (!routeModal?.from_location || !routeModal?.to_location) return;
    setForm((f) => ({ ...f, routes: [...f.routes, routeModal] }));
    setRouteModal(null);
    setError("");
  };
  
  const removeRoute = (idx) =>
    setForm((f) => {
      const arr = [...f.routes];
      arr.splice(idx, 1);
      return { ...f, routes: arr };
    });

  const saveVehicleFromModal = () => {
    if (!vehicleModal?.vehicle_type || !vehicleModal?.vehicle_number) {
      setError("Vehicle Type and Number are required.");
      return;
    }
    if (vehicleModal.image && !under250kb(vehicleModal.image)) {
      setError("Vehicle image must be smaller than 250KB");
      return;
    }
    setForm((f) => ({ ...f, vehicles: [...f.vehicles, vehicleModal] }));
    setVehicleModal(null);
    setError("");
  };
  
  const removeVehicle = (idx) =>
    setForm((f) => {
      const arr = [...f.vehicles];
      arr.splice(idx, 1);
      return { ...f, vehicles: arr };
    });

  const saveDriverFromModal = () => {
    if (!driverModal?.driver_name || !driverModal?.driving_license_no) {
      setError("Driver Name and License Number are required.");
      return;
    }
    if (driverModal.image && !under250kb(driverModal.image)) {
      setError("Driver photo must be smaller than 250KB");
      return;
    }
    setForm((f) => ({ ...f, drivers: [...f.drivers, driverModal] }));
    setDriverModal(null);
    setError("");
  };
  
  const removeDriver = (idx) =>
    setForm((f) => {
      const arr = [...f.drivers];
      arr.splice(idx, 1);
      return { ...f, drivers: arr };
    });

  /** Build FormData */
  const toFormData = (payload) => {
    const fd = new FormData();

    const baseKeys = [
      "company_name","registration_id","company_email","contact_number_1","contact_number_2",
      "company_type","main_office_location","Passenger_instruction",
      "owner_name","owner_email","owner_contact_number","owner_cnic","owner_address",
    ];
    baseKeys.forEach((k) => fd.append(k, payload[k] ?? ""));

    if (payload.company_logo instanceof File) {
      fd.append("company_logo", payload.company_logo);
    } else if (payload.company_logo === null || payload.company_logo === "") {
      fd.append("company_logo", "");
    }

    fd.append("agreement_accepted", payload.agreement_accepted ? "true" : "false");
    fd.append("is_submitted", payload.is_submitted ? "true" : "false");

    fd.append("routes", JSON.stringify(payload.routes || []));
    fd.append("vehicles", JSON.stringify(payload.vehicles?.map(v => ({
      vehicle_type: v.vehicle_type,
      vehicle_number: v.vehicle_number,
      number_of_seats: v.number_of_seats,
      id: v.id,
    })) || []));
    fd.append("drivers", JSON.stringify(payload.drivers?.map(d => ({
      driver_name: d.driver_name,
      driver_contact_number: d.driver_contact_number,
      driver_cnic: d.driver_cnic,
      driving_license_no: d.driving_license_no,
      id: d.id,
    })) || []));

    (payload.vehicles || []).forEach((v, i) => {
      if (v.image instanceof File) {
        fd.append(`vehicle_images_${i}`, v.image);
      }
    });
    (payload.drivers || []).forEach((d, i) => {
      if (d.image instanceof File) {
        fd.append(`driver_images_${i}`, d.image);
      }
    });

    return fd;
  };

  // ---------- Save draft / Submit ----------
  const saveDraft = async () => {
    setLoading(true);
    setMsg("");
    setError("");

    try {
      const fd = toFormData({ ...form, is_submitted: false });
      const headers = { Authorization: `Bearer ${localStorage.getItem("access_token")}` };

      let response;
      if (form.id) {
        response = await apiPrivate.patch(`auth/CompanyDetail/${form.id}/`, fd, { headers });
      } else {
        response = await apiPrivate.post("auth/CompanyDetail/", fd, { headers });
      }

      setForm((f) => ({
        ...f,
        ...response.data,
        company_logo: response.data.company_logo || f.company_logo,
      }));

      setMsg("Draft saved successfully! ✅");
    } catch (e) {
      console.error("Save Draft Error:", e);
      setError(parseServerError(e, "Error saving draft. Please check your inputs."));
    } finally {
      setLoading(false);
    }
  };

  const submit = () => {
    if (!form.company_name || !form.owner_name || form.routes.length === 0 || form.vehicles.length === 0 || form.drivers.length === 0) {
      setError("Please fill in Company/Owner details, and add at least one Route, Vehicle, and Driver before submitting.");
      return;
    }
    setShowConfirm(true);
    setError("");
  };

  const confirmSubmit = async () => {
    setLoading(true);
    setMsg("");
    setError("");

    try {
      const fd = toFormData({ ...form, is_submitted: true });
      const headers = { Authorization: `Bearer ${localStorage.getItem("access_token")}` };

      let response;
      if (form.id) {
        response = await apiPrivate.patch(`auth/CompanyDetail/${form.id}/`, fd, { headers });
      } else {
        response = await apiPrivate.post("auth/CompanyDetail/", fd, { headers });
      }

      setMsg("Submitted for admin review! ✅");
      setShowConfirm(false);

      setForm((f) => ({
        ...f,
        ...response.data,
        company_logo: response.data.company_logo || f.company_logo,
      }));

    } catch (e) {
      console.error("Submit Error:", e);
      setError(parseServerError(e, "Submit failed ❌. Please check required fields."));
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    if (window.confirm("Are you sure you want to clear the entire form? This action cannot be undone unless you have a saved draft.")) {
      setForm(emptyForm);
      setMsg("Form cleared. You can now start over.");
      setError("");
    }
  };

  // A readable summary for the confirm modal
  const preview = useMemo(() => {
    return {
      Company: [
        ["Company Name", form.company_name || "—"],
        ["Registration ID", form.registration_id || "—"],
        ["Email", form.company_email || "—"],
        ["Contact #1", form.contact_number_1 || "—"],
        ["Contact #2", form.contact_number_2 || "—"],
        ["Company Type", form.company_type === "offer_seats" ? "Offer Seats" : "Offer Vehicle"],
        ["Main Office", form.main_office_location || "—"],
        ["Passenger Instruction", form.Passenger_instruction || "—"],
        ["Company Logo", form.company_logo ? (form.company_logo.name || "Uploaded/Existing") : "—"],
      ],
      Owner: [
        ["Name", form.owner_name || "—"],
        ["Email", form.owner_email || "—"],
        ["Contact", form.owner_contact_number || "—"],
        ["CNIC", form.owner_cnic || "—"],
        ["Address", form.owner_address || "—"],
      ],
      Routes: (form.routes || []).map(r => [`${r.from_location || "—"} → ${r.to_location || "—"}`]),
      Vehicles: (form.vehicles || []).map(v => [
        v.vehicle_type?.charAt(0).toUpperCase() + v.vehicle_type?.slice(1) || "—",
        v.vehicle_number || "—",
        v.number_of_seats || "—",
        v.image ? (v.image.name || "Image Uploaded") : "—"
      ]),
      Drivers: (form.drivers || []).map(d => [
        d.driver_name || "—",
        d.driver_contact_number || "—",
        d.driver_cnic || "—",
        d.driving_license_no || "—",
        d.image ? (d.image.name || "Image Uploaded") : "—"
      ]),
    };
  }, [form]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Fixed Step Indicator */}
      <StepIndicator currentStep={currentStep} />

      {/* Status Messages - Fixed at top */}
      {(msg || error) && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <AnimatePresence>
            {msg && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="mb-2 p-4 bg-green-50 border border-green-200 rounded-xl shadow-lg"
              >
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-green-800 font-medium">{msg}</span>
                </div>
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-xl shadow-lg"
              >
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800 font-medium">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Main Form Content */}
      <div className={`max-w-4xl mx-auto px-4 py-8 ${showConfirm ? 'opacity-30 pointer-events-none' : ''}`}>
        
        {/* Form Sections */}
        <div className="space-y-8">
          {/* 1. Company Information */}
          <section 
            ref={el => formRefs.current[0] = el}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
                <Building className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
                <p className="text-gray-600">Basic details about your company</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Company Name *"
                required
                icon={<Building className="h-5 w-5" />}
              >
                <Input
                  placeholder="Enter company name"
                  value={form.company_name}
                  onChange={(e) => {
                    if (alphaSpaceOnly(e.target.value)) setField("company_name", e.target.value);
                  }}
                />
              </FormField>

              <FormField
                label="Registration ID"
                icon={<IdCard className="h-5 w-5" />}
              >
                <Input
                  placeholder="Enter registration ID"
                  value={form.registration_id}
                  onChange={(e) => setField("registration_id", e.target.value)}
                />
              </FormField>

              <FormField
                label="Company Email"
                icon={<Mail className="h-5 w-5" />}
              >
                <Input
                  type="email"
                  placeholder="company@example.com"
                  value={form.company_email}
                  onChange={(e) => setField("company_email", e.target.value)}
                />
              </FormField>

              <FormField
                label="Contact Number 1 *"
                required
                icon={<Phone className="h-5 w-5" />}
              >
                <Input
                  placeholder="03XXXXXXXXX"
                  value={form.contact_number_1}
                  onChange={(e) => setField("contact_number_1", e.target.value)}
                />
              </FormField>

              <FormField
                label="Contact Number 2"
                icon={<Phone className="h-5 w-5" />}
              >
                <Input
                  placeholder="Optional"
                  value={form.contact_number_2}
                  onChange={(e) => setField("contact_number_2", e.target.value)}
                />
              </FormField>

              <FormField
                label="Company Type"
                icon={<Info className="h-5 w-5" />}
              >
                <select
                  className="form-select"
                  value={form.company_type}
                  onChange={(e) => setField("company_type", e.target.value)}
                >
                  <option value="offer_vehicle">Offer Vehicle (Whole Hire)</option>
                  <option value="offer_seats">Offer Seats (Individual)</option>
                </select>
              </FormField>

              <FormField
                label="Main Office Location"
                icon={<MapPin className="h-5 w-5" />}
              >
                <Input
                  placeholder="e.g., Gilgit"
                  value={form.main_office_location}
                  onChange={(e) => setField("main_office_location", e.target.value)}
                />
              </FormField>

              <div className="md:col-span-2">
                <FormField
                  label="Company Logo"
                  icon={<Upload className="h-5 w-5" />}
                >
                  <FileUpload
                    file={form.company_logo}
                    onChange={(file) => setField("company_logo", file)}
                    accept="image/*"
                    maxSize={250}
                    label="Upload company logo (max 250KB)"
                  />
                </FormField>
              </div>

              <div className="md:col-span-2">
                <FormField
                  label="Passenger Instructions"
                  icon={<Info className="h-5 w-5" />}
                >
                  <textarea
                    className="form-textarea h-32"
                    placeholder="Important information for passengers..."
                    value={form.Passenger_instruction}
                    onChange={(e) => setField("Passenger_instruction", e.target.value)}
                  />
                </FormField>
              </div>
            </div>
          </section>

          {/* 2. Owner Information */}
          <section 
            ref={el => formRefs.current[1] = el}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Owner Information</h2>
                <p className="text-gray-600">Details about company owner/registrar</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Owner Name *"
                required
                icon={<User className="h-5 w-5" />}
              >
                <Input
                  placeholder="Enter owner's full name"
                  value={form.owner_name}
                  onChange={(e) => setField("owner_name", e.target.value)}
                />
              </FormField>

              <FormField
                label="Owner Email"
                icon={<Mail className="h-5 w-5" />}
              >
                <Input
                  type="email"
                  placeholder="owner@example.com"
                  value={form.owner_email}
                  onChange={(e) => setField("owner_email", e.target.value)}
                />
              </FormField>

              <FormField
                label="Owner Contact"
                icon={<Phone className="h-5 w-5" />}
              >
                <Input
                  placeholder="03XXXXXXXXX"
                  value={form.owner_contact_number}
                  onChange={(e) => setField("owner_contact_number", e.target.value)}
                />
              </FormField>

              <FormField
                label="Owner CNIC"
                icon={<IdCard className="h-5 w-5" />}
              >
                <Input
                  placeholder="XXXXX-XXXXXXX-X"
                  value={form.owner_cnic}
                  onChange={(e) => setField("owner_cnic", e.target.value)}
                />
              </FormField>

              <div className="md:col-span-2">
                <FormField
                  label="Owner Address"
                  icon={<MapPin className="h-5 w-5" />}
                >
                  <Input
                    placeholder="Full residential address"
                    value={form.owner_address}
                    onChange={(e) => setField("owner_address", e.target.value)}
                  />
                </FormField>
              </div>
            </div>
          </section>

          {/* 3. Routes */}
          <section 
            ref={el => formRefs.current[2] = el}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <Map className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Routes</h2>
                  <p className="text-gray-600">Add your company routes (Minimum 1 required)</p>
                </div>
              </div>
              <button
                onClick={() => setRouteModal({ from_location: "", to_location: "" })}
                className="btn-primary"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Route
              </button>
            </div>

            {form.routes.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                <Map className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No routes added</h3>
                <p className="text-gray-600 mb-4">Add at least one route to continue</p>
                <button
                  onClick={() => setRouteModal({ from_location: "", to_location: "" })}
                  className="btn-outline"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add First Route
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {form.routes.map((route, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-4 hover:border-green-500 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                          <span className="text-green-600 font-bold">{index + 1}</span>
                        </div>
                        <span className="font-medium text-gray-900">Route {index + 1}</span>
                      </div>
                      <button
                        onClick={() => removeRoute(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-20">From:</span>
                        <span className="font-medium">{route.from_location}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 w-20">To:</span>
                        <span className="font-medium">{route.to_location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 4. Vehicles */}
          <section 
            ref={el => formRefs.current[3] = el}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                  <Car className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Vehicles</h2>
                  <p className="text-gray-600">Add your company vehicles (Minimum 1 required)</p>
                </div>
              </div>
              <button
                onClick={() => setVehicleModal({
                  vehicle_type: VEHICLE_TYPES[0],
                  vehicle_number: "",
                  number_of_seats: "",
                  image: null,
                })}
                className="btn-primary"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Vehicle
              </button>
            </div>

            {form.vehicles.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles added</h3>
                <p className="text-gray-600 mb-4">Add at least one vehicle to continue</p>
                <button
                  onClick={() => setVehicleModal({
                    vehicle_type: VEHICLE_TYPES[0],
                    vehicle_number: "",
                    number_of_seats: "",
                    image: null,
                  })}
                  className="btn-outline"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add First Vehicle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {form.vehicles.map((vehicle, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-5 hover:border-orange-500 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                            <span className="text-orange-600 font-bold">{index + 1}</span>
                          </div>
                          <span className="font-bold text-gray-900">
                            {vehicle.vehicle_type?.charAt(0).toUpperCase() + vehicle.vehicle_type?.slice(1)}
                          </span>
                        </div>
                        <div className="space-y-1 ml-11">
                          <div className="flex items-center text-sm">
                            <span className="text-gray-500 w-20">Number:</span>
                            <span className="font-medium">{vehicle.vehicle_number}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <span className="text-gray-500 w-20">Seats:</span>
                            <span className="font-medium">{vehicle.number_of_seats}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeVehicle(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                    {vehicle.image && (
                      <div className="mt-4 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center text-sm text-gray-600">
                          <Upload className="h-4 w-4 mr-2" />
                          {vehicle.image.name || "Image uploaded"}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 5. Drivers */}
          <section 
            ref={el => formRefs.current[4] = el}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Drivers</h2>
                  <p className="text-gray-600">Add your company drivers (Minimum 1 required)</p>
                </div>
              </div>
              <button
                onClick={() => setDriverModal({
                  driver_name: "",
                  driver_contact_number: "",
                  driver_cnic: "",
                  driving_license_no: "",
                  image: null,
                })}
                className="btn-primary"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Driver
              </button>
            </div>

            {form.drivers.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No drivers added</h3>
                <p className="text-gray-600 mb-4">Add at least one driver to continue</p>
                <button
                  onClick={() => setDriverModal({
                    driver_name: "",
                    driver_contact_number: "",
                    driver_cnic: "",
                    driving_license_no: "",
                    image: null,
                  })}
                  className="btn-outline"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add First Driver
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {form.drivers.map((driver, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-5 hover:border-purple-500 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{driver.driver_name}</h3>
                            <p className="text-sm text-gray-600">Driver {index + 1}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 ml-14">
                          <div className="text-sm">
                            <span className="text-gray-500 block">Contact:</span>
                            <span className="font-medium">{driver.driver_contact_number || "—"}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-500 block">CNIC:</span>
                            <span className="font-medium">{driver.driver_cnic || "—"}</span>
                          </div>
                          <div className="text-sm col-span-2">
                            <span className="text-gray-500 block">License #:</span>
                            <span className="font-medium">{driver.driving_license_no}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeDriver(index)}
                        className="text-red-500 hover:text-red-700 ml-4"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                    {driver.image && (
                      <div className="mt-4 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center text-sm text-gray-600">
                          <Upload className="h-4 w-4 mr-2" />
                          {driver.image.name || "Photo uploaded"}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 6. Agreement */}
          <section 
            ref={el => formRefs.current[5] = el}
            className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Agreement & Submission</h2>
                <p className="text-gray-600">Review and submit your application</p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="flex items-start mb-6">
                <input
                  type="checkbox"
                  id="agreement"
                  checked={form.agreement_accepted}
                  onChange={(e) => setField("agreement_accepted", e.target.checked)}
                  className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
                <label htmlFor="agreement" className="ml-3">
                  <h3 className="font-bold text-gray-900 mb-2">Terms & Conditions</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    I certify that the information provided is true and accurate to the best of my knowledge. 
                    I understand that providing false information may lead to rejection or suspension of access 
                    to CTMS_GB services. CTMS_GB may verify my details and contact me for clarifications. 
                    I have read and accept the Terms & Conditions and Privacy Policy.
                  </p>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={clearAll}
                  className="btn-secondary flex-1"
                >
                  Clear All
                </button>
                <button
                  onClick={saveDraft}
                  disabled={loading}
                  className="btn-warning flex-1"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {loading ? "Saving..." : form.id ? "Update Draft" : "Save Draft"}
                </button>
                <button
                  onClick={submit}
                  disabled={!form.agreement_accepted || loading}
                  className="btn-success flex-1"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Submit for Review
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modals */}
      {/* Route Modal */}
      <AnimatePresence>
        {routeModal && (
          <Modal onClose={() => setRouteModal(null)} title="Add New Route">
            <div className="space-y-6">
              <FormField label="From Location">
                <select
                  className="form-select"
                  value={routeModal.from_location}
                  onChange={(e) =>
                    setRouteModal((m) => ({ ...m, from_location: e.target.value }))
                  }
                >
                  <option value="" disabled>Select starting point</option>
                  {PLACES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="To Location">
                <select
                  className="form-select"
                  value={routeModal.to_location}
                  onChange={(e) =>
                    setRouteModal((m) => ({ ...m, to_location: e.target.value }))
                  }
                >
                  <option value="" disabled>Select destination</option>
                  {PLACES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </FormField>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  className="btn-secondary"
                  onClick={() => setRouteModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={saveRouteFromModal}
                  disabled={!routeModal.from_location || !routeModal.to_location}
                >
                  Add Route
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Vehicle Modal */}
      <AnimatePresence>
        {vehicleModal && (
          <Modal onClose={() => setVehicleModal(null)} title="Add New Vehicle">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Vehicle Type *">
                  <select
                    className="form-select"
                    value={vehicleModal.vehicle_type}
                    onChange={(e) =>
                      setVehicleModal((m) => ({ ...m, vehicle_type: e.target.value }))
                    }
                  >
                    {VEHICLE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Vehicle Number *">
                  <Input
                    placeholder="e.g., LE-1234"
                    value={vehicleModal.vehicle_number}
                    onChange={(e) =>
                      setVehicleModal((m) => ({ ...m, vehicle_number: e.target.value }))
                    }
                  />
                </FormField>

                <FormField label="Number of Seats">
                  <Input
                    type="number"
                    placeholder="e.g., 14"
                    value={vehicleModal.number_of_seats}
                    onChange={(e) =>
                      setVehicleModal((m) => ({ ...m, number_of_seats: e.target.value }))
                    }
                  />
                </FormField>

                <FormField label="Vehicle Image">
                  <FileUpload
                    file={vehicleModal.image}
                    onChange={(file) => setVehicleModal((m) => ({ ...m, image: file }))}
                    accept="image/*"
                    maxSize={250}
                    label="Upload vehicle image (max 250KB)"
                  />
                </FormField>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  className="btn-secondary"
                  onClick={() => setVehicleModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={saveVehicleFromModal}
                  disabled={!vehicleModal.vehicle_type || !vehicleModal.vehicle_number}
                >
                  Add Vehicle
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Driver Modal */}
      <AnimatePresence>
        {driverModal && (
          <Modal onClose={() => setDriverModal(null)} title="Add New Driver">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Driver Name *">
                  <Input
                    placeholder="Full name"
                    value={driverModal.driver_name}
                    onChange={(e) =>
                      setDriverModal((m) => ({ ...m, driver_name: e.target.value }))
                    }
                  />
                </FormField>

                <FormField label="Driver Contact">
                  <Input
                    placeholder="03XXXXXXXXX"
                    value={driverModal.driver_contact_number}
                    onChange={(e) =>
                      setDriverModal((m) => ({ ...m, driver_contact_number: e.target.value }))
                    }
                  />
                </FormField>

                <FormField label="Driver CNIC">
                  <Input
                    placeholder="XXXXX-XXXXXXX-X"
                    value={driverModal.driver_cnic}
                    onChange={(e) =>
                      setDriverModal((m) => ({ ...m, driver_cnic: e.target.value }))
                    }
                  />
                </FormField>

                <FormField label="License Number *">
                  <Input
                    placeholder="Driver's license number"
                    value={driverModal.driving_license_no}
                    onChange={(e) =>
                      setDriverModal((m) => ({ ...m, driving_license_no: e.target.value }))
                    }
                  />
                </FormField>

                <div className="md:col-span-2">
                  <FormField label="Driver Photo">
                    <FileUpload
                      file={driverModal.image}
                      onChange={(file) => setDriverModal((m) => ({ ...m, image: file }))}
                      accept="image/*"
                      maxSize={250}
                      label="Upload driver photo (max 250KB)"
                    />
                  </FormField>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  className="btn-secondary"
                  onClick={() => setDriverModal(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={saveDriverFromModal}
                  disabled={!driverModal.driver_name || !driverModal.driving_license_no}
                >
                  Add Driver
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <Modal onClose={() => setShowConfirm(false)} title="Review & Submit Application">
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-blue-600 mr-3" />
                  <p className="text-blue-800 font-medium">
                    Please review all details carefully before submitting.
                  </p>
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto space-y-8 pr-2">
                <PreviewSection title="Company Details" data={preview.Company} />
                <PreviewSection title="Owner Details" data={preview.Owner} />
                
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Routes ({preview.Routes.length})</h3>
                  {preview.Routes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {preview.Routes.map((route, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                          <div className="flex items-center">
                            <Map className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="font-medium">{route[0]}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-red-500 text-sm">No routes added!</p>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Vehicles ({preview.Vehicles.length})</h3>
                  {preview.Vehicles.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-3 text-left">Type</th>
                            <th className="p-3 text-left">Number</th>
                            <th className="p-3 text-left">Seats</th>
                            <th className="p-3 text-left">Image</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.Vehicles.map((v, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="p-3">{v[0]}</td>
                              <td className="p-3">{v[1]}</td>
                              <td className="p-3">{v[2]}</td>
                              <td className="p-3">{v[3]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-red-500 text-sm">No vehicles added!</p>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Drivers ({preview.Drivers.length})</h3>
                  {preview.Drivers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Contact</th>
                            <th className="p-3 text-left">CNIC</th>
                            <th className="p-3 text-left">License</th>
                            <th className="p-3 text-left">Photo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {preview.Drivers.map((d, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="p-3">{d[0]}</td>
                              <td className="p-3">{d[1]}</td>
                              <td className="p-3">{d[2]}</td>
                              <td className="p-3">{d[3]}</td>
                              <td className="p-3">{d[4]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-red-500 text-sm">No drivers added!</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  className="btn-secondary"
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="btn-success"
                  onClick={confirmSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    "Confirm Submission"
                  )}
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Reusable Components ---------- */

// Modal Component
function Modal({ children, onClose, title }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden z-10"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Form Field Component
function FormField({ label, children, icon, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        <div className="flex items-center">
          {icon && <span className="mr-2 text-gray-500">{icon}</span>}
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>
      </label>
      {children}
    </div>
  );
}

// Input Component
function Input(props) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
    />
  );
}

// File Upload Component
function FileUpload({ file, onChange, accept, maxSize, label }) {
  return (
    <div className="space-y-2">
      <label className="block">
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors">
          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-3" />
          <div className="text-sm text-gray-600">
            {file ? file.name : label}
          </div>
          {file && (
            <div className="mt-2 text-xs text-green-600">
              ✓ File selected ({Math.round(file.size / 1024)}KB)
            </div>
          )}
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) {
                if (selectedFile.size > maxSize * 1024) {
                  alert(`File must be smaller than ${maxSize}KB`);
                  e.target.value = null;
                } else {
                  onChange(selectedFile);
                }
              }
            }}
          />
        </div>
      </label>
      {file && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Remove file
        </button>
      )}
    </div>
  );
}

// Preview Section Component
function PreviewSection({ title, data }) {
  return (
    <div>
      <h3 className="font-bold text-gray-900 mb-4">{title}</h3>
      <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
        {data.map((row, idx) => (
          <div key={idx} className={`flex ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="w-1/3 px-4 py-3 border-r border-gray-200 text-gray-600">
              {row[0]}
            </div>
            <div className="w-2/3 px-4 py-3 font-medium">
              {row[1]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Utility Functions ---------- */

function parseServerError(e, fallback) {
  if (e?.response?.data) {
    try {
      const d = e.response.data;
      if (typeof d === "object" && !Array.isArray(d)) {
        return Object.entries(d)
          .map(([key, value]) => {
            const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
            return `${formattedKey}: ${Array.isArray(value) ? value.join(", ") : value}`;
          })
          .join(" | ");
      }
      return Array.isArray(d) ? d.join(", ") : d.toString();
    } catch (err) {
      return fallback;
    }
  }
  return fallback;
}

/* ---------- CSS Classes ---------- */
const styles = `
  .btn-primary {
    @apply px-5 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center;
  }
  .btn-secondary {
    @apply px-5 py-3 bg-gray-200 text-gray-800 font-medium rounded-xl hover:bg-gray-300 transition-colors;
  }
  .btn-success {
    @apply px-5 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center;
  }
  .btn-warning {
    @apply px-5 py-3 bg-yellow-500 text-white font-medium rounded-xl hover:bg-yellow-600 transition-colors flex items-center justify-center;
  }
  .btn-outline {
    @apply px-5 py-2 border-2 border-indigo-600 text-indigo-600 font-medium rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center;
  }
  .form-select {
    @apply w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition;
  }
  .form-textarea {
    @apply w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none;
  }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);