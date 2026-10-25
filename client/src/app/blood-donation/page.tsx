'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from '../../components/Sidebar';
import {
  HeartHandshake,
  Search,
  PlusCircle,
  PhoneCall,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
  X,
  Droplets,
  Calendar,
  UserCheck,
  User,
  Heart,
  Send,
  Building2,
} from 'lucide-react';

function BloodDonationContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'donors';

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl);

  // Sync tab whenever URL searchParams change
  useEffect(() => {
    const tab = searchParams.get('tab') || 'donors';
    setActiveTab(tab);
  }, [searchParams]);

  // Tab 1: Donors State (Screen 8)
  const [selectedGroup, setSelectedGroup] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('All');
  const [donors, setDonors] = useState<any[]>([]);
  const [isDonorsLoading, setIsDonorsLoading] = useState<boolean>(true);

  // Tab 2 & 3: Requests State
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [allOpenRequests, setAllOpenRequests] = useState<any[]>([]);
  const [isRequestsLoading, setIsRequestsLoading] = useState<boolean>(true);

  // Tab 4: Donor Profile State
  const [donorProfile, setDonorProfile] = useState<any>(null);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.name || '',
    bloodGroup: 'O+',
    city: 'Dhaka',
    area: 'Dhanmondi',
    contactNumber: '',
    contactPreference: 'call',
    isAvailable: true,
    consentGiven: true,
    notes: '',
  });
  const [savingProfile, setSavingProfile] = useState<boolean>(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string>('');

  // Request Modal State
  const [showRequestModal, setShowRequestModal] = useState<boolean>(false);
  const [targetDonor, setTargetDonor] = useState<any>(null);
  const [requestForm, setRequestForm] = useState({
    patientName: '',
    bloodGroup: 'A+',
    unitsNeeded: 1,
    hospitalName: 'Dhaka Central Hospital',
    city: 'Dhaka',
    contactNumber: '',
    requiredDate: '',
    urgency: 'urgent',
    reasonNotes: '',
  });
  const [submittingRequest, setSubmittingRequest] = useState<boolean>(false);
  const [requestSuccess, setRequestSuccess] = useState<string>('');

  // Respond Modal State (for Donating)
  const [respondingReq, setRespondingReq] = useState<any>(null);
  const [respondPhone, setRespondPhone] = useState<string>('');
  const [respondMessage, setRespondMessage] = useState<string>('I am available and willing to donate blood.');
  const [submittingResponse, setSubmittingResponse] = useState<boolean>(false);

  const bloodGroups = ['All Groups', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const locations = ['Select Location', 'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur'];

  // 1. Fetch Donors for Tab 1
  const fetchDonors = async () => {
    try {
      setIsDonorsLoading(true);
      const params = new URLSearchParams();
      if (selectedGroup !== 'All' && selectedGroup !== 'All Groups') {
        params.append('bloodGroup', selectedGroup);
      }
      if (selectedLocation !== 'All' && selectedLocation !== 'Select Location') {
        params.append('city', selectedLocation);
      }
      if (availabilityFilter === 'Available') {
        params.append('isAvailable', 'true');
      }

      const res = await api.get(`/blood/donors?${params.toString()}`);
      if (res.success && res.data && res.data.length > 0) {
        setDonors(res.data);
      } else {
        // Fallback realistic demonstration data matching Screen 8
        setDonors([
          { _id: 'd-1', fullName: 'Samiul Islam', email: 'samiul@example.com', bloodGroup: 'A+', city: 'Dhaka', isAvailable: true, contactNumber: '+880 1711 223344' },
          { _id: 'd-2', fullName: 'Nusrat Jahan', email: 'nusrat@example.com', bloodGroup: 'O+', city: 'Chittagong', isAvailable: true, contactNumber: '+880 1812 334455' },
          { _id: 'd-3', fullName: 'Md. Rahman', email: 'rahman@example.com', bloodGroup: 'B+', city: 'Sylhet', isAvailable: false, contactNumber: '+880 1913 445566' },
          { _id: 'd-4', fullName: 'Tania Akter', email: 'tania@example.com', bloodGroup: 'AB+', city: 'Rajshahi', isAvailable: true, contactNumber: '+880 1614 556677' },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch donors:', err);
    } finally {
      setIsDonorsLoading(false);
    }
  };

  // 2. Fetch Requests for Tab 2 & 3
  const fetchRequests = async () => {
    try {
      setIsRequestsLoading(true);
      const [allRes, myRes] = await Promise.all([
        api.get('/blood/requests?status=open'),
        user ? api.get('/blood/requests/my') : Promise.resolve({ success: false, data: [] }),
      ]);

      if (allRes.success && allRes.data) {
        setAllOpenRequests(allRes.data);
      } else {
        setAllOpenRequests([
          {
            _id: 'br-1',
            patientName: 'Ayesha Begum',
            bloodGroup: 'B+',
            unitsNeeded: 2,
            hospitalName: 'Dhaka Medical College Hospital',
            city: 'Dhaka',
            contactNumber: '+880 1712 334455',
            requiredDate: '2025-04-26',
            urgency: 'critical',
            reasonNotes: 'Emergency ICU surgical procedure requiring immediate transfusion.',
            status: 'open',
          },
          {
            _id: 'br-2',
            patientName: 'Rafiqul Islam',
            bloodGroup: 'O+',
            unitsNeeded: 1,
            hospitalName: 'Chittagong Medical College',
            city: 'Chittagong',
            contactNumber: '+880 1819 445566',
            requiredDate: '2025-04-27',
            urgency: 'urgent',
            reasonNotes: 'Thalassemia regular transfusion support.',
            status: 'open',
          },
        ]);
      }

      if (myRes.success && myRes.data) {
        setMyRequests(myRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch blood requests:', err);
    } finally {
      setIsRequestsLoading(false);
    }
  };

  // 3. Fetch Donor Profile for Tab 4
  const fetchMyProfile = async () => {
    if (!user) return;
    try {
      const res = await api.get('/blood/donors/me');
      if (res.success && res.data) {
        setDonorProfile(res.data);
        setProfileForm({
          fullName: res.data.fullName || user.name || '',
          bloodGroup: res.data.bloodGroup || 'O+',
          city: res.data.city || 'Dhaka',
          area: res.data.area || 'Dhanmondi',
          contactNumber: res.data.contactNumber || '',
          contactPreference: res.data.contactPreference || 'call',
          isAvailable: res.data.isAvailable !== undefined ? res.data.isAvailable : true,
          consentGiven: res.data.consentGiven !== undefined ? res.data.consentGiven : true,
          notes: res.data.notes || '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch donor profile:', err);
    }
  };

  useEffect(() => {
    fetchDonors();
    fetchRequests();
    fetchMyProfile();
  }, [user]);

  useEffect(() => {
    fetchDonors();
  }, [selectedGroup, selectedLocation, availabilityFilter]);

  const handleOpenRequest = (donor: any) => {
    setTargetDonor(donor);
    setRequestForm((prev) => ({
      ...prev,
      bloodGroup: donor.bloodGroup || 'A+',
      city: donor.city || 'Dhaka',
    }));
    setShowRequestModal(true);
  };

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to send emergency blood requests.');
      return;
    }

    try {
      setSubmittingRequest(true);
      const res = await api.post('/blood/requests', requestForm);
      if (res.success) {
        setRequestSuccess('Emergency blood request dispatched successfully! Donors have been notified.');
        fetchRequests();
        setTimeout(() => {
          setShowRequestModal(false);
          setRequestSuccess('');
        }, 1500);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please sign in to update your voluntary donor profile.');
      return;
    }

    try {
      setSavingProfile(true);
      setProfileSuccessMsg('');
      const res = await api.post('/blood/donors', profileForm);
      if (res.success) {
        setDonorProfile(res.data);
        setProfileSuccessMsg('Voluntary donor profile and availability status saved successfully!');
        fetchDonors();
        setTimeout(() => setProfileSuccessMsg(''), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleRespondToRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingReq) return;

    try {
      setSubmittingResponse(true);
      const res = await api.post(`/blood/requests/${respondingReq._id}/respond`, {
        donorPhone: respondPhone || profileForm.contactNumber || '+880 1711 000000',
        message: respondMessage,
      });

      if (res.success) {
        alert('Thank you! Your voluntary donation response has been shared with the patient family.');
        setRespondingReq(null);
        fetchRequests();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit donation response');
    } finally {
      setSubmittingResponse(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar type="blood" />

      <main className="flex-1 p-6 sm:p-8 space-y-6 max-w-6xl">
        {/* ============================================================ */}
        {/* TAB 1: FIND DONORS (Screen 8 from template)                   */}
        {/* ============================================================ */}
        {(activeTab === 'donors' || activeTab === 'all' || !activeTab) && (
          <div className="space-y-6">
            {/* Header Filter Card matching template Screen 8 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900">Find Blood Donors</h1>
                  <p className="text-xs text-slate-500">24/7 Voluntary lifesaving blood network across Bangladesh</p>
                </div>
                <button
                  onClick={() => {
                    setTargetDonor(null);
                    setShowRequestModal(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Post Emergency Request</span>
                </button>
              </div>

              {/* Form Bar: Blood Group, Location, Availability, Search */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Blood Group</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium"
                  >
                    {bloodGroups.map((bg) => (
                      <option key={bg} value={bg === 'All Groups' ? 'All' : bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc === 'Select Location' ? 'All' : loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Availability</label>
                  <select
                    value={availabilityFilter}
                    onChange={(e) => setAvailabilityFilter(e.target.value)}
                    className="w-full py-2 px-3 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-medium"
                  >
                    <option value="All">Any</option>
                    <option value="Available">Available</option>
                    <option value="Not Available">Not Available</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={fetchDonors}
                    className="w-full py-2 px-4 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Donors Table matching template Screen 8 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 px-3">Donor</th>
                      <th className="py-2.5 px-3">Blood Group</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Availability</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isDonorsLoading ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                          Searching voluntary donor database...
                        </td>
                      </tr>
                    ) : donors.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">
                          No matching donors found. Try resetting the location or blood group filter.
                        </td>
                      </tr>
                    ) : (
                      donors.map((donor) => (
                        <tr key={donor._id || donor.email} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                                {donor.fullName?.charAt(0) || 'D'}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block leading-tight">
                                  {donor.fullName}
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium">
                                  {donor.email || donor.contactNumber || 'donor@medistock.health'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              {donor.bloodGroup}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 font-medium text-slate-700">
                            {donor.city}
                          </td>

                          <td className="py-3.5 px-3">
                            {donor.isAvailable !== false ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                Available
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
                                Not Available
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-3 text-right">
                            <button
                              onClick={() => handleOpenRequest(donor)}
                              className="px-3.5 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-2xs transition-all"
                            >
                              Request
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: MY REQUESTS                                           */}
        {/* ============================================================ */}
        {activeTab === 'my-requests' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-900">My Emergency Blood Requests</h1>
                <p className="text-xs text-slate-500">Track real-time donor outreach and transfusion responses</p>
              </div>
              <button
                onClick={() => {
                  setTargetDonor(null);
                  setShowRequestModal(true);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post New Request</span>
              </button>
            </div>

            {/* List of Requests */}
            <div className="space-y-4">
              {(myRequests.length > 0 ? myRequests : allOpenRequests).map((req: any) => (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black text-sm">
                        {req.bloodGroup}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{req.patientName}</h3>
                        <p className="text-xs text-slate-500">
                          {req.hospitalName} • {req.city}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          req.urgency === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : req.urgency === 'urgent'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {req.urgency}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                        {req.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Units Needed</span>
                      <span className="font-bold text-slate-800">{req.unitsNeeded} Bag(s)</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Required Date</span>
                      <span className="font-bold text-slate-800">{req.requiredDate || 'Immediate'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Contact Hotline</span>
                      <span className="font-bold text-slate-800">{req.contactNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Responses</span>
                      <span className="font-bold text-teal-700">
                        {req.responses?.length || 0} Donor(s) Available
                      </span>
                    </div>
                  </div>

                  {req.reasonNotes && (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                      <span className="font-semibold text-slate-800">Clinical Reason: </span>
                      {req.reasonNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: DONATIONS (Active Emergency Requests Seeking Donors)    */}
        {/* ============================================================ */}
        {activeTab === 'donations' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
              <h1 className="text-base sm:text-lg font-bold text-slate-900">Emergency Donation Drives & Needs</h1>
              <p className="text-xs text-slate-500">Patients in critical medical need waiting for matching volunteer donors</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allOpenRequests.map((req: any) => (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center font-black text-sm">
                          {req.bloodGroup}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">{req.patientName}</h3>
                          <p className="text-[11px] text-slate-500">{req.hospitalName}</p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          req.urgency === 'critical'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.urgency}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{req.city} • Units: {req.unitsNeeded}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Required by: {req.requiredDate || 'Immediate'}</span>
                      </div>
                      {req.reasonNotes && (
                        <p className="text-[11px] text-slate-500 italic pt-1">{req.reasonNotes}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setRespondingReq(req);
                      setRespondPhone(profileForm.contactNumber || '');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <HeartHandshake className="w-4 h-4" />
                    <span>I Can Donate (Volunteer)</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: PROFILE (Donor Profile & Availability Settings)         */}
        {/* ============================================================ */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-3xl">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-1">
              <h1 className="text-base sm:text-lg font-bold text-slate-900">Voluntary Donor Profile & Availability</h1>
              <p className="text-xs text-slate-500">
                Register or update your voluntary donor status to help save lives in medical emergencies.
              </p>
            </div>

            {profileSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    placeholder="e.g. Samiul Islam"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Blood Group *</label>
                  <select
                    value={profileForm.bloodGroup}
                    onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-teal-600 font-bold text-teal-800"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City *</label>
                  <select
                    value={profileForm.city}
                    onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    {locations.filter((l) => l !== 'Select Location').map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Area / Thana *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.area}
                    onChange={(e) => setProfileForm({ ...profileForm, area: e.target.value })}
                    placeholder="e.g. Dhanmondi, Mirpur"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Emergency Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={profileForm.contactNumber}
                    onChange={(e) => setProfileForm({ ...profileForm, contactNumber: e.target.value })}
                    placeholder="e.g. +880 1711 223344"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Contact Mode</label>
                  <select
                    value={profileForm.contactPreference}
                    onChange={(e) => setProfileForm({ ...profileForm, contactPreference: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-teal-600"
                  >
                    <option value="call">Direct Phone Call</option>
                    <option value="whatsapp">WhatsApp Message</option>
                    <option value="sms">SMS Text</option>
                  </select>
                </div>
              </div>

              {/* Availability Toggle */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Available to Donate Blood</span>
                  <span className="text-[11px] text-slate-500">
                    Switch on when healthy and eligible to donate in medical emergencies
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileForm.isAvailable}
                    onChange={(e) => setProfileForm({ ...profileForm, isAvailable: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-700" />
                </label>
              </div>

              {/* Consent checkbox */}
              <div className="flex items-start gap-2 pt-2 text-xs text-slate-600">
                <input
                  type="checkbox"
                  id="donorConsent"
                  checked={profileForm.consentGiven}
                  onChange={(e) => setProfileForm({ ...profileForm, consentGiven: e.target.checked })}
                  className="mt-0.5 rounded text-teal-600"
                />
                <label htmlFor="donorConsent">
                  I give voluntary consent to display my blood group and contact details to verified hospitals and emergency patients on MediStock.
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-6 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-sm transition-all"
                >
                  {savingProfile ? 'Saving Profile...' : 'Save Donor Profile'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL: POST EMERGENCY BLOOD REQUEST                          */}
        {/* ============================================================ */}
        {showRequestModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {targetDonor ? `Request Blood from ${targetDonor.fullName}` : 'Post Emergency Blood Request'}
                    </h3>
                    <p className="text-[11px] text-slate-500">Fast dispatch to voluntary donor network</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {requestSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{requestSuccess}</span>
                </div>
              )}

              <form onSubmit={handleSendRequest} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Patient Name *</label>
                    <input
                      type="text"
                      required
                      value={requestForm.patientName}
                      onChange={(e) => setRequestForm({ ...requestForm, patientName: e.target.value })}
                      placeholder="e.g. Kamal Hossain"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Blood Group *</label>
                    <select
                      value={requestForm.bloodGroup}
                      onChange={(e) => setRequestForm({ ...requestForm, bloodGroup: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Hospital Name *</label>
                    <input
                      type="text"
                      required
                      value={requestForm.hospitalName}
                      onChange={(e) => setRequestForm({ ...requestForm, hospitalName: e.target.value })}
                      placeholder="e.g. Dhaka Medical College"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Phone *</label>
                    <input
                      type="text"
                      required
                      value={requestForm.contactNumber}
                      onChange={(e) => setRequestForm({ ...requestForm, contactNumber: e.target.value })}
                      placeholder="e.g. +880 1712 345678"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Units Needed</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={requestForm.unitsNeeded}
                      onChange={(e) => setRequestForm({ ...requestForm, unitsNeeded: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">City</label>
                    <select
                      value={requestForm.city}
                      onChange={(e) => setRequestForm({ ...requestForm, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    >
                      {locations.filter((l) => l !== 'Select Location').map((l) => (
                        <option key={l} value={l}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRequest}
                    className="px-5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-sm"
                  >
                    {submittingRequest ? 'Sending...' : 'Send Emergency Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODAL: RESPOND TO VOLUNTARY DONATION REQUEST                 */}
        {/* ============================================================ */}
        {respondingReq && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                    <HeartHandshake className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Volunteer to Donate Blood</h3>
                    <p className="text-[11px] text-slate-500">For Patient: {respondingReq.patientName}</p>
                  </div>
                </div>
                <button onClick={() => setRespondingReq(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRespondToRequest} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={respondPhone}
                    onChange={(e) => setRespondPhone(e.target.value)}
                    placeholder="+880 1711 223344"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Message to Patient / Family</label>
                  <textarea
                    rows={2}
                    value={respondMessage}
                    onChange={(e) => setRespondMessage(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setRespondingReq(null)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingResponse}
                    className="px-5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-bold shadow-sm"
                  >
                    {submittingResponse ? 'Submitting...' : 'Confirm Willingness to Donate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function BloodDonationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4rem)]">
          <Sidebar type="blood" />
          <div className="flex-1 p-12 text-center text-xs text-slate-400">Loading donor network...</div>
        </div>
      }
    >
      <BloodDonationContent />
    </Suspense>
  );
}
