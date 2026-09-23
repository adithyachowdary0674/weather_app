export default async function handler(req, res) {
    try {
        const { city } = req.query;

        if (!city) {
            return res.status(400).json({
                error: "City name is required"
            });
        }

        const API_KEY = process.env.OPENWEATHER_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({
                error: "Weather API key is not configured"
            });
        }

        // --------------------------------
        // 1. Convert city name to coordinates
        // --------------------------------

        const geoURL =
            `https://api.openweathermap.org/geo/1.0/direct` +
            `?q=${encodeURIComponent(city)}` +
            `&limit=1` +
            `&appid=${API_KEY}`;

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            return res.status(502).json({
                error: "Geocoding service failed"
            });
        }

        const locations = await geoResponse.json();

        if (!locations.length) {
            return res.status(404).json({
                error: "City not found"
            });
        }

        const location = locations[0];

        const { lat, lon, name, country, state } = location;

        // --------------------------------
        // 2. Get current weather
        // --------------------------------

        const weatherURL =
            `https://api.openweathermap.org/data/2.5/weather` +
            `?lat=${lat}` +
            `&lon=${lon}` +
            `&appid=${API_KEY}` +
            `&units=metric`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            return res.status(502).json({
                error: "Weather service failed"
            });
        }

        const weather = await weatherResponse.json();

        // --------------------------------
        // 3. Get forecast
        // --------------------------------

        const forecastURL =
            `https://api.openweathermap.org/data/2.5/forecast` +
            `?lat=${lat}` +
            `&lon=${lon}` +
            `&appid=${API_KEY}` +
            `&units=metric`;

        const forecastResponse = await fetch(forecastURL);

        if (!forecastResponse.ok) {
            return res.status(502).json({
                error: "Forecast service failed"
            });
        }

        const forecast = await forecastResponse.json();

        // --------------------------------
        // 4. Send clean data to frontend
        // --------------------------------

        return res.status(200).json({
            location: {
                name,
                country,
                state: state || null,
                latitude: lat,
                longitude: lon
            },

            current: {
                temperature: weather.main.temp,
                feelsLike: weather.main.feels_like,
                minTemperature: weather.main.temp_min,
                maxTemperature: weather.main.temp_max,

                humidity: weather.main.humidity,
                pressure: weather.main.pressure,
                visibility: weather.visibility,

                windSpeed: weather.wind.speed,
                windDirection: weather.wind.deg,

                condition: weather.weather[0].main,
                description: weather.weather[0].description,
                icon: weather.weather[0].icon,

                sunrise: weather.sys.sunrise,
                sunset: weather.sys.sunset
            },

            forecast: forecast.list.map(item => ({
                timestamp: item.dt,
                temperature: item.main.temp,
                feelsLike: item.main.feels_like,
                humidity: item.main.humidity,
                condition: item.weather[0].main,
                description: item.weather[0].description,
                icon: item.weather[0].icon,
                windSpeed: item.wind.speed
            }))
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Something went wrong"
        });
    }
}