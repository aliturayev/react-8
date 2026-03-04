import { useEffect, useState } from "react";

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const API_KEY = "REAL_API_KEYINGNI_QO‘Y";

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      const res = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${query}`
      );

      const data = await res.json();
      setSuggestions(data);
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query);
    setSuggestions([]);
  };

  const selectCity = (name) => {
    setQuery(name);
    setSuggestions([]);
    onSearch(name);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Shahar qidiring..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full px-6 py-3 rounded-full 
                     bg-white/20 backdrop-blur-xl 
                     border border-white/30
                     text-white placeholder-white/70
                     outline-none focus:ring-2 focus:ring-white/50"
        />
      </form>

      {suggestions.length > 0 && (
        <div className="absolute w-full bg-white/20 backdrop-blur-xl 
                        border border-white/20 rounded-2xl mt-3 
                        shadow-xl overflow-hidden z-50">
          {suggestions.map((item, i) => (
            <div
              key={i}
              onClick={() => selectCity(item.name)}
              className="px-4 py-3 hover:bg-white/20 cursor-pointer text-white"
            >
              {item.name}, {item.country}
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default SearchBar;