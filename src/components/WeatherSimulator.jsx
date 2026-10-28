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
      case 'rainy': return <CloudRain size={13} className="vp-weather-icon" aria-hidden="true" />;
      case 'sunny': return <Sun size={13} className="vp-weather-icon" aria-hidden="true" />;
      case 'overcast': return <Cloud size={13} className="vp-weather-icon" aria-hidden="true" />;
      case 'misty': return <CloudFog size={13} className="vp-weather-icon" aria-hidden="true" />;
      default: return <Sun size={13} className="vp-weather-icon" aria-hidden="true" />;
    }
  };

  return (
    <div className="vp-weatherbar">
      <div className="vp-weatherbar-inner">
        <div className="vp-weather-readout" aria-live="polite">
          <span className="vp-weather-indicator" />
          <span className="vp-weather-label">FIELD CONDITIONS</span>
          <span className="vp-weather-current">{climate.season} <i>·</i> {getWeatherIcon(climate.weather)} {climate.weather}</span>
          <span className="vp-weather-temperature"><Thermometer size={13} aria-hidden="true" /> {climate.temperature}</span>
        </div>
        <div className="vp-weather-controls">
          <label className="vp-weather-control"><span>Season</span>
            <select aria-label="Simulated season" value={climate.season} onChange={(e) => handleUpdate({ season: e.target.value })}>
              <option value="winter">Winter</option>
              <option value="summer">Summer</option>
              <option value="monsoon">Monsoon</option>
            </select>
          </label>
          <label className="vp-weather-control"><span>Sky</span>
            <select aria-label="Simulated weather" value={climate.weather} onChange={(e) => handleUpdate({ weather: e.target.value })}>
              <option value="sunny">Clear</option>
              <option value="rainy">Rain</option>
              <option value="overcast">Cloudy</option>
              <option value="misty">Misty</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
