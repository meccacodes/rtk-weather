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

      const cityName = response.data.city.name;
      const country = response.data.city.country;
      const zip = response.data.city.zip;
      const state = response.data.city.state;

      return {
        weatherData: response.data,
        cityName: `${cityName}, ${state}, ${country}, ${zip}`,
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

      if (!geoResponse.data || !geoResponse.data.lat || !geoResponse.data.lon) {
        throw new Error("Invalid zip code or no location found.");
      }

      const {
        lat,
        lon,
        name: city,
        country,
        state,
        zip: geoZip,
      } = geoResponse.data;

      const weatherResponse = await axios.get(
        `${BASE_URL}?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
      );

      return {
        weatherData: weatherResponse.data,
        city,
        country,
        state,
        zip: geoZip,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchWeatherByCity = createAsyncThunk(
  "weather/fetchWeatherByCity",
  async ({ city, state }, { rejectWithValue }) => {
    try {
      const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},US&appid=${API_KEY}`;

      const geoResponse = await axios.get(geoUrl);

      if (!geoResponse.data || geoResponse.data.length === 0) {
        throw new Error("Invalid city or state.");
      }

      const {
        name: geoCityName,
        state: geoState,
        country,
        zip: geoZip,
      } = geoResponse.data[0];

      const { lat, lon } = geoResponse.data[0];
      const weatherResponse = await axios.get(
        `${BASE_URL}?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`
      );
      return {
        weatherData: weatherResponse.data,
        cityName: `${geoCityName}, ${geoState}, ${country}`,
        geoCityName,
        geoState,
        country,
        geoZip,
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
    geoCityName: "",
    geoState: "",
    geoZip: "",
    geoCountry: "",
    country: "",
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
        state.geoCityName = action.payload.city;
        state.geoState = action.payload.state;
        state.geoZip = action.payload.zip;
        state.country = action.payload.country;
        state.geoData = action.payload.geoData;
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
        state.cityName = action.payload.cityName;
        state.geoState = action.payload.geoState;
        state.cityName = action.payload.cityName;
        state.geoZip = action.payload.zip;
        state.country = action.payload.country;
        state.geoData = action.payload.geoData;
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
