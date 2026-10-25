import React from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, HeartHandshake, PhoneCall, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Medi<span className="text-teal-400">Stock</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              MediStock is a centralized healthcare supply and inventory management platform tailored for verified pharmacies, hospitals, and clinics. Facilitating streamlined medical procurement, automated batch tracking, and community blood donor support.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 text-teal-400 text-xs font-medium border border-slate-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                DGDA & DGHS Compliant Workflows
              </span>
            </div>
          </div>

          {/* Supply Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Healthcare Supply</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products" className="hover:text-teal-400 transition-colors">
                  Medical Catalog
                </Link>
              </li>
              <li>
                <Link href="/organizations/register" className="hover:text-teal-400 transition-colors">
                  Hospital Verification
                </Link>
              </li>
              <li>
                <Link href="/organizations/register" className="hover:text-teal-400 transition-colors">
                  Pharmacy Registration
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-teal-400 transition-colors">
                  Supply Restock Process
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-teal-400 transition-colors">
                  Organization Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Blood Donation System */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
              <HeartHandshake className="w-3.5 h-3.5" />
              Blood Donation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/blood-donation" className="hover:text-rose-400 transition-colors">
                  Find Blood Donors
                </Link>
              </li>
              <li>
                <Link href="/blood-donation" className="hover:text-rose-400 transition-colors">
                  Emergency Blood Requests
                </Link>
              </li>
              <li>
                <Link href="/blood-donation" className="hover:text-rose-400 transition-colors">
                  Register as a Donor
                </Link>
              </li>
              <li>
                <span className="text-[11px] text-slate-500 block pt-1">
                  24/7 Voluntary Blood Coordination
                </span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Contact & Support</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>+880 (2) 988-1234</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>support@medistock.health</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                <span>Central Medical Logistics Hub, Tejgaon Industrial Area, Dhaka</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>
            © {new Date().getFullYear()} MediStock Technologies. All rights reserved. Professional healthcare supply platform.
          </p>
          <p className="text-[11px] text-slate-500 max-w-xl text-center md:text-right">
            Medical Disclaimer: Medicines & products presented are for registered institutional procurement. Consult qualified medical practitioners for medical emergencies.
          </p>
        </div>
      </div>
    </footer>
  );
};

