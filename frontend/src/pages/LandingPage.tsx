import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Navigation, 
  ArrowRight, 
  Eye, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  MapPin, 
  Train, 
  CheckCircle2, 
  Cpu, 
  Layers, 
  Route, 
  TrendingUp,
  Search
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-8 sm:pt-16 sm:pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-primary text-xs font-bold shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>AI-Powered Public Transit Journey Reconstruction</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-textPrimary tracking-tight max-w-4xl mx-auto leading-[1.15]"
          >
            LOSTLINK <br />
            <span className="text-primary">"Every Item Has a Journey."</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-textSecondary max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Reconstruct the probable journey of lost belongings using witness observations, route information, time, location and AI-assisted evidence.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-3.5 pt-2"
          >
            <Link
              to="/report-lost"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-white font-bold text-sm shadow-md shadow-primary/25 hover:bg-primary-dark transition-all transform hover:-translate-y-0.5"
            >
              <span>REPORT LOST ITEM</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/report-witness"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-borderCustom text-textPrimary font-bold text-sm hover:bg-slate-50 transition-all shadow-xs"
            >
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>REPORT A SIGHTING</span>
            </Link>

            <Link
              to="/staff/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>STAFF DASHBOARD</span>
            </Link>

            <button
              onClick={() => navigate('/journey/1')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-sm hover:bg-amber-400 transition-all shadow-md shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4 text-slate-950 animate-spin" />
              <span>⚡ LOAD DEMO INVESTIGATION</span>
            </button>
          </motion.div>

        </div>
      </section>

      {/* CORE DIFFERENTIATION VISUALIZER: The Animated Transport Journey Reconstruction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-borderCustom shadow-float p-6 sm:p-10 space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-primary tracking-wider uppercase bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
              The LostLink Core Paradigm
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-textPrimary tracking-tight">
              Moving Beyond Static Lost & Found
            </h2>
            <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
              Traditional portals only know where an item was lost and found. LostLink pieces together the transit story that happened in between.
            </p>
          </div>

          {/* Interactive Flow Diagram */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
            
            {/* Stage 1: Lost Report */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-red-200/80 space-y-3 relative group hover:bg-white hover:shadow-card transition-all">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">Origin Event</span>
                <h4 className="font-bold text-sm text-textPrimary">Lost Item Report</h4>
                <p className="text-xs text-textSecondary leading-relaxed">
                  Passenger logs black backpack at Coimbatore Junction (6:10 PM, Train S3).
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-slate-600">
                LST-001 • Encrypted
              </div>
            </div>

            {/* Stage 2: Witness Observation */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-emerald-200/80 space-y-3 relative group hover:bg-white hover:shadow-card transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Key Differentiator</span>
                <h4 className="font-bold text-sm text-textPrimary">Witness Sighting</h4>
                <p className="text-xs text-textSecondary leading-relaxed">
                  Fellow passenger spots backpack on Coach S3 overhead rack near Tiruppur (6:25 PM).
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-emerald-700 font-semibold">
                WIT-101 • 92% Correlation
              </div>
            </div>

            {/* Stage 3: Route & Corridor Intelligence */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-blue-200/80 space-y-3 relative group hover:bg-white hover:shadow-card transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Transit Spatial Correlator</span>
                <h4 className="font-bold text-sm text-textPrimary">Route & Time Matrix</h4>
                <p className="text-xs text-textSecondary leading-relaxed">
                  AI validates speed, station stops, and in-transit TTE inspection log (6:50 PM).
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-primary font-semibold">
                Kovai Express Route Correlated
              </div>
            </div>

            {/* Stage 4: Found Item in Custody */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-purple-200/80 space-y-3 relative group hover:bg-white hover:shadow-card transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">Custody Intake</span>
                <h4 className="font-bold text-sm text-textPrimary">Found Item Log</h4>
                <p className="text-xs text-textSecondary leading-relaxed">
                  RPF staff secures backpack at Erode Junction station desk (7:10 PM).
                </p>
              </div>
              <div className="pt-2 border-t border-slate-200 text-[10px] font-mono text-purple-700 font-semibold">
                FND-401 • In Custody
              </div>
            </div>

            {/* Stage 5: Staff Verification & Owner Recovery */}
            <div className="bg-gradient-to-b from-blue-50 to-emerald-50 p-5 rounded-2xl border border-primary/40 space-y-3 relative group hover:shadow-card transition-all">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
                5
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Human In The Loop</span>
                <h4 className="font-bold text-sm text-textPrimary">Staff Verification</h4>
                <p className="text-xs text-textSecondary leading-relaxed">
                  Staff approves 93.8% evidence chain. Passenger notified for depot pickup.
                </p>
              </div>
              <div className="pt-2 border-t border-primary/20 text-[10px] font-mono text-emerald-800 font-bold">
                Recovery Ready & Verified
              </div>
            </div>

          </div>

          {/* Interactive Preview Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>DEMO SCENARIO AVAILABLE</span>
              </div>
              <p className="text-sm font-semibold text-slate-200">
                Witness the complete Coimbatore Junction ➔ Erode Junction Black Backpack Journey.
              </p>
            </div>
            <button
              onClick={() => navigate('/journey/1')}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-bold shadow-md transition-all whitespace-nowrap"
            >
              Explore Interactive Journey Map & Timeline →
            </button>
          </div>

        </div>
      </section>

      {/* KPI Stats & Live System Metrics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-white p-6 rounded-2xl border border-borderCustom shadow-card space-y-1">
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Active Investigations</span>
            <p className="text-3xl font-extrabold text-textPrimary">10</p>
            <p className="text-[11px] text-emerald-600 font-medium">Correlating public transit corridors</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-borderCustom shadow-card space-y-1">
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Witness Sightings</span>
            <p className="text-3xl font-extrabold text-emerald-600">10</p>
            <p className="text-[11px] text-textSecondary font-medium">Crowdsourced transit logs</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-borderCustom shadow-card space-y-1">
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">High Match Probability</span>
            <p className="text-3xl font-extrabold text-primary">93.8%</p>
            <p className="text-[11px] text-textSecondary font-medium">Coimbatore-Erode Flagship</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-borderCustom shadow-card space-y-1">
            <span className="text-xs font-bold text-textSecondary uppercase tracking-wider">Average Recovery Time</span>
            <p className="text-3xl font-extrabold text-purple-600">3.4 hrs</p>
            <p className="text-[11px] text-textSecondary font-medium">Down from 72h conventional baseline</p>
          </div>

        </div>
      </section>

      {/* Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-textPrimary">Engineered for Rapid Transit Networks</h2>
          <p className="text-xs text-textSecondary">
            Combining multi-modal AI with transit telemetry and crowdsourced passenger observations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-2xl border border-borderCustom shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-textPrimary">Multimodal AI Preprocessing</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Perceptual hashing (dHash/aHash) and 3D color histogram indexing paired with TF-IDF semantic description tokenizers ensure rapid, accurate candidate discovery.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-borderCustom shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-textPrimary">Frictionless Witness Sightings</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Passengers don't have to carry or take custody of items. A quick photo and carriage log allows AI to pinpoint transit movement along the corridor.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-borderCustom shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-textPrimary">Human-In-The-Loop Verification</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              AI calculates evidence scores and generates probable journey timelines. Authorized transit officers make the final claim and release decisions.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
