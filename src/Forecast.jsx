function Forecast({ data }) {
  return (
    <div className="mt-20 max-w-4xl mx-auto">

      <div className="grid grid-cols-5 gap-8 text-center">

        {data.forecast.forecastday.map((day, index) => (
          <div
            key={index}
            className="bg-white/15 backdrop-blur-xl 
                       border border-white/20 
                       rounded-2xl py-6 
                       transition hover:bg-white/25"
          >
            <div className="text-sm opacity-80">
              {new Date(day.date).toLocaleDateString("uz-UZ", {
                weekday: "short"
              })}
            </div>

            <img
              src={day.day.condition.icon}
              alt=""
              className="mx-auto w-14 my-4"
            />

            <div className="text-xl font-semibold">
              {Math.round(day.day.avgtemp_c)}°
            </div>
          </div>
        ))}

      </div>

    </div>
  );
}

export default Forecast;