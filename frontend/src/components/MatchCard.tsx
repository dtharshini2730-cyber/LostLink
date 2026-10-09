import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Eye, 
  MapPin, 
  Clock, 
  Train, 
  ShieldCheck, 
  FileText, 
  ArrowRight,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { AIMatch } from '../types';

interface MatchCardProps {
  match: AIMatch;
  onVerify?: (matchId: number) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onVerify }) => {
  const navigate = useNavigate();

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 65) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-slate-700 bg-slate-50 border-slate-200';
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 65) return 'bg-amber-500';
    return 'bg-blue-500';
  };

  const lostTitle = match.lost_item?.title || 'Reported Lost Item';
  const foundTitle = match.found_item?.title || 'Custody Found Item';
  const foundImg = match.found_item?.image_path || match.lost_item?.image_path;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-borderCustom shadow-card hover:shadow-float transition-all overflow-hidden flex flex-col justify-between"
    >
      <div>
        
        {/* Top Header with Total Match % */}
        <div className="p-5 border-b border-borderCustom/70 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-50 text-primary border border-primary-100 uppercase">
                {match.lost_item?.category || 'Transit Property'}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-md border uppercase ${
                match.confidence_level === 'HIGH' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {match.confidence_level} CONFIDENCE
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-textPrimary leading-tight pt-1">
              {lostTitle}
            </h3>
            
            <p className="text-xs text-textSecondary flex items-center gap-2">
              <span>Lost: {match.lost_item?.location_name || 'Station'}</span>
              <span>•</span>
              <span className="text-primary font-medium">Found: {match.found_item?.location_name || 'Custody Depot'}</span>
            </p>
          </div>

          {/* Large Match Score Circular Pill */}
          <div className={`shrink-0 px-3.5 py-2 rounded-2xl border flex flex-col items-center justify-center shadow-xs ${getScoreColor(match.total_score)}`}>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-black tracking-tight">{match.total_score}</span>
              <span className="text-xs font-bold">%</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">AI Match</span>
          </div>
        </div>

        {/* Middle Section: Image Comparison & 6-Factor Breakdown */}
        <div className="p-5 space-y-4">
          
          {/* Quick Image Preview */}
          {foundImg && (
            <div className="relative w-full h-40 rounded-xl overflow-hidden bg-slate-100 border border-borderCustom">
              <img
                src={foundImg.startsWith('/') ? `http://localhost:8000${foundImg}` : foundImg}
                alt={lostTitle}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] font-medium text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Visual Match: {match.image_score}%</span>
              </div>
            </div>
          )}

          {/* 6 Deterministic Evidence Progress Bars */}
          <div className="space-y-2.5 bg-slate-50/80 p-3.5 rounded-xl border border-borderCustom/60">
            <div className="text-[11px] font-bold text-textSecondary uppercase tracking-wider flex items-center justify-between">
              <span>Multi-Factor Evidence Matrix</span>
              <span className="font-mono text-primary font-bold">100% Total</span>
            </div>

            {/* 1. Visual Similarity (30%) */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                <span>Visual Similarity (30% weight)</span>
                <span className="font-bold">{match.image_score}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(match.image_score)}`}
                  style={{ width: `${match.image_score}%` }}
                />
              </div>
            </div>

            {/* 2. Description Similarity (20%) */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                <span>Description & Attributes (20% weight)</span>
                <span className="font-bold">{match.text_score}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(match.text_score)}`}
                  style={{ width: `${match.text_score}%` }}
                />
              </div>
            </div>

            {/* 3. Time Correlation (15%) */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                <span>Time Window Plausibility (15% weight)</span>
                <span className="font-bold">{match.time_score}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(match.time_score)}`}
                  style={{ width: `${match.time_score}%` }}
                />
              </div>
            </div>

            {/* 4. Location Correlation (15%) */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                <span>Location & Geospatial Distance (15% weight)</span>
                <span className="font-bold">{match.location_score}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(match.location_score)}`}
                  style={{ width: `${match.location_score}%` }}
                />
              </div>
            </div>

            {/* 5. Route Compatibility (10%) */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                <span>Route & Vehicle Match (10% weight)</span>
                <span className="font-bold">{match.route_score}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(match.route_score)}`}
                  style={{ width: `${match.route_score}%` }}
                />
              </div>
            </div>

            {/* 6. Witness Evidence (10%) */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1 text-slate-700">
                <span>Witness Corroboration (10% weight)</span>
                <span className="font-bold">{match.witness_score}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(match.witness_score)}`}
                  style={{ width: `${match.witness_score}%` }}
                />
              </div>
            </div>

          </div>

          {/* AI Reasoning Summary */}
          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-slate-700 leading-relaxed">
            <div className="font-bold text-primary mb-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Evidence Reasoning:</span>
            </div>
            {match.explanation}
          </div>

        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="p-4 bg-slate-50 border-t border-borderCustom flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => navigate(`/journey/${match.lost_item_id}`)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-borderCustom text-xs font-bold text-textPrimary hover:bg-slate-100 transition-colors shadow-xs"
        >
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span>View Journey</span>
        </button>

        <button
          onClick={() => navigate(`/journey/${match.lost_item_id}`)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors shadow-sm shadow-primary/25"
        >
          <span>View Evidence</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        {onVerify && (
          <button
            onClick={() => onVerify(match.id)}
            className="w-full mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Send to Staff Verification</span>
          </button>
        )}
      </div>

    </motion.div>
  );
};
