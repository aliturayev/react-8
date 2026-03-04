import React from 'react';
import { Wind } from 'lucide-react';

const AirQuality = ({ data, theme = 'dark' }) => {
  const isDark = theme === 'dark';

  const getAQIInfo = (aqi) => {
    const info = [
      { label: "Zo'r", color: "text-green-500", bg: "bg-green-500/10" },
      { label: "Yaxshi", color: "text-yellow-500", bg: "bg-yellow-500/10" },
      { label: "O'rtacha", color: "text-orange-500", bg: "bg-orange-500/10" },
      { label: "Yomon", color: "text-red-500", bg: "bg-red-500/10" },
      { label: "Xavfli", color: "text-purple-500", bg: "bg-purple-500/10" }
    ];
    return info[aqi - 1] || info[0];
  };

  const aqiInfo = getAQIInfo(data.main.aqi);

  return (
    <div className={`border p-6 rounded-[2rem] flex items-center justify-between transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] group cursor-pointer ${isDark ? 'bg-slate-900/50 border-slate-800 hover:border-blue-500/50' : 'bg-white/82 border-slate-200 hover:border-blue-300'}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${aqiInfo.bg} ${aqiInfo.color} transition-transform duration-300 group-hover:scale-110`}>
          <Wind size={24} />
        </div>
        <div>
          <p className={`text-xs uppercase font-bold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Havo Sifati</p>
          <h3 className={`text-xl font-bold ${aqiInfo.color}`}>{aqiInfo.label}</h3>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-2xl font-black ${isDark ? 'text-white/25' : 'text-slate-400'}`}>AQI {data.main.aqi}</p>
      </div>
    </div>
  );
};

export default AirQuality;
