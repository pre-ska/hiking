const locations = JSON.parse(document.getElementById("map").dataset.locations);

mapboxgl.accessToken =
  "pk.eyJ1Ijoid29sZndhciIsImEiOiJja2JodXlmZDYwOHlnMzBycHg3MmNydHk2In0.Rs1t63s02skXQhEdzEoT2w";

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/wolfwar/ckbi1hxs311wa1iqhzezm81af",
  scrollZoom: false,
  // center: [19.00103, 45.34914],
  // zoom: 10,
  // interactive: true,
});

//12-14
const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // create marker
  const el = document.createElement("div");
  el.className = "marker";

  //add marker
  new mapboxgl.Marker({
    element: el,
    anchor: "bottom",
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  //add popup
  new mapboxgl.Popup({ offset: 30 })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // extends the map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
