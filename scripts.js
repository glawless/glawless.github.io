// Openweathermap API. Do not share it publicly.
const api = "01f8ed03c635bd66f1a1a644756198d6"; //Replace with your API

const iconImg = document.getElementById("weather-icon");
const loc = document.querySelector("#location");
const tempF = document.querySelector(".f");
const desc = document.querySelector(".desc");
const tempL = document.querySelector(".temp_min");
const tempH = document.querySelector(".temp_max");
const sunriseDOM = document.querySelector(".sunrise");
const sunsetDOM = document.querySelector(".sunset");



//weather
window.addEventListener("load", () => {
  let long;
  let lat;
  // Accesing Geolocation of User
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      // Storing Longitude and Latitude in variables
      long = position.coords.longitude;
      lat = position.coords.latitude;
      const base = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${api}&units=metric`;

      console.log(base);

      // Using fetch to get data
      fetch(base)
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          // checking
          console.log(data);
          console.log(data[0]);

          const { temp } = data.main;
          const place = data.name;
          const { description, icon } = data.weather[0];
          const { temp_min } = data.main;
          const { temp_max } = data.main;
          const { sunrise, sunset } = data.sys;

          const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
          const fahrenheit = (temp * 9) / 5 + 32;
          const minFahrenheit = (temp_min * 9) / 5 + 32;
          const maxFahrenheit = (temp_max * 9) / 5 + 32;

          const sunriseGMT = new Date(sunrise * 1000);
          const sunsetGMT = new Date(sunset * 1000);

          // Interacting with DOM to show data
          iconImg.src = iconUrl;
          loc.textContent = `${place}`;
          desc.textContent = `${description}`;
          tempF.textContent = `${fahrenheit.toFixed(0)} °F`;
          tempL.textContent = `${minFahrenheit.toFixed(0)} °F`;
          tempH.textContent = `${maxFahrenheit.toFixed(0)} °F`;

          sunriseDOM.textContent = `${sunriseGMT.toLocaleDateString()}, ${sunriseGMT.toLocaleTimeString(
            [],
            { timeStyle: "short" }
          )}`;
          sunsetDOM.textContent = `${sunsetGMT.toLocaleDateString()}, ${sunsetGMT.toLocaleTimeString(
            [],
            { timeStyle: "short" }
          )}`;
        });
    });
  }
});
