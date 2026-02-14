// DriverDetailModal.jsx (FINAL READY-TO-USE)

import React, { useState, useEffect } from "react";
// import apiPrivate from "../../../../api/apiprivate";
import apiPrivate from "../../../../api/apiprivate";
import { X, Trash2, Loader2, Save } from "lucide-react";

const DriverDetailModal = ({ driver, onClose, onUpdateSuccess, onDeleteSuccess }) => {

    const [formData, setFormData] = useState({ ...driver, image: null });
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");

    // Reset when modal opens
    useEffect(() => {
        setFormData({ ...driver, image: null });
        setMsg("");
        setError("");
    }, [driver]);


    // Handle Input Changes
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: files ? files[0] : value,
        }));
    };


    // ✅ UPDATE DRIVER
    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");
        setError("");

        try {
            const updateData = new FormData();
            updateData.append("driver_name", formData.driver_name);
            updateData.append("driver_contact_number", formData.driver_contact_number);
            updateData.append("driver_cnic", formData.driver_cnic);
            updateData.append("driving_license_no", formData.driving_license_no);

            if (formData.image instanceof File) {
                updateData.append("image", formData.image);
            }

            // 🔥 Correct update URL
            const updateUrl = `/auth/drivers/${driver.id}/`;

            const response = await apiPrivate.patch(updateUrl, updateData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setMsg("✅ Driver updated successfully!");
            onUpdateSuccess(response.data);

        } catch (err) {
            const detail =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.message;

            setError(`❌ Update failed: ${detail}`);
        } finally {
            setLoading(false);
        }
    };


    // 🗑️ DELETE DRIVER
    const handleDelete = async () => {
        if (!window.confirm(`Delete driver "${driver.driver_name}" permanently?`)) return;

        setLoading(true);
        setMsg("");
        setError("");

        try {
            // 🔥 Correct delete URL
            const deleteUrl = `/auth/drivers/${driver.id}/`;

            await apiPrivate.delete(deleteUrl);

            onDeleteSuccess(driver.id);
            onClose();

        } catch (err) {
            const detail =
                err.response?.data?.detail ||
                err.response?.data?.message ||
                err.message;

            setError(`❌ Delete failed: ${detail}`);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-red-600 p-1 rounded-full bg-gray-50"
                >
                    <X size={24} />
                </button>

                <h3 className="text-2xl font-bold mb-4 text-green-700 border-b pb-2">
                    Driver Details: {driver.driver_name}
                </h3>

                {msg && <p className="text-green-600 mb-3 font-medium">{msg}</p>}
                {error && <p className="text-red-600 mb-3 font-medium">{error}</p>}

                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* LEFT COLUMN (Image) */}
                    <div className="md:col-span-1 flex flex-col items-center pt-4">
                        <img
                            src={
                                formData.image instanceof File
                                    ? URL.createObjectURL(formData.image)
                                    : driver.image || "https://via.placeholder.com/200x200?text=Driver"
                            }
                            alt="Driver"
                            className="w-40 h-40 object-cover rounded-full border-4 border-green-200 shadow-md mb-4"
                        />

                        <label className="block w-full text-center">
                            <span className="text-gray-700 font-medium text-sm">Change Image:</span>
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleChange}
                                className="mt-1 block w-full text-xs text-gray-500 file:py-1 file:px-2
                                file:rounded-full file:text-sm file:font-semibold
                                file:bg-green-50 file:text-green-700"
                            />
                        </label>
                    </div>


                    {/* RIGHT COLUMN (Inputs) */}
                    <div className="md:col-span-2 grid grid-cols-2 gap-4">

                        <label className="block col-span-2">
                            <span className="text-gray-700 font-medium">Driver Name:</span>
                            <input
                                type="text"
                                name="driver_name"
                                value={formData.driver_name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border p-2 rounded-lg"
                            />
                        </label>

                        <label className="block">
                            <span className="text-gray-700 font-medium">Contact Number:</span>
                            <input
                                type="text"
                                name="driver_contact_number"
                                value={formData.driver_contact_number}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border p-2 rounded-lg"
                            />
                        </label>

                        <label className="block">
                            <span className="text-gray-700 font-medium">CNIC:</span>
                            <input
                                type="text"
                                name="driver_cnic"
                                value={formData.driver_cnic}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border p-2 rounded-lg"
                            />
                        </label>

                        <label className="block col-span-2">
                            <span className="text-gray-700 font-medium">License Number:</span>
                            <input
                                type="text"
                                name="driving_license_no"
                                value={formData.driving_license_no}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full border p-2 rounded-lg"
                            />
                        </label>
                    </div>


                    {/* BUTTONS */}
                    <div className="col-span-1 md:col-span-3 flex justify-end gap-4 pt-3 border-t mt-4">

                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 
                            text-white py-2 px-4 rounded-full font-semibold"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Trash2 size={20} />}
                            Delete
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 
                            text-white py-2 px-4 rounded-full font-semibold"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Save Changes
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
};

export default DriverDetailModal;
