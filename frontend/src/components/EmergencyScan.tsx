import { ScanLine, ShieldAlert } from "lucide-react";
import Scroll from "./page-binder/Scroll";

const EmergencyScan = () => {
  return (
    <Scroll>
      <section className="py-24 bg-blue-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="text-red-400" size={28} />
              <span className="font-semibold tracking-wide text-red-300">
                EMERGENCY ACCESS
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold leading-snug">
              Scan QR Code to Access <br />
              Critical Patient Information
            </h2>

            <p className="mt-5 text-blue-200 max-w-xl">
              In medical emergencies, doctors or healthcare staff can scan
              the patient’s DRQR QR code to instantly view essential
              health details such as blood group, allergies, chronic diseases,
              and emergency contacts — without login delay.
            </p>

            <div className="mt-6 space-y-3 text-sm text-blue-100">
              <p>✅ Blood Group & Allergies</p>
              <p>✅ Chronic Diseases</p>
              <p>✅ Emergency Contact Details</p>
              <p>✅ Read-Only Secure Access</p>
            </div>
          </div>

          <div className="flex justify-center">

            <div className="relative bg-white text-blue-900 w-72 h-72 rounded-2xl shadow-2xl flex flex-col items-center justify-center">

              <ScanLine size={70} className="mb-4 text-blue-900 animate-pulse" />

              <p className="font-semibold">
                Scan Patient QR Code
              </p>

              <p className="text-sm text-gray-600 mt-1 text-center px-6">
                Use DRQR Scanner in emergency situations
              </p>

              {/* Fake scanning line */}
              <div className="absolute top-6 left-4 right-4 h-0.5 bg-blue-500 animate-ping"></div>
            </div>

          </div>

        </div>
      </section>
    </Scroll>
  );
};

export default EmergencyScan;
