import React, { useState, useEffect } from "react";
import apiPrivate from "../../../api/apiprivate";
import { Upload, Building2, KeyRound, Check, X, Wallet, Menu } from "lucide-react";

const createFormDataForUpdate = (data, keysToInclude, imageFile = null, coverImageFile = null) => {
  const formData = new FormData();
  keysToInclude.forEach((key) => {
    if (data[key] !== undefined) {
      formData.append(key, data[key] === null ? "" : data[key]);
    }
  });
  if (imageFile) formData.append("company_logo", imageFile);
  if (coverImageFile) formData.append("company_banner", coverImageFile);
  return formData;
};

const CompanydetailProfile = ({ user: userProp, fetchUser }) => {
  const [activeTab, setActiveTab] = useState("company");
  const [message, setMessage] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Added for sidebar functionality

  // file objects for upload & preview
  const [companyLogo, setCompanyLogo] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  // store server response (includes urls) separately — used for displaying logo/banner & any server-provided fields
  const [companyData, setCompanyData] = useState(null);

  const [formData, setFormData] = useState({
    company_name: "",
    company_email: "",
    contact_number_1: "",
    contact_number_2: "",
    main_office_location: "",
    owner_name: "",
    owner_email: "",
    owner_contact_number: "",
    owner_cnic: "",
    owner_address: "",

    // PAYMENT INFO
    payment_type: "BOTH",
    easypaisa_name: "",
    easypaisa_number: "",
    jazzcash_name: "",
    jazzcash_number: "",
    bank_name: "",
    bank_account_title: "",
    bank_account_number: "",
    bank_iban: "",
  });

  const [loadingData, setLoadingData] = useState(true);
  const [passwords, setPasswords] = useState({ old_password: "", new_password: "", confirm_password: "" });
  const [showNewPasswordFields, setShowNewPasswordFields] = useState(false);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // Load company details on mount
  useEffect(() => {
    const loadCompany = async () => {
      try {
        const res = await apiPrivate.get("auth/my-company-detail/");
        const data = res.data;

        // set server data (includes *_url fields)
        setCompanyData(data);

        // Merge into formData (so we don't accidentally wipe other fields)
        setFormData((prev) => ({
          ...prev,
          company_name: data.company_name ?? "",
          company_email: data.company_email ?? "",
          contact_number_1: data.contact_number_1 ?? "",
          contact_number_2: data.contact_number_2 ?? "",
          main_office_location: data.main_office_location ?? "",

          owner_name: data.owner_name ?? "",
          owner_email: data.owner_email ?? "",
          owner_contact_number: data.owner_contact_number ?? "",
          owner_cnic: data.owner_cnic ?? "",
          owner_address: data.owner_address ?? "",

          // Payment fields
          payment_type: data.payment_type ?? "BOTH",
          easypaisa_name: data.easypaisa_name ?? "",
          easypaisa_number: data.easypaisa_number ?? "",
          jazzcash_name: data.jazzcash_name ?? "",
          jazzcash_number: data.jazzcash_number ?? "",
          bank_name: data.bank_name ?? "",
          bank_account_title: data.bank_account_title ?? "",
          bank_account_number: data.bank_account_number ?? "",
          bank_iban: data.bank_iban ?? "",
        }
      ));
      console.log("the response is",data,"this is total")
      } catch (err) {
        console.error("Failed to load company:", err);
        showMessage("Failed to load company data.", "error");
      } finally {
        setLoadingData(false);
      }
      
    };

    loadCompany();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // -------------------
  // COMPANY UPDATE (including logo/banner files)
  // -------------------
  const handleCompanyUpdate = async (e) => {
    e.preventDefault();
    const keys = ["company_name", "company_email", "contact_number_1", "contact_number_2", "main_office_location"];
    const dataToSend = createFormDataForUpdate(formData, keys, companyLogo, coverImage);

    try {
      const res = await apiPrivate.put("auth/update-my-company-detail/", dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // update local server state & form
      setCompanyData(res.data);
      setFormData((prev) => ({
        ...prev,
        company_name: res.data.company_name ?? prev.company_name,
        company_email: res.data.company_email ?? prev.company_email,
        contact_number_1: res.data.contact_number_1 ?? prev.contact_number_1,
        contact_number_2: res.data.contact_number_2 ?? prev.contact_number_2,
        main_office_location: res.data.main_office_location ?? prev.main_office_location,
      }));

      // clear file previews (optional)
      setCompanyLogo(null);
      setCoverImage(null);

      if (fetchUser) await fetchUser();
      showMessage("Company details updated successfully!");
    } catch (err) {
      console.log(err);
      showMessage("Failed to update company details.", "error");
    }
  };

  // -------------------
  // OWNER UPDATE
  // -------------------
  const handleOwnerUpdate = async (e) => {
    e.preventDefault();
    const keys = ["owner_name", "owner_email", "owner_contact_number", "owner_cnic", "owner_address"];
    const dataToSend = {};
    keys.forEach((key) => (dataToSend[key] = formData[key]));

    try {
      const res = await apiPrivate.put("auth/update-my-company-detail/", dataToSend);
      setCompanyData(res.data);
      setFormData((prev) => ({
        ...prev,
        owner_name: res.data.owner_name ?? prev.owner_name,
        owner_email: res.data.owner_email ?? prev.owner_email,
        owner_contact_number: res.data.owner_contact_number ?? prev.owner_contact_number,
        owner_cnic: res.data.owner_cnic ?? prev.owner_cnic,
        owner_address: res.data.owner_address ?? prev.owner_address,
      }));
      showMessage("Owner details updated!");
    } catch (err) {
      console.error(err);
      showMessage("Failed to update owner info.", "error");
    }
  };

  // -------------------
  // PAYMENT UPDATE
  // -------------------
  const handlePaymentUpdate = async (e) => {
    e.preventDefault();

    // Only send payment-related fields
    const paymentData = {
      payment_type: formData.payment_type,
      easypaisa_name: formData.easypaisa_name,
      easypaisa_number: formData.easypaisa_number,
      jazzcash_name: formData.jazzcash_name,
      jazzcash_number: formData.jazzcash_number,
      bank_name: formData.bank_name,
      bank_account_title: formData.bank_account_title,
      bank_account_number: formData.bank_account_number,
      bank_iban: formData.bank_iban,
    };

    try {
      const res = await apiPrivate.put("auth/update-my-company-detail/", paymentData);
      // update server data + form
      setCompanyData(res.data);
      setFormData((prev) => ({
        ...prev,
        payment_type: res.data.payment_type ?? prev.payment_type,
        easypaisa_name: res.data.easypaisa_name ?? prev.easypaisa_name,
        easypaisa_number: res.data.easypaisa_number ?? prev.easypaisa_number,
        jazzcash_name: res.data.jazzcash_name ?? prev.jazzcash_name,
        jazzcash_number: res.data.jazzcash_number ?? prev.jazzcash_number,
        bank_name: res.data.bank_name ?? prev.bank_name,
        bank_account_title: res.data.bank_account_title ?? prev.bank_account_title,
        bank_account_number: res.data.bank_account_number ?? prev.bank_account_number,
        bank_iban: res.data.bank_iban ?? prev.bank_iban,
      }));
      showMessage("Payment info updated!");
    } catch (err) {
      console.log(err);
      showMessage("Failed to update payment info.", "error");
    }
  };

  const tabColors = { company: "bg-blue-600", owner: "bg-green-600", payment: "bg-purple-600", password: "bg-red-600" };

  if (loadingData) return <div className="p-8 text-center">Loading...</div>;

  // Helper for preview URL (file chosen takes precedence)
  const bannerPreview = coverImage ? URL.createObjectURL(coverImage) : companyData?.company_banner ?? null;
  const logoPreview = companyLogo ? URL.createObjectURL(companyLogo) : companyData?.company_logo_url ?? null;

  return (
    <div className="relative">

      <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen pt-20 lg:pt-8">
        {/* MESSAGE - Responsive */}
        {message && (
          <div
            className={`flex items-center p-3 sm:p-4 rounded-xl mb-4 sm:mb-6 shadow-md ${
              message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message.type === "success" ? <Check className="mr-2 w-4 h-4 sm:w-5 sm:h-5" /> : <X className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />}
            <span className="text-sm sm:text-base">{message.text}</span>
          </div>
        )}

        {/* TABS - Responsive Grid */}
        <div className="bg-white p-2 rounded-xl shadow-lg mb-4 sm:mb-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {["company", "owner", "payment", "password"].map((tabId) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`px-3 py-2.5 sm:px-4 sm:py-3 rounded-lg font-bold text-xs sm:text-sm md:text-base whitespace-nowrap ${
                activeTab === tabId ? tabColors[tabId] + " text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tabId === "company" ? "Company" : tabId === "owner" ? "Owner" : tabId === "payment" ? "Payment Info" : "Password"}
            </button>
          ))}
        </div>

        {/* TAB CONTENT - Responsive Padding */}
        <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl">
          {/* COMPANY TAB */}
          {activeTab === "company" && (
            <form onSubmit={handleCompanyUpdate} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                {["company_name", "company_email", "contact_number_1", "contact_number_2", "main_office_location"].map((name) => (
                  <div key={name} className="w-full">
                    <label className="text-xs sm:text-sm font-bold block mb-1 sm:mb-2">{name.replace(/_/g, " ").toUpperCase()}</label>
                    <input 
                      name={name} 
                      value={formData[name]} 
                      onChange={handleChange} 
                      className="border p-2.5 sm:p-3 rounded-xl w-full text-sm sm:text-base"
                    />
                  </div>
                ))}
              </div>

              {/* IMAGES - Responsive */}
              <div className="pt-3 sm:pt-4 border-t">
                <label className="font-semibold flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5" /> Update Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setCompanyLogo(e.target.files[0]);
                  }}
                  className="mt-2 text-xs sm:text-sm w-full"
                />

                <label className="font-semibold mt-3 sm:mt-4 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5" /> Update Cover Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) setCoverImage(e.target.files[0]);
                  }}
                  className="mt-2 text-xs sm:text-sm w-full"
                />
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base">
                Save Company Details
              </button>
            </form>
          )}

          {/* OWNER TAB */}
          {activeTab === "owner" && (
            <form onSubmit={handleOwnerUpdate} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
                {["owner_name", "owner_email", "owner_contact_number", "owner_cnic"].map((name) => (
                  <div key={name} className="w-full">
                    <label className="text-xs sm:text-sm font-bold block mb-1 sm:mb-2">{name.replace(/_/g, " ").toUpperCase()}</label>
                    <input 
                      name={name} 
                      value={formData[name]} 
                      onChange={handleChange} 
                      className="border p-2.5 sm:p-3 rounded-xl w-full text-sm sm:text-base"
                    />
                  </div>
                ))}
              </div>

              <div className="w-full">
                <label className="text-xs sm:text-sm font-bold block mb-1 sm:mb-2">OWNER ADDRESS</label>
                <textarea 
                  name="owner_address" 
                  rows="3" 
                  value={formData.owner_address} 
                  onChange={handleChange} 
                  className="border p-2.5 sm:p-3 rounded-xl w-full text-sm sm:text-base"
                />
              </div>

              <button type="submit" className="w-full bg-green-600 text-white py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base">
                Save Owner Details
              </button>
            </form>
          )}

          {/* PAYMENT TAB */}
          {activeTab === "payment" && (
            <form onSubmit={handlePaymentUpdate} className="space-y-4 sm:space-y-6 md:space-y-8">
              {/* PAYMENT TYPE */}
              <div>
                <label className="font-bold text-xs sm:text-sm md:text-base block mb-1 sm:mb-2">Payment Type</label>
                <select 
                  name="payment_type" 
                  value={formData.payment_type} 
                  onChange={handleChange} 
                  className="border p-2.5 sm:p-3 rounded-xl w-full text-sm sm:text-base"
                >
                  <option value="ADVANCE">Advance Payment Only</option>
                  <option value="CASH">Cash Only</option>
                  <option value="BOTH">Both Cash + Advance</option>
                </select>
              </div>

              {/* EASYPaisa */}
              <div className="border p-3 sm:p-4 rounded-xl">
                <h2 className="font-bold mb-3 sm:mb-4 text-purple-600 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5" /> Easypaisa Info
                </h2>

                <input 
                  name="easypaisa_name" 
                  placeholder="Account Holder Name" 
                  value={formData.easypaisa_name} 
                  onChange={handleChange} 
                  className="border p-2.5 sm:p-3 rounded-xl w-full mb-2.5 sm:mb-3 text-sm sm:text-base"
                />

                <input 
                  name="easypaisa_number" 
                  placeholder="Easypaisa Number" 
                  value={formData.easypaisa_number} 
                  onChange={handleChange} 
                  className="border p-2.5 sm:p-3 rounded-xl w-full text-sm sm:text-base"
                />
              </div>

              {/* JazzCash */}
              <div className="border p-3 sm:p-4 rounded-xl">
                <h2 className="font-bold mb-3 sm:mb-4 text-yellow-600 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5" /> JazzCash Info
                </h2>

                <input 
                  name="jazzcash_name" 
                  placeholder="Account Holder Name" 
                  value={formData.jazzcash_name} 
                  onChange={handleChange} 
                  className="border p-2.5 sm:p-3 rounded-xl w-full mb-2.5 sm:mb-3 text-sm sm:text-base"
                />

                <input 
                  name="jazzcash_number" 
                  placeholder="JazzCash Number" 
                  value={formData.jazzcash_number} 
                  onChange={handleChange} 
                  className="border p-2.5 sm:p-3 rounded-xl w-full text-sm sm:text-base"
                />
              </div>

              {/* BANK INFO */}
              <div className="border p-3 sm:p-4 rounded-xl">
                <h2 className="font-bold mb-3 sm:mb-4 text-blue-600 flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5" /> Bank Account Info
                </h2>

                {["bank_name", "bank_account_title", "bank_account_number", "bank_iban"].map((name) => (
                  <input 
                    key={name} 
                    name={name} 
                    placeholder={name.replace(/_/g, " ").toUpperCase()} 
                    value={formData[name]} 
                    onChange={handleChange} 
                    className="border p-2.5 sm:p-3 rounded-xl w-full mb-2.5 sm:mb-3 text-sm sm:text-base"
                  />
                ))}
              </div>

              <button type="submit" className="w-full bg-purple-600 text-white py-2.5 sm:py-3 rounded-xl font-bold text-sm sm:text-base">
                Save Payment Info
              </button>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!showNewPasswordFields) {
                  try {
                    await apiPrivate.post("auth/passenger/verify-password/", { password: passwords.old_password });
                    setShowNewPasswordFields(true);
                    showMessage("Old password verified! Enter new password.", "success");
                  } catch (err) {
                    showMessage(err.response?.data?.detail || "Current password incorrect.", "error");
                  }
                  return;
                }
                if (passwords.new_password.length < 6) {
                  showMessage("New password must be at least 6 characters.", "error");
                  return;
                }
                if (passwords.new_password !== passwords.confirm_password) {
                  showMessage("New password and confirmation do not match.", "error");
                  return;
                }
                try {
                  await apiPrivate.put("/auth/passenger/change-password/", { old_password: passwords.old_password, new_password: passwords.new_password });
                  showMessage("Password changed successfully! Please log in again.", "success");
                  setPasswords({ old_password: "", new_password: "", confirm_password: "" });
                  setShowNewPasswordFields(false);
                } catch (err) {
                  showMessage(err.response?.data?.detail || "Password change failed.", "error");
                }
              }}
              className="space-y-4 sm:space-y-6 max-w-lg mx-auto"
            >
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-gray-600">Current Password</label>
                <input 
                  type="password" 
                  value={passwords.old_password} 
                  onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })} 
                  className="border p-2.5 sm:p-3 rounded-xl w-full text-sm sm:text-base" 
                  required 
                />
              </div>
              {showNewPasswordFields && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-600">New Password</label>
                    <input 
                      type="password" 
                      value={passwords.new_password} 
                      onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })} 
                      className="border p-2.5 sm:p-3 rounded-xl w-full text-sm sm:text-base" 
                      required 
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-600">Confirm New Password</label>
                    <input 
                      type="password" 
                      value={passwords.confirm_password} 
                      onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })} 
                      className="border p-2.5 sm:p-3 rounded-xl w-full text-sm sm:text-base" 
                      required 
                    />
                  </div>
                </>
              )}
              <button type="submit" className="w-full bg-red-600 text-white py-2.5 sm:py-3 rounded-xl font-bold flex justify-center items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
                {showNewPasswordFields ? "Save New Password" : "Verify Current Password"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanydetailProfile;