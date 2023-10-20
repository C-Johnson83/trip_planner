var key = "pk.ab52d604f1e0511146ebe97634a5b6d7";

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