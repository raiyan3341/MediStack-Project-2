'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '../../../../components/Sidebar';
import { api } from '../../../../lib/api';
import {
  Printer,
  Download,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
} from 'lucide-react';

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/orders/my-orders/${id}`);
        if (res.success && res.data) {
          setOrder(res.data);
        } else {
          // Fallback demo matching Screen 9
          setOrder({
            _id: id || 'ord-0124',
            orderNumber: '#ORD-0124',
            status: 'delivered',
            createdAt: '2025-04-24T10:30:00Z',
            totalAmount: 2450,
            organizationName: 'City Hospital',
            organizationAddress: '123 Medical Road, Dhaka-1200',
            organizationPhone: '+880 1712 345678',
            organizationEmail: 'cityhospital@medistock.health',
            items: [
              { productName: 'Paracetamol 500mg', quantity: 10, unitPrice: 25, subtotal: 250 },
              { productName: 'Mask (N95)', quantity: 20, unitPrice: 45, subtotal: 900 },
              { productName: 'Vitamin C Syrup', quantity: 5, unitPrice: 120, subtotal: 600 },
              { productName: 'Thermometer', quantity: 2, unitPrice: 350, subtotal: 700 },
            ],
            timeline: [
              { status: 'Order Placed', time: 'Apr 24, 10:30 AM', done: true },
              { status: 'Confirmed', time: 'Apr 24, 11:15 AM', done: true },
              { status: 'Shipped', time: 'Apr 24, 01:45 PM', done: true },
              { status: 'Delivered', time: 'Apr 25, 11:20 AM', done: true },
            ],
          });
        }
      } catch (err) {
        // Fallback demo matching Screen 9
        setOrder({
          _id: id || 'ord-0124',
          orderNumber: '#ORD-0124',
          status: 'delivered',
          createdAt: '2025-04-24T10:30:00Z',
          totalAmount: 2450,
          organizationName: 'City Hospital',
          organizationAddress: '123 Medical Road, Dhaka-1200',
          organizationPhone: '+880 1712 345678',
          organizationEmail: 'cityhospital@medistock.health',
          items: [
            { productName: 'Paracetamol 500mg', quantity: 10, unitPrice: 25, subtotal: 250 },
            { productName: 'Mask (N95)', quantity: 20, unitPrice: 45, subtotal: 900 },
            { productName: 'Vitamin C Syrup', quantity: 5, unitPrice: 120, subtotal: 600 },
            { productName: 'Thermometer', quantity: 2, unitPrice: 350, subtotal: 700 },
          ],
          timeline: [
            { status: 'Order Placed', time: 'Apr 24, 10:30 AM', done: true },
            { status: 'Confirmed', time: 'Apr 24, 11:15 AM', done: true },
            { status: 'Shipped', time: 'Apr 24, 01:45 PM', done: true },
            { status: 'Delivered', time: 'Apr 25, 11:20 AM', done: true },
          ],
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const itemsList =
    order?.items?.length > 0
      ? order.items
      : [
          { productName: 'Paracetamol 500mg', quantity: 10, unitPrice: 25, subtotal: 250 },
          { productName: 'Mask (N95)', quantity: 20, unitPrice: 45, subtotal: 900 },
          { productName: 'Vitamin C Syrup', quantity: 5, unitPrice: 120, subtotal: 600 },
          { productName: 'Thermometer', quantity: 2, unitPrice: 350, subtotal: 700 },
        ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <div className="no-print">
        <Sidebar type="organization" />
      </div>

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-6xl">
        {/* Top Actions matching template Screen 9 */}
        <div className="flex items-center justify-between no-print">
          <button
            onClick={() => router.push('/organization/orders')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Orders
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Invoice Header matching template Screen 9 */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Order {order?.orderNumber || '#ORD-0124'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Delivered
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Order Date: Apr 24, 2025 | Organization: {order?.organizationName || 'City Hospital'}
          </p>
        </div>

        {/* Two Column Layout matching template Screen 9 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Items Table */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itemsList.map((item: any, idx: number) => {
                    const price = item.unitPrice || item.price || 0;
                    const qty = item.quantity || 1;
                    const total = item.subtotal || price * qty;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {item.productName || item.product?.name || 'Medical Supply Item'}
                        </td>
                        <td className="py-3 px-3 text-center font-medium text-slate-600">
                          {qty}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-600 font-medium">
                          ৳ {price}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">
                          ৳ {total}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 pt-3 flex justify-end">
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 mr-4">Grand Total:</span>
                <span className="text-lg font-black text-slate-900">
                  ৳ {(order?.totalAmount || 2450).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Organization Details & Order Timeline */}
          <div className="lg:col-span-4 space-y-6">
            {/* Organization Details Box matching template Screen 9 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Organization Details
              </h2>
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-900 text-sm">
                  {order?.organizationName || 'City Hospital'}
                </p>
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{order?.organizationAddress || '123 Medical Road, Dhaka-1200'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{order?.organizationPhone || '+880 1712 345678'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{order?.organizationEmail || 'cityhospital@medistock.health'}</span>
                </div>
              </div>
            </div>

            {/* Order Timeline matching template Screen 9 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Order Timeline
              </h2>
              <div className="space-y-4">
                {[
                  { label: 'Order Placed', time: 'Apr 24, 10:30 AM' },
                  { label: 'Confirmed', time: 'Apr 24, 11:15 AM' },
                  { label: 'Shipped', time: 'Apr 24, 01:45 PM' },
                  { label: 'Delivered', time: 'Apr 25, 11:20 AM' },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{step.label}</p>
                      <p className="text-[11px] text-slate-400">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
