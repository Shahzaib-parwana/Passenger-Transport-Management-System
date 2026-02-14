// import React, { useRef } from "react";
// import { QRCodeCanvas } from "qrcode.react";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

// export default function TicketDetails({ ticket, setStep }) {
//   const ticketRef = useRef();

//   // ✅ PDF Download
//   const handleDownload = async () => {
//     const element = ticketRef.current;
//     if (!element) return;

//     const canvas = await html2canvas(element, { useCORS: true, scale: 2 });
//     const imgData = canvas.toDataURL("image/png", 1.0);
//     const pdf = new jsPDF("p", "mm", "a4");

//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = pdf.internal.pageSize.getHeight();
//     const imgProps = pdf.getImageProperties(imgData);
//     const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);

//     const newWidth = imgProps.width * ratio;
//     const newHeight = imgProps.height * ratio;

//     const x = (pdfWidth - newWidth) / 2;
//     const y = (pdfHeight - newHeight) / 2;

//     pdf.addImage(imgData, "PNG", x, y, newWidth, newHeight);
//     pdf.save(`ticket_${ticket.booking_id}.pdf`);
//   };

//   return (
//     <div className="p-6 border rounded-lg bg-white shadow">
//       {/* ✅ Download Button */}
//       <div className="flex justify-end mb-4">
//         <button
//           onClick={handleDownload}
//           className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//         >
//           ⬇ Download Ticket
//         </button>
//       </div>

//       {/* ✅ Ticket Content */}
//       <div
//         ref={ticketRef}
//         className="p-6 border-2 border-dashed rounded-lg bg-gray-50"
//       >
//         <h2 className="text-2xl font-bold text-center mb-6 text-green-700">
//           🎟 {ticket.transport_name || "Travel Company"}
//         </h2>

//         {/* ✅ Passenger Info + Logo */}
//         <div className="mb-4 border-b pb-3">
//           <div className="flex justify-between items-center">
//             <h3 className="font-semibold text-lg">Passenger Details</h3>

//             {ticket.company_logo_url && (
//               <img
//                 src={ticket.company_logo_url}
//                 alt="logo"
//                 className="w-20 h-20 object-contain rounded-full border shadow ml-4"
//                 onError={(e) => (e.target.style.display = "none")}
//               />
//             )}
//           </div>

//           <div className="mt-2">
//           <p><strong>Name:</strong> {ticket.passenger_name || "N/A"}</p>
//           <p><strong>CNIC:</strong> {ticket.passenger_cnic || "N/A"}</p>
//           <p><strong>Contact:</strong> {ticket.passenger_contact || "N/A"}</p>
//           <p><strong>Email:</strong> {ticket.passenger_email || "N/A"}</p>
//           </div>
//         </div>

//         {/* ✅ Seats */}
//         <div className="mb-4">
//           <h3 className="font-semibold text-lg">Selected Seats</h3>
//           <p>{ticket.seats?.join(", ")}</p>
//         </div>

//         {/* ✅ Transport Info */}
//         <div className="mb-4">
//           <h3 className="font-semibold text-lg">Transport Info</h3>
//           <p><strong>Vehicle No:</strong> {ticket.vehicle_number}</p>
//           <p><strong>Driver:</strong> {ticket.driver_name || "N/A"}</p>
//           <p><strong>Route:</strong> {ticket.route_from} ➝ {ticket.route_to}</p>
//           <p><strong>Date:</strong> {ticket.arrival_date} at {ticket.arrival_time}</p>
//         </div>

//         {/* ✅ Payment Info + QR */}
//         <div className="mb-6 flex justify-between items-start">
//           <div>
//             <h3 className="font-semibold text-lg">Payment Type</h3>
//             <p>{ticket.payment_type}</p>
//             <h3 className="font-semibold text-lg mt-2">Total Amount</h3>
//             <p>{ticket.total_price} Rs</p>
//           </div>

//           <div className="ml-2 self-start">
//             <QRCodeCanvas value={JSON.stringify(ticket)} size={100} />
//           </div>
//         </div>
//       </div>

//       {/* ✅ Back Button */}
//       <div className="mt-6 text-center">
//         <button
//           onClick={() => setStep("history")}
//           className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//         >
//           ⬅ Back to History
//         </button>
//       </div>
//     </div>
//   );
// }
