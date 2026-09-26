import Scroll from "../page-binder/Scroll";

const About = () => {
  return (
    <Scroll>
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <p className="text-blue-900 font-semibold mb-2">
              ABOUT DRQR
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-snug">
              Digital Healthcare Designed <br />
              For Patients & Doctors
            </h2>

            <p className="text-gray-700 mt-4 max-w-xl mx-auto md:mx-0">
              DRQR is a secure digital healthcare system
              that allows patients and doctors to manage medical records,
              appointments, and emergency health information efficiently.
              Our goal is to make healthcare accessible, fast, and paperless.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 text-left">

              <div className="flex items-start gap-3">
                <span className="text-blue-900 font-bold text-lg">✔</span>
                <p>Secure Medical Record Management</p>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-blue-900 font-bold text-lg">✔</span>
                <p>Verified Doctors & Role-Based Access</p>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-blue-900 font-bold text-lg">✔</span>
                <p>Online Appointment Scheduling</p>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-blue-900 font-bold text-lg">✔</span>
                <p>Emergency Health Access System</p>
              </div>

            </div>

            <button className="mt-8 bg-blue-900 text-white px-7 py-3 rounded-md hover:bg-blue-950 transition">
              Learn More
            </button>
          </div>

          <div className="relative flex justify-center gap-6">

            <div className="w-44 sm:w-52 md:w-56 h-64 md:h-72 rounded-xl overflow-hidden shadow-md">
              <img
                src="/doctor-2.png"
                alt="Doctor"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-44 sm:w-52 md:w-56 h-64 md:h-72 rounded-xl overflow-hidden shadow-md mt-8">
              <img
                src="/doctor-3.png"
                alt="Medical Team"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="absolute bottom-0 right-2 sm:right-6 bg-blue-900 text-white px-6 py-4 rounded-xl shadow-lg">
              <h3 className="text-3xl font-bold">20+</h3>
              <p className="text-sm">Years of Medical Experience</p>
            </div>

          </div>
        </div>
      </section>
    </Scroll>
  );
};

export default About;
