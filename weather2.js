let lat, lon;
    
function getWeatherData() {
  const apiKey = '8d6509de40db05562be58e56aa21fb1f';
  const zipCode = document.getElementById('zipCode').value;
  const countryCode = document.getElementById('countryCode').value;

  if (!zipCode || !countryCode) {
    document.getElementById('alerts').innerText = 'Please enter both ZIP Code and Country Code.';
    document.getElementById('airQuality').innerText = 'Please enter both ZIP Code and Country Code.';
    document.getElementById('sunriseSunset').innerText = 'Please enter both ZIP Code and Country Code.';
    document.getElementById('forecast').innerText = 'Please enter both ZIP Code and Country Code.';
    return;
  }

  fetch(`http://api.openweathermap.org/geo/1.0/zip?zip=${zipCode},${countryCode}&appid=${apiKey}`)
    .then(response => response.json())
    .then(data => {
      if (!data.lat || !data.lon) {
        document.getElementById('alerts').innerText = 'Invalid ZIP Code or Country Code.';
        document.getElementById('airQuality').innerText = 'Invalid ZIP Code or Country Code.';
        document.getElementById('sunriseSunset').innerText = 'Invalid ZIP Code or Country Code.';
        document.getElementById('forecast').innerText = 'Invalid ZIP Code or Country Code.';
        return;
      }

      lat = data.lat;
      lon = data.lon;
      console.log(`Latitude: ${lat}, Longitude: ${lon}`);

      // Fetch weather alerts
      fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,daily&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
          const alerts = data.alerts || [];
          let alertsHTML = '';
          if (alerts.length === 0) {
            alertsHTML = '<p>No weather alerts for this location.</p>';
          } else {
            alerts.forEach(alert => {
              alertsHTML += `
                <div class="alert">
                  <h3>${alert.event}</h3>
                  <p>${alert.description}</p>
                  <p>Start: ${new Date(alert.start * 1000).toLocaleString()}</p>
                  <p>End: ${new Date(alert.end * 1000).toLocaleString()}</p>
                </div>`;
            });
          }
          document.getElementById('alerts').innerHTML = alertsHTML;
        })
        .catch(error => {
          console.error('Error fetching weather alerts:', error);
          document.getElementById('alerts').innerText = 'Error loading weather alerts.';
        });

      // Fetch air quality index
      fetch(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
          const aqi = data.list[0].main.aqi;
          const aqiDescription = getAQIDescription(aqi);
          const airQualityHTML = `
            <p>Air Quality Index (AQI): ${aqi}</p>
            <p>Air Quality Description: ${aqiDescription}</p>`;
          document.getElementById('airQuality').innerHTML = airQualityHTML;
        })
        .catch(error => {
          console.error('Error fetching air quality index:', error);
          document.getElementById('airQuality').innerText = 'Error loading air quality index.';
        });

      // Fetch current weather data including sunrise and sunset times
      fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
          const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
          const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString();
          const sunriseSunsetHTML = `
            <p>Sunrise: ${sunrise}</p>
            <p>Sunset: ${sunset}</p>`;
          document.getElementById('sunriseSunset').innerHTML = sunriseSunsetHTML;
        })
        .catch(error => {
          console.error('Error fetching weather data:', error);
          document.getElementById('sunriseSunset').innerText = 'Error loading weather data.';
        });

      // Fetch 3-hour forecast
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
          const forecast = data.list.slice(0, 9); // Get the next 3 hours of forecast (3-hour intervals)
          let forecastHTML = '';
          let rowCount = 0;
          forecast.forEach((item, index) => {
            if (index % 3 === 0) {
              if (rowCount > 0) forecastHTML += '</div>'; // Close previous row
              forecastHTML += '<div class="forecast-row">'; // Start new row
            }
            const date = new Date(item.dt * 1000).toLocaleDateString();
            const time = new Date(item.dt * 1000).toLocaleTimeString();
            const temp = item.main.temp;
            const description = item.weather[0].description;
            forecastHTML += `
              <div class="forecast-item">
                <p>Date: ${date}</p>
                <p>Time: ${time}</p>
                <p>Temp: ${temp} K</p>
                <p>Description: ${description}</p>
              </div>`;
            if (index === forecast.length - 1) forecastHTML += '</div>'; // Close last row
          });
          document.querySelector('.forecast-container').innerHTML = forecastHTML;
        })
        .catch(error => {
          console.error('Error fetching forecast data:', error);
          document.querySelector('.forecast-container').innerText = 'Error loading forecast data.';
        });
    })
    .catch(error => {
      console.error('Error fetching geolocation data:', error);
      document.getElementById('alerts').innerText = 'Error loading geolocation data.';
      document.getElementById('airQuality').innerText = 'Error loading geolocation data.';
      document.getElementById('sunriseSunset').innerText = 'Error loading geolocation data.';
      document.getElementById('forecast').innerText = 'Error loading geolocation data.';
    });
}

function getAQIDescription(aqi) {
  switch (aqi) {
    case 1:
      return 'Good';
    case 2:
      return 'Fair';
    case 3:
      return 'Moderate';
    case 4:
      return 'Poor';
    case 5:
      return 'Very Poor';
    default:
      return 'Unknown';
  }
}
