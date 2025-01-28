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
      return response.data;
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

      const { lat, lon, name: city, country } = geoResponse.data;

      // Fetch the weather data using the lat/lon
      const weatherResponse = await axios.get(
        `${BASE_URL}?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
      );

      // Return both the weather data and the city information
      return { weatherData: weatherResponse.data, city: `${city}, ${country}` };
    } catch (error) {
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
        state.data = action.payload;
        state.error = "";
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
        state.cityName = action.payload.city;
      })
      .addCase(fetchWeatherByZip.rejected, (state, action) => {
        state.loading = false;
        state.data = {};
        state.error = action.payload;
      });
  },
});

export const { setCityName } = weatherSlice.actions;
export default weatherSlice.reducer;
