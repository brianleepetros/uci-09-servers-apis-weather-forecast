import dayjs from "dayjs";
import dotenv from "dotenv";
dotenv.config();
// TODO: Define a class for the Weather object
class Weather {
    constructor(city, date, tempF, windSpeed, humidity, icon, iconDescription) {
        this.city = city;
        this.date = date;
        this.tempF = tempF;
        this.windSpeed = windSpeed;
        this.humidity = humidity;
        this.icon = icon;
        this.iconDescription = iconDescription;
    }
}
// TODO: Complete the WeatherService class
class WeatherService {
    constructor() {
        this.city = "";
        this.baseURL = process.env.API_BASE_URL || "";
        this.apiKey = process.env.API_KEY || "";
    }
    // TODO: Create fetchLocationData method
    async fetchLocationData(query) {
        try {
            if (!this.baseURL || !this.apiKey) {
                throw new Error("API base URL or API key not found");
            }
            const response = await fetch(query).then((res) => res.json());
            return response[0];
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
    // TODO: Create destructureLocationData method
    destructureLocationData(locationData) {
        if (!locationData) {
            throw new Error("City not found");
        }
        const { name, lat, lon, country, state } = locationData;
        const coordinates = {
            name,
            lat,
            lon,
            country,
            state,
        };
        return coordinates;
    }
    // TODO: Create buildGeocodeQuery method
    buildGeocodeQuery() {
        const geocodeQuery = `${this.baseURL}/geo/1.0/direct?q=${this.city}&limit=1&appid=${this.apiKey}`;
        return geocodeQuery;
    }
    // TODO: Create buildWeatherQuery method
    buildWeatherQuery(coordinates) {
        const weatherQuery = `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&units=imperial&appid=${this.apiKey}`;
        return weatherQuery;
    }
    // TODO: Create fetchAndDestructureLocationData method
    async fetchAndDestructureLocationData() {
        return await this.fetchLocationData(this.buildGeocodeQuery()).then((data) => this.destructureLocationData(data));
    }
    // TODO: Create fetchWeatherData method
    async fetchWeatherData(coordinates) {
        try {
            const response = await fetch(this.buildWeatherQuery(coordinates)).then((res) => res.json());
            if (!response) {
                throw new Error("Weather data not found");
            }
            const currentWeather = this.parseCurrentWeather(response.list[0]);
            const forecast = this.buildForecastArray(currentWeather, response.list);
            return forecast;
        }
        catch (error) {
            console.error(error);
            return error;
        }
    }
    // TODO: Build parseCurrentWeather method
    parseCurrentWeather(response) {
        const parsedDate = dayjs.unix(response.dt).format("M/D/YYYY");
        const currentWeather = new Weather(this.city, parsedDate, response.main.temp, response.wind.speed, response.main.humidity, response.weather[0].icon, response.weather[0].description || response.weather[0].main);
        return currentWeather;
    }
    // TODO: Complete buildForecastArray method
    buildForecastArray(currentWeather, weatherData) {
        const weatherForecast = [currentWeather];
        const filteredWeatherData = weatherData.filter((data) => {
            return data.dt_txt.includes("12:00:00");
        });
        for (const day of filteredWeatherData) {
            weatherForecast.push(new Weather(this.city, dayjs.unix(day.dt).format("M/D/YYYY"), day.main.temp, day.wind.speed, day.main.humidity, day.weather[0].icon, day.weather[0].description || day.weather[0].main));
        }
        return weatherForecast;
    }
    // TODO: Complete getWeatherForCity method
    async getWeatherForCity(city) {
        try {
            this.city = city;
            const coordinates = await this.fetchAndDestructureLocationData();
            if (coordinates) {
                const weather = await this.fetchWeatherData(coordinates);
                return weather;
            }
            throw new Error("Weather data not found");
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }
}
export default new WeatherService();
