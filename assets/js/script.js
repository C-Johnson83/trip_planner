////////// Map and search section //////////

// Location IQ API key
var key = "pk.ab52d604f1e0511146ebe97634a5b6d7";
var searchRadius = 10000;
var searchCriteria = $("#interestsInput");
var reset = $("#reset");
var criteria = 'all';

// Default coordinates for the map's center
var defaultCenter = [39.8283, -98.5795];
// Initialize latlng with the default center coordinates
var latlng = defaultCenter;

// Event listener for the input change
searchCriteria.on("change", function () {
  // Update the criteria variable with the selected value
  criteria = this.value;
  console.log(criteria); // Log the selected value

  // Clear the markers from the map
  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }

  // Call the nearbyStuff function with the updated criteria
  nearbyStuff(latlng, criteria);
});
})

// Add layers to the map using built-in Unwired
var streets = L.tileLayer.Unwired({
  key: key,
  scheme: "streets"
});

// Initialize the map
var map = L.map('map', {
  zoom: 14,
  scrollWheelZoom: true,
  layers: [streets],
  zoomControl: false,
});

// Get the user's location using the Geolocation API
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    // Success callback function
    function (position) {
      var userLat = position.coords.latitude;
      var userLng = position.coords.longitude;
      // Update latlng with the user's location
      latlng = { lat: userLat, lng: userLng };
      map.setView([latlng.lat, latlng.lng], 14);

      // Call the getWeather function with the user's location
      getWeather(latlng);

      // Call the nearbyStuff function with the updated criteria
      nearbyStuff(latlng, criteria);
    },
    // Error callback function
    function (error) {
      // Log the error message
      console.log(error.message);
      // Set the map center to the default center when geolocation fails or user denies access
      map.setView(defaultCenter, 5);
    }
  );
} else {
  // Set the map center to the default center when geolocation is not available
  map.setView(defaultCenter, 5);
}

// Add the autocomplete text box and search using the Location IQ built-in geocoder
var geocoderControl = L.control.geocoder(key, {
  url: "https://api.locationiq.com/v1",
  expanded: true,
  panToPoint: true,
  focus: true,
  position: "topleft",
  zoom: 14,
}).addTo(map);

// Event listener for address selection change to run the functions
geocoderControl.on('select', function (event) {
  console.log(event);
  // Get the latitude and longitude of the selected location
  var latlng = event.latlng;
  var placeName = event.feature.name
criteria = criteria

var dataToStore = {
  name: placeName,
  latlng: latlng,
  criteria: criteria
};

var selectedData = JSON.parse(localStorage.getItem('selectedData')) || [];

selectedData.push(dataToStore);
// Store the data as a single JSON string in local storage
localStorage.setItem('selectedData', JSON.stringify(selectedData));

// Log the data (optional)
console.log('Data stored:', dataToStore);

  icon.empty();
  getWeather(latlng);
  nearbyStuff(latlng, criteria);
});


////////// Weather Section //////////

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
  // Construct the weather query URL with latitude and longitude
  var weatherQueryUrl = weatherUrl + '&lat=' + latlng.lat + '&lon=' + latlng.lng + '&cnt=' + count + "&appid=" + weatherApiKey + "&units=imperial"; // for the current weather

  // Fetch the weather data
  fetch(weatherQueryUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log(data); // Check the retrieved weather data
      var cityName = data.name;
      var tempVal = data.main.temp; // Get the temperature value
      var windVal = data.wind.speed; // Get the wind speed
      var humidityVal = data.main.humidity; // Get the humidity value
      var dateVal = data.dt; // Get the date value
      var newDate = new Date(dateVal * 1000); // Convert the date value
      var date = newDate.toLocaleDateString("en-US");
      var iconVal = data.weather[0].icon; // Get the icon value
      var iconImage = 'https://openweathermap.org/img/wn/' + iconVal + '@2x.png'; // Get the icon image
      var png = $('<img src="' + iconImage + '">'); // Create the icon image
      city.text('Current weather of your destination in ' + cityName + ' is, ' + date);
      png.attr('id', 'weatherIcon');
      icon.append(png);
      temp.text(`Temperature: ${tempVal + '°F'}`);
      wind.text(`Wind Speed: ${(windVal * 2.23694).toFixed(2)} mph`);
      humidity.text(`Humidity: ${humidityVal}%`);
    });
}

function nearbyStuff(latlng, criteria) {
  var nearbyUrl = 'https://us1.locationiq.com/v1/nearby?key='
  // Construct the nearby search query URL
  var nearbyQueryUrl = nearbyUrl + key + '&lat=' + latlng.lat + '&lon=' + latlng.lng + '&tag=' + criteria + '&limit=30&radius=' + searchRadius + '&format=json';

  // Clear the markers from the map
  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  // Create a custom marker icon for places of interest
  var customIcon = L.icon({
    iconUrl: './assets/images/icons8-drop-of-blood-48.png', // Replace with the path to your custom marker image
    iconSize: [48, 48], // Set the size of the icon
    iconAnchor: [16, 32], // Set the anchor point of the icon
  });

  // Fetch nearby locations
  fetch(nearbyQueryUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log('nearby places data',data); // Check the retrieved data
      data.forEach(function (place) {
        // Create markers for each nearby place
        var marker = L.marker([parseFloat(place.lat), parseFloat(place.lon)], { icon: customIcon }).addTo(map);
        marker.bindPopup(place.display_name);
      });
    });
}

reset.on('click', function(){
  selectedData = [];
  localStorage.setItem('selectedData', JSON.stringify(selectedData));
})