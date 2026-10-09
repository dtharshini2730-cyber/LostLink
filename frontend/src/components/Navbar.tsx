import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Navigation, 
  Search, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  ShieldCheck, 
  Compass, 
  Eye, 
  PlusCircle, 
  Sparkles, 
  CheckCircle2, 
  ChevronDown,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { notificationApi, searchApi } from '../services/api';
import { Notification } from '../types';

export const Navbar: React.FC = () => {
  const { user, logout, quickSwitchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifs, setShowNotifs] = useState<boolean>(false);
  const [showRoleMenu, setShowRoleMenu] = useState<boolean>(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState<boolean>(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const data = await notificationApi.getAll();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.read).length);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifs(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search debouncing
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      const timer = setTimeout(async () => {
        try {
          const res = await searchApi.search(searchQuery);
          setSearchResults(res);
          setShowSearchDropdown(true);
        } catch (e) {
          // ignore
        } finally {
          setIsSearching(false);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowSearchDropdown(false);
      setSearchResults(null);
    }
  }, [searchQuery]);

  const handleMarkAllRead = async () => {
    await notificationApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const isStaff = user?.role === 'STAFF';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-borderCustom shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/25 transition-transform group-hover:scale-105">
                <Navigation className="w-5 h-5 -rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-textPrimary leading-none flex items-center gap-1.5">
                  LOSTLINK
                  <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-primary-50 text-primary uppercase border border-primary-100">
                    AI Journey
                  </span>
                </span>
                <span className="text-[11px] text-textSecondary font-medium tracking-wide mt-0.5">
                  Transit Reconstruction
                </span>
              </div>
            </Link>

            {/* Main Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/dashboard'
                    ? 'text-primary bg-primary-50'
                    : 'text-textSecondary hover:text-textPrimary hover:bg-slate-50'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/report-lost"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/report-lost'
                    ? 'text-primary bg-primary-50'
                    : 'text-textSecondary hover:text-textPrimary hover:bg-slate-50'
                }`}
              >
                Report Lost
              </Link>
              <Link
                to="/report-witness"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname === '/report-witness'
                    ? 'text-primary bg-primary-50'
                    : 'text-textSecondary hover:text-textPrimary hover:bg-slate-50'
                }`}
              >
                <Eye className="w-4 h-4 text-emerald-600" />
                Witness Sighting
              </Link>
              <Link
                to="/matches"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  location.pathname === '/matches'
                    ? 'text-primary bg-primary-50'
                    : 'text-textSecondary hover:text-textPrimary hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                AI Matches
              </Link>
              <Link
                to="/journey/1"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  location.pathname.startsWith('/journey')
                    ? 'text-primary bg-primary-50'
                    : 'text-textSecondary hover:text-textPrimary hover:bg-slate-50'
                }`}
              >
                <Compass className="w-4 h-4 text-primary" />
                Journey Track
              </Link>
              
              {/* Staff Exclusive Tab */}
              <Link
                to="/staff/dashboard"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  location.pathname.startsWith('/staff')
                    ? 'text-primary-dark bg-blue-100 font-semibold'
                    : 'text-textSecondary hover:text-textPrimary hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-primary-dark" />
                Staff Portal
              </Link>
            </nav>
          </div>

          {/* Right Section: Search, Demo Button, Notifications, User Profile */}
          <div className="flex items-center gap-3">
            
            {/* Global Search Bar */}
            <div className="relative hidden md:block" ref={searchRef}>
              <div className="relative">
                <Search className="w-4 h-4 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search item, route, train..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-56 lg:w-64 pl-9 pr-4 py-1.5 bg-slate-50 border border-borderCustom rounded-lg text-sm text-textPrimary placeholder:text-textSecondary/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              {/* Search Dropdown Modal */}
              {showSearchDropdown && searchResults && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-float border border-borderCustom p-3 z-50 max-h-[28rem] overflow-y-auto">
                  <div className="text-xs font-semibold text-textSecondary uppercase tracking-wider px-2 py-1">
                    Search Results ({searchResults.total_results})
                  </div>
                  
                  {searchResults.lost_items.length > 0 && (
                    <div className="mt-2">
                      <div className="text-[11px] font-bold text-primary px-2 py-0.5 uppercase">Lost Items</div>
                      {searchResults.lost_items.map((item: any) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            navigate(`/journey/${item.id}`);
                            setShowSearchDropdown(false);
                          }}
                          className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <div>
                            <p className="text-xs font-semibold text-textPrimary">{item.title}</p>
                            <p className="text-[11px] text-textSecondary">{item.location} • {item.category}</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-primary font-medium">
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.witness_reports.length > 0 && (
                    <div className="mt-2 border-t border-borderCustom/60 pt-2">
                      <div className="text-[11px] font-bold text-emerald-600 px-2 py-0.5 uppercase">Witness Sightings</div>
                      {searchResults.witness_reports.map((w: any) => (
                        <div
                          key={w.id}
                          onClick={() => {
                            navigate(`/journey/1`);
                            setShowSearchDropdown(false);
                          }}
                          className="p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                        >
                          <p className="text-xs text-textPrimary line-clamp-1">{w.description}</p>
                          <p className="text-[11px] text-textSecondary">{w.location} • {w.vehicle_number || 'Transit'}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchResults.total_results === 0 && (
                    <p className="text-xs text-textSecondary text-center py-4">No matching records found.</p>
                  )}
                </div>
              )}
            </div>

            {/* Quick Demo Mode Button */}
            <button
              onClick={() => navigate('/journey/1')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold shadow-xs hover:bg-amber-100 transition-colors"
              title="Click to view the complete Coimbatore -> Erode Backpack Journey demo"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>⚡ Demo Journey</span>
            </button>

            {/* Notification Popover */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 text-textSecondary hover:text-textPrimary hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-float border border-borderCustom p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-borderCustom">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-textPrimary">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-primary-50 text-primary font-semibold rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="mt-2 max-h-80 overflow-y-auto divide-y divide-borderCustom/50">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-textSecondary text-center py-6">No notifications yet.</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (notif.link_url) navigate(notif.link_url);
                            setShowNotifs(false);
                          }}
                          className={`py-3 px-2 flex items-start gap-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors ${
                            !notif.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-textPrimary">{notif.title}</p>
                            <p className="text-xs text-textSecondary mt-0.5 leading-relaxed">{notif.message}</p>
                            <span className="text-[10px] text-textSecondary/70 mt-1 block">
                              {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile & Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-borderCustom hover:border-slate-300 bg-white transition-all shadow-xs"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  user?.role === 'STAFF' ? 'bg-purple-100 text-purple-700' :
                  user?.role === 'WITNESS' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {user?.name ? user.name[0] : 'U'}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-textPrimary leading-none">
                    {user?.name || 'Guest User'}
                  </span>
                  <span className="text-[10px] text-textSecondary font-medium">
                    {user?.role || 'PASSENGER'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-textSecondary" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-float border border-borderCustom p-3 z-50">
                  <div className="px-2 py-1.5 border-b border-borderCustom mb-2">
                    <p className="text-xs font-bold text-textPrimary">{user?.name}</p>
                    <p className="text-[11px] text-textSecondary truncate">{user?.email}</p>
                    <div className="mt-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        Current Role: {user?.role}
                      </span>
                    </div>
                  </div>

                  {/* 1-Click Role Switcher for Hackathon Demonstrations */}
                  <div className="py-1">
                    <p className="text-[11px] font-semibold text-textSecondary px-2 mb-1">Demo Quick-Switch:</p>
                    <button
                      onClick={() => {
                        quickSwitchRole('PASSENGER');
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-blue-50 text-textPrimary flex items-center justify-between"
                    >
                      <span>👤 Passenger (Arjun)</span>
                      {user?.role === 'PASSENGER' && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                    </button>
                    <button
                      onClick={() => {
                        quickSwitchRole('WITNESS');
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-emerald-50 text-textPrimary flex items-center justify-between"
                    >
                      <span>👁️ Witness (Priya)</span>
                      {user?.role === 'WITNESS' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                    <button
                      onClick={() => {
                        quickSwitchRole('STAFF');
                        setShowRoleMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-purple-50 text-textPrimary flex items-center justify-between"
                    >
                      <span>🛡️ Staff (Officer Rajesh)</span>
                      {user?.role === 'STAFF' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                    </button>
                  </div>

                  <div className="border-t border-borderCustom mt-2 pt-2">
                    <button
                      onClick={() => {
                        logout();
                        setShowRoleMenu(false);
                        navigate('/login');
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-xs text-danger font-medium rounded-lg hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
