// src/components/TransportList.jsx
import React, { useState } from "react";
import TransportInfo from "./TransportInfo";
import TransportCard from "./TransportCard"
import apiPrivate from "../../../api/apiprivate";

const TransportList = ({
  transports,
  setTransports,
  onEditTransport,
  vehicles,
  drivers,
  fullTransportList
}) => {
  const [selectedTransport, setSelectedTransport] = useState(null); // ✅ Single state for all
  const [loadingStates, setLoadingStates] = useState({});

  // ---------------------------------------------
  // ⭐ Filter: HIDE EXPIRED TRANSPORTS
  // ---------------------------------------------
  const validTransports = transports.filter((t) => {
    if (!t.arrival_date || !t.arrival_time) return true;

    const arrivalDateTime = new Date(`${t.arrival_date}T${t.arrival_time}`);
    const now = new Date();

    // Add 12 hours to arrival time
    const expiryTime = new Date(arrivalDateTime.getTime() + 12 * 60 * 60 * 1000);

    // Show only if still within 12-hour window
    return expiryTime >= now;
  });

  // DELETE handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transport offer?")) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, [id]: true }));

    try {
      await apiPrivate.delete(`/transports/${id}/`);
      setTransports((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete transport offer. Please try again.");
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  // ACTIVE/INACTIVE toggle handler
  const handleToggleStatus = async (id, currentStatus) => {
    const transport = transports.find(t => t.id === id);

    if (transport.offer_type === 'offer_sets') {
      if (!transport.price_per_seat || transport.price_per_seat <= 0) {
        if (!currentStatus) {
          alert("Cannot activate: Price per seat is required for seat booking offers!");
          return;
        }
      }
    }

    const newStatus = !currentStatus;

    setLoadingStates(prev => ({ ...prev, [id]: true }));

    try {
      const formData = new FormData();
      formData.append("is_active", newStatus);

      const response = await apiPrivate.patch(`/transports/${id}/`, formData);

      setTransports(prev => prev.map(t =>
        t.id === id ? { ...t, is_active: response.data.is_active } : t
      ));
    } catch (error) {
      console.error(error.response?.data);
      alert(error.response?.data?.detail || "Failed to update status");
    } finally {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }
  };

  // Grouping transports
  const groupedTransports = {
    seatOffers: validTransports.filter(t => t.offer_type === 'offer_sets'),
    hireOffers: validTransports.filter(t => t.offer_type === 'whole_hire')
  };

  // Empty state
  if (validTransports.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No active transport offers found</h3>
        <p className="text-gray-500 mb-4">
          All expired transports are automatically hidden.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SEAT BOOKING OFFERS */}
      {groupedTransports.seatOffers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-indigo-700 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            Seat Booking Offers ({groupedTransports.seatOffers.length})
          </h3>

          <div className="space-y-4">
            {groupedTransports.seatOffers.map((transport) => (
              <TransportCard
                key={transport.id}
                transport={transport}
                onEdit={() => onEditTransport(transport.id)}
                onDelete={() => handleDelete(transport.id)}
                onToggleStatus={() => handleToggleStatus(transport.id, transport.is_active)}
                isLoading={loadingStates[transport.id]}
                offerType="seat"
                setInfoVehicle={setSelectedTransport} // ✅ Same function for both
              />
            ))}
          </div>
        </div>
      )}

      {/* VEHICLE HIRE OFFERS */}
      {groupedTransports.hireOffers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-teal-700 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Vehicle Hire Offers ({groupedTransports.hireOffers.length})
          </h3>

          <div className="space-y-4">
            {groupedTransports.hireOffers.map((transport) => (
              <TransportCard
                key={transport.id}
                transport={transport}
                onEdit={() => onEditTransport(transport.id)}
                onDelete={() => handleDelete(transport.id)}
                onToggleStatus={() => handleToggleStatus(transport.id, transport.is_active)}
                isLoading={loadingStates[transport.id]}
                offerType="hire"
                setInfoVehicle={setSelectedTransport} // ✅ Same function for both
              />
            ))}
          </div>
        </div>
      )}

      {/* MIXED View fallback */}
      {groupedTransports.seatOffers.length === 0 && groupedTransports.hireOffers.length === 0 && validTransports.length > 0 && (
        <div className="space-y-4">
          {validTransports.map((transport) => (
            <TransportCard
              key={transport.id}
              transport={transport}
              onEdit={() => onEditTransport(transport.id)}
              onDelete={() => handleDelete(transport.id)}
              onToggleStatus={() => handleToggleStatus(transport.id, transport.is_active)}
              isLoading={loadingStates[transport.id]}
              offerType={transport.offer_type === 'offer_sets' ? 'seat' : 'hire'}
              setInfoVehicle={setSelectedTransport} // ✅ Same function for both
            />
          ))}
        </div>
      )}

      {/* TRANSPORT INFO POPUP - Single modal for all */}
      {selectedTransport && (
        <TransportInfo
          transportData={selectedTransport}
          onClose={() => setSelectedTransport(null)}
        />
      )}
    </div>
  );
};

export default TransportList;