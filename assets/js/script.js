var key = "pk.ab52d604f1e0511146ebe97634a5b6d7";


// Initialize the map
var map = L.map('map', {
    center: [37.779,-122.42], // Map loads with this location as center lat,lon
    zoom: 13,
    scrollWheelZoom: true,
    layers: [streets],
    zoomControl: false
  });

L.control.geocoder(key, {
    placeholder: 'Search nearby',
    url: "https://api.locationiq.com/v1",
    expanded: true,
    panToPoint: true,
    focus: true,
    position: "topleft"
  }).addTo(map);