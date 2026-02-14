import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Hello from "./logout";
import LoginPage from "./components/Global_Component/login/LoginPage";
import PassengerRegistration from "./Registration_Pages/passenger_registration";
import CompanyRegistration from "./Registration_Pages/company_registration";
import CompanyDashboard from "./dashboard/CompanyDashbaord";
import PassengerDashboard from "./dashboard/PassengerDashboard";
import WeatherDashboard from "./components/HeaderComponent/weather";
import HomePage from "./Home/page";
import CompanyProfilePage from "./Registration_Pages/CompanyProfileForm";
import PassengerCardList from "./components/Passenger_Side/Set_Booking/PassengerCardList";
import SeatSelectionPage from "./components/Passenger_Side/Set_Booking/SeatSelectionPage";
import ServiceProviderDashboard from "./components/Company_Side/Company_management/Company_Seeting_Manager";
import Header from "./components/Global_Component/Header_Footer/Header";
import CompanydetailProfile from "./components/Company_Side/Company_management/Company_profile_detail";
import SeatBookingCompanies from "./components/HeaderComponent/Companies/SeatBookingCompanies/SeatBookingCompanies";
import VehicleBookingCompanies from "./components/HeaderComponent/Companies/VehicleBookingCompanies/VehicleBookingCompanies";
import LoginModal from "./components/Global_Component/login/LoginModal";
import CompanyTransportsList from "./components/HeaderComponent/Companies/SeatBookingCompanies/SeatBooking_in_Set_booking_companies";
import SeatBookingOffers from "./components/HomePageComponent/SeatBookingOffers";
import AllVehiclesPage from "./components/HeaderComponent/VehicalsPage";
import ProtectedRoute from "./components/Global_Component/login/ProtectedRoute";
import CompanyRegistrationSection from "./components/HeaderComponent/Service_Provider1";
import AboutUs from "./components/HeaderComponent/About_us";
import ContactPage from "./components/HeaderComponent/Contact-us";
import PassengerProfile from "./components/Passenger_Side/PassengerProfile/PassengerProfileModel";
import BookingSummary from "./components/Passenger_Side/Set_Booking/SeatBookingSummary";

import SeatBookingFormWrapper from "./components/Direct_Card_Booking/SeatBooking/SeatBookingComponentWrapp";
import VehicleBookingFormWrapper from "./components/Direct_Card_Booking/VehicleBooking/VehicalBookngeComponentWrapes";
import SeatBookingDetailsPage from "./components/Direct_Card_Booking/SeatBooking/SeatBookingDetailsPage";

import Footer from "./components/Global_Component/Header_Footer/Footer";
import PaymentPage from "./components/Passenger_Side/Vehicle_Booking/VehicleBookingSummary";
import FullVehicleDetailsPage from "./components/Direct_Card_Booking/VehicleBooking/FullVehicleDetailPage";

import ForgotPasswordPage from "./components/Global_Component/login/Forgat_Password_Handler/ForgotPasswordPage";
import ResetPasswordPage from "./components/Global_Component/login/Forgat_Password_Handler/ResetPasswordPage";
import VerifyOTPPage from "./components/Global_Component/login/Forgat_Password_Handler/VerifyOTPPage";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => setIsLoggedIn(false);
  const toggleLoginModal = (shouldShow) => setShowLoginModal(shouldShow);

  return (
    <>
      {/* <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md"> */}
        <Header
          isLoggedIn={isLoggedIn}
          onOpenLoginModal={() => toggleLoginModal(true)}
          onLogout={handleLogout}
        />
      {/* </div> */}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => toggleLoginModal(false)}>
          <LoginPage isModal={true} onSuccessfulLogin={handleLogin} />
        </LoginModal>
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage onSuccessfulLogin={handleLogin} />} />
        <Route path="/PassengerRegistration" element={<PassengerRegistration />} />
        <Route path="/CompanyProfileForm" element={<CompanyProfilePage />} />
        <Route path="/CompanyRegistration" element={<CompanyRegistration />} />
        <Route path="/logout" element={<Hello />} />
        <Route path="/Weather" element={<WeatherDashboard />} />
        <Route path="/PassengerCardList" element={<PassengerCardList />} />
        <Route path="/passenger/booking" element={<SeatSelectionPage />} />
        {/* new added paths  */}
        <Route path="/summary" element={<BookingSummary />} />

        <Route path="/book-vehical-details/:id" element={<FullVehicleDetailsPage/>} />
        <Route path="/payment" element={<PaymentPage />} />

        {/* ```````````````````````````````` */}
        <Route path="/ServiceProviderDashboard" element={<ServiceProviderDashboard />} />
        <Route path="/seat-booking" element={<SeatBookingCompanies />} />
        <Route path="/vehicle-booking" element={<VehicleBookingCompanies />} />
        <Route path="/company/:company_id/transports" element={<CompanyTransportsList />} />
        <Route path="/Seatbookingoffers" element={<SeatBookingOffers />} />
        <Route path="/AllVehiclesPage" element={<AllVehiclesPage />} />
        <Route path="/CompanyRegistrationSection" element={<CompanyRegistrationSection />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/ContactPage" element={<ContactPage />} />
        <Route path="/Passenger_profile" element={<PassengerProfile />} />

        {/* Protected (Authenticated) Routes */}
        <Route element={<ProtectedRoute isLoggedIn={isLoggedIn} />}>
          <Route path="/Company_profile" element={<CompanydetailProfile />} />
          <Route path="/PassengerDashboard" element={<PassengerDashboard />} />
          <Route path="/CompanyDashboard" element={<CompanyDashboard />} />
        </Route>

        <Route path="/book-seat" element={<SeatBookingFormWrapper />} />
        <Route path="/book-vehical/:id" element={<VehicleBookingFormWrapper />} />
        <Route path="/view-seat-offer/:id" element={<SeatBookingDetailsPage />} />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-otp" element={<VerifyOTPPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

      </Routes>

      <Footer />
    </>
  );
}

export default App;
