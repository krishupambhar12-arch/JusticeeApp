// import logo from './logo.svg';
import "./App.css";
import Home from "./pages/home";
import Login from "./pages/Login";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from "./pages/Register";
import AttorneyDetailsForm from "./pages/AttorneyDetailsForm";
import AttorneyDashboard from "./pages/AttorneyDashboard";
import AttorneyProfile from "./pages/DoctorProfile";
import AttorneyAppointments from "./pages/AttorneyAppointments";
import ClientDashboard from "./pages/ClientDashboard";
import ClientProfile from "./pages/ClientProfile";
import ClientAppointments from "./pages/ClientAppointments";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AttorneyListing from "./pages/AttorneyListing";
import BookAppointment from "./pages/BookAppointment";
import PublicAttorneyProfile from "./pages/PublicAttorneyProfile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAppointments from "./pages/AdminAppointments";
import AdminPatients from "./pages/AdminPatients";
import AdminDoctors from "./pages/AdminDoctors";
import AdminFeedback from "./pages/AdminFeedback";
import AdminLabTests from "./pages/AdminLabTests";
import AdminLabTestBookings from "./pages/AdminLabTestBookings";
import ClientConsultation from "./pages/ClientConsultation";
import AttorneyConsultation from "./pages/AttorneyConsultation";
import AIAdvisor from "./pages/AIAdvisor";
import AdminConsultations from "./pages/AdminConsultations";
import ClientFeedback from "./pages/ClientFeedback";
import ForgotPassword from "./pages/ForgotPassword";
import LabTestListing from "./pages/LabTestListing";
import BookLabTest from "./pages/BookLabTest";
import ClientLabTests from "./pages/ClientLabTests";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/attorney/details" element={<AttorneyDetailsForm />} />
        <Route path="/attorney/dashboard" element={<AttorneyDashboard />} />
        <Route path="/attorney/profile" element={<AttorneyProfile />} />
        <Route path="/attorney/appointments" element={<AttorneyAppointments />} />
        <Route path="/attorney/consultation" element={<AttorneyConsultation />} />
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        <Route path="/client/profile" element={<ClientProfile />} />
        <Route path="/client/appointments" element={<ClientAppointments/>} />
        <Route path="/client/feedback" element={<ClientFeedback/>} />
        <Route path="/client/lab-tests" element={<ClientLabTests/>} />
        <Route path="/client/consultation" element={<ClientConsultation/>} />
        <Route path="/lab-tests" element={<LabTestListing/>} />
        <Route path="/book-lab-test/:testId" element={<BookLabTest/>} />
        <Route path="/about" element={<About/>} />
        <Route path="/contact" element={<Contact/>} />
        <Route path="/attorneys" element={<AttorneyListing/>} />
        <Route path="/book-appointment/:attorneyId" element={<BookAppointment/>} />
        <Route path="/attorney-profile/:attorneyId" element={<PublicAttorneyProfile/>} />
        <Route path="/admin/dashboard" element={<AdminDashboard/>} />
        <Route path="/admin/appointments" element={<AdminAppointments/>} />
        <Route path="/admin/users" element={<AdminPatients/>} />
        <Route path="/admin/doctors" element={<AdminDoctors/>} />
        <Route path="/admin/feedback" element={<AdminFeedback/>} />
        <Route path="/admin/lab-tests" element={<AdminLabTests/>} />
        <Route path="/admin/lab-test-bookings" element={<AdminLabTestBookings/>} />
        <Route path="/admin/consultations" element={<AdminConsultations/>} />
        <Route path="/ai-advisor" element={<AIAdvisor/>} />

      </Routes>
    </Router>
  );
}

export default App;
