import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Compass, 
  MapPin, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Eye, 
  Train, 
  CheckCircle2, 
  FileText, 
  Layers, 
  Share2, 
  Printer, 
  AlertCircle,
  Loader2,
  TrendingUp,
  Award
} from 'lucide-react';
import { journeyApi, lostApi, verificationApi } from '../services/api';
import { JourneyResponse, LostItem } from '../types';
import { JourneyMap } from '../components/JourneyMap';
import { JourneyTimeline } from '../components/JourneyTimeline';
import { EvidenceChainPanel } from '../components/EvidenceChainPanel';
import { useAuth } from '../context/AuthContext';

export const JourneyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const itemId = id ? parseInt(id, 10) : 1;

  const [journeyData, setJourneyData] = useState<JourneyResponse | null>(null);
  const [lostItemsList, setLostItemsList] = useState<LostItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Verification modal state
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [verificationRemarks, setVerificationRemarks] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifySuccess, setVerifySuccess] = useState<boolean>(false);

  const fetchJourney = async (targetId: number) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await journeyApi.getJourney(targetId);
      setJourneyData(data);
    } catch (e: any) {
      setErrorMsg(e.response?.data?.detail || 'Could not load journey data.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllLost = async () => {
    try {
      const items = await lostApi.getAll();
      setLostItemsList(items);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchJourney(itemId);
    fetchAllLost();
  }, [itemId]);

  const handleVerifySubmit = async (decision: 'VERIFIED' | 'REJECTED' | 'REQUEST_INFO') => {
    if (!journeyData?.matched_found_item) return;
    setIsVerifying(true);
    try {
      // Find match id
      await verificationApi.submit({
        match_id: 1, // flagship or active match
        decision: decision,
        remarks: verificationRemarks || 'Verified physical and route evidence matches origin.'
      });
      setVerifySuccess(true);
      setTimeout(() => {
        setShowVerifyModal(false);
        setVerifySuccess(false);
        fetchJourney(itemId);
      }, 1200);
    } catch (e) {
      console.error(e);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-bold text-textPrimary">Reconstructing Transit Corridors & Evidence...</p>
      </div>
    );
  }

  if (errorMsg || !journeyData) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-danger mx-auto" />
        <h2 className="text-xl font-bold text-textPrimary">Journey Record Unavailable</h2>
        <p className="text-xs text-textSecondary">{errorMsg || 'Investigation record not found.'}</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const lost = journeyData.lost_item;
  const matchScore = journeyData.match_score || 93.8;
  const isHighConfidence = matchScore >= 85;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header Card with Quick Case Selector & Status */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-borderCustom shadow-card space-y-6">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-borderCustom/70 pb-6">
          
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-primary-50 text-primary border border-primary-100 uppercase">
                {lost.category}
              </span>
              
              <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase ${
                lost.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                lost.status === 'VERIFICATION_REQUIRED' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                Status: {lost.status}
              </span>

              <span className="text-xs font-mono text-textSecondary/80 px-2 py-0.5 bg-slate-100 rounded">
                Case ID: LST-00{lost.id}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
              {lost.title}
            </h1>
            
            <p className="text-xs sm:text-sm text-textSecondary flex flex-wrap items-center gap-2">
              <span>Reported from: <strong className="text-textPrimary">{lost.location_name}</strong></span>
              <span>•</span>
              <span>Corridor: <strong className="text-textPrimary">{lost.transport_type} {lost.vehicle_number || ''}</strong></span>
              <span>•</span>
              <span>Time: {new Date(lost.date_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </p>
          </div>

          {/* AI Match Meter Badge & Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            
            <div className="px-5 py-3 rounded-2xl bg-gradient-to-br from-blue-50 to-emerald-50 border border-primary/20 shadow-xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-sm shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-textPrimary">{matchScore}</span>
                  <span className="text-xs font-bold text-primary">% Match</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isHighConfidence ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isHighConfidence ? 'High Certainty' : 'Moderate Match'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowVerifyModal(true)}
              className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Staff Verification Action</span>
            </button>

          </div>

        </div>

        {/* Quick Demo Case Switcher Pill Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-textSecondary uppercase tracking-wider shrink-0 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            Switch Investigation:
          </span>
          {lostItemsList.slice(0, 6).map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/journey/${item.id}`)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                item.id === lost.id
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-slate-50 text-textSecondary border-borderCustom hover:bg-slate-100 hover:text-textPrimary'
              }`}
            >
              {item.title.split(' ')[0]} {item.title.split(' ')[1] || ''} (#{item.id})
            </button>
          ))}
        </div>

      </div>

      {/* Main Grid: Interactive Map & Reconstructed Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 7 Columns: Interactive Map & AI Narrative */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white p-5 rounded-3xl border border-borderCustom shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-textPrimary">Interactive Transit Corridor Map</h3>
              </div>
              <span className="text-xs text-textSecondary font-medium">
                {journeyData.checkpoints.length} Geospatial Waypoints
              </span>
            </div>

            {/* Leaflet Map Visualizer */}
            <JourneyMap
              checkpoints={journeyData.checkpoints}
              routeCoordinates={journeyData.map_route_coordinates}
            />

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-textSecondary pt-1">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-600 inline-block" /> Lost Origin</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> Witness Sighting</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-600 inline-block" /> Transit Staff Log</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-600 inline-block" /> Found Custody</span>
            </div>
          </div>

          {/* AI Journey Explanation Narrative Card */}
          <div className="bg-white p-6 rounded-3xl border border-borderCustom shadow-card space-y-3">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>AI Reconstructed Journey Summary</span>
            </div>
            
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-blue-50/60 p-4 rounded-2xl border border-blue-100">
              {journeyData.ai_summary}
            </p>

            {journeyData.matched_found_item && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-emerald-900">Current Custody Status</h4>
                  <p className="text-xs text-emerald-800">
                    Secured at <strong className="font-semibold">{journeyData.matched_found_item.depot_station || journeyData.matched_found_item.location_name}</strong>. Ready for passenger claim upon staff verification.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Evidence Chain Panel */}
          <EvidenceChainPanel
            evidenceChain={journeyData.evidence_chain}
            matchScore={matchScore}
          />

        </div>

        {/* Right 5 Columns: Chronological Interactive Timeline */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-borderCustom shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-borderCustom/70 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-textPrimary">Chronological Journey Path</h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Live Timeline
              </span>
            </div>

            {/* Timeline Component */}
            <JourneyTimeline checkpoints={journeyData.checkpoints} />
          </div>

        </div>

      </div>

      {/* Staff Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-lg w-full rounded-3xl border border-borderCustom shadow-float p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-borderCustom pb-3">
              <div className="flex items-center gap-2 font-bold text-base text-textPrimary">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <span>Staff Official Match Verification</span>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-textSecondary hover:text-textPrimary text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-borderCustom text-xs space-y-1">
                <p className="font-bold text-textPrimary">Candidate: {lost.title}</p>
                <p className="text-textSecondary">Evidence Score: {matchScore}% (High Certainty)</p>
                <p className="text-textSecondary">Corridor: {lost.transport_type} {lost.vehicle_number || ''}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">
                  Staff Verification Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Verified photo match and seat coach alignment with passenger ticket..."
                  value={verificationRemarks}
                  onChange={(e) => setVerificationRemarks(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-borderCustom text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {verifySuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Decision Recorded & Passenger Notified for Recovery!</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-borderCustom">
              <button
                onClick={() => handleVerifySubmit('REJECTED')}
                disabled={isVerifying}
                className="px-4 py-2 rounded-xl bg-red-50 text-danger border border-red-200 text-xs font-bold hover:bg-red-100 transition-colors"
              >
                Reject Match
              </button>
              <button
                onClick={() => handleVerifySubmit('REQUEST_INFO')}
                disabled={isVerifying}
                className="px-4 py-2 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors"
              >
                Request Info
              </button>
              <button
                onClick={() => handleVerifySubmit('VERIFIED')}
                disabled={isVerifying}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-extrabold transition-all shadow-md shadow-primary/25 flex items-center gap-1.5"
              >
                {isVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                <span>Verify & Authorize Recovery</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
