import { ArrowRight, CalendarCheck, QrCode, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const highlights = [
  {
    icon: <ShieldCheck size={18} />,
    label: "Secure Records",
  },
  {
    icon: <CalendarCheck size={18} />,
    label: "Easy Appointments",
  },
  {
    icon: <QrCode size={18} />,
    label: "Emergency QR",
  },
];

const stats = [
  { value: "200K+", label: "Patients Registered" },
  { value: "180+", label: "Verified Doctors" },
  { value: "24x7", label: "Emergency Access" },
];

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-slate-50">
      <img
        src="/doctors-3.png"
        alt="Doctors using DRQR"
        className="absolute inset-0 h-full w-full object-cover object-bottom-center"
      />

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(248,250,252,0.98)_0%,rgba(248,250,252,0.93)_42%,rgba(248,250,252,0.62)_70%,rgba(248,250,252,0.18)_100%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-7xl items-center px-5 py-14 sm:py-16 lg:py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-2 text-sm font-semibold text-blue-900 shadow-sm">
            <ShieldCheck size={16} />
            Secure patient and doctor medical record management
          </div>

          <h1 className="mt-6 text-4xl font-bold leading-tight text-gray-950 sm:text-5xl lg:text-6xl">
            DRQR
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-gray-700 sm:text-lg">
            Manage medical records, appointments, reports, emergency access, and doctor communication from one clean digital healthcare workspace.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-950"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/scan"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-900 bg-white/85 px-6 py-3 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
            >
              <QrCode size={18} />
              Scan Emergency QR
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {highlights.map((item) => (
              <div
                key={item.label}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/75 px-3 py-2 text-sm font-medium text-gray-800 shadow-sm"
              >
                <span className="text-blue-900">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>

          <div className="mt-9 grid max-w-xl grid-cols-3 gap-3 border-t border-slate-200 pt-6">
            {stats.map((item) => (
              <div key={item.label}>
                <div className="text-2xl font-bold text-blue-900 sm:text-3xl">{item.value}</div>
                <div className="mt-1 text-xs font-medium text-gray-600 sm:text-sm">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
