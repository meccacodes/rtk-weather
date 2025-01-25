"use client";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchWeather } from "./store/slices/weatherSlice";
import {
  Sparklines,
  SparklinesLine,
  SparklinesReferenceLine,
} from "react-sparklines";

const Home = () => {
  const [city, setCity] = useState("");
  const dispatch = useDispatch();
  const { loading, data, error } = useSelector((state) => state.weather);

  const handleSearch = () => {
    dispatch(fetchWeather(city));
  };

  const getChartData = (key) => {
    return data.list ? data.list.map((item) => item.main[key]) : [];
  };

  return (
    <div>
      <h2>Weather Search</h2>
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <div>
        <h3>Temperature</h3>
        <Sparklines data={getChartData("temp")}>
          <SparklinesLine color="blue" />
          <SparklinesReferenceLine type="mean" />
        </Sparklines>
        <h3>Pressure</h3>
        <Sparklines data={getChartData("pressure")}>
          <SparklinesLine color="green" />
          <SparklinesReferenceLine type="mean" />
        </Sparklines>
        <h3>Humidity</h3>
        <Sparklines data={getChartData("humidity")}>
          <SparklinesLine color="orange" />
          <SparklinesReferenceLine type="mean" />
        </Sparklines>
      </div>
    </div>
  );
};

export default Home;
