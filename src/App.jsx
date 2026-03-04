import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import WeatherMain from "./WeatherMain";
import Forecast from "./Forecast";

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_KEY = "REAL_API_KEYINGNI_QO‘Y";

  const fetchWeather = async (city) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=5`
      );

      const result = await res.json();

      if (result.error) {
        throw new Error(result.error.message);
      }

      setData(result);
    } catch (err) {
      setError("API xatosi yoki noto‘g‘ri key");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather("Tashkent");
  }, []);

  // 🔥 Ob-havoga qarab background tanlash
  const getBackground = () => {
    if (!data) return "/clear.jpg";

    const condition = data.current.condition.text.toLowerCase();

    if (condition.includes("rain")) return "/rain.jpg";
    if (condition.includes("cloud")) return "/cloud.jpg";
    if (condition.includes("snow")) return "/snow.jpg";
    if (condition.includes("sun")) return "/clear.jpg";

    return "/clear.jpg";
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white transition-all duration-700"
      style={{ backgroundImage: `url(${getBackground()})` }}
    >
      <div className="min-h-screen bg-black/50 backdrop-blur-sm flex flex-col items-center px-4 py-10">

        <SearchBar onSearch={fetchWeather} />

        {loading && (
          <div className="mt-20 text-xl">Yuklanmoqda...</div>
        )}

        {error && (
          <div className="mt-20 text-red-400 text-xl">{error}</div>
        )}

        {data && !loading && (
          <>
            <WeatherMain data={data} />
            <Forecast data={data} />
          </>
        )}

      </div>
    </div>
  );
}

export default App;