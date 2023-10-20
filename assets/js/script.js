// Map and search section 
// Location IQ api key
var key = "pk.ab52d604f1e0511146ebe97634a5b6d7";

// Add layers that we need to the map using built in Unwired
var streets = L.tileLayer.Unwired({
    key: key,
    scheme: "streets"
  });

    // Initialize the map
var map = L.map('map', {
    center: [31.4505, -83.5085], // Map loads with my town location as center lat,lon
    zoom: 10,
    scrollWheelZoom: true,
    layers: [streets],
    zoomControl: false,
  });

  // Add the autocomplete text box and search using the Location IQ built in geocoder
var geocoderControl = L.control.geocoder(key, {
    url: "https://api.locationiq.com/v1",
    expanded: true,
    panToPoint: true,
    focus: true,
    position: "topleft",
    zoom: 10,
  }).addTo(map);

//   listening event for address selection change
  geocoderControl.on('select', function(event) {
    console.log (event);
    var latlng = event.latlng; // Get the latitude and longitude of the selected location
    console.log('Latitude:', latlng.lat, 'Longitude:', latlng.lng);
    getWeather(latlng)
  });


  // Weather Section
  // OpenWeather API key
  var weatherApiKey = 'cebdbe1753a5af12101fc266dce79204';
  var weatherUrl = "https://api.openweathermap.org/data/2.5/weather?q="
  var city = $('#currentCity');
  var icon = $('#iconCurrent');
  var temp = $('#currentTemp');
  var wind = $('#currentWind');
  var humidity = $('#currentHumidity');
  var count = '8'

  function getWeather(latlng) {
 
    console.log(latlng);
    var weatherQueryUrl = weatherUrl + '&lat=' + latlng.lat + '&lon=' + latlng.lng + '&cnt=' + count + "&appid=" + weatherApiKey + "&units=imperial"; // for the current weather
    fetch(weatherQueryUrl)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        console.log(data); // checking the data
        var cityName = data.name;
        var tempVal = data.main.temp; // get the temp value
        var windVal = data.wind.speed; // get the wind speed
        var humidityVal = data.main.humidity; // get the humidity value
        var dateVal = data.dt; // get the date value
        var newDate = new Date(dateVal * 1000); // get the date
        var date = newDate.toLocaleDateString("en-US");
        var iconVal = data.weather[0].icon; // get the icon value
        var iconImage = 'https://openweathermap.org/img/wn/' + iconVal + '@2x.png'; // get the icon image
        var png = $('<img src="' + iconImage + '">'); // creating the icon image
        city.text('Current weather of your destination in ' + cityName + ' is, ' + date);
        png.attr('id', 'weatherIcon');
        icon.append(png);
        temp.text(`Temperature: ${tempVal + '°F'}`);
        wind.text(`Wind Speed: ${(windVal * 2.23694).toFixed(2)} mph`);
        humidity.text(`Humidity: ${humidityVal}%`);
    });
}