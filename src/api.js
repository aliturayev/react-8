const GEO_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

const WEATHER_CODE_MAP = {
  0: { description: "musaffo osmon", icon: (isDay) => (isDay ? "01d" : "01n") },
  1: { description: "asosan ochiq", icon: (isDay) => (isDay ? "02d" : "02n") },
  2: { description: "qisman bulutli", icon: (isDay) => (isDay ? "03d" : "03n") },
  3: { description: "bulutli", icon: "04d" },
  45: { description: "tuman", icon: "50d" },
  48: { description: "qirov tuman", icon: "50d" },
  51: { description: "yengil shivalash", icon: "09d" },
  53: { description: "ortacha shivalash", icon: "09d" },
  55: { description: "kuchli shivalash", icon: "09d" },
  56: { description: "muzli shivalash", icon: "13d" },
  57: { description: "kuchli muzli shivalash", icon: "13d" },
  61: { description: "yengil yomgir", icon: "10d" },
  63: { description: "ortacha yomgir", icon: "10d" },
  65: { description: "kuchli yomgir", icon: "10d" },
  66: { description: "muzli yomgir", icon: "13d" },
  67: { description: "kuchli muzli yomgir", icon: "13d" },
  71: { description: "yengil qor", icon: "13d" },
  73: { description: "ortacha qor", icon: "13d" },
  75: { description: "kuchli qor", icon: "13d" },
  77: { description: "qor donalari", icon: "13d" },
  80: { description: "yomgir jala", icon: "09d" },
  81: { description: "ortacha yomgir jala", icon: "09d" },
  82: { description: "kuchli yomgir jala", icon: "09d" },
  85: { description: "qor jala", icon: "13d" },
  86: { description: "kuchli qor jala", icon: "13d" },
  95: { description: "momaqaldiroq", icon: "11d" },
  96: { description: "momaqaldiroq va do'l", icon: "11d" },
  99: { description: "kuchli momaqaldiroq va do'l", icon: "11d" }
};

const getWeatherMeta = (code, isDay = true) => {
  const mapped = WEATHER_CODE_MAP[Number(code)] || {
    description: "ob-havo ma'lumoti yo'q",
    icon: "03d"
  };
  const icon = typeof mapped.icon === "function" ? mapped.icon(isDay) : mapped.icon;

  return {
    description: mapped.description,
    icon
  };
};

const toAqiLevel = (usAqi) => {
  if (typeof usAqi !== "number" || Number.isNaN(usAqi)) return 1;
  if (usAqi <= 50) return 1;
  if (usAqi <= 100) return 2;
  if (usAqi <= 150) return 3;
  if (usAqi <= 200) return 4;
  return 5;
};

const readErrorMessage = async (response, fallbackMessage) => {
  try {
    const errorBody = await response.json();
    const message = errorBody?.reason || errorBody?.error || errorBody?.message;
    return message || fallbackMessage;
  } catch {
    return fallbackMessage;
  }
};

const fetchJson = async (url, fallbackMessage) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, fallbackMessage));
  }

  return response.json();
};

const pickCurrentAqi = (airData) => {
  if (typeof airData?.current?.us_aqi === "number") {
    return airData.current.us_aqi;
  }

  if (Array.isArray(airData?.hourly?.us_aqi)) {
    const nearestValue = airData.hourly.us_aqi.find((value) => typeof value === "number");
    return nearestValue ?? null;
  }

  return null;
};

const buildForecast = (dailyData) => {
  const times = dailyData?.time || [];
  const codes = dailyData?.weather_code || [];
  const maxTemps = dailyData?.temperature_2m_max || [];
  const minTemps = dailyData?.temperature_2m_min || [];

  return times.map((date, index) => {
    const maxTemp = maxTemps[index];
    const minTemp = minTemps[index];
    const validTemps = [maxTemp, minTemp].filter((temp) => typeof temp === "number");
    const avgTemp = validTemps.length
      ? validTemps.reduce((sum, temp) => sum + temp, 0) / validTemps.length
      : 0;
    const meta = getWeatherMeta(codes[index], true);

    return {
      dt_txt: `${date} 12:00:00`,
      main: {
        temp: avgTemp
      },
      weather: [
        {
          description: meta.description,
          icon: meta.icon
        }
      ]
    };
  });
};

const formatLocationLabel = (location) => {
  const pieces = [location?.name, location?.admin1, location?.country].filter(Boolean);
  return pieces.join(", ");
};

export const searchCities = async (query, limit = 8) => {
  const text = query.trim();

  if (text.length < 2) {
    return [];
  }

  const geocodingUrl =
    `${GEO_URL}?name=${encodeURIComponent(text)}` +
    `&count=${limit}&language=uz&format=json`;
  const geocodingData = await fetchJson(geocodingUrl, "Shaharlar ro'yxatini olib bo'lmadi");
  const results = geocodingData?.results || [];

  return results.map((location) => ({
    id: location.id || `${location.latitude}-${location.longitude}-${location.name}`,
    name: location.name,
    country: location.country || "",
    admin1: location.admin1 || "",
    latitude: location.latitude,
    longitude: location.longitude,
    label: formatLocationLabel(location)
  }));
};

export const getWeatherData = async (city) => {
  const cityName = city.trim();

  if (!cityName) {
    throw new Error("Shahar nomini kiriting");
  }

  try {
    const geocodingUrl = `${GEO_URL}?name=${encodeURIComponent(cityName)}&count=1&language=uz&format=json`;
    const geocodingData = await fetchJson(geocodingUrl, "Shahar topilmadi");
    const location = geocodingData?.results?.[0];

    if (!location) {
      throw new Error("Shahar topilmadi");
    }

    const { latitude, longitude, name } = location;

    const weatherUrl =
      `${WEATHER_URL}?latitude=${latitude}&longitude=${longitude}` +
      "&current=temperature_2m,apparent_temperature,relative_humidity_2m,surface_pressure,weather_code,is_day,wind_speed_10m" +
      "&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7&wind_speed_unit=ms";
    const weatherData = await fetchJson(weatherUrl, "Ob-havo ma'lumotini olib bo'lmadi");

    if (!weatherData?.current) {
      throw new Error("Ob-havo ma'lumoti topilmadi");
    }

    const currentMeta = getWeatherMeta(
      weatherData.current.weather_code,
      weatherData.current.is_day === 1
    );
    const forecast = buildForecast(weatherData.daily);

    let airData = null;
    try {
      const airUrl =
        `${AIR_URL}?latitude=${latitude}&longitude=${longitude}` +
        "&hourly=us_aqi&timezone=auto&forecast_days=1";
      airData = await fetchJson(airUrl, "Havo sifati ma'lumotini olib bo'lmadi");
    } catch (airError) {
      console.warn("Air quality fetch failed:", airError.message);
    }

    const usAqi = pickCurrentAqi(airData);

    return {
      current: {
        name,
        main: {
          temp: weatherData.current.temperature_2m,
          feels_like: weatherData.current.apparent_temperature ?? weatherData.current.temperature_2m,
          humidity: weatherData.current.relative_humidity_2m,
          pressure: weatherData.current.surface_pressure
        },
        wind: {
          speed: weatherData.current.wind_speed_10m ?? 0
        },
        weather: [
          {
            description: currentMeta.description,
            icon: currentMeta.icon
          }
        ]
      },
      forecast,
      air: {
        main: {
          aqi: toAqiLevel(usAqi),
          us_aqi: usAqi
        }
      }
    };
  } catch (err) {
    console.error("API Error:", err.message);
    throw err;
  }
};
