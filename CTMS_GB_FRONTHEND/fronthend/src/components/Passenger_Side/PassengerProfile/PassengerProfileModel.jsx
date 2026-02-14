"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  User, Mail, Phone, Calendar, MapPin, Edit, Save, X,
  Bell, UserCheck, Briefcase, Heart, Globe, Key,
  Image as ImageIcon, AlertTriangle, CheckCircle
} from "lucide-react";
import apiPrivate from "../../../api/apiprivate";

// -------------------- ALERT COMPONENT --------------------
const AlertMessage = ({ type, text, onClose }) => {
  if (!text) return null;
  const isSuccess = type === "success";
  const Icon = isSuccess ? CheckCircle : AlertTriangle;
  const bg = isSuccess
    ? "bg-green-100 border-green-400 text-green-700"
    : "bg-red-100 border-red-400 text-red-700";

  return (
    <div className={`fixed top-4 right-4 p-4 border rounded-lg shadow-lg z-50 flex items-center space-x-3 ${bg}`}>
      <Icon className="w-6 h-6" />
      <p>{text}</p>
      <X className="w-4 h-4 cursor-pointer" onClick={onClose} />
    </div>
  );
};

// -------------------- PASSWORD CHANGE MODAL --------------------
const PasswordChangeModal = ({ isOpen, onClose, showAlert }) => {
  const [currentPassword, setCurrent] = useState("");
  const [newPassword, setNew] = useState("");
  const [confirmPassword, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  // Step 1: Verify current password via API
  const verifyCurrentPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Replace endpoint with your backend API for password check
      await apiPrivate.post("auth/passenger/verify-password/", { password: currentPassword });
      showAlert("success", "Current password verified. Enter new password.");
      setVerified(true);
    } catch (err) {
      console.error(err);
      showAlert("error", "Incorrect current password.");
    }

    setLoading(false);
  };

  // Step 2: Submit new password
  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) return showAlert("error", "Passwords do not match.");
    if (newPassword.length < 8) return showAlert("error", "Password must be at least 8 characters.");

    setLoading(true);

    try {
      // Replace endpoint with your backend API to change password
      await apiPrivate.put("auth/passenger/change-password/", {
  old_password: currentPassword,
  new_password: newPassword,
});


      showAlert("success", "Password changed successfully.");
      setCurrent("");
      setNew("");
      setConfirm("");
      setVerified(false);
      onClose();
    } catch (err) {
      console.error(err);
      showAlert("error", "Error changing password.");
    }

    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <Key className="w-6 h-6 text-indigo-600 mr-2" />
            Change Password
          </h2>
          <X className="w-6 h-6 cursor-pointer" onClick={onClose} />
        </div>

        {!verified ? (
          <form onSubmit={verifyCurrentPassword} className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              className="w-full border p-3 rounded-lg"
              value={currentPassword}
              onChange={(e) => setCurrent(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg"
            >
              {loading ? "Verifying..." : "Verify Current Password"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="New Password"
              className="w-full border p-3 rounded-lg"
              value={newPassword}
              onChange={(e) => setNew(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              className="w-full border p-3 rounded-lg"
              value={confirmPassword}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg"
            >
              {loading ? "Changing..." : "Change Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};


// -------------------- HELPER COMPONENTS --------------------
const InfoField = ({ icon: Icon, label, value }) => (
  <div className="p-4 bg-gray-50 rounded-lg flex items-center space-x-3">
    <Icon className="w-5 h-5 text-indigo-600" />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium">{value || "---"}</p>
    </div>
  </div>
);

const InputField = ({ name, label, value, onChange, type = "text" }) => (
  <div>
    <label className="block font-medium">{label}</label>
    <input
      type={type}
      name={name}
      className="w-full border p-3 rounded-lg"
      value={value || ""}
      onChange={onChange}
    />
  </div>
);

const LockedField = ({ label, value }) => (
  <div>
    <label className="block font-medium">{label}</label>
    <input
      className="w-full border p-3 rounded-lg bg-gray-100"
      value={value}
      readOnly
    />
  </div>
);

const SelectField = ({ name, label, value, onChange, options }) => (
  <div>
    <label className="block font-medium">{label}</label>
    <select
      name={name}
      value={value ?? ""}
      onChange={onChange}
      className="w-full border p-3 rounded-lg"
    >
      <option value="">Select...</option>
      {options.map(([v, t]) => (
        <option key={v} value={v}>{t}</option>
      ))}
    </select>
  </div>
);

// -------------------- STATUS MAP --------------------
const STATUS_MAP = {
  male: "Male",
  female: "Female",
  married: "Married",
  unmarried: "Unmarried",
  student: "Student",
  govt_job: "Government Job",
  private_job: "Private Job",
  labor_former: "Laborer/Farmer",
  business_man: "Business Man",
  no_job: "No Job",
  yes: "Yes",
  no: "No",
};

// -------------------- MAIN COMPONENT --------------------
export default function PassengerProfile() {
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [profileFile, setProfileFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [alert, setAlert] = useState({ type: "", text: "" });
  const [passwordModal, setPasswordModal] = useState(false);

  const showAlert = useCallback((type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert({ type: "", text: "" }), 4000);
  }, []);

  // -------------------- FETCH PROFILE --------------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiPrivate.get("auth/passenger/profile/");
        setProfileData(res.data);
        setFormData({
          ...res.data,
          username: res.data.user.username,
          email: res.data.user.email,
          phone_number: res.data.user.phone_number,
        });
        setPreview(res.data.profile_picture);
        localStorage.setItem("passenger_profile_data", JSON.stringify(res.data));
      } catch {
        console.log("Using localStorage fallback");
        const stored = JSON.parse(localStorage.getItem("passenger_profile_data") || "{}");
        setProfileData(stored);
        setFormData(stored);
        setPreview(stored.profile_picture);
      }
    };
    fetchProfile();
  }, []);

  // -------------------- INPUT CHANGE --------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // -------------------- IMAGE PREVIEW --------------------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfileFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  // -------------------- SAVE PROFILE --------------------
  const saveProfile = async (customData = {}) => {
    try {
      const form = new FormData();
      // Append all fields
      const data = { ...formData, ...customData };
      form.append("cnic_or_passport", data.cnic_or_passport || "");
      form.append("address", data.address || "");
      form.append("gender", data.gender || "");
      form.append("date_of_birth", data.date_of_birth || "");
      form.append("living_status", data.living_status || "");
      form.append("current_status", data.current_status || "");
      form.append("special_person", data.special_person || "");
      form.append("additional_info", data.additional_info || "");
      form.append("notification_enabled", data.notification_enabled ? "true" : "false");

      if (profileFile) form.append("profile_picture", profileFile);

      const res = await apiPrivate.put("auth/passenger/profile/", form);
      setProfileData(res.data);
      setFormData((prev) => ({ ...prev, ...res.data }));
      setEditing(false);
      showAlert("success", "Profile updated successfully!");
      localStorage.setItem("passenger_profile_data", JSON.stringify(res.data));
    } catch (e) {
      console.error(e);
      showAlert("error", "Error saving profile.");
    }
  };

  if (!profileData) return <p>Loading...</p>;

  // -------------------- VIEW MODE --------------------
  if (!editing) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-xl my-10">
        <AlertMessage {...alert} onClose={() => setAlert({ type: "", text: "" })} />

        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <h2 className="text-3xl font-bold flex items-center">
            <UserCheck className="w-8 h-8 text-indigo-600 mr-3" />
            Passenger Profile
          </h2>
          <div className="space-x-3">
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-lg"
              onClick={() => setPasswordModal(true)}
            >
              <Key className="inline w-4 h-4 mr-1" /> Change Password
            </button>
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
              onClick={() => setEditing(true)}
            >
              <Edit className="inline w-4 h-4 mr-1" /> Edit
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-6 mb-8">
          <img
            src={profileData.profile_picture || "https://via.placeholder.com/150"}
            className="w-32 h-32 rounded-full object-cover border-4 border-indigo-300"
          />
          <div>
            <h3 className="text-3xl font-bold">{profileData.user.username}</h3>
            <p className="text-gray-600 flex items-center mt-1">
              <Mail className="w-4 h-4 mr-2" />
              {profileData.user.email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField icon={Phone} label="Phone" value={profileData.user.phone_number} />
          <InfoField icon={Globe} label="CNIC / Passport" value={profileData.cnic_or_passport} />
          <InfoField icon={MapPin} label="Address" value={profileData.address} />
          <InfoField icon={Calendar} label="Date of Birth" value={profileData.date_of_birth} />
          <InfoField icon={User} label="Gender" value={STATUS_MAP[profileData.gender]} />
          <InfoField icon={Heart} label="Marital Status" value={STATUS_MAP[profileData.living_status]} />
          <InfoField icon={Briefcase} label="Current Status" value={STATUS_MAP[profileData.current_status]} />
          <InfoField icon={UserCheck} label="Special Person" value={STATUS_MAP[profileData.special_person]} />
        </div>

        <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
          <h3 className="font-bold text-indigo-700 mb-2">Additional Info</h3>
          <p>{profileData.additional_info || "N/A"}</p>
        </div>

        <div className="mt-6 flex items-center space-x-3">
          <Bell className="w-6 h-6 text-indigo-600" />
          <p className="font-medium">
            Notifications: {profileData.notification_enabled ? "Enabled" : "Disabled"}
          </p>
          <button
            onClick={() => saveProfile({ notification_enabled: !profileData.notification_enabled })}
            className={`px-4 py-2 rounded-lg text-white ${profileData.notification_enabled ? "bg-red-500" : "bg-green-600"}`}
          >
            {profileData.notification_enabled ? "Disable" : "Enable"}
          </button>
        </div>

        <PasswordChangeModal
          isOpen={passwordModal}
          onClose={() => setPasswordModal(false)}
          showAlert={showAlert}
        />
      </div>
    );
  }

  // -------------------- EDIT MODE --------------------
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-xl rounded-xl my-10">
      <AlertMessage {...alert} onClose={() => setAlert({ type: "", text: "" })} />

      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h2 className="text-3xl font-bold text-red-600">Edit Profile</h2>
        <div className="space-x-3">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
            onClick={() => saveProfile()}
          >
            <Save className="inline w-4 h-4 mr-1" /> Save
          </button>
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded-lg"
            onClick={() => setEditing(false)}
          >
            <X className="inline w-4 h-4 mr-1" /> Cancel
          </button>
        </div>
      </div>

      {/* IMAGE UPLOAD */}
      <div className="flex flex-col items-center mb-6">
        <img
          src={preview || "https://via.placeholder.com/150"}
          className="w-32 h-32 rounded-full object-cover border-4 border-indigo-300"
        />
        <label className="mt-3 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg cursor-pointer">
          <ImageIcon className="w-4 h-4 inline mr-1" />
          Change Photo
          <input type="file" className="hidden" onChange={handleFileChange} />
        </label>
        {profileFile && <p className="text-sm mt-2">Selected: {profileFile.name}</p>}
      </div>

      {/* FORM */}
      <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LockedField label="Username" value={formData.username} />
        <LockedField label="Email" value={formData.email} />
        <InputField name="phone_number" label="Phone" value={formData.phone_number} onChange={handleChange} />
        <InputField name="cnic_or_passport" label="CNIC / Passport" value={formData.cnic_or_passport} onChange={handleChange} />
        <InputField name="date_of_birth" type="date" label="Date of Birth" value={formData.date_of_birth} onChange={handleChange} />

        <SelectField name="gender" label="Gender" value={formData.gender} onChange={handleChange}
          options={[["male", "Male"], ["female", "Female"]]} />
        <SelectField name="living_status" label="Marital Status" value={formData.living_status} onChange={handleChange}
          options={[["married", "Married"], ["unmarried", "Unmarried"]]} />
        <SelectField name="current_status" label="Current Status" value={formData.current_status} onChange={handleChange}
          options={[
            ["student", "Student"],
            ["govt_job", "Government Job"],
            ["private_job", "Private Job"],
            ["labor_former", "Laborer / Farmer"],
            ["business_man", "Business Man"],
            ["no_job", "No Job"]
          ]} />
        <SelectField name="special_person" label="Special Person" value={formData.special_person} onChange={handleChange}
          options={[["yes", "Yes"], ["no", "No"]]} />

        <div className="col-span-2">
          <label className="block font-medium">Address</label>
          <input
            name="address"
            className="w-full border p-3 rounded-lg"
            value={formData.address || ""}
            onChange={handleChange}
          />
        </div>

        <div className="col-span-2">
          <label className="block font-medium">Additional Info</label>
          <textarea
            name="additional_info"
            className="w-full border p-3 rounded-lg"
            rows="3"
            value={formData.additional_info || ""}
            onChange={handleChange}
          ></textarea>
        </div>
      </form>
    </div>
  );
}
