import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ScanLine } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="bg-blue-900 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">

        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 text-white">
          <img src="/logo.jpg" alt="DRQR Logo" className="w-9 h-9 rounded-xl object-cover bg-white" />
          <span className="text-lg font-bold">
            DRQR
          </span>
        </Link>

        {/* DESKTOP LINKS */}
        <ul className="hidden md:flex items-center gap-8 font-medium text-white">
          {navLinks.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `transition hover:text-blue-200 ${isActive ? "text-blue-200 font-semibold" : ""
                  }`
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* DESKTOP ACTIONS */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg border border-white text-white hover:bg-white hover:text-blue-900 transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="px-4 py-2 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-600 transition"
          >
            Register
          </Link>
          <Link
            to="/scan"
            className="flex items-center gap-2 bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-100 transition"
          >
            <ScanLine size={18} />
            Scan QR
          </Link>
        </div>

        {/* MOBILE TOGGLE */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-3xl text-white"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-blue-950 text-white px-6 py-6 space-y-4">

          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setOpen(false)}
              className="block font-medium hover:text-blue-200"
            >
              {link.name}
            </NavLink>
          ))}

          <div className="pt-4 border-t border-blue-800 space-y-3">

            <Link
              to="/scan"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 bg-white text-blue-900 py-2 rounded-lg font-semibold"
            >
              <ScanLine size={18} />
              Scan QR
            </Link>
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block text-center border border-white py-2 rounded-lg hover:bg-white hover:text-blue-900 transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              onClick={() => setOpen(false)}
              className="block text-center bg-blue-700 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
