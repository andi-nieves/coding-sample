import React, { useState, useRef } from "react";
import axios from "axios";
import { debounce, get } from "lodash";
import "./App.css";

function App() {
  const input = useRef(null);
  const [result, setResult] = useState([]);
  const [queryString, setQueryString] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [forecast, setForecast] = useState([]);

  async function search(queryString) {
    if (queryString === "") {
      return;
    }
    const queryResult = await axios(
      `https://www.metaweather.com/api/location/search/?query=${queryString}`
    );
    if (queryResult.data.length > 0) {
      setResult(queryResult.data);
    } else {
      setResult([{ title: "No Record Found!" }]);
    }
  }
  async function fiveDaysForecast(woeid) {
    const queryResult = await axios(
      `https://www.metaweather.com/api/location/${woeid}`
    );
    setForecast(get(queryResult, "data.consolidated_weather", []));
  }
  function onChange(e) {
    const str = e.target.value;
    setQueryString(str);
    if (str === "") {
      setResult([]);
      return;
    }
    debounce(() => {
      search(str);
    }, 300)();
  }
  function renderResultList() {
    return (
      result.length > 0 && (
        <ul className="dataList">
          {result.map(data => (
            <li
              key={Math.random() + data.woeid}
              onClick={() => {
                if (data.woeid === undefined) {
                  return;
                }
                setForecast([]);
                fiveDaysForecast(data.woeid);
                setSelectedItem(data);
              }}
            >
              {data.title}
            </li>
          ))}
        </ul>
      )
    );
  }
  function clear() {
    setQueryString("");
    setResult([]);
    input.current.value = "";
  }
  function renderSearchInput() {
    return (
      <React.Fragment>
        <div className="searchBox">
          <i className="fas fa-search" />
          <span>Enter a city name</span>
          <input
            ref={input}
            className="searchInput"
            type="text"
            onChange={onChange}
          />
          {queryString !== "" && (
            <i
              className="fas fa-times-circle"
              onClick={() => {
                clear();
              }}
            />
          )}
        </div>
        {renderResultList()}
      </React.Fragment>
    );
  }
  function renderForecastData(data) {
    return (
      <table>
        <tbody>
          <tr>
            <td style={{ minWidth: 300 }}>{data.created.substr(0, 10)}</td>
            <td>{parseFloat(data.min_temp).toFixed(1)} &deg;C </td>
            <td>{parseFloat(data.max_temp).toFixed(1)} &deg;C </td>
          </tr>
          <tr>
            <td>{data.weather_state_name}</td>
            <td>Min</td>
            <td>Max</td>
          </tr>
        </tbody>
      </table>
    );
  }
  function renderForecast() {
    return forecast.length > 0 ? (
      <React.Fragment>
        <p style={{ textAlign: "center" }}>
          5 Day Forecast for {selectedItem.title}
        </p>
        <ul>
          {forecast.map(data => (
            <li key={data.id}>{renderForecastData(data)}</li>
          ))}
        </ul>
      </React.Fragment>
    ) : (
      <i className="fas fa-spinner fa-spin" />
    );
  }
  return (
    <div className="App">
      {selectedItem && (
        <a
          className="returnButton"
          href="#back"
          onClick={e => {
            e.preventDefault();
            setSelectedItem(null);
          }}
        >
          <i className="fas fa-arrow-left" /> Back
        </a>
      )}

      <h1 className="title">Simple Weather Application</h1>
      {selectedItem ? renderForecast() : renderSearchInput()}
    </div>
  );
}

export default App;
