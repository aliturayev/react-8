import React from 'react';

const removeQuestionMarks = (value) => String(value ?? "").replace(/\?/g, "").trim();

const Forecast = ({ days }) => {
  return (
    <div className="mt-2">
      <h3 className="text-slate-400 text-sm font-medium mb-4 px-2">Haftalik Bashorat</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {days.map((day, index) => {
          const date = new Date(day.dt_txt);
          const dayName = date.toLocaleDateString('uz-UZ', { weekday: 'short' });

          return (
            <div
              key={index}
              className="bg-slate-900 border border-slate-800 p-5 rounded-[2rem] text-center transition-all duration-300 group hover:border-blue-500/50 hover:-translate-y-1 hover:scale-[1.03] cursor-pointer"
            >
              <p className="text-xs text-slate-500 font-bold uppercase mb-3 group-hover:text-blue-400 transition-colors">
                {removeQuestionMarks(dayName)}
              </p>
              <img
                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                alt="weather"
                className="w-12 h-12 mx-auto drop-shadow-xl transition-transform duration-300 group-hover:scale-110"
              />
              <div className="mt-3">
                <p className="text-xl font-bold text-white leading-none">
                  {Math.round(day.main.temp)}°
                </p>
                <p className="text-[10px] text-slate-500 mt-1 capitalize truncate px-1">
                  {removeQuestionMarks(day.weather[0].description)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Forecast;
