function WeatherMain({ data }) {
  const { location, current } = data;

  return (
    <div className="text-center mt-24">

      <div className="text-2xl font-medium tracking-wide">
        {location.name}, {location.country}
      </div>

      <div className="flex justify-center mt-8">
        <img
          src={current.condition.icon}
          alt=""
          className="w-36"
        />
      </div>

      <div className="text-[120px] leading-none font-semibold mt-6 tracking-tight">
        {Math.round(current.temp_c)}°
      </div>

      <div className="text-2xl mt-4 opacity-90">
        {current.condition.text}
      </div>

      <div className="flex justify-center gap-16 mt-12 text-sm opacity-80">
        <div>Humidity {current.humidity}%</div>
        <div>Wind {current.wind_kph} km/h</div>
        <div>Feels {Math.round(current.feelslike_c)}°</div>
      </div>

    </div>
  );
}

export default WeatherMain;