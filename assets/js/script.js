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
    var markLocation = L.marker([parseFloat(latlng.lat), parseFloat(latlng.lng)]).addTo(map);
    markLocation.bindPopup('hi');
    // Call the nearbyStuff function with the updated criteria
    nearbyStuff(latlng, criteria);
  });
})


// Initialize the map
var map = L.map('map', {
  zoom: 14,
  scrollWheelZoom: true,
  layers: [CartoDB_DarkMatter],
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
    icon.empty();
    // Handle the click event (e.g., center the map on the location)
    map.setView([dataToStore.latlng.lat, dataToStore.latlng.lng], 13);
    getWeather(dataToStore.latlng);
    nearbyStuff(dataToStore.latlng, criteria);
    repoReapersAway(latlng)
  });

  favorites.append(favButton);


  // Log the data (optional)
  console.log('Data stored:', dataToStore);

  icon.empty();
  getWeather(latlng);
  nearbyStuff(latlng, criteria);
  repoReapersAway(latlng)
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
      console.log('weather data', data); // Check the retrieved weather data
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
  var nearbyQueryUrl = nearbyUrl + key + '&lat=' + latlng.lat + '&lon=' + latlng.lng + '&tag=' + criteria + '&limit=50&radius=' + searchRadius + '&format=json';

  // Clear the markers from the map
  map.eachLayer(function (layer) {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });
  var citymarker = L.marker([parseFloat(latlng.lat), parseFloat(latlng.lng)]).addTo(map);
  citymarker.bindPopup('hi');

  // Fetch nearby locations
  fetch(nearbyQueryUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log('nearby places data', data); // Check the retrieved data
      data.forEach(function (place) {
        // console.log(place.type)

        // Create a custom marker icon for places of interest

        var airportIcon = L.icon({
          iconUrl: './assets/images/icons8-airplane-48.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var atmIcon = L.icon({
          iconUrl: './assets/images/icons8-atm-48.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var bankIcon = L.icon({
          iconUrl: './assets/images/icons8-bank-48.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var busStationIcon = L.icon({
          iconUrl: './assets/images/icons8-bus-station-48.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var cardealerIcon = L.icon({
          iconUrl: './assets/images/icons8-car-rental-48.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var churchIcon = L.icon({
          iconUrl: './assets/images/icons8-church-50.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var cinemaIcon = L.icon({
          iconUrl: './assets/images/icons8-documentary-64.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var customIcon = L.icon({
          iconUrl: './assets/images/icons8-drop-of-blood-48.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var restuarantIcon = L.icon({
          iconUrl: './assets/images/icons8-fast-food-53.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var fuelIcon = L.icon({
          iconUrl: './assets/images/icons8-fuel-48.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var gymIcon = L.icon({
          iconUrl: './assets/images/icons8-gym-48.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var hospitalIcon = L.icon({
          iconUrl: './assets/images/icons8-hospital-64.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var hotelIcon = L.icon({
          iconUrl: './assets/images/icons8-hotel-64.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var parkIcon = L.icon({
          iconUrl: './assets/images/icons8-park-40.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var parkingIcon = L.icon({
          iconUrl: './assets/images/icons8-parking-64.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var pharmacyIcon = L.icon({
          iconUrl: './assets/images/icons8-pharmacy-64.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var pubIcon = L.icon({
          iconUrl: './assets/images/icons8-pub-64.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var railwayStationIcon = L.icon({
          iconUrl: './assets/images/icons8-railway-station-48.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var schoolIcon = L.icon({
          iconUrl: './assets/images/icons8-school-94.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var stadiumIcon = L.icon({
          iconUrl: './assets/images/icons8-stadium-48.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var supermarketIcon = L.icon({
          iconUrl: './assets/images/icons8-supermarket-48.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });
        var toiletIcon = L.icon({
          iconUrl: './assets/images/icons8-toilet-48.png', // Replace with the path to your custom marker image
          iconSize: [32, 32], // Set the size of the icon
          iconAnchor: [16, 32], // Set the anchor point of the icon
        });


        if (place.type == 'place_of_worship') {
          mapIcon = churchIcon;
        } else if (place.type == 'airport') {
          mapIcon = airportIcon;
        } else if (place.type == 'atm') {
          mapIcon = atmIcon;
        } else if (place.type == 'bank') {
          mapIcon = bankIcon;
        } else if (place.type == 'bus_station') {
          mapIcon = busStationIcon;
        } else if (place.type == 'cardealer') {
          mapIcon = cardealerIcon;
        } else if (place.type == 'church') {
          mapIcon = churchIcon;
        } else if (place.type == 'cinema') {
          mapIcon = cinemaIcon;
        } else if (place.type == 'restuarant') {
          mapIcon = restuarantIcon;
        } else if (place.type == 'fuel') {
          mapIcon = fuelIcon;
        } else if (place.type == 'gym') {
          mapIcon = gymIcon;
        } else if (place.type == 'hospital') {
          mapIcon = hospitalIcon;
        } else if (place.type == 'hotel') {
          mapIcon = hotelIcon;
        } else if (place.type == 'park') {
          mapIcon = parkIcon;
        } else if (place.type == 'parking') {
          mapIcon = parkingIcon;
        } else if (place.type == 'pharmacy') {
          mapIcon = pharmacyIcon;
        } else if (place.type == 'pub') {
          mapIcon = pubIcon;
        } else if (place.type == 'railway_station') {
          mapIcon = railwayStationIcon;
        } else if (place.type == 'school') {
          mapIcon = schoolIcon;
        } else if (place.type == 'stadium') {
          mapIcon = stadiumIcon;
        } else if (place.type == 'supermarket') {
          mapIcon = supermarketIcon;
        } else if (place.type == 'toilet') {
          mapIcon = toiletIcon;
        } else {
          mapIcon = customIcon
        }

        // Create markers for each nearby place
        var marker = L.marker([parseFloat(place.lat), parseFloat(place.lon)], { icon: mapIcon }).addTo(map);
        marker.bindPopup(place.display_name);
      });
    });
}

function repoReapersAway(latlng) {
  var drivingUrl = 'https://us1.locationiq.com/v1/directions/driving/';
  var polyline;

  var startInput = [-83.5085, 31.4505];
  var drivingQueryUrl = drivingUrl + startInput + ';' + latlng.lng + ',' + latlng.lat + "?key=" + key + '&steps=true&alternatives=true&geometries=geojson&overview=full';

  // Remove the old polyline if it exists
  if (polyline) {
    map.removeLayer(polyline);
  }

  startingPointMarker = L.marker(startInput).addTo(map).bindPopup("Start the trip here");
  endingPointMarker = L.marker([latlng.lng, latlng.lat]).addTo(map).bindPopup("End the trip here");

  fetch(drivingQueryUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      console.log("driving data", data);

      // Extract the coordinates from the GeoJSON response
      var coordinates = data.routes[0].geometry.coordinates;

      // Create an empty array to store polyline coordinates
      var polylineCoordinates = [];

      // Add coordinates to the polylineCoordinates array
      coordinates.forEach(function (coordinate) {
        polylineCoordinates.push([coordinate[1], coordinate[0]]);
      });

      // Create the polyline using the coordinates
      polyline = L.polyline(polylineCoordinates, { color: 'blue' }).addTo(map);
    });
}







reset.on('click', function () {
  selectedData = [];
  favorites.empty();
  localStorage.setItem('selectedData', JSON.stringify(selectedData));
})