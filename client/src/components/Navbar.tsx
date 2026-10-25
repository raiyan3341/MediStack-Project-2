'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Search,
  ShoppingCart,
  Bell,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Building2,
  Shield,
  Activity,
  Layers,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, organization, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Blood Donation', href: '/blood-donation' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearch.trim()) {
      router.push(`/products?search=${encodeURIComponent(navSearch.trim())}`);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'owner') return '/owner/dashboard';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'organization') return '/organization/dashboard';
    return '/user/dashboard';
  };

  const isApprovedOrg =
    (user?.role === 'organization' && organization?.verificationStatus === 'approved') ||
    user?.role === 'admin' ||
    user?.role === 'owner';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-xs group-hover:bg-teal-700 transition-colors">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Medi<span className="text-teal-700">Stock</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-xs lg:text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'text-teal-700 font-bold bg-teal-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar matching template */}
          <form onSubmit={handleSearchSubmit} className="hidden sm:flex items-center relative flex-1 max-w-xs lg:max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search for medicines, masks, or more..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-1 focus:ring-teal-500 focus:bg-white text-slate-800 placeholder-slate-400 transition-all"
            />
          </form>

          {/* Right Action Icons & Login / Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Restock Shopping Cart */}
            {isApprovedOrg && (
              <Link
                href="/organization/cart"
                className="relative p-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                title="Restock Cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 bg-teal-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notification Bell when logged in */}
            {user && (
              <Link
                href={getDashboardLink()}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-colors relative"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-slate-500" />
                <span className="w-2 h-2 rounded-full bg-teal-500 absolute top-2 right-2 ring-1 ring-white" />
              </Link>
            )}

            {/* Login Button or User Profile Avatar */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border border-slate-200 hover:border-slate-300 bg-white transition-all"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="hidden lg:block text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="mt-1 inline-block text-[10px] uppercase font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-teal-700 font-medium"
                      >
                        <UserIcon className="w-4 h-4" />
                        Dashboard
                      </Link>

                      {user.role === 'organization' && (
                        <Link
                          href="/organization/orders"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          My Orders
                        </Link>
                      )}

                      {user.role === 'user' && (
                        <Link
                          href="/organizations/register"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-teal-700 hover:bg-teal-50 font-semibold"
                        >
                          <Building2 className="w-4 h-4" />
                          Register Facility
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={async () => {
                          setProfileDropdownOpen(false);
                          await logout();
                          router.push('/login');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-bold rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-xs"
              >
                Login
              </Link>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Search medicines, masks..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
            />
          </form>
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-xs font-medium rounded-lg ${
                  pathname === link.href ? 'text-teal-700 bg-teal-50 font-bold' : 'text-slate-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
