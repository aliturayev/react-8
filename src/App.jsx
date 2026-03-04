import React, { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, Heart, X, Wind, Droplets, Thermometer, Sun, Moon } from 'lucide-react';
import { getWeatherData, searchCities } from './api';
import AirQuality from './AirQuality';
import Forecast from './Forecast';
import Favorites from './Favorites';

const WEATHER_BACKGROUNDS = {
  clear: "https://images.unsplash.com/photo-1501973801540-537f08ccae7b?auto=format&fit=crop&w=2000&q=80",
  cloudy: "https://images.unsplash.com/photo-1527489377706-5bf97e608852?auto=format&fit=crop&w=2000&q=80",
  rain: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=2000&q=80",
  storm: "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=2000&q=80",
  snow: "https://images.unsplash.com/photo-1516431883659-655d41c09bf9?auto=format&fit=crop&w=2000&q=80",
  fog: "https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=2000&q=80",
  default: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80"
};

const removeQuestionMarks = (value) => String(value ?? "").replace(/\?/g, "").trim();

const getBackgroundKeyByIcon = (iconCode) => {
  const code = String(iconCode || "").slice(0, 2);

  if (code === "01") return "clear";
  if (code === "02" || code === "03" || code === "04") return "cloudy";
  if (code === "09" || code === "10") return "rain";
  if (code === "11") return "storm";
  if (code === "13") return "snow";
  if (code === "50") return "fog";

  return "default";
};

const LOCAL_CITY_SUGGESTIONS = [
  "Toshkent",
  "Samarqand",
  "Buxoro",
  "Xiva",
  "Andijon",
  "Namangan",
  "Farg'ona",
  "Nukus"
];

const toLocalSuggestion = (name) => ({
  id: `local-${name.toLowerCase()}`,
  name,
  label: `${name}, O'zbekiston`,
  country: "O'zbekiston"
});

const filterLocalSuggestions = (query) => {
  const text = query.trim().toLowerCase();
  const base = text
    ? LOCAL_CITY_SUGGESTIONS.filter((name) => name.toLowerCase().includes(text))
    : LOCAL_CITY_SUGGESTIONS;

  return base.map(toLocalSuggestion);
};

const mergeSuggestions = (remoteSuggestions, localSuggestions, maxCount = 8) => {
  const all = [...remoteSuggestions, ...localSuggestions];
  const seen = new Set();
  const unique = [];

  for (const cityItem of all) {
    const key = `${cityItem.name}-${cityItem.admin1 || ""}-${cityItem.country || ""}`.toLowerCase();

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(cityItem);

    if (unique.length >= maxCount) {
      break;
    }
  }

  return unique;
};

