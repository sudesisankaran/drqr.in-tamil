import { Route, Routes } from 'react-router-dom';
import Login from './components/auth/login';
import Register from './components/auth/register';
import ContactSection from './components/ContactSection';
import { PageNotFound } from './components/Dashboard';
import Layout from './components/Dashboard/Layout';
import Footer from './components/footer';
import Home from './components/home';
import About from './components/home/about';
import SmartFeatures from './components/home/SmartFeatures';
import Navbar from './components/Navbar';
import ScanPage from './components/sacn';
import { AccessibleProfile, PatientReport, Profile } from './components/user-pages';
import AddVisitRecord from './components/user-pages/AddVisitRecord';
import AddTreatmentRecord from './components/user-pages/AddTreatmentRecord';
import { useAuth } from './providers/AuthContext';
import { AdminUser } from './components/Admin';
import { Appointments, BookAppointments, Messages, Settings } from './components/common';
import { DoctorPatient } from './components/doctors-pages';
import EmergencyPatientPage from './components/EmergencyPatientPage';
import _env from './utils/_env';

function App() {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  if (isLoggedIn) {
    return (
      <Layout>
        <Routes>
          <Route path="/" element={<Profile />} />
          <Route path="/:role/dashboard" element={<Profile />} />
          <Route path="/:role/profile" element={<Profile />} />
          <Route path="/:role/profiles/:userId" element={<AccessibleProfile />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/:role/settings" element={<Settings />} />
          <Route path="/:role/appointments" element={<Appointments />} />
          <Route path='/:role/appointments/book' element={<BookAppointments />} />
          <Route path="/:role/reports" element={<PatientReport />} />
          <Route path="/:role/add-visit" element={<AddVisitRecord />} />
          <Route path="/:role/add-treatment" element={<AddTreatmentRecord />} />
          <Route path='/:role/messages' element={<Messages/>} />
          <Route path="/emergency/:qrCodeId" element={<EmergencyPatientPage />} />

          <Route path='/admin/doctors' element={<AdminUser type="doctor" />} />
          <Route path='/admin/patients' element={<AdminUser type="patient" />} />
          {/* doctors */}
          <Route path="/doctor/patients" element={<DoctorPatient />} />
          {/* patients */}

          {/* TODO: check patient and doctor pannel then by role   */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Layout>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<SmartFeatures />} />
        <Route path="/contact" element={<ContactSection />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/emergency/:qrCodeId" element={<EmergencyPatientPage />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
