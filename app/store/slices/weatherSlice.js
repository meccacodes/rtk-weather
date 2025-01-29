import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_KEY = "3f88d5f8bbfa8eb651ea5f78d37f3578";
const BASE_URL = "https://api.openweathermap.org/data/2.5/forecast";

export const fetchWeather = createAsyncThunk(
  "weather/fetchWeather",
  async (city, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}?q=${city}&units=imperial&appid=${API_KEY}`
      );
      console.log("Weather API Response:", response.data);

      const cityName = response.data.city.name;
      const country = response.data.city.country;

      return {
        weatherData: response.data,
        cityName: `${cityName}, ${country}`,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchWeatherByZip = createAsyncThunk(
  "weather/fetchWeatherByZip",
  async (zip, { rejectWithValue }) => {
    try {
      const geoResponse = await axios.get(
        `http://api.openweathermap.org/geo/1.0/zip?zip=${zip},us&appid=${API_KEY}`
      );
      console.log("Geocoding API Response:", geoResponse.data);

      if (!geoResponse.data || !geoResponse.data.lat || !geoResponse.data.lon) {
        throw new Error("Invalid zip code or no location found.");
      }

      const { lat, lon, name: city, country, state } = geoResponse.data;

      // Fetch the weather data using the lat/lon
      const weatherResponse = await axios.get(
        `${BASE_URL}?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
      );

      // Return both the weather data and the city information
      return { weatherData: weatherResponse.data, city, country, state };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchWeatherByCity = createAsyncThunk(
  "weather/fetchWeatherByCity",
  async ({ city, state }, { rejectWithValue }) => {
    try {
      // Log the input for debugging
      console.log(`Fetching weather for: ${city}, ${state}`);

      // Construct the geocoding request URL with country code
      const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&appid=${API_KEY}`;
      console.log("Geocoding API Request URL:", geoUrl); // Log the request URL

      // First, get the geocoding data
      const geoResponse = await axios.get(geoUrl);

      // Log the geocoding response for debugging
      console.log("Geocoding API Response:", geoResponse.data);

      if (!geoResponse.data || geoResponse.data.length === 0) {
        throw new Error("Invalid city or state.");
      }

      const { lat, lon, state: geoState, country } = geoResponse.data[0];

      // Now fetch the weather data using the lat/lon
      const weatherResponse = await axios.get(
        `${BASE_URL}?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
      );

      return {
        weatherData: weatherResponse.data,
        cityName: `${city}, ${geoState}, ${country}`, // Include state in the return
      };
    } catch (error) {
      console.error("Error fetching weather by city:", error);
      return rejectWithValue(error.message);
    }
  }
);

const weatherSlice = createSlice({
  name: "weather",
  initialState: {
    loading: false,
    data: {},
    error: "",
    cityName: "",
  },
  reducers: {
    setCityName: (state, action) => {
      state.cityName = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.weatherData;
        state.error = "";
        state.cityName = action.payload.cityName;
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false;
        state.data = {};
        state.error = action.payload;
      })
      .addCase(fetchWeatherByZip.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWeatherByZip.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.weatherData;
        state.error = "";
        state.cityName = `${action.payload.city}, ${
          action.payload.state || ""
        } ${action.payload.country}`.trim();
      })
      .addCase(fetchWeatherByZip.rejected, (state, action) => {
        state.loading = false;
        state.data = {};
        state.error = action.payload;
      })
      .addCase(fetchWeatherByCity.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWeatherByCity.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.weatherData;
        state.error = "";
        state.cityName = `${action.payload.city}, ${
          action.payload.state || ""
        } ${action.payload.country}`.trim();
      })
      .addCase(fetchWeatherByCity.rejected, (state, action) => {
        state.loading = false;
        state.data = {};
        state.error = action.payload;
      });
  },
});

export const { setCityName } = weatherSlice.actions;
export default weatherSlice.reducer;
