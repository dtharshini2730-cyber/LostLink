import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Search, 
  Filter, 
  RefreshCw, 
  Loader2, 
  AlertCircle,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { aiApi, verificationApi } from '../services/api';
import { AIMatch } from '../types';
import { MatchCard } from '../components/MatchCard';

export const MatchesPage: React.FC = () => {
  const [matches, setMatches] = useState<AIMatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [confidenceFilter, setConfidenceFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const data = await aiApi.getAllMatches();
      setMatches(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleRecalculateAll = async () => {
    setIsRefreshing(true);
    try {
      await aiApi.triggerMatch(1);
      await fetchMatches();
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredMatches = matches.filter((m) => {
    if (confidenceFilter !== 'ALL' && m.confidence_level !== confidenceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const lTitle = m.lost_item?.title.toLowerCase() || '';
      const fTitle = m.found_item?.title.toLowerCase() || '';
      const loc = m.lost_item?.location_name.toLowerCase() || '';
      return lTitle.includes(q) || fTitle.includes(q) || loc.includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 uppercase">
              AI Multi-Factor Engine
            </span>
            <span className="text-xs text-textSecondary font-semibold">
              {matches.length} active match candidates
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">
            AI Evidence & Match Candidates
          </h1>
          <p className="text-xs text-textSecondary">
            Candidate matches synthesized by combining visual hashes, description tokens, time windows, and transit corridor witness reports.
          </p>
        </div>

        <button
          onClick={handleRecalculateAll}
          disabled={isRefreshing}
          className="px-4 py-2.5 rounded-xl bg-white border border-borderCustom text-xs font-bold text-textPrimary hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Recalculate Matches</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-borderCustom shadow-card flex flex-wrap items-center justify-between gap-4">
        
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter by item, station, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-borderCustom rounded-xl text-xs text-textPrimary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-textSecondary flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Confidence:
          </span>
          {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setConfidenceFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                confidenceFilter === lvl
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-slate-100 text-textSecondary hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

      </div>

      {/* Matches Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-semibold text-textSecondary">Analyzing AI similarity vectors...</p>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-borderCustom text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-textPrimary">No matching candidates found</h3>
          <p className="text-xs text-textSecondary">Try adjusting your search query or confidence filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}

    </div>
  );
};
