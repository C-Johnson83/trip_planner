////////// Map and search section //////////
  // Create the default layer
  var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    noWrap: true,
    maxZoom: 20
  });
    // Create alternative layers
    var streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      noWrap: true,
      
  });
  var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    noWrap: true,
  });
  
  var OpenTopoMap = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    noWrap: true,
  });
  var NASAGIBS_ViirsEarthAtNight2012 = L.tileLayer('https://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
    attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
    bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
    minZoom: 1,
    maxZoom: 8,
    format: 'jpg',
    time: '',
    noWrap: true,
    tilematrixset: 'GoogleMapsCompatible_Level'
  });

  // Create a baseMaps 
let baseMaps = {
  "Dark Matter": CartoDB_DarkMatter,
  "Street Map": streetmap,
  
  "World Map": Esri_WorldImagery,
  

  
  };

// Location IQ API key
var key = "pk.ab52d604f1e0511146ebe97634a5b6d7";
var searchRadius = 10000;
var searchCriteria = $("#interestsInput");
var reset = $("#reset");
var criteria = 'all';
var favorites = $('#favorites');
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

L.control.layers(baseMaps, null, { collapsed: false, color: "gray" }).addTo(map);

// Get the user's location using the Geolocation API
if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    // Success callback function
    function (position) {
      var userLat = position.coords.latitude;
      var userLng = position.coords.longitude;
      // Update latlng with the user's location
      latlng = { lat: userLat, lng: userLng };
      map.setView([latlng.lat, latlng.lng], 16);

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
      map.setView(defaultCenter, 17);
    }
  );
} else {
  // Set the map center to the default center when geolocation is not available
  map.setView(defaultCenter, 17);
}

// Add the autocomplete text box and search using the Location IQ built-in geocoder
var geocoderControl = L.control.geocoder(key, {
  url: "https://api.locationiq.com/v1",
  expanded: true,
  panToPoint: true,
  focus: true,
  position: "topleft",
  zoom: 15,
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
var favButton = $('<button>', {
  text: placeName,
});

favButton.click(function () {
  // Handle the click event (e.g., center the map on the location)
  map.setView([dataToStore.latlng.lat, dataToStore.latlng.lng], 13);
  getWeather(dataToStore.latlng);
  nearbyStuff(dataToStore.latlng, criteria);
});

favorites.append(favButton);


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
  favorites.empty();
  localStorage.setItem('selectedData', JSON.stringify(selectedData));
})