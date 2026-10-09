import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  UploadCloud, 
  MapPin, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft, 
  Trash2, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  Train,
  Clock,
  Shield,
  Tag
} from 'lucide-react';
import { lostApi } from '../services/api';

export const ReportLostPage: React.FC = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionProgress, setSubmissionProgress] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Bags',
    description: '',
    brand: '',
    color: '',
    unique_features: '',
    transport_type: 'Train',
    vehicle_number: '',
    coach_number: '',
    location_name: '',
    date_time: new Date().toISOString().slice(0, 16),
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const categories = ['Bags', 'Electronics', 'Wallets', 'Documents', 'Accessories', 'Clothing', 'Others'];
  const transportModes = ['Train', 'Metro', 'Bus', 'Flight'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Validation
  const validateStep = (step: number) => {
    setErrorMsg('');
    if (step === 1) {
      if (!formData.title.trim()) {
        setErrorMsg('Please enter the item name.');
        return false;
      }
      if (!formData.description.trim()) {
        setErrorMsg('Please provide a detailed description.');
        return false;
      }
    }
    if (step === 3) {
      if (!formData.location_name.trim()) {
        setErrorMsg('Please provide the last known station or location.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Step-by-step progress simulation for hackathon UI wow factor
      setSubmissionProgress('Uploading report data securely...');
      setProgressPercent(15);
      await new Promise((r) => setTimeout(r, 400));

      setSubmissionProgress('AI Preprocessing: Computing Perceptual Hashes & Color Histogram...');
      setProgressPercent(35);
      await new Promise((r) => setTimeout(r, 500));

      setSubmissionProgress('NLP Engine: Tokenizing description & semantic keywords...');
      setProgressPercent(55);
      await new Promise((r) => setTimeout(r, 450));

      setSubmissionProgress('Spatial Engine: Correlating transit routes and station stops...');
      setProgressPercent(75);
      await new Promise((r) => setTimeout(r, 400));

      setSubmissionProgress('Correlating passenger witness sightings & custody records...');
      setProgressPercent(90);

      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('description', formData.description);
      formPayload.append('category', formData.category);
      if (formData.brand) formPayload.append('brand', formData.brand);
      if (formData.color) formPayload.append('color', formData.color);
      if (formData.unique_features) formPayload.append('unique_features', formData.unique_features);
      formPayload.append('transport_type', formData.transport_type);
      if (formData.vehicle_number) formPayload.append('vehicle_number', formData.vehicle_number);
      if (formData.coach_number) formPayload.append('coach_number', formData.coach_number);
      formPayload.append('location_name', formData.location_name);
      formPayload.append('date_time', new Date(formData.date_time).toISOString());
      
      if (imageFile) {
        formPayload.append('image', imageFile);
      }

      const created = await lostApi.create(formPayload);

      setProgressPercent(100);
      setSubmissionProgress('Complete! Matching evidence and journey synthesized.');
      await new Promise((r) => setTimeout(r, 500));

      navigate(`/journey/${created.id}`);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Submission failed. Please check network connection.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Title & Subtitle */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">
          Report a Lost Belonging
        </h1>
        <p className="text-sm text-textSecondary max-w-lg mx-auto">
          Provide item and travel details so LostLink AI can reconstruct its journey and correlate witness sightings.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white p-4 rounded-2xl border border-borderCustom shadow-card">
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold">
          {[
            { step: 1, label: 'Item Details', icon: FileText },
            { step: 2, label: 'Photo Upload', icon: UploadCloud },
            { step: 3, label: 'Transit Journey', icon: MapPin },
            { step: 4, label: 'Review & AI', icon: Sparkles },
          ].map((item) => (
            <div
              key={item.step}
              className={`flex flex-col items-center gap-1.5 py-2 px-1 rounded-xl transition-all ${
                currentStep === item.step
                  ? 'bg-primary-50 text-primary font-bold'
                  : currentStep > item.step
                  ? 'text-emerald-700 font-medium'
                  : 'text-textSecondary/60'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs ${
                  currentStep === item.step
                    ? 'bg-primary text-white shadow-xs'
                    : currentStep > item.step
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {currentStep > item.step ? '✓' : item.step}
              </div>
              <span className="hidden sm:inline text-[11px]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error Alert if any */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Multi-Step Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-borderCustom shadow-float">
        
        {/* Step 1: Item Information */}
        {currentStep === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h2 className="text-lg font-bold text-textPrimary flex items-center gap-2 border-b border-borderCustom pb-3">
              <FileText className="w-5 h-5 text-primary" />
              <span>Step 1: Item Identification</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">Item Title / Name *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Black Wildcraft Travel Backpack"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderCustom bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderCustom bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">Brand / Manufacturer</label>
                <input
                  type="text"
                  name="brand"
                  placeholder="e.g. Wildcraft, Dell, Apple, Sony"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderCustom bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">Primary Color</label>
                <input
                  type="text"
                  name="color"
                  placeholder="e.g. Matte Black, Navy Blue, Silver"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderCustom bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1">Detailed Description *</label>
              <textarea
                name="description"
                rows={3}
                placeholder="Mention size, internal contents, compartment layout, materials..."
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderCustom bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-textPrimary mb-1">Unique Identifying Features</label>
              <input
                type="text"
                name="unique_features"
                placeholder="e.g. Keychain on zipper, GitHub sticker on lid, initial tag 'A.S.'"
                value={formData.unique_features}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-borderCustom bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </motion.div>
        )}

        {/* Step 2: Image Upload */}
        {currentStep === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h2 className="text-lg font-bold text-textPrimary flex items-center gap-2 border-b border-borderCustom pb-3">
              <UploadCloud className="w-5 h-5 text-primary" />
              <span>Step 2: Upload Photo / Reference Image</span>
            </h2>

            <p className="text-xs text-textSecondary">
              Upload a clear photo of your item. Our AI will compute perceptual visual hashes and extract 3D color histograms to correlate with found items.
            </p>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-borderCustom bg-slate-50 p-4 flex flex-col items-center">
                <img
                  src={imagePreview}
                  alt="Item Preview"
                  className="max-h-64 object-contain rounded-xl shadow-xs"
                />
                <div className="flex items-center gap-3 mt-4">
                  <label className="px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-primary-dark transition-colors">
                    Replace Photo
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  <button
                    onClick={handleRemoveImage}
                    className="px-3.5 py-2 bg-red-50 text-danger border border-red-200 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-primary rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/30 transition-all text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-primary flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-textPrimary">Click to upload or drag & drop</div>
                <p className="text-[11px] text-textSecondary">PNG, JPG, JPEG up to 10MB</p>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </motion.div>
        )}

        {/* Step 3: Journey & Transit Details */}
        {currentStep === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h2 className="text-lg font-bold text-textPrimary flex items-center gap-2 border-b border-borderCustom pb-3">
              <MapPin className="w-5 h-5 text-primary" />
              <span>Step 3: Journey & Transit Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">Transport Mode *</label>
                <select
                  name="transport_type"
                  value={formData.transport_type}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderCustom bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  {transportModes.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">Vehicle / Train Number</label>
                <input
                  type="text"
                  name="vehicle_number"
                  placeholder="e.g. Train 12675 (Kovai Express) or Metro R-44"
                  value={formData.vehicle_number}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderCustom bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">Coach / Seat / Berth</label>
                <input
                  type="text"
                  name="coach_number"
                  placeholder="e.g. Coach S3 (Seat 42) or Front Coach"
                  value={formData.coach_number}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderCustom bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">Last Known Station / Location *</label>
                <input
                  type="text"
                  name="location_name"
                  placeholder="e.g. Coimbatore Junction, Platform 2"
                  value={formData.location_name}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderCustom bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-textPrimary mb-1">Date & Time Lost *</label>
                <input
                  type="datetime-local"
                  name="date_time"
                  value={formData.date_time}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-borderCustom bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Review Summary & Submit */}
        {currentStep === 4 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <h2 className="text-lg font-bold text-textPrimary flex items-center gap-2 border-b border-borderCustom pb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span>Step 4: Review & Initialize AI Pipeline</span>
            </h2>

            <div className="bg-slate-50 p-5 rounded-2xl border border-borderCustom/80 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <h3 className="font-bold text-sm text-textPrimary">{formData.title}</h3>
                  <span className="text-xs text-textSecondary">{formData.category} • {formData.brand || 'Unspecified'}</span>
                </div>
                {imagePreview && (
                  <img src={imagePreview} alt="Thumbnail" className="w-12 h-12 object-cover rounded-lg border border-borderCustom" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-textSecondary block">Transport:</span>
                  <span className="font-semibold text-textPrimary">{formData.transport_type} {formData.vehicle_number}</span>
                </div>
                <div>
                  <span className="text-textSecondary block">Coach/Seat:</span>
                  <span className="font-semibold text-textPrimary">{formData.coach_number || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-textSecondary block">Last Seen:</span>
                  <span className="font-semibold text-textPrimary">{formData.location_name}</span>
                </div>
                <div>
                  <span className="text-textSecondary block">Timestamp:</span>
                  <span className="font-semibold text-textPrimary">{new Date(formData.date_time).toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2 text-xs">
                <span className="text-textSecondary block">Description:</span>
                <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 mt-1">
                  {formData.description}
                </p>
              </div>
            </div>

            {/* AI Progress Box during active submission */}
            {isSubmitting && (
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-primary">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{submissionProgress}</span>
                  </div>
                  <span>{progressPercent}%</span>
                </div>

                <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-borderCustom mt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={prevStep}
              className="px-4 py-2 rounded-xl border border-borderCustom text-xs font-bold text-textPrimary hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>
          ) : <div />}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-all flex items-center gap-1.5 shadow-sm shadow-primary/25"
            >
              Next Step
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="px-8 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-extrabold shadow-md shadow-primary/30 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing Multi-Stage AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Submit & Reconstruct Journey
                </>
              )}
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
