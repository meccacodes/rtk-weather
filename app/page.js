"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchWeather,
  fetchWeatherByZip,
  fetchWeatherByCity,
} from "./store/slices/weatherSlice";
import styles from "./page.module.css";
import axios from "axios";
import {
  Sparklines,
  SparklinesLine,
  SparklinesReferenceLine,
} from "react-sparklines";

const Home = () => {
  const [city, setCity] = useState("");
  const [cityName, setCityName] = useState("");
  const dispatch = useDispatch();
  const {
    loading,
    data,
    error,
    cityName: reduxCityName,
  } = useSelector((state) => state.weather);

  const getUserLocation = async () => {
    try {
      const response = await axios.get("https://ipapi.co/json/");
      const userCity = response.data.city;
      const userState = response.data.region;
      const userCountry = response.data.country;
      const fullCityName = `${userCity}, ${
        userState ? userState + ", " : ""
      }${userCountry}`;

      dispatch(fetchWeather(userCity));
      dispatch({ type: "weather/setCityName", payload: fullCityName });
    } catch (error) {
      console.error("Error fetching user location", error);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const handleSearch = async () => {
    try {
      const formattedInput = city.trim();
      const isZipCode = /^\d{5}(-\d{4})?$/.test(formattedInput); // Check if input is a zip code

      if (isZipCode) {
        dispatch(fetchWeatherByZip(formattedInput)); // Fetch by zip code
      } else {
        const [inputCity, inputState] = formattedInput
          .split(",")
          .map((part) => part.trim());
        dispatch(fetchWeatherByCity({ city: inputCity, state: inputState })); // Pass city and state as an object
      }
    } catch (error) {
      console.error("Error fetching location from input", error);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const getChartData = (key) => {
    return data.list ? data.list.map((item) => item.main[key]) : [];
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Weather Search</h2>
      <input
        className={styles.searchInput}
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        onKeyDown={handleKeyPress}
      />
      <button className={styles.searchBtn} onClick={handleSearch}>
        Search
      </button>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <div>
        <h3>Showing data for {reduxCityName}</h3>
        <h3>Temperature</h3>
        <Sparklines
          data={data.list ? data.list.map((item) => item.main.temp) : []}
        >
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
