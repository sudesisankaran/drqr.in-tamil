import { useState } from "react";
import type { FormEvent } from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import { notification } from "antd";
import Scroll from "./page-binder/Scroll";
import _env from "../utils/_env";

const ContactSection = () => {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const submitContact = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${_env.SERVER_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Message failed");

      notification.success({ message: "Message sent successfully" });
      setForm({ fullName: "", email: "", subject: "", message: "" });
    } catch (err) {
      notification.error({
        message: err instanceof Error ? err.message : "Message failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Scroll>
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14 text-center">
            <p className="font-semibold tracking-wide text-blue-900">
              CONTACT US
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">
              Get in Touch with DRQR
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-gray-600">
              Have questions about medical records, appointments, or emergency
              access? Our support team is available to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="flex items-start gap-4 rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Phone className="text-blue-900" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Phone Support</h4>
                  <p className="text-sm text-gray-600">
                    +91 98765 43210
                    <br />
                    24x7 Emergency Assistance
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Mail className="text-blue-900" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Email Address</h4>
                  <p className="text-sm text-gray-600">
                    support@smarthealthportal.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <MapPin className="text-blue-900" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Office Location
                  </h4>
                  <p className="text-sm text-gray-600">
                    Lucknow, Uttar Pradesh, India
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-white p-8 shadow-md">
              <h3 className="mb-6 text-xl font-semibold text-gray-900">
                Send Us a Message
              </h3>
              <form className="space-y-5" onSubmit={submitContact}>
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full rounded-md border px-4 py-3 focus:outline-blue-900"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full rounded-md border px-4 py-3 focus:outline-blue-900"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Subject"
                  className="w-full rounded-md border px-4 py-3 focus:outline-blue-900"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                />
                <textarea
                  rows={4}
                  placeholder="Your Message"
                  className="w-full rounded-md border px-4 py-3 focus:outline-blue-900"
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                />
                <button
                  className="w-full rounded-md bg-blue-900 py-3 font-semibold text-white transition hover:bg-blue-950 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </Scroll>
  );
};

export default ContactSection;
