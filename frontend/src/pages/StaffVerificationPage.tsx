import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  MapPin, 
  Train, 
  Clock, 
  FileText, 
  Loader2, 
  AlertCircle,
  Eye,
  Award
} from 'lucide-react';
import { aiApi, verificationApi } from '../services/api';
import { AIMatch } from '../types';

export const StaffVerificationPage: React.FC = () => {
  const navigate = useNavigate();

  const [matches, setMatches] = useState<AIMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<AIMatch | null>(null);
  const [remarks, setRemarks] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const data = await aiApi.getAllMatches();
      setMatches(data);
      if (data.length > 0) {
        setSelectedMatch(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleDecision = async (decision: 'VERIFIED' | 'REJECTED' | 'REQUEST_INFO') => {
    if (!selectedMatch) return;
    setIsProcessing(true);
    setStatusMsg(null);

    try {
      await verificationApi.submit({
        match_id: selectedMatch.id,
        decision: decision,
        remarks: remarks || `Officer submitted ${decision} decision after reviewing multi-factor evidence.`,
      });

      setStatusMsg({
        type: 'success',
        text: `Official Decision '${decision}' recorded in custody register. Owner notified.`,
      });

      setTimeout(() => {
        setStatusMsg(null);
        fetchMatches();
      }, 1500);
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to submit verification.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase">
            Human-In-The-Loop Authority
          </span>
          <span className="text-xs text-textSecondary font-semibold">
            Operational Verification Queue
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight mt-1">
          Staff Evidence & Claim Verification
        </h1>
        <p className="text-xs text-textSecondary">
          AI calculates similarity and reconstructs transit corridors. Authorized staff make the definitive claim verification before release.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-semibold text-textSecondary">Loading verification queue...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-borderCustom text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-textPrimary">All Match Investigations Verified</h3>
          <p className="text-xs text-textSecondary">No pending candidate matches requiring verification.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left 4 Cols: Match Queue List */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-textSecondary uppercase tracking-wider px-1">
              Pending Candidates ({matches.length})
            </h3>

            <div className="space-y-2.5">
              {matches.map((m) => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMatch(m)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedMatch?.id === m.id
                      ? 'bg-blue-50/70 border-primary shadow-sm'
                      : 'bg-white border-borderCustom hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {m.lost_item?.category || 'Belonging'}
                      </span>
                      <h4 className="font-bold text-sm text-textPrimary mt-1 line-clamp-1">
                        {m.lost_item?.title}
                      </h4>
                      <p className="text-[11px] text-textSecondary">
                        Found at: {m.found_item?.location_name}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-primary">{m.total_score}%</span>
                      <span className="block text-[9px] font-bold text-emerald-700 uppercase">{m.confidence_level}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 8 Cols: Side-by-Side Verification Workbench */}
          {selectedMatch && (
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-borderCustom shadow-float space-y-6">
              
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-borderCustom/70 pb-4">
                <div>
                  <span className="text-xs font-mono text-purple-700 font-bold bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                    MATCH INSPECTION #00{selectedMatch.id}
                  </span>
                  <h2 className="text-xl font-extrabold text-textPrimary mt-1">
                    {selectedMatch.lost_item?.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-2xl font-black text-primary">{selectedMatch.total_score}%</span>
                    <span className="block text-[10px] font-bold text-emerald-700 uppercase">AI Evidence Score</span>
                  </div>
                </div>
              </div>

              {/* Status Alert */}
              {statusMsg && (
                <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  statusMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-danger border border-red-200'
                }`}>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{statusMsg.text}</span>
                </div>
              )}

              {/* Side-by-Side: Lost Report vs Found Custody */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Lost Item Report */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-red-200/70 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-red-700 uppercase">
                    <span>Passenger Lost Report</span>
                    <span className="font-mono">#LST-00{selectedMatch.lost_item?.id}</span>
                  </div>

                  {selectedMatch.lost_item?.image_path && (
                    <div className="h-32 rounded-xl overflow-hidden bg-slate-200 border border-borderCustom">
                      <img
                        src={selectedMatch.lost_item.image_path.startsWith('/') ? `http://localhost:8000${selectedMatch.lost_item.image_path}` : selectedMatch.lost_item.image_path}
                        alt="Lost Item"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="text-xs space-y-1">
                    <p><strong className="text-textPrimary">Location:</strong> {selectedMatch.lost_item?.location_name}</p>
                    <p><strong className="text-textPrimary">Transport:</strong> {selectedMatch.lost_item?.transport_type} {selectedMatch.lost_item?.vehicle_number || ''}</p>
                    <p><strong className="text-textPrimary">Coach/Seat:</strong> {selectedMatch.lost_item?.coach_number || 'N/A'}</p>
                    <p className="text-slate-600 bg-white p-2 rounded-lg border border-slate-200/80 text-[11px] mt-1">
                      {selectedMatch.lost_item?.description}
                    </p>
                  </div>
                </div>

                {/* Found Item in Custody */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-emerald-200/70 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase">
                    <span>Secured Found Custody</span>
                    <span className="font-mono">#FND-00{selectedMatch.found_item?.id}</span>
                  </div>

                  {selectedMatch.found_item?.image_path && (
                    <div className="h-32 rounded-xl overflow-hidden bg-slate-200 border border-borderCustom">
                      <img
                        src={selectedMatch.found_item.image_path.startsWith('/') ? `http://localhost:8000${selectedMatch.found_item.image_path}` : selectedMatch.found_item.image_path}
                        alt="Found Item"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="text-xs space-y-1">
                    <p><strong className="text-textPrimary">Custody Depot:</strong> {selectedMatch.found_item?.depot_station || selectedMatch.found_item?.location_name}</p>
                    <p><strong className="text-textPrimary">Transport:</strong> {selectedMatch.found_item?.transport_type} {selectedMatch.found_item?.vehicle_number || ''}</p>
                    <p><strong className="text-textPrimary">Found Time:</strong> {new Date(selectedMatch.found_item?.found_time || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    <p className="text-slate-600 bg-white p-2 rounded-lg border border-slate-200/80 text-[11px] mt-1">
                      {selectedMatch.found_item?.description}
                    </p>
                  </div>
                </div>

              </div>

              {/* AI Multi-Score Bar Summary */}
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-primary">
                  <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> AI Evidence Breakdown</span>
                  <span className="font-mono">{selectedMatch.total_score}% Combined Certainty</span>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px] font-bold text-slate-700">
                  <div className="bg-white p-2 rounded-lg border border-blue-200">
                    <span className="text-slate-500 block">Visual (30%)</span>
                    <span className="text-xs text-primary">{selectedMatch.image_score}%</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-blue-200">
                    <span className="text-slate-500 block">Text (20%)</span>
                    <span className="text-xs text-primary">{selectedMatch.text_score}%</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-blue-200">
                    <span className="text-slate-500 block">Time (15%)</span>
                    <span className="text-xs text-primary">{selectedMatch.time_score}%</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-blue-200">
                    <span className="text-slate-500 block">Location (15%)</span>
                    <span className="text-xs text-primary">{selectedMatch.location_score}%</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-blue-200">
                    <span className="text-slate-500 block">Route (10%)</span>
                    <span className="text-xs text-primary">{selectedMatch.route_score}%</span>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-blue-200">
                    <span className="text-slate-500 block">Witness (10%)</span>
                    <span className="text-xs text-primary">{selectedMatch.witness_score}%</span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 pt-1 leading-relaxed">
                  <strong>AI Explanation:</strong> {selectedMatch.explanation}
                </p>
              </div>

              {/* Remarks Field */}
              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">
                  Staff Verification Notes & Handoff Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Serial tag verified against passenger purchase receipt. Ready for counter 3 pickup at Erode station."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderCustom text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Decision Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-borderCustom">
                <button
                  type="button"
                  onClick={() => handleDecision('REJECTED')}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl bg-red-50 text-danger border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject Candidate</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision('REQUEST_INFO')}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Request Passenger Info</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision('VERIFIED')}
                  disabled={isProcessing}
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-extrabold shadow-md shadow-primary/30 transition-all flex items-center gap-2"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>VERIFY & NOTIFY PASSENGER</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
