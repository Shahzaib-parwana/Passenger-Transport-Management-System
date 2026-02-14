// components/LoginModal.jsx
import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginModal({ children, onClose }) {
    return (
        // Backdrop
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                onClick={onClose} // Close when clicking the backdrop
            >
                {/* Modal Content Container */}
                <motion.div
                    initial={{ scale: 0.9, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 50 }} // Exit animation improved for smooth closing
                    transition={{ duration: 0.3 }}
                    // 👇 Ye class change ki hai: max-w-sm se max-w-md
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative m-4"
                    onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-500 hover:text-red-500 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition z-10"
                        title="Close"
                    >
                        <X size={24} />
                    </button>
                    
                    {/* Render the children (LoginPage with isModal=true) */}
                    {children}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}