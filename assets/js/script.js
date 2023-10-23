var key = "pk.ab52d604f1e0511146ebe97634a5b6d7";
var searchRadius = 1000;
var searchCriteria = "hotel";

// Add layers that we need to the map
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
    zoomControl: false
  });

  // Add the autocomplete text box
var geocoderControl = L.control.geocoder(key, {
    url: "https://api.locationiq.com/v1",
    expanded: true,
    panToPoint: true,
    focus: true,
    position: "topleft",
    zoom: 10,
  }).addTo(map);

function readFavoritesFromStorage() {
    var favorite = localStorage.getItem('favorite');
    if (favorite) {
        favorite = JSON.parse(favorite);
    } else {
        favorite = [];
    }
    return favorite;
}

function saveFavoriteToStorage() {
    localStorage.setItem('favorite', JSON.stringify(favorite));
}

function printFavoriteData() {
    favoriteDisplayEl.empty();
    var favorite = readFavoritesFromStorage();
    for (var i = 0; i < favorite.length; i += 1) {
        var favorite = favorite[i];
        var rowEl = $('<tr>');
        var nameEl = $('<tr>').text(favorite.name);
        var poiEl = $('<td>').text(favorite.$(searchCriteria));
    }
}


//   listening event for address
  geocoderControl.on('select', function(event) {
    console.log (event);
    var latlng = event.latlng; // Get the latitude and longitude of the entered location
    console.log('Latitude:', latlng.lat, 'Longitude:', latlng.lng);
    console.log('Place ID:', event.feature.feature.place_id);
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": `https://us1.locationiq.com/v1/nearby?key=${key}&lat=${latlng.lat}&lon=${latlng.lng}&tag=${searchCriteria}&radius=${searchRadius}&format=json`,
        "method": "GET"
    }

    $.ajax(settings).done(function (response) {
        console.log(response);
      });
  });