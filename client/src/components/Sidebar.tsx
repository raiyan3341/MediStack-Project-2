'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Layers,
  AlertTriangle,
  ClipboardList,
  CheckCircle,
  Building2,
  FileQuestion,
  Users,
  BarChart3,
  History,
  ShoppingCart,
  PlusCircle,
  Settings,
  Bell,
  HeartHandshake,
  Shield,
  ShieldAlert,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

interface SidebarProps {
  type: 'admin' | 'owner' | 'organization' | 'user' | 'blood';
}

export const Sidebar: React.FC<SidebarProps> = ({ type }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, organization, logout } = useAuth();

  const [currentSearch, setCurrentSearch] = React.useState('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentSearch(window.location.search);
      const onLocationChange = () => setCurrentSearch(window.location.search);
      window.addEventListener('popstate', onLocationChange);
      return () => window.removeEventListener('popstate', onLocationChange);
    }
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Nav menus matching the template picture precisely
  const userLinks = [
    { label: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
    { label: 'My Orders', href: '/organization/orders', icon: ClipboardList },
    { label: 'Blood Donation', href: '/blood-donation', icon: HeartHandshake },
    { label: 'Notifications', href: '/user/dashboard#notifications', icon: Bell },
    { label: 'Profile', href: '/user/dashboard#profile', icon: UserIcon },
    { label: 'Settings', href: '/user/dashboard#settings', icon: Settings },
  ];

  const organizationLinks = [
    { label: 'Dashboard', href: '/organization/dashboard', icon: LayoutDashboard },
    { label: 'Orders', href: '/organization/orders', icon: ClipboardList },
    { label: 'Products', href: '/organization/catalog', icon: Package },
    { label: 'Inventory', href: '/organization/cart', icon: ShoppingCart },
    { label: 'Profile', href: '/organization/profile', icon: Building2 },
    { label: 'Notifications', href: '/organization/dashboard#notifications', icon: Bell },
  ];

  const adminLinks = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Orders', href: '/admin/orders', icon: ClipboardList },
    { label: 'Organizations', href: '/admin/organizations', icon: Building2 },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Demand Requests', href: '/admin/requests', icon: FileQuestion },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { label: 'Notifications', href: '/admin/logs', icon: Bell },
  ];

  const ownerLinks = [
    { label: 'Dashboard', href: '/owner/dashboard', icon: LayoutDashboard },
    { label: 'Users', href: '/owner/users', icon: Users },
    { label: 'Organizations', href: '/admin/organizations', icon: Building2 },
    { label: 'Admins', href: '/owner/users?tab=admins', icon: ShieldAlert },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Orders', href: '/admin/orders', icon: ClipboardList },
    { label: 'Settings', href: '/owner/dashboard#settings', icon: Settings },
    { label: 'Activity Logs', href: '/admin/logs', icon: History },
  ];

  const bloodLinks = [
    { label: 'Blood Donation', href: '/blood-donation?tab=donors', icon: HeartHandshake },
    { label: 'Find Donors', href: '/blood-donation?tab=donors', icon: Users },
    { label: 'My Requests', href: '/blood-donation?tab=my-requests', icon: ClipboardList },
    { label: 'Donations', href: '/blood-donation?tab=donations', icon: HeartHandshake },
    { label: 'Profile', href: '/blood-donation?tab=profile', icon: UserIcon },
  ];

  let links = userLinks;
  let panelTitle = user?.name || 'User Profile';
  let panelSub = 'Normal User';
  let avatarIcon = <UserIcon className="w-5 h-5 text-teal-700" />;

  if (type === 'organization') {
    links = organizationLinks;
    panelTitle = organization?.name || user?.name || 'City Hospital';
    panelSub = 'Organization';
    avatarIcon = <Building2 className="w-5 h-5 text-teal-700" />;
  } else if (type === 'admin') {
    links = adminLinks;
    panelTitle = 'Admin Panel';
    panelSub = user?.name || 'Sarah Ahmed';
    avatarIcon = <Shield className="w-5 h-5 text-blue-700" />;
  } else if (type === 'owner') {
    links = ownerLinks;
    panelTitle = 'Owner Panel';
    panelSub = user?.name || 'Dr. Salman Khan';
    avatarIcon = <ShieldAlert className="w-5 h-5 text-purple-700" />;
  } else if (type === 'blood') {
    links = bloodLinks;
    panelTitle = 'Blood Network';
    panelSub = 'Voluntary Donor Portal';
    avatarIcon = <HeartHandshake className="w-5 h-5 text-rose-600" />;
  }

  return (
    <aside className="w-60 lg:w-64 bg-white border-r border-slate-200/90 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Top Profile / Panel Snippet matching template */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        {user?.profileImage ? (
          <img
            src={user.profileImage}
            alt={panelTitle}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
            {avatarIcon}
          </div>
        )}
        <div className="overflow-hidden">
          <h2 className="text-xs font-bold text-slate-900 truncate leading-tight">{panelTitle}</h2>
          <p className="text-[11px] text-slate-500 truncate mt-0.5">{panelSub}</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          let isActive = false;
          if (type === 'blood') {
            const currentTab = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') || 'donors' : 'donors';
            const linkTab = link.href.includes('tab=') ? new URLSearchParams(link.href.split('?')[1]).get('tab') : 'donors';
            if (link.label === 'Blood Donation') {
              isActive = currentTab === 'donors';
            } else {
              isActive = currentTab === linkTab;
            }
          } else {
            isActive = pathname === link.href.split('?')[0].split('#')[0];
          }

          return (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => {
                if (link.href.includes('tab=')) {
                  setCurrentSearch(`?tab=${new URLSearchParams(link.href.split('?')[1]).get('tab')}`);
                }
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all ${
                isActive
                  ? 'bg-teal-50 text-teal-800 font-bold border-l-2 border-teal-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-teal-700 stroke-[2.2]' : 'text-slate-400'
                }`}
              />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Logout Button matching template */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
