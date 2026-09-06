import React, { useEffect, useState } from 'react';
import { getWeather, getLocations } from '../utils/storage';
import { AlertCircle, Flame, Star, Bell } from 'lucide-react';

export default function Marquee() {
  const [alerts, setAlerts] = useState([]);
  const [climate, setClimate] = useState({ season: 'winter', weather: 'sunny' });

  const loadAlerts = () => {
    const currentClimate = getWeather();
    setClimate(currentClimate);
    
    const locations = getLocations();
    const pendingLocs = locations.filter(loc => loc.verificationStatus === 'pending');
    
    const generatedAlerts = [];

    // Weather-based alerts
    if (currentClimate.weather === 'rainy') {
      generatedAlerts.push({
        type: 'danger',
        text: 'SAFETY WARNING: Active monsoon downpours make Savandurga and Madhugiri granite surfaces vertical slides. Avoid climbing.'
      });
      generatedAlerts.push({
        type: 'warning',
        text: 'MUD ADVISORY: Makalidurga and Kalavara Durga (Skandagiri) trails are slushy. Heavy grip boots recommended.'
      });
    } else if (currentClimate.weather === 'misty') {
      generatedAlerts.push({
        type: 'info',
        text: 'VISIBILITY ADVISORY: Dense mist on Skandagiri and Savandurga peaks. Start morning climbs with powerful headlamps.'
      });
    } else if (currentClimate.season === 'summer' && currentClimate.weather === 'sunny') {
      generatedAlerts.push({
        type: 'warning',
        text: 'EXCESSIVE HEAT: Dehydration warning. Madhugiri monolith radiates extreme heat during mid-day. Climb before 7:00 AM.'
      });
    }

    // Community alerts
    if (pendingLocs.length > 0) {
      pendingLocs.forEach(loc => {
        generatedAlerts.push({
          type: 'verify',
          text: `COMMUNITY NOTICE: New unlocated spot "${loc.name}" submitted by Pathfinder. Upvotes needed on Explore page to verify.`
        });
      });
    }

    // Default system notices
    generatedAlerts.push({
      type: 'info',
      text: 'EXPLORER NEWS: Chola Mud Fort in Begur is open for history exploration. Clean environment initiative in progress.'
    });
    generatedAlerts.push({
      type: 'info',
      text: 'TIPS: Enable geolocation preferences in Settings to see distance-based safety ratings for your location.'
    });

    setAlerts(generatedAlerts);
  };

  useEffect(() => {
    loadAlerts();

    // Listen to weather changes
    window.addEventListener('weatherChanged', loadAlerts);
    window.addEventListener('storage', loadAlerts); // sync on submissions
    
    return () => {
      window.removeEventListener('weatherChanged', loadAlerts);
      window.removeEventListener('storage', loadAlerts);
    };
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className="relative flex overflow-x-hidden bg-slate-950 text-white border-y border-slate-900 py-1 font-sans text-xs">
      <div className="flex animate-marquee whitespace-nowrap py-1">
        {alerts.concat(alerts).map((alert, index) => {
          return (
            <span key={index} className="mx-8 flex items-center gap-2">
              {alert.type === 'danger' && <AlertCircle className="h-4.5 w-4.5 text-red-500 fill-red-950/20" />}
              {alert.type === 'warning' && <AlertCircle className="h-4.5 w-4.5 text-amber-500 fill-amber-950/20" />}
              {alert.type === 'verify' && <Flame className="h-4.5 w-4.5 text-emerald-400" />}
              {alert.type === 'info' && <Bell className="h-4.5 w-4.5 text-blue-400" />}
              
              <span className={`font-semibold uppercase tracking-wider text-[10px] ${
                alert.type === 'danger' ? 'text-red-400' :
                alert.type === 'warning' ? 'text-amber-400' :
                alert.type === 'verify' ? 'text-emerald-400' : 'text-blue-400'
              }`}>
                [{alert.type}]
              </span>
              
              <span className="text-slate-300 tracking-wide font-medium">{alert.text}</span>
            </span>
          );
        })}
      </div>

      {/* Tailwind Custom Keyframe Styling Injection */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
