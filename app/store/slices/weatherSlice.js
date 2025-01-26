import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_KEY = "3f88d5f8bbfa8eb651ea5f78d37f3578";
const BASE_URL = "https://api.openweathermap.org/data/2.5/forecast";

export const fetchWeather = createAsyncThunk(
  "weather/fetchWeather",
  async (city) => {
    const response = await axios.get(
      `${BASE_URL}?q=${city}&units=imperial&appid=${API_KEY}`
    );
    return response.data;
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
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeather.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = "";
        state.cityName = action.payload.city.name;
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false;
        state.data = {};
        state.error = action.error.message;
        state.cityName = "";
      });
  },
});

export default weatherSlice.reducer;
