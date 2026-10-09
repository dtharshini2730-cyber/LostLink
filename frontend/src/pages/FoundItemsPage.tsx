import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  PackageCheck, 
  Plus, 
  Search, 
  MapPin, 
  Train, 
  Clock, 
  Building, 
  CheckCircle2, 
  UploadCloud, 
  Trash2, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { foundApi } from '../services/api';
import { FoundItem } from '../types';

export const FoundItemsPage: React.FC = () => {
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form State for logging found item
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Bags');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [locationName, setLocationName] = useState('');
  const [transportType, setTransportType] = useState('Train');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [coachNumber, setCoachNumber] = useState('');
  const [depotStation, setDepotStation] = useState('');
  const [foundTime, setFoundTime] = useState(new Date().toISOString().slice(0, 16));

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchFoundItems = async () => {
    setIsLoading(true);
    try {
      const data = await foundApi.getAll();
      setFoundItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFoundItems();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationName.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      if (brand) formData.append('brand', brand);
      if (color) formData.append('color', color);
      formData.append('location_name', locationName);
      formData.append('transport_type', transportType);
      if (vehicleNumber) formData.append('vehicle_number', vehicleNumber);
      if (coachNumber) formData.append('coach_number', coachNumber);
      if (depotStation) formData.append('depot_station', depotStation);
      formData.append('found_time', new Date(foundTime).toISOString());
      if (imageFile) formData.append('image', imageFile);

      await foundApi.create(formData);
      setShowLogModal(false);
      // Reset
      setTitle('');
      setDescription('');
      setLocationName('');
      setImageFile(null);
      setImagePreview(null);
      fetchFoundItems();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to log found item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = foundItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.location_name.toLowerCase().includes(q) ||
      (item.depot_station && item.depot_station.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
              Custody Vault
            </span>
            <span className="text-xs text-textSecondary font-semibold">
              {foundItems.length} secured belongings
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight mt-1">
            Transit Custody & Found Inventory
          </h1>
          <p className="text-xs text-textSecondary">
            Verified items currently held in official custody across railway stations, metro depots, and transit customer centers.
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md shadow-primary/25 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Found Belonging (Staff)</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-borderCustom shadow-card">
        <div className="relative">
          <Search className="w-4 h-4 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search custody inventory by title, description, or depot location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-borderCustom rounded-xl text-xs text-textPrimary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-semibold text-textSecondary">Loading custody database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-borderCustom text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-textPrimary">No items matching your criteria</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-borderCustom shadow-card hover:shadow-float transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 bg-slate-100 border-b border-borderCustom overflow-hidden">
                  <img
                    src={item.image_path?.startsWith('/') ? `http://localhost:8000${item.image_path}` : item.image_path || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                    {item.status}
                  </div>
                  <div className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-md bg-white/90 backdrop-blur-md text-textPrimary text-[11px] font-bold shadow-xs">
                    {item.category}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-textPrimary leading-tight">
                    {item.title}
                  </h3>
                  
                  <div className="space-y-1 text-xs text-textSecondary">
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{item.location_name}</span>
                    </p>
                    {item.depot_station && (
                      <p className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Building className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span>{item.depot_station}</span>
                      </p>
                    )}
                    <p className="flex items-center gap-1.5 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Found: {new Date(item.found_time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 line-clamp-3">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-borderCustom flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-textSecondary">ID: FND-00{item.id}</span>
                <span className="font-bold text-primary flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  In Custody
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Log Found Item Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white max-w-xl w-full rounded-3xl border border-borderCustom shadow-float p-6 sm:p-8 space-y-5 my-8"
          >
            <div className="flex items-center justify-between border-b border-borderCustom pb-3">
              <div className="flex items-center gap-2 font-bold text-base text-textPrimary">
                <PackageCheck className="w-5 h-5 text-primary" />
                <span>Log Recovered Found Item (Staff)</span>
              </div>
              <button onClick={() => setShowLogModal(false)} className="text-textSecondary hover:text-textPrimary text-xs font-bold px-2 py-1">✕</button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-textPrimary mb-1">Item Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Wildcraft Backpack"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-borderCustom text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textPrimary mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-borderCustom text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    {['Bags', 'Electronics', 'Wallets', 'Documents', 'Accessories', 'Clothing', 'Others'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">Description *</label>
                <textarea
                  rows={2}
                  placeholder="Physical description, contents..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-borderCustom text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  required
                />
              </div>

              {/* Photo */}
              <div>
                <label className="block text-xs font-bold text-textPrimary mb-1">Photo</label>
                {imagePreview ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-borderCustom">
                    <img src={imagePreview} alt="Preview" className="h-16 w-20 object-cover rounded-lg" />
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="px-2.5 py-1 text-xs text-danger font-bold">Remove</button>
                  </div>
                ) : (
                  <label className="border border-dashed border-slate-300 hover:border-primary rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer bg-slate-50/50 text-xs text-textSecondary">
                    <UploadCloud className="w-4 h-4 text-primary" />
                    <span>Upload photo for AI visual hash</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-textPrimary mb-1">Found Location / Station *</label>
                  <input
                    type="text"
                    placeholder="e.g. Erode Junction"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-borderCustom text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textPrimary mb-1">Depot / Custody Office</label>
                  <input
                    type="text"
                    placeholder="e.g. Erode RPF Lost & Found Desk"
                    value={depotStation}
                    onChange={(e) => setDepotStation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-borderCustom text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textPrimary mb-1">Transport Vehicle (If on-board)</label>
                  <input
                    type="text"
                    placeholder="e.g. Train 12675 (Kovai Express)"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-borderCustom text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-textPrimary mb-1">Coach / Carriage</label>
                  <input
                    type="text"
                    placeholder="e.g. Coach S3 (Berth 42)"
                    value={coachNumber}
                    onChange={(e) => setCoachNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-borderCustom text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PackageCheck className="w-4 h-4" />}
                <span>Log to Custody & Run AI Match Correlator</span>
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};
