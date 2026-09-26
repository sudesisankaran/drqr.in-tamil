import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-blue-900 text-gray-200 pt-16">

      {/* TOP FOOTER */}
      <div className="max-w-7xl mx-auto px-6 grid sm:grid-cols-2 md:grid-cols-4 gap-10">

        {/* BRAND */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">
            DRQR
          </h2>

          <p className="text-gray-300 text-sm leading-relaxed">
            DRQR is a secure digital healthcare platform
            that helps patients and doctors manage medical records,
            appointments, and emergency health access efficiently.
          </p>

          {/* Social Icons */}
          <div className="flex gap-4 mt-6">
            <a href="#" className="hover:text-white transition">
              <Facebook size={20} />
            </a>
            <a href="#" className="hover:text-white transition">
              <Twitter size={20} />
            </a>
            <a href="#" className="hover:text-white transition">
              <Linkedin size={20} />
            </a>
            <a href="#" className="hover:text-white transition">
              <Instagram size={20} />
            </a>
          </div>

          <p className="mt-5 text-sm text-gray-400">
            © {new Date().getFullYear()} DRQR <br />
            All rights reserved.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Quick Links
          </h3>

          <ul className="space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Home</li>
            <li className="hover:text-white cursor-pointer">About Us</li>
            <li className="hover:text-white cursor-pointer">Services</li>
            <li className="hover:text-white cursor-pointer">Doctors</li>
            <li className="hover:text-white cursor-pointer">Contact</li>
          </ul>
        </div>

        {/* SERVICES */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Our Services
          </h3>

          <ul className="space-y-2 text-sm text-gray-300">
            <li>Medical Record Management</li>
            <li>Doctor Appointment Booking</li>
            <li>Emergency Health Access</li>
            <li>Online Consultation</li>
            <li>Health History Tracking</li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">
            Contact Info
          </h3>

          <ul className="space-y-4 text-sm text-gray-300">

            <li className="flex items-center gap-3">
              <MapPin size={18} className="text-blue-200" />
              Lucknow, Uttar Pradesh, India
            </li>

            <li className="flex items-center gap-3">
              <Phone size={18} className="text-blue-200" />
              +91 98765 43210
            </li>

            <li className="flex items-center gap-3">
              <Mail size={18} className="text-blue-200" />
              smarthealthportal@gmail.com
            </li>

            <li className="flex items-center gap-3">
              <Clock size={18} className="text-blue-200" />
              24×7 Emergency Support
            </li>

          </ul>
        </div>

      </div>

      <div className="border-t border-blue-800 mt-12"></div>
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
        <div className="text-center md:text-left space-y-1">
          <p>
            Designed & Developed by
            <span className="text-white font-semibold">
              {" "}
              Prashant Srivastav
            </span>
          </p>
          <p className="text-gray-300 text-sm">
            MCA Student,{" "}
            <span className="text-white font-medium">
              Babu Banarasi Das University (BBDU), Lucknow
            </span>
          </p>
        </div>

        <div className="flex gap-4 mt-4 md:mt-0">
          <span className="hover:text-white cursor-pointer">
            Privacy Policy
          </span>
          <span className="hover:text-white cursor-pointer">
            Terms
          </span>
          <span className="hover:text-white cursor-pointer">
            Support
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
