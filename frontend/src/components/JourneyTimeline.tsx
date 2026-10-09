import React from 'react';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Eye, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Train, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { JourneyCheckpoint } from '../types';

interface JourneyTimelineProps {
  checkpoints: JourneyCheckpoint[];
}

export const JourneyTimeline: React.FC<JourneyTimelineProps> = ({ checkpoints }) => {
  const getBadgeIcon = (type: string) => {
    switch (type) {
      case 'ORIGIN':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'WITNESS':
        return <Eye className="w-4 h-4 text-emerald-600" />;
      case 'STAFF_OBSERVATION':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      case 'FOUND_CUSTODY':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-primary" />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'ORIGIN':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'WITNESS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'STAFF_OBSERVATION':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'FOUND_CUSTODY':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Horizontal High-Level Journey Bar */}
      <div className="hidden lg:block bg-white p-5 rounded-2xl border border-borderCustom shadow-sm">
        <div className="text-xs font-bold text-textSecondary uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Multi-Stage Reconstructed Transit Path</span>
        </div>
        
        <div className="flex items-center justify-between relative">
          {/* Background Connecting Line */}
          <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
          
          {checkpoints.map((chk, index) => (
            <div key={chk.id || index} className="relative z-10 flex flex-col items-center max-w-[180px] text-center">
              <div className={`w-10 h-10 rounded-full border-2 bg-white flex items-center justify-center shadow-md ${
                chk.type === 'FOUND_CUSTODY' ? 'border-green-500 ring-4 ring-green-100' :
                chk.type === 'WITNESS' ? 'border-emerald-500 ring-4 ring-emerald-100' :
                chk.type === 'STAFF_OBSERVATION' ? 'border-purple-500 ring-4 ring-purple-100' :
                'border-red-500 ring-4 ring-red-100'
              }`}>
                {getBadgeIcon(chk.type)}
              </div>
              <span className="text-xs font-bold text-textPrimary mt-2 line-clamp-1">
                {new Date(chk.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[11px] font-semibold text-textSecondary line-clamp-1 mt-0.5">
                {chk.location_name}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 mt-1 rounded-full border uppercase ${getBadgeStyle(chk.type)}`}>
                {chk.source_badge}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Chronological Timeline Cards */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-primary/20 space-y-6">
        {checkpoints.map((chk, index) => (
          <motion.div
            key={chk.id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: index * 0.1 }}
            className="relative"
          >
            {/* Timeline Node Icon on line */}
            <div className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-8 h-8 rounded-full border-2 bg-white flex items-center justify-center shadow-sm ${
              chk.type === 'FOUND_CUSTODY' ? 'border-green-500' :
              chk.type === 'WITNESS' ? 'border-emerald-500' :
              chk.type === 'STAFF_OBSERVATION' ? 'border-purple-500' :
              'border-red-500'
            }`}>
              {getBadgeIcon(chk.type)}
            </div>

            {/* Event Card */}
            <div className="bg-white p-5 rounded-2xl border border-borderCustom shadow-card hover:shadow-md transition-shadow">
              
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-borderCustom/60 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md border uppercase ${getBadgeStyle(chk.type)}`}>
                    {chk.source_badge}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-textSecondary font-semibold">
                    <Clock className="w-3.5 h-3.5 text-textSecondary" />
                    <span>{new Date(chk.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-textSecondary">Confidence:</span>
                  <span className="font-bold text-primary px-2 py-0.5 bg-primary-50 rounded">
                    {chk.confidence}%
                  </span>
                </div>
              </div>

              {/* Title & Body */}
              <div className="mt-3">
                <h3 className="text-base font-bold text-textPrimary leading-snug">
                  {chk.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-3 text-xs text-textSecondary font-medium mt-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {chk.location_name}
                  </span>
                  {chk.vehicle_info && (
                    <span className="flex items-center gap-1">
                      <Train className="w-3.5 h-3.5 text-slate-500" />
                      {chk.vehicle_info}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200/70 mt-3 leading-relaxed">
                  {chk.description}
                </p>

                {/* Evidence Image if available */}
                {chk.image_url && (
                  <div className="mt-3">
                    <div className="w-48 h-32 rounded-xl overflow-hidden border border-borderCustom bg-slate-100 shadow-xs">
                      <img
                        src={chk.image_url.startsWith('/') ? `http://localhost:8000${chk.image_url}` : chk.image_url}
                        alt={chk.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  </div>
                )}

              </div>

            </div>
          </motion.div>
        ))}
      </div>

    </div>
  );
};
