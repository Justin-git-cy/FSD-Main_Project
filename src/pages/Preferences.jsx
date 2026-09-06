import React, { useState, useEffect } from 'react';
import { getPreferences, savePreferences, getActiveUser } from '../utils/storage';
import { Sliders, CheckCircle, Compass, Star, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Preferences() {
  const { user } = getActiveUser() ? { user: getActiveUser() } : { user: null };
  const navigate = useNavigate();

  const [categories, setCategories] = useState({
    cat_trekking: true,
    cat_abandoned: true,
    cat_historic: true
  });
  const [difficulty, setDifficulty] = useState('medium');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const prefs = getPreferences();
    if (prefs) {
      setDifficulty(prefs.preferredDifficulty || 'medium');
      if (prefs.preferredCategories) {
        const catMap = { cat_trekking: false, cat_abandoned: false, cat_historic: false };
        prefs.preferredCategories.forEach(catId => {
          catMap[catId] = true;
        });
        setCategories(catMap);
      }
    }
  }, []);

  const handleCategoryToggle = (catId) => {
    setCategories({
      ...categories,
      [catId]: !categories[catId]
    });
  };

  const handleSave = (e) => {
    e.preventDefault();

    const preferredCategories = Object.keys(categories).filter(key => categories[key]);

    if (preferredCategories.length === 0) {
      alert('Please select at least one preferred category.');
      return;
    }

    const currentPrefs = getPreferences();
    const updated = {
      ...currentPrefs,
      preferredCategories,
      preferredDifficulty: difficulty
    };

    savePreferences(updated);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      navigate('/recommendations');
    }, 1500);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl space-y-6 transition-colors">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-adventure-500/10 rounded-2xl flex items-center justify-center text-adventure-500 dark:text-adventure-400">
            <Sliders className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Explorer Taste Preferences</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customize your profiles interests to calibrate the seasonal safety scoring engine.</p>
          </div>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle className="h-4.5 w-4.5 flex-shrink-0" />
            <span>Preferences saved! Calibrating recommendation feed...</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section 1: Categories selection */}
          <div className="space-y-4">
            <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              Preferred Sight Categories
            </span>
            
            <div className="space-y-3">
              {/* Trekking */}
              <button
                type="button"
                onClick={() => handleCategoryToggle('cat_trekking')}
                className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition ${
                  categories.cat_trekking 
                    ? 'bg-adventure-500/10 border-adventure-500 text-slate-900 dark:text-white font-semibold shadow-sm' 
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-800 text-slate-550 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${categories.cat_trekking ? 'bg-adventure-500 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
                    <Compass className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block font-bold text-xs">Trekking & Hills</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Hiking, peaks, monolith climbs, and wilderness routes.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={categories.cat_trekking}
                  readOnly
                  className="rounded border-slate-300 dark:border-slate-800 text-adventure-500 focus:ring-adventure-500 bg-slate-50 dark:bg-slate-950 h-4 w-4"
                />
              </button>

              {/* Abandoned */}
              <button
                type="button"
                onClick={() => handleCategoryToggle('cat_abandoned')}
                className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition ${
                  categories.cat_abandoned 
                    ? 'bg-adventure-500/10 border-adventure-500 text-slate-900 dark:text-white font-semibold shadow-sm' 
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-800 text-slate-550 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${categories.cat_abandoned ? 'bg-adventure-500 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
                    <Star className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block font-bold text-xs">Abandoned & Ruins</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Old industrial clay factories, brick kilns, and unused depots.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={categories.cat_abandoned}
                  readOnly
                  className="rounded border-slate-300 dark:border-slate-800 text-adventure-500 focus:ring-adventure-500 bg-slate-50 dark:bg-slate-950 h-4 w-4"
                />
              </button>

              {/* Historic */}
              <button
                type="button"
                onClick={() => handleCategoryToggle('cat_historic')}
                className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition ${
                  categories.cat_historic 
                    ? 'bg-adventure-500/10 border-adventure-500 text-slate-900 dark:text-white font-semibold shadow-sm' 
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-800 text-slate-550 dark:text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${categories.cat_historic ? 'bg-adventure-500 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}>
                    <Award className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block font-bold text-xs">Historic Monuments</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Mud forts, cave temples, and stepwells dating back to Cholas.</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={categories.cat_historic}
                  readOnly
                  className="rounded border-slate-300 dark:border-slate-800 text-adventure-500 focus:ring-adventure-500 bg-slate-50 dark:bg-slate-950 h-4 w-4"
                />
              </button>
            </div>
          </div>

          {/* Section 2: Difficulty Selection */}
          <div className="space-y-4">
            <span className="block text-xs font-extrabold uppercase tracking-wider text-slate-450 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              Preferred Adventure Difficulty
            </span>
            
            <div className="grid grid-cols-3 gap-3">
              {['easy', 'medium', 'hard'].map((level) => {
                const isActive = difficulty === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`py-3.5 rounded-xl border font-bold capitalize text-xs transition ${
                      isActive 
                        ? 'bg-adventure-500 text-white border-adventure-500 shadow-md shadow-adventure-900/20' 
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
            <button
              type="submit"
              className="w-full bg-adventure-500 hover:bg-adventure-400 transition text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-adventure-900/30"
            >
              <span>Save & Re-Score Recommendations</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
