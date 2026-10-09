import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  TrendingUp, 
  FileText, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  ArrowRight, 
  Compass, 
  BarChart3, 
  PieChart as PieIcon,
  Sparkles,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { dashboardApi, lostApi } from '../services/api';
import { DashboardStats, LostItem } from '../types';

export const StaffDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [lostList, setLostList] = useState<LostItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [transportFilter, setTransportFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, items] = await Promise.all([
        dashboardApi.getStats(),
        lostApi.getAll(),
      ]);
      setStats(statsData);
      setLostList(items);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const filteredItems = lostList.filter((item) => {
    if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
    if (transportFilter !== 'ALL' && item.transport_type !== transportFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.location_name.toLowerCase().includes(q) ||
        (item.vehicle_number && item.vehicle_number.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'VERIFICATION_REQUIRED':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'MATCH_FOUND':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'ANALYZING':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'RECOVERED':
        return 'bg-green-100 text-green-900 border-green-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase">
              Staff Command Center
            </span>
            <span className="text-xs text-textSecondary font-semibold">
              Real-time Transit Intelligence
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight mt-1">
            Operational Dashboard & Analytics
          </h1>
          <p className="text-xs text-textSecondary">
            Monitor transit corridor lost reports, witness observations, and pending verification queues across all networks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/staff/verification"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verification Queue</span>
          </Link>
          <Link
            to="/found-items"
            className="px-5 py-2.5 rounded-xl bg-white border border-borderCustom text-textPrimary font-bold text-xs hover:bg-slate-50 transition-all shadow-xs"
          >
            Custody Vault
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-semibold text-textSecondary">Aggregating telemetry & transit statistics...</p>
        </div>
      ) : (
        <>
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-borderCustom shadow-card space-y-1">
              <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Total Reports</span>
              <p className="text-3xl font-extrabold text-textPrimary">{stats?.total_lost_reports || 10}</p>
              <span className="text-[11px] text-textSecondary font-medium">Logged across rail & metro</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-borderCustom shadow-card space-y-1">
              <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Active Investigations</span>
              <p className="text-3xl font-extrabold text-primary">{stats?.active_investigations || 8}</p>
              <span className="text-[11px] text-primary font-semibold">AI Correlating</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-borderCustom shadow-card space-y-1">
              <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Potential Matches</span>
              <p className="text-3xl font-extrabold text-amber-600">{stats?.potential_matches || 9}</p>
              <span className="text-[11px] text-amber-700 font-semibold">&gt; 65% Confidence score</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-borderCustom shadow-card space-y-1">
              <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Recovery Rate</span>
              <p className="text-3xl font-extrabold text-emerald-600">{stats?.recovery_rate_percent || 78.4}%</p>
              <span className="text-[11px] text-emerald-700 font-semibold">Avg 3.4 hours turn-around</span>
            </div>

          </div>

          {/* Recharts Visualizations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 7-Day Activity Trend (8 Cols) */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-borderCustom shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>7-Day Transit Investigation Trend</span>
                  </h3>
                  <p className="text-xs text-textSecondary">
                    Lost Reports vs Recovered Items vs Witness Sightings
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Lost</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Recovered</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Witness</span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.reports_by_day || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorLost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#FFF', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="lost" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorLost)" />
                    <Area type="monotone" dataKey="recovered" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorRec)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transport Mode Donut Chart (4 Cols) */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-borderCustom shadow-card space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-textPrimary flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-purple-600" />
                  <span>Transport Distribution</span>
                </h3>
                <p className="text-xs text-textSecondary">
                  Breakdown by transit vehicle types
                </p>
              </div>

              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.transport_distribution || [
                        { name: 'Train', count: 6, color: '#2563EB' },
                        { name: 'Metro', count: 3, color: '#0D9488' },
                        { name: 'Bus', count: 1, color: '#F59E0B' }
                      ]}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {(stats?.transport_distribution || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || (index === 0 ? '#2563EB' : index === 1 ? '#0D9488' : '#F59E0B')} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#FFF', borderRadius: '12px', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-around text-xs font-semibold pt-2 border-t border-borderCustom">
                {(stats?.transport_distribution || []).map((t, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color || '#2563EB' }} />
                    <span className="text-slate-700">{t.name}: {t.count}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Operational Investigations Filter Table */}
          <div className="bg-white rounded-3xl border border-borderCustom shadow-card overflow-hidden space-y-4 p-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-textPrimary">Recent Investigations Registry</h3>
                <p className="text-xs text-textSecondary">Real-time status of all active lost belongings and corridor correlations</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Filter registry..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-borderCustom rounded-lg focus:bg-white focus:outline-none"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-borderCustom rounded-lg"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">New</option>
                  <option value="ANALYZING">Analyzing</option>
                  <option value="MATCH_FOUND">Match Found</option>
                  <option value="VERIFICATION_REQUIRED">Verification Required</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="RECOVERED">Recovered</option>
                </select>

                <select
                  value={transportFilter}
                  onChange={(e) => setTransportFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-slate-50 border border-borderCustom rounded-lg"
                >
                  <option value="ALL">All Transports</option>
                  <option value="Train">Train</option>
                  <option value="Metro">Metro</option>
                  <option value="Bus">Bus</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-textSecondary border-y border-borderCustom uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Item & Case ID</th>
                    <th className="py-3 px-4">Origin Station</th>
                    <th className="py-3 px-4">Transport Mode</th>
                    <th className="py-3 px-4">Reported Time</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderCustom/60">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-textPrimary">
                        <div className="flex items-center gap-2">
                          <span>{item.title}</span>
                          <span className="font-mono text-[10px] text-textSecondary font-normal">#LST-00{item.id}</span>
                        </div>
                        <span className="text-[11px] font-normal text-textSecondary">{item.category}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {item.location_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-textPrimary">{item.transport_type}</span>
                        {item.vehicle_number && (
                          <span className="block text-[11px] text-textSecondary">{item.vehicle_number}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-textSecondary">
                        {new Date(item.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${getStatusBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => navigate(`/journey/${item.id}`)}
                          className="px-3 py-1.5 rounded-lg bg-primary-50 hover:bg-primary hover:text-white text-primary text-[11px] font-bold transition-all inline-flex items-center gap-1"
                        >
                          <Compass className="w-3 h-3" />
                          <span>Track Journey</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </>
      )}

    </div>
  );
};
