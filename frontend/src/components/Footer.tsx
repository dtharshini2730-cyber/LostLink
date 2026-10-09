import React from 'react';
import { Navigation, ShieldCheck, Heart, Sparkles, Cpu, Route } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-borderCustom mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                <Navigation className="w-4 h-4 -rotate-45" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-textPrimary">
                LOSTLINK
              </span>
            </div>
            <p className="text-xs text-textSecondary leading-relaxed">
              AI-Powered Lost Item Journey Reconstruction for Public Transportation networks. Reconnecting passengers with their belongings through multi-factor witness and route intelligence.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
              <Cpu className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Pipeline Online (Perceptual + TF-IDF)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider mb-3">Passenger & Public</h4>
            <ul className="space-y-2 text-xs text-textSecondary">
              <li><Link to="/report-lost" className="hover:text-primary transition-colors">Report Lost Item</Link></li>
              <li><Link to="/report-witness" className="hover:text-primary transition-colors">Submit Witness Sighting</Link></li>
              <li><Link to="/journey/1" className="hover:text-primary transition-colors">Live Journey Tracker</Link></li>
              <li><Link to="/matches" className="hover:text-primary transition-colors">AI Match Feed</Link></li>
            </ul>
          </div>

          {/* Staff & Transit Authorities */}
          <div>
            <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider mb-3">Transit Authority</h4>
            <ul className="space-y-2 text-xs text-textSecondary">
              <li><Link to="/staff/dashboard" className="hover:text-primary transition-colors">Operations Command Dashboard</Link></li>
              <li><Link to="/staff/verification" className="hover:text-primary transition-colors">Official Match Verification</Link></li>
              <li><Link to="/found-items" className="hover:text-primary transition-colors">Custody Inventory</Link></li>
              <li><Link to="/report-found" className="hover:text-primary transition-colors">Log Found Belonging</Link></li>
            </ul>
          </div>

          {/* Hackathon Architecture Badge */}
          <div className="bg-slate-50 p-4 rounded-xl border border-borderCustom space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-textPrimary">
              <Route className="w-4 h-4 text-primary" />
              <span>College Hackathon Architecture</span>
            </div>
            <p className="text-[11px] text-textSecondary leading-normal">
              Built with React, Vite, TypeScript, Tailwind CSS, Leaflet, FastAPI, and SQLAlchemy. Deterministic multi-factor AI scoring ensures transparency and human-in-the-loop verification.
            </p>
            <div className="text-[10px] text-textSecondary font-mono pt-1">
              LOSTLINK Core v1.0 • Demo Ready
            </div>
          </div>

        </div>

        <div className="border-t border-borderCustom/60 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-textSecondary">
          <p>© 2026 LostLink Public Transit Systems. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Empowering public transit recovery with explainable AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
