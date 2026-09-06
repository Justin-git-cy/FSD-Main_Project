import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addLocation } from '../utils/storage';
import { PlusCircle, ShieldAlert } from 'lucide-react';

export default function AddLocation() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    categoryId: 'cat_trekking',
    difficulty: 'medium',
    description: '',
    lat: '12.9716', // Default Bangalore MG Road area
    lng: '77.5946',
    imageUrl: '',
    bestSeason: 'Winter',
    summerSuitability: '0.8',
    monsoonSuitability: '0.5',
    winterSuitability: '0.9',
    rainyWarning: '',
    sunnyWarning: ''
  });

  const [errors, setErrors] = useState({});

  if (!user) {
    return (
      <div className="bg-slate-50 dark:bg-slate-950 min-h-[70vh] flex flex-col items-center justify-center text-slate-900 dark:text-white px-4 font-sans transition-colors duration-300">
        <ShieldAlert className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-slate-550 dark:text-slate-400 text-xs mb-6 text-center max-w-sm">You must be logged in as an explorer to share a new discovery.</p>
        <Link to="/login" className="bg-adventure-500 hover:bg-adventure-400 transition text-white px-5 py-2 rounded-xl text-sm font-bold shadow-md">
          Sign In
        </Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    
    const latNum = parseFloat(formData.lat);
    if (isNaN(latNum) || latNum < 12.0 || latNum > 14.0) {
      newErrors.lat = 'Latitude must be a valid float in the Bangalore region (e.g. 12.0 to 14.0)';
    }

    const lngNum = parseFloat(formData.lng);
    if (isNaN(lngNum) || lngNum < 77.0 || lngNum > 79.0) {
      newErrors.lng = 'Longitude must be a valid float in the Bangalore region (e.g. 77.0 to 79.0)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const weatherWarnings = {};
    if (formData.rainyWarning.trim()) weatherWarnings.rainy = formData.rainyWarning.trim();
    if (formData.sunnyWarning.trim()) weatherWarnings.sunny = formData.sunnyWarning.trim();

    const newLoc = {
      name: formData.name.trim(),
      categoryId: formData.categoryId,
      difficulty: formData.difficulty,
      description: formData.description.trim(),
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      images: formData.imageUrl.trim() ? [formData.imageUrl.trim()] : [],
      verificationStatus: user.role === 'Pathfinder' ? 'verified' : 'pending',
      createdBy: user.id,
      bestSeason: formData.bestSeason,
      seasonalSuitability: {
        summer: parseFloat(formData.summerSuitability),
        monsoon: parseFloat(formData.monsoonSuitability),
        winter: parseFloat(formData.winterSuitability)
      },
      weatherWarnings,
      rating: 4.0, // default rating for new user submissions
      upvotes: 0
    };

    const added = addLocation(newLoc);
    navigate(`/explore?focus=${added.id}`);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-6 transition-colors">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <PlusCircle className="h-6 w-6 text-adventure-500 dark:text-adventure-400" />
            Share a New Discovery
          </h2>
          <p className="text-slate-550 dark:text-slate-400 text-xs mt-1 leading-relaxed">
            Have you located an unmapped ruins spot, trek, or historic temple outskirts of Bangalore? Fill out the details.
            {user.role === 'Pathfinder' 
              ? ' Since you are a Pathfinder, your submission will be auto-verified!' 
              : ' Your coordinates will be pinned as "Pending" until upvoted by the community.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1: Core Details */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">Core Details</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Sight Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Savandurga Monolith"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-950 dark:text-white focus:outline-none focus:border-adventure-500 transition-colors"
                />
                {errors.name && <span className="text-[10px] text-red-400 mt-1 block">{errors.name}</span>}
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Category</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-adventure-500 cursor-pointer transition-colors"
                >
                  <option value="cat_trekking">Trekking & Hills</option>
                  <option value="cat_abandoned">Abandoned & Ruins</option>
                  <option value="cat_historic">Historic Sights</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Give details about the approach, safety warnings, and what explorers should watch out for..."
                rows="4"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-955 dark:text-white focus:outline-none focus:border-adventure-500 resize-none transition-colors"
              />
              {errors.description && <span className="text-[10px] text-red-400 mt-1 block">{errors.description}</span>}
            </div>
          </div>

          {/* Section 2: Coordinates & Images */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">Coordinates & Images</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Latitude</label>
                <input
                  type="text"
                  name="lat"
                  value={formData.lat}
                  onChange={handleChange}
                  placeholder="e.g. 12.9716"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-955 dark:text-white focus:outline-none focus:border-adventure-500 font-mono transition-colors"
                />
                {errors.lat && <span className="text-[10px] text-red-400 mt-1 block">{errors.lat}</span>}
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Longitude</label>
                <input
                  type="text"
                  name="lng"
                  value={formData.lng}
                  onChange={handleChange}
                  placeholder="e.g. 77.5946"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-955 dark:text-white focus:outline-none focus:border-adventure-500 font-mono transition-colors"
                />
                {errors.lng && <span className="text-[10px] text-red-400 mt-1 block">{errors.lng}</span>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Difficulty</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-adventure-500 cursor-pointer transition-colors"
                >
                  <option value="easy">Easy / Hike</option>
                  <option value="medium">Medium / Trek</option>
                  <option value="hard">Hard / Climb</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Image URL (Optional)</label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-955 dark:text-white focus:outline-none focus:border-adventure-500 transition-colors"
              />
            </div>
          </div>

          {/* Section 3: Seasonal suitability & warnings */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">Seasonal Suitability (0.0 to 1.0)</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Best Season</label>
                <select
                  name="bestSeason"
                  value={formData.bestSeason}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-955 dark:text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-adventure-500 cursor-pointer transition-colors"
                >
                  <option value="Winter">Winter</option>
                  <option value="Monsoon">Monsoon</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Summer Score</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  name="summerSuitability"
                  value={formData.summerSuitability}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-955 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Monsoon Score</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  name="monsoonSuitability"
                  value={formData.monsoonSuitability}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-955 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Winter Score</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  name="winterSuitability"
                  value={formData.winterSuitability}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-955 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Rainy Weather Warning</label>
                <input
                  type="text"
                  name="rainyWarning"
                  value={formData.rainyWarning}
                  onChange={handleChange}
                  placeholder="e.g. CRITICAL: Granite hill gets slippery."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-955 dark:text-white focus:outline-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-300 mb-1.5">Sunny Weather Advisory</label>
                <input
                  type="text"
                  name="sunnyWarning"
                  value={formData.sunnyWarning}
                  onChange={handleChange}
                  placeholder="e.g. CAUTION: Bring 3L water."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-955 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/explore"
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            >
              Cancel
            </Link>
            
            <button
              type="submit"
              className="bg-adventure-500 hover:bg-adventure-400 transition text-white px-6 py-2.5 text-xs rounded-xl font-bold shadow-md shadow-adventure-900/30"
            >
              Broadcast Coordinate Node
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
