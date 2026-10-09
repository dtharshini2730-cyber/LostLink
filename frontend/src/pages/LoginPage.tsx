import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Navigation, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, quickSwitchRole } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('PASSENGER');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (isRegister) {
        await register({ name, email, password, role, phone });
      } else {
        await login(email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Authentication failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoPreset = async (demoRole: 'PASSENGER' | 'WITNESS' | 'STAFF') => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      await quickSwitchRole(demoRole);
      navigate('/dashboard');
    } catch (e) {
      setErrorMsg('Demo login failed. Make sure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-md shadow-primary/25">
            <Navigation className="w-6 h-6 -rotate-45" />
          </div>
          <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">
            {isRegister ? 'Create LostLink Account' : 'Welcome to LostLink'}
          </h1>
          <p className="text-xs text-textSecondary">
            Public transit AI journey reconstruction & custody network
          </p>
        </div>

        {/* Demo 1-Click Login Box for Judges */}
        <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/90 space-y-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Judge & Demo 1-Click Sign In:</span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDemoPreset('PASSENGER')}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-amber-200 text-[11px] font-bold text-slate-800 hover:bg-amber-100/50 shadow-xs"
            >
              Passenger
            </button>
            <button
              type="button"
              onClick={() => handleDemoPreset('WITNESS')}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-amber-200 text-[11px] font-bold text-emerald-800 hover:bg-amber-100/50 shadow-xs"
            >
              Witness
            </button>
            <button
              type="button"
              onClick={() => handleDemoPreset('STAFF')}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-amber-200 text-[11px] font-bold text-purple-800 hover:bg-amber-100/50 shadow-xs"
            >
              Staff
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-borderCustom shadow-float space-y-5">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-danger text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-bold text-textPrimary mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Arjun Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-borderCustom focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-textPrimary mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-borderCustom focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="PASSENGER">Passenger</option>
                    <option value="WITNESS">Witness</option>
                    <option value="STAFF">Transit Staff</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="passenger@lostlink.demo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-borderCustom focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-borderCustom focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-extrabold text-xs shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-borderCustom">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
              }}
              className="text-xs text-primary font-bold hover:underline"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
