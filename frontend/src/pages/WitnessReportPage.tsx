import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Eye, 
  UploadCloud, 
  MapPin, 
  Train, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Trash2,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { witnessApi } from '../services/api';

export const WitnessReportPage: React.FC = () => {
  const navigate = useNavigate();

  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [transportType, setTransportType] = useState('Train');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [coachNumber, setCoachNumber] = useState('');
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [notes, setNotes] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [linkedId, setLinkedId] = useState<number | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !locationName.trim()) {
      setErrorMsg('Please provide what you saw and where you saw it.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('location_name', locationName);
      formData.append('transport_type', transportType);
      if (vehicleNumber) formData.append('vehicle_number', vehicleNumber);
      if (coachNumber) formData.append('coach_number', coachNumber);
      formData.append('date_time', new Date(dateTime).toISOString());
      if (notes) formData.append('notes', notes);
      if (imageFile) formData.append('image', imageFile);

      const res = await witnessApi.create(formData);
      setLinkedId(res.linked_lost_item_id || 1);
      setSubmittedSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to submit witness report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
          <Eye className="w-3.5 h-3.5 text-emerald-600" />
          <span>Crowdsourced Transit Sighting</span>
        </div>
        
        <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">
          "Your observation can help complete an item's journey."
        </h1>
        
        <p className="text-sm text-textSecondary max-w-xl mx-auto leading-relaxed">
          Witnesses do <span className="font-bold text-textPrimary">not</span> need to recover or hold onto items. Simply report what and where you saw it so LostLink AI can complete the spatial-temporal evidence chain.
        </p>
      </div>

      {submittedSuccess ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl border border-emerald-200 shadow-float text-center space-y-5"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-textPrimary">Observation Connected to Transit Journey!</h2>
            <p className="text-xs sm:text-sm text-textSecondary max-w-md mx-auto">
              Your observation has been indexed as high-priority evidence and correlated with an active lost item claim.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              onClick={() => navigate(`/journey/${linkedId || 1}`)}
              className="px-6 py-3 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all flex items-center gap-2 shadow-md shadow-primary/25"
            >
              <span>View Reconstructed Journey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSubmittedSuccess(false);
                setDescription('');
                setLocationName('');
                setImageFile(null);
                setImagePreview(null);
              }}
              className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-textPrimary text-xs font-bold transition-all"
            >
              Report Another Sighting
            </button>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-borderCustom shadow-float space-y-6">
          
          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-textPrimary mb-1">
              What did you observe? *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Spotted an unattended black Wildcraft backpack on the luggage rack near berth 42..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-borderCustom bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              required
            />
          </div>

          {/* Photo upload */}
          <div>
            <label className="block text-xs font-bold text-textPrimary mb-1">
              Photo / Snapshot (Optional but highly recommended)
            </label>
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-borderCustom bg-slate-50 p-3 flex items-center justify-between">
                <img src={imagePreview} alt="Sighting Preview" className="h-24 w-32 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-50 text-danger border border-red-200 text-xs font-bold hover:bg-red-100 flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-all text-center space-y-1">
                <UploadCloud className="w-6 h-6 text-emerald-600" />
                <span className="text-xs font-bold text-textPrimary">Upload photo of unattended item</span>
                <span className="text-[10px] text-textSecondary">PNG, JPG up to 10MB</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Location & Transit fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1">Location / Station *</label>
              <input
                type="text"
                placeholder="e.g. Tiruppur Railway Station corridor"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderCustom bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1">Transport Mode</label>
              <select
                value={transportType}
                onChange={(e) => setTransportType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderCustom bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="Train">Train</option>
                <option value="Metro">Metro</option>
                <option value="Bus">Bus</option>
                <option value="Flight">Flight</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1">Vehicle / Train Number</label>
              <input
                type="text"
                placeholder="e.g. Train 12675 (Kovai Express)"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderCustom bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1">Coach / Seat / Carriage</label>
              <input
                type="text"
                placeholder="e.g. Coach S3 (Near Berth 42)"
                value={coachNumber}
                onChange={(e) => setCoachNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderCustom bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-textPrimary mb-1">Observation Time *</label>
              <input
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderCustom bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-textPrimary mb-1">Additional Context / Notes</label>
            <input
              type="text"
              placeholder="e.g. Looked undisturbed; passenger moved towards pantry car..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-borderCustom bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Correlating Observation with Active Claims...</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Submit Sighting to Journey Evidence Chain</span>
              </>
            )}
          </button>

        </form>
      )}

    </div>
  );
};