const App = () => {
  const [city, setCity] = useState('');
  const [allData, setAllData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState(() => filterLocalSuggestions(''));
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('weather-theme');
    return savedTheme === 'light' ? 'light' : 'dark';
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('weather-favs');
    return saved ? JSON.parse(saved) : [];
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    fetchData("Samarkand");
  }, []);

  useEffect(() => {
    localStorage.setItem('weather-favs', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('weather-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!showSuggestions) {
      return;
    }

    const query = city.trim();
    const localMatches = filterLocalSuggestions(query);

    if (!query || query.length < 2) {
      setSuggestions(localMatches);
      setSuggestionsLoading(false);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setSuggestionsLoading(true);

      try {
        const remoteSuggestions = await searchCities(query, 8);

        if (!active) {
          return;
        }

        setSuggestions(mergeSuggestions(remoteSuggestions, localMatches, 8));
      } catch {
        if (active) {
          setSuggestions(localMatches);
        }
      } finally {
        if (active) {
          setSuggestionsLoading(false);
        }
      }
    }, 280);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [city, showSuggestions]);

  const fetchData = async (cityName) => {
    const query = cityName.trim();
    if (!query) return;

    setLoading(true);
    setShowSuggestions(false);
    try {
      const data = await getWeatherData(query);
      setAllData(data);
      setCity('');
    } catch (err) {
      alert("Xatolik: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = () => {
    if (!allData?.current?.name) {
      return;
    }

    const cityName = allData.current.name;
    if (favorites.includes(cityName)) {
      setFavorites(favorites.filter((f) => f !== cityName));
    } else {
      setFavorites([...favorites, cityName]);
    }
  };

  const currentIconCode = allData?.current?.weather?.[0]?.icon;
  const backgroundKey = getBackgroundKeyByIcon(currentIconCode);
  const backgroundImageUrl = WEATHER_BACKGROUNDS[backgroundKey] || WEATHER_BACKGROUNDS.default;
  const overlayGradient = isDark
    ? "linear-gradient(120deg, rgba(2,6,23,0.88), rgba(2,6,23,0.75))"
    : "linear-gradient(120deg, rgba(248,250,252,0.86), rgba(226,232,240,0.72))";

  return (
    <div
      className={`min-h-screen bg-cover bg-center bg-fixed px-4 py-6 md:px-8 lg:px-12 xl:px-16 font-sans selection:bg-blue-500/30 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}
      style={{
        backgroundImage: `${overlayGradient}, url('${backgroundImageUrl}')`
      }}
    >
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 font-semibold transition-all duration-300 cursor-pointer ${isDark ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' : 'bg-white/80 hover:bg-white text-slate-800 border border-slate-200'}`}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        <Favorites
          favorites={favorites}
          theme={theme}
          onSelect={(name) => fetchData(name)}
          onRemove={(name) => setFavorites(favorites.filter((f) => f !== name))}
        />

        <div className="relative mb-8">
          <form onSubmit={(e) => { e.preventDefault(); fetchData(city); }} className="relative z-20 group">
            <input
              type="text"
              className={`w-full border rounded-2xl py-4 px-6 text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300 shadow-2xl group-hover:scale-[1.005] ${isDark ? 'bg-slate-900/90 border-slate-800 text-slate-100 placeholder:text-slate-500 group-hover:border-blue-500/50' : 'bg-white/85 border-slate-200 text-slate-900 placeholder:text-slate-400 group-hover:border-blue-400/60'}`}
              placeholder="Shahar qidirish..."
              value={city}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setCity(e.target.value);
                setShowSuggestions(true);
              }}
            />
            <div className="absolute right-4 top-4 flex items-center gap-3">
              {city && (
                <X
                  size={20}
                  className={`cursor-pointer hover:scale-110 transition-all ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                  onClick={() => setCity('')}
                />
              )}
              <div className={`w-[1px] h-6 ${isDark ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
              {loading ? (
                <Loader2 className="animate-spin text-blue-500" size={22} />
              ) : (
                <Search
                  className="text-slate-400 hover:text-blue-400 hover:scale-110 cursor-pointer transition-all"
                  size={22}
                  onClick={() => fetchData(city)}
                />
              )}
            </div>
          </form>

          {showSuggestions && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSuggestions(false)}></div>
              <div className={`absolute top-full left-0 w-full backdrop-blur-xl border mt-2 rounded-2xl overflow-hidden shadow-2xl z-20 animate-in fade-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'}`}>
                <p className={`px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'text-slate-500 bg-slate-800/30' : 'text-slate-500 bg-slate-100/80'}`}>
                  {city.trim() ? "Topilgan shaharlar" : "Mashhur shaharlar"}
                </p>

                {suggestionsLoading && (
                  <div className={`px-6 py-4 flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Qidirilmoqda...</span>
                  </div>
                )}

                {!suggestionsLoading && suggestions.length === 0 && (
                  <div className={`px-6 py-4 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Shahar topilmadi</div>
                )}

                {!suggestionsLoading && suggestions.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={`w-full px-6 py-4 cursor-pointer transition-all duration-200 flex items-center justify-between gap-3 group border-b last:border-0 hover:scale-[1.01] ${isDark ? 'hover:bg-blue-600/20 border-slate-800/50' : 'hover:bg-blue-100/90 border-slate-200/80'}`}
                    onClick={() => fetchData(item.name)}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin size={16} className="text-slate-500 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
                      <div className="text-left">
                        <p className={`font-medium ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{removeQuestionMarks(item.name)}</p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          {item.admin1
                            ? `${removeQuestionMarks(item.admin1)}, ${removeQuestionMarks(item.country)}`
                            : removeQuestionMarks(item.country)}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs transition-colors ${isDark ? 'text-slate-500 group-hover:text-blue-300' : 'text-slate-500 group-hover:text-blue-600'}`}>Tanlash</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {allData ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className={`xl:col-span-8 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] cursor-pointer shadow-[0_20px_50px_rgba(30,64,175,0.3)] ${isDark ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800' : 'bg-gradient-to-br from-sky-300 via-blue-400 to-indigo-500'}`}>
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md mb-4">
                      <MapPin size={14} className="text-white" />
                      <span className="text-xs font-bold tracking-wide uppercase text-white">{removeQuestionMarks(allData.current.name)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-white">
                        {Math.round(allData.current.main.temp)}°
                      </h1>
                      <img
                        src={`https://openweathermap.org/img/wn/${allData.current.weather[0].icon}@4x.png`}
                        alt="icon"
                        className="w-24 h-24 drop-shadow-2xl transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  </div>
                  <button
                    onClick={toggleFavorite}
                    className={`p-4 rounded-3xl backdrop-blur-xl transition-all duration-300 cursor-pointer ${favorites.includes(allData.current.name) ? 'bg-white text-red-500 scale-110 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30 hover:scale-110'}`}
                  >
                    <Heart size={24} className={favorites.includes(allData.current.name) ? 'fill-current' : ''} />
                  </button>
                </div>
                <p className="text-2xl mt-4 capitalize font-light text-white">{removeQuestionMarks(allData.current.weather[0].description)}</p>

                <div className="flex gap-6 mt-8">
                  <div className="flex items-center gap-2 text-white/90">
                    <Thermometer size={18} />
                    <span>His etiladi: {Math.round(allData.current.main.feels_like ?? allData.current.main.temp)}°</span>
                  </div>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] group-hover:bg-white/20 transition-all duration-700"></div>
            </div>

            <div className="xl:col-span-4 grid grid-cols-1 gap-6">
              <AirQuality data={allData.air} theme={theme} />

              <div className={`border backdrop-blur-sm p-6 rounded-[2rem] flex justify-around items-center shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] cursor-pointer ${isDark ? 'bg-slate-900/45 border-slate-800/50 hover:border-blue-500/50' : 'bg-white/82 border-slate-200 hover:border-blue-300'}`}>
                <div className="text-center group">
                  <Droplets className="mx-auto mb-2 text-blue-500 group-hover:scale-110 transition-transform" size={20} />
                  <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Namlik</p>
                  <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{allData.current.main.humidity}%</p>
                </div>
                <div className={`w-[1px] h-12 ${isDark ? 'bg-slate-700/60' : 'bg-slate-300'}`}></div>
                <div className="text-center group">
                  <Wind className="mx-auto mb-2 text-teal-500 group-hover:scale-110 transition-transform" size={20} />
                  <p className={`text-[10px] uppercase font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Shamal</p>
                  <p className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{Number(allData.current.wind.speed || 0).toFixed(1)} m/s</p>
                </div>
              </div>
            </div>

            <div className="xl:col-span-12">
              <Forecast days={allData.forecast} theme={theme} />
            </div>
          </div>
        ) : (
          !loading && (
            <div className={`text-center py-20 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Ma'lumot topilmadi.
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default App;
