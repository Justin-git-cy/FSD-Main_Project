import React from 'react';
import { Compass, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 px-4 sm:px-6 lg:px-8 mt-auto font-sans">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Logo & Vision */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-adventure-500 text-white font-bold text-base shadow">
                VP
              </div>
              <span className="font-extrabold text-lg text-white">ViewPoint</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Mapping the lost, the historic, and the untouched paths around Bangalore. Designed for adventure explorers who seek the road less traveled.
            </p>
          </div>

          {/* Guidelines */}
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-adventure-400" />
              Safety & Ethics
            </h3>
            <ul className="text-xs space-y-2 text-slate-400 leading-relaxed">
              <li>• Always carry enough hydration for wilderness trails.</li>
              <li>• Respect historical ruins: Pack in, pack out.</li>
              <li>• Leave no trace behind. No graffiti or littering.</li>
              <li>• Never enter fragile abandoned structures alone.</li>
            </ul>
          </div>

          {/* Technical Info */}
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-adventure-400" />
              Navigation Engine
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              Features a custom proximity and seasonal weather weighting engine that matches active climates with trail conditions. Set coordinates in settings to simulate navigation.
            </p>
          </div>

        </div>

        {/* Divider */}
        <hr className="border-slate-800 my-6" />

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <span>© {new Date().getFullYear()} ViewPoint Bangalore. Built for FSD Course.</span>
          <span className="flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> by Adventure Seekers.
          </span>
        </div>
      </div>
    </footer>
  );
}
