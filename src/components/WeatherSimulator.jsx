import React, { useState, useEffect } from 'react';
import { getWeather, setWeather } from '../utils/storage';
import { CloudRain, Sun, Cloud, CloudFog, Thermometer } from 'lucide-react';

const TEMPERATURES = {
  summer: { sunny: '34°C', rainy: '27°C', overcast: '29°C', misty: '26°C' },
  monsoon: { sunny: '28°C', rainy: '22°C', overcast: '24°C', misty: '23°C' },
  winter: { sunny: '25°C', rainy: '21°C', overcast: '22°C', misty: '16°C' }
};

export default function WeatherSimulator() {
  const [climate, setClimate] = useState({ season: 'winter', weather: 'sunny', temperature: '24°C' });

  useEffect(() => {
    setClimate(getWeather());

    const handleWeatherChange = () => {
      setClimate(getWeather());
    };

    window.addEventListener('weatherChanged', handleWeatherChange);
    return () => window.removeEventListener('weatherChanged', handleWeatherChange);
  }, []);

  const handleUpdate = (updates) => {
    const nextSeason = updates.season || climate.season;
    const nextWeather = updates.weather || climate.weather;
    const nextTemp = TEMPERATURES[nextSeason][nextWeather] || '24°C';

    const newClimate = {
      season: nextSeason,
      weather: nextWeather,
      temperature: nextTemp
    };

    setClimate(newClimate);
    setWeather(newClimate);
  };

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case 'rainy': return <CloudRain className="h-3 w-3 text-blue-400" />;
      case 'sunny': return <Sun className="h-3 w-3 text-amber-400" />;
      case 'overcast': return <Cloud className="h-3 w-3 text-slate-300" />;
      case 'misty': return <CloudFog className="h-3 w-3 text-teal-300" />;
      default: return <Sun className="h-3 w-3" />;
    }
  };

  return (
    <div className="bg-slate-800 border-t border-slate-700 py-1.5 px-4 text-xs">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-2 text-slate-300">
        
        {/* Left Side: Current State */}
        <div className="flex items-center gap-2 font-medium">
          <span className="text-slate-400 uppercase text-[10px] tracking-wider font-bold">Simulator:</span>
          <div className="flex items-center gap-1.5 bg-slate-900/60 rounded px-2 py-0.5 border border-slate-700">
            <span className="capitalize font-semibold text-white">{climate.season}</span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 capitalize">
              {getWeatherIcon(climate.weather)}
              {climate.weather}
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center text-adventure-300 font-mono">
              <Thermometer className="h-3.5 w-3.5 mr-0.5 text-adventure-400" />
              {climate.temperature}
            </span>
          </div>
        </div>

        {/* Right Side: Selectors */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
          {/* Season Select */}
          <div className="flex items-center gap-1">
            <span>Season:</span>
            <select
              value={climate.season}
              onChange={(e) => handleUpdate({ season: e.target.value })}
              className="bg-slate-900 text-white rounded px-2 py-0.5 border border-slate-700 text-xs focus:outline-none focus:border-adventure-500 cursor-pointer"
            >
              <option value="winter">Winter (Nov - Feb)</option>
              <option value="summer">Summer (Mar - May)</option>
              <option value="monsoon">Monsoon (Jun - Oct)</option>
            </select>
          </div>

          {/* Weather Condition Select */}
          <div className="flex items-center gap-1">
            <span>Weather:</span>
            <select
              value={climate.weather}
              onChange={(e) => handleUpdate({ weather: e.target.value })}
              className="bg-slate-900 text-white rounded px-2 py-0.5 border border-slate-700 text-xs focus:outline-none focus:border-adventure-500 cursor-pointer"
            >
              <option value="sunny">Sunny / Clear</option>
              <option value="rainy">Rainy / Shower</option>
              <option value="overcast">Cloudy / Overcast</option>
              <option value="misty">Misty / Foggy</option>
            </select>
          </div>
        </div>

      </div>
    </div>
  );
}
