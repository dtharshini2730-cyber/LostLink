import React from 'react';
import { 
  FileText, 
  Eye, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  MapPin, 
  Award,
  Sparkles
} from 'lucide-react';
import { Evidence } from '../types';

interface EvidenceChainPanelProps {
  evidenceChain: Evidence[];
  matchScore?: number;
}

export const EvidenceChainPanel: React.FC<EvidenceChainPanelProps> = ({ evidenceChain, matchScore = 94.0 }) => {
  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'LOST_REPORT':
        return <FileText className="w-4 h-4 text-blue-600" />;
      case 'WITNESS_OBSERVATION':
        return <Eye className="w-4 h-4 text-emerald-600" />;
      case 'STAFF_OBSERVATION':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      case 'FOUND_REPORT':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-600" />;
    }
  };

  const getEvidenceBadge = (type: string) => {
    switch (type) {
      case 'LOST_REPORT':
        return { label: 'Passenger Report', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'WITNESS_OBSERVATION':
        return { label: 'Witness Sighting', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'STAFF_OBSERVATION':
        return { label: 'Transit Staff Log', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'FOUND_REPORT':
        return { label: 'Custody Recovery', color: 'bg-green-50 text-green-700 border-green-200' };
      default:
        return { label: 'Correlated Record', color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-borderCustom shadow-card p-6 space-y-6">
      
      {/* Header with Evidence Strength Tag */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-borderCustom/60 pb-4">
        <div>
          <h3 className="text-base font-bold text-textPrimary flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            <span>Cryptographic Evidence Chain</span>
          </h3>
          <p className="text-xs text-textSecondary mt-0.5">
            Verified chronological sequence corroborating item movement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-textSecondary font-medium">Chain Strength:</span>
          <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
            matchScore >= 85 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{matchScore >= 85 ? 'HIGH CERTAINTY' : 'MODERATE'}</span>
          </span>
        </div>
      </div>

      {/* Sequential Evidence Nodes */}
      <div className="space-y-4">
        {evidenceChain.map((ev, index) => {
          const badge = getEvidenceBadge(ev.evidence_type);
          return (
            <div
              key={ev.id || index}
              className="p-4 rounded-xl border border-borderCustom/80 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-2.5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white shadow-xs border border-borderCustom flex items-center justify-center">
                    {getEvidenceIcon(ev.evidence_type)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-textPrimary">
                      Evidence #{index + 1}: {ev.source_id || `EV-00${index + 1}`}
                    </span>
                    <span className={`ml-2 text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-textSecondary font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="text-xs font-semibold text-textSecondary flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>{ev.location}</span>
              </div>

              <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                {ev.description}
              </p>

              <div className="flex items-center justify-between pt-1 text-[11px] text-textSecondary border-t border-slate-200/50">
                <span>Confidence Rating:</span>
                <span className="font-bold text-primary">{ev.confidence}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Synthesis Box */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200/80 text-xs text-blue-950 space-y-1.5">
        <div className="font-bold text-primary flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          <span>AI Multi-Source Validation:</span>
        </div>
        <p className="leading-relaxed text-slate-700">
          The evidence chain forms a continuous spatial-temporal progression along the recorded transit corridor. The witness observation in coach S3 bridges the gap between origin loss at Coimbatore Junction and depot recovery at Erode.
        </p>
      </div>

    </div>
  );
};
