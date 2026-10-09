import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  FileText, 
  Eye, 
  Compass, 
  Plus, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { lostApi, aiApi } from '../services/api';
import { LostItem, AIMatch } from '../types';
import { useAuth } from '../context/AuthContext';
import { MatchCard } from '../components/MatchCard';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [matches, setMatches] = useState<AIMatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const [items, allMatches] = await Promise.all([
        lostApi.getAll(),
        aiApi.getAllMatches(),
      ]);
      setLostItems(items);
      setMatches(allMatches);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-borderCustom shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-primary border border-primary-100 uppercase">
              Passenger Operations Center
            </span>
            <span className="text-xs text-textSecondary font-medium">Active Session</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
            Welcome back, {user?.name || 'Passenger'}!
          </h1>
          <p className="text-xs text-textSecondary max-w-xl">
            Track your lost belongings, view AI journey reconstructions, and review corroborated witness sightings across transit lines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/report-lost"
            className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/25 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Report Lost Item</span>
          </Link>
          <Link
            to="/report-witness"
            className="px-5 py-3 rounded-2xl bg-white border border-borderCustom text-textPrimary font-bold text-xs hover:bg-slate-50 transition-all shadow-xs flex items-center gap-2"
          >
            <Eye className="w-4 h-4 text-emerald-600" />
            <span>Submit Sighting</span>
          </Link>
        </div>
      </div>

      {/* Flagship Hero Case Quick-Card */}
      <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-6 rounded-3xl shadow-float flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>FLAGSHIP DEMO INVESTIGATION</span>
          </div>
          <h3 className="text-xl font-extrabold">
            Black Wildcraft Backpack (Coimbatore ➔ Erode)
          </h3>
          <p className="text-xs text-slate-300 max-w-xl">
            Correlated with Train 12675 Coach S3, witness sighting at Tiruppur, and TTE inspection. High match confidence: 93.8%.
          </p>
        </div>

        <button
          onClick={() => navigate('/journey/1')}
          className="px-6 py-3 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-extrabold text-xs shadow-md transition-all whitespace-nowrap flex items-center gap-2"
        >
          <span>Open Full Journey Tracker</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-semibold text-textSecondary">Loading investigations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Active Investigations List (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-textPrimary flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>Active Transit Investigations ({lostItems.length})</span>
              </h2>
              <Link to="/report-lost" className="text-xs font-bold text-primary hover:underline">
                + New Report
              </Link>
            </div>

            <div className="space-y-3">
              {lostItems.slice(0, 5).map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-5 rounded-2xl border border-borderCustom shadow-card hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image_path?.startsWith('/') ? `http://localhost:8000${item.image_path}` : item.image_path || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'}
                      alt={item.title}
                      className="w-14 h-14 object-cover rounded-xl border border-borderCustom bg-slate-100 shrink-0"
                    />
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          {item.category}
                        </span>
                        <span className="text-xs font-mono text-textSecondary">#LST-00{item.id}</span>
                      </div>
                      <h4 className="font-bold text-sm text-textPrimary leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-xs text-textSecondary">
                        📍 {item.location_name} • {item.transport_type} {item.vehicle_number || ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-borderCustom">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-blue-50 text-primary border border-blue-100 uppercase">
                      {item.status}
                    </span>
                    <button
                      onClick={() => navigate(`/journey/${item.id}`)}
                      className="px-3.5 py-2 rounded-xl bg-primary-50 text-primary hover:bg-primary hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Journey</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Matches Feed (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-textPrimary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI Candidate Matches</span>
              </h2>
              <Link to="/matches" className="text-xs font-bold text-primary hover:underline">
                View All ({matches.length})
              </Link>
            </div>

            <div className="space-y-4">
              {matches.slice(0, 2).map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
