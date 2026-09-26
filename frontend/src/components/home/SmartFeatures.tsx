import {
  ShieldCheck,
  UserCheck,
  Activity,
} from "lucide-react";
import Scroll from "../page-binder/Scroll";

const SmartFeatures = () => {
  return (
    <Scroll>
      <section className="py-24 bg-slate-50">

        <div className="max-w-7xl mx-auto px-6 text-center">

          <p className="text-blue-900 font-semibold tracking-wide">
            SMART FEATURES
          </p>

          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
            Why Choose DRQR?
          </h2>

          <p className="text-gray-600 max-w-2xl mx-auto mt-4">
            A secure, intelligent healthcare system designed to simplify
            medical record management, doctor access, and emergency response.
          </p>

          {/* FEATURES GRID */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* CARD 1 */}
            <div className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition border border-gray-100 relative overflow-hidden">

              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-700 to-blue-400"></div>

              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <ShieldCheck className="text-blue-900" size={28} />
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                Secure Medical Records
              </h3>

              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                All patient medical data is securely stored using
                authentication, authorization, and encrypted access control.
              </p>
            </div>

            {/* CARD 2 */}
            <div className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition border border-gray-100 relative overflow-hidden">

              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-700 to-blue-400"></div>

              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <UserCheck className="text-blue-900" size={28} />
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                Verified Doctors Access
              </h3>

              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Only admin-verified doctors can access patient records
                after patient approval, ensuring full data privacy.
              </p>
            </div>

            {/* CARD 3 */}
            <div className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition border border-gray-100 relative overflow-hidden">

              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-700 to-blue-400"></div>

              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-5 group-hover:scale-110 transition">
                <Activity className="text-blue-900" size={28} />
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                Emergency Health Access
              </h3>

              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                In emergency situations, critical health details
                can be accessed instantly using QR or Health ID.
              </p>
            </div>

          </div>

        </div>
      </section>
    </Scroll>
  );
};

export default SmartFeatures;
