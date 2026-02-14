import React, { useState, useEffect } from "react";
import axios from "./api/axiosConfig"; // ensure this path and export are correct
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 text-red-800 rounded">
          <h3 className="font-bold mb-2">Something went wrong rendering this form</h3>
          <pre className="text-xs">{String(this.state.error)}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}
const blankForm = {
  company_name: "",
  registration_id: "",
  company_email: "",
  contact_no_1: "",
  contact_no_2: "",
  company_type: "vehicles",
  main_office_location: "",
  owner_name: "",
  owner_email: "",
  owner_contact: "",
  owner_cnic: "",
  owner_address: "",
  routes: [],
  vehicles: [],
  drivers: [],
  is_submitted: false,
  agreed: false, // added to avoid undefined checks
};



export default function Hello({ open = false, onClose }) {

     const [form, setForm] = useState(blankForm);
     const [loading, setLoading] = useState(false);
     const [showConfirm, setShowConfirm] = useState(false);
     const [message, setMessage] = useState("");

    // Defensive: if axios not configured, show note (prevents crash)
      useEffect(() => {
        if (!axios || typeof axios.get !== "function") {
          console.error("axios is not configured or import path is wrong (../api/axiosConfig).");
          setMessage("Network client not available. Check axiosConfig import.");
        }
      }, []);

      // load existing draft when modal opens
        useEffect(() => {
          if (!open) return;
          let mounted = true;
          (async () => {
            try {
              if (!axios || typeof axios.get !== "function") return;
              const res = await axios.get("/companies/company-detail/");
              if (!mounted) return;
              if (res && res.data && typeof res.data === "object" && Object.keys(res.data).length) {
                setForm((prev) => ({
                  ...blankForm,
                  ...res.data,
                  routes: Array.isArray(res.data.routes) ? res.data.routes : [],
                  vehicles: Array.isArray(res.data.vehicles) ? res.data.vehicles : [],
                  drivers: Array.isArray(res.data.drivers) ? res.data.drivers : [],
                  is_submitted: !!res.data.is_submitted,
                  agreed: !!res.data.agreed,
                }));
              } else {
                setForm(blankForm);
              }
            } catch (err) {
              console.error("Load draft error:", err);
              setMessage("Unable to load draft (see console).");
            }
          })();
          return () => { mounted = false; };
        }, [open]);

        // small setters
  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const addRoute = () => setForm((f) => ({ ...f, routes: [...f.routes, { from_location: "", to_location: "" }] }));
  const updateRoute = (i, key, value) => setForm((f) => {
    const r = [...f.routes]; r[i] = { ...r[i], [key]: value }; return { ...f, routes: r };
  });
  const removeRoute = (i) => setForm((f) => { const r = [...f.routes]; r.splice(i, 1); return { ...f, routes: r }; });

  const addVehicle = () => setForm((f) => ({ ...f, vehicles: [...f.vehicles, { vehicle_type: "Bus", vehicle_number: "", seats_or_capacity: "", image: null }] }));
  const updateVehicle = (i, key, value) => setForm((f) => { const v = [...f.vehicles]; v[i] = { ...v[i], [key]: value }; return { ...f, vehicles: v }; });
  const removeVehicle = (i) => setForm((f) => { const v = [...f.vehicles]; v.splice(i, 1); return { ...f, vehicles: v }; });

  const addDriver = () => setForm((f) => ({ ...f, drivers: [...f.drivers, { name: "", contact_no: "", cnic: "", license_number: "", photo: null }] }));
  const updateDriver = (i, key, value) => setForm((f) => { const d = [...f.drivers]; d[i] = { ...d[i], [key]: value }; return { ...f, drivers: d }; });
  const removeDriver = (i) => setForm((f) => { const d = [...f.drivers]; d.splice(i, 1); return { ...f, drivers: d }; });

  const clearForm = () => setForm(blankForm);

   // File handlers with small size check
  const handleFileChangeVehicle = (i, file) => {
    if (!file) return updateVehicle(i, "image", null);
    if (file.size > 250 * 1024) { alert("Vehicle image must be < 250KB"); return; }
    updateVehicle(i, "image", file);
  };
  const handleFileChangeDriver = (i, file) => {
    if (!file) return updateDriver(i, "photo", null);
    if (file.size > 250 * 1024) { alert("Driver photo must be < 250KB"); return; }
    updateDriver(i, "photo", file);
  };
  // Save draft
    const saveDraft = async () => {
      if (!axios || typeof axios.post !== "function") {
        setMessage("Network client not available.");
        return;
      }
      setLoading(true); setMessage("");
      try {
        const fd = new FormData();
        const simpleFields = [
          "company_name","registration_id","company_email","contact_no_1","contact_no_2","company_type","main_office_location",
          "owner_name","owner_email","owner_contact","owner_cnic","owner_address","is_submitted"
        ];
        simpleFields.forEach(k => fd.append(k, String(form[k] ?? "")));
  
        fd.append("routes", JSON.stringify(form.routes || []));
        fd.append("vehicles", JSON.stringify((form.vehicles || []).map(v => ({
          vehicle_type: v.vehicle_type, vehicle_number: v.vehicle_number, seats_or_capacity: v.seats_or_capacity
        }))));
  
        (form.vehicles || []).forEach((v, idx) => { if (v && v.image instanceof File) fd.append(`vehicle_image_${idx}`, v.image); });
  
        fd.append("drivers", JSON.stringify((form.drivers || []).map(d => ({ name: d.name, contact_no: d.contact_no, cnic: d.cnic, license_number: d.license_number })) ));
        (form.drivers || []).forEach((d, idx) => { if (d && d.photo instanceof File) fd.append(`driver_photo_${idx}`, d.photo); });
  
        const res = await axios.post("/companies/company-detail/", fd, { headers: { "Content-Type": "multipart/form-data" } });
        setMessage("Draft saved successfully.");
        if (res && res.data && typeof res.data === "object") setForm((f) => ({ ...f, ...res.data }));
      } catch (err) {
        console.error("Save draft error:", err);
        setMessage("Error saving draft. See console.");
      } finally { setLoading(false); }
    };
   // Submit
    const submit = () => setShowConfirm(true);
    const confirmSubmit = async () => {
      if (!axios || typeof axios.post !== "function") {
        setMessage("Network client not available.");
        return;
      }
      setLoading(true);
      try {
        await axios.post("/companies/company-submit/");
        setMessage("Submitted for admin review");
        setShowConfirm(false);
        onClose && onClose();
      } catch (err) {
        console.error("Submit error:", err);
        setMessage("Submit failed. See console.");
      } finally { setLoading(false); }
    };
// export default function Hello({ onClose }) {
//   const [open, setOpen] = useState(false);

//   return (
//     <AnimatePresence>
//       {open && (
//         <div>Hello</div>
//       )}
//     </AnimatePresence>
//   );
// }


 

  




  return <h1>Hello World - Passenger Registration</h1>;

}
