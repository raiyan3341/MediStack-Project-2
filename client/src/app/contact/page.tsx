'use client';

import React, { useState } from 'react';
import { Mail, PhoneCall, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
          Support & Inquiries
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Contact MediStock Healthcare Team
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Have questions regarding hospital verification, bulk procurement, or blood donation? Our team is available 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-slate-900">Get in Touch</h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <PhoneCall className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Hospital Procurement Hotline</p>
                <p className="text-slate-500">+880 (2) 988-1234 / +880 1711-000000</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Official Correspondence</p>
                <p className="text-slate-500">support@medistock.health</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Central Logistics Facility</p>
                <p className="text-slate-500">Tejgaon Industrial Area, Dhaka 1208, Bangladesh</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xs">
          {submitted ? (
            <div className="p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Message Received</h3>
              <p className="text-xs text-slate-500">
                Thank you for contacting MediStock. A healthcare coordinator will respond to your registered email shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hospital bulk procurement or Trade license verification"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="How can our clinical support team assist you?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" /> Submit Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

