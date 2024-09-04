// map.js
mapboxgl.accessToken =
  'pk.eyJ1IjoibWFydGluY2FzZSIsImEiOiJjazY5ZjIya3UwMjNmM2xtc2l4NGR5cndhIn0.u8dDT2iOQzQmzYKZ1EQzIg'

var windowSize = $(window).width()
let zoomLevel, controlPosition
var centerTimes = { lng: -73.986599390738, lat: 40.756269524707 }
var customMarkerSize = 0.5
var markers
var map, nav
var smallCircleSize = 15
var largeCircleSize = 20
var customMarkerSize = 0.5
var fontSize1, fontSize2

// Check if the window width is less than 501 pixels (mobile view)
if ($(window).width() < 501) {
  // Set map zoom level for smaller screens
  zoomLevel = 15
  smallCircleSize = 15
  largeCircleSize = 20
  customMarkerSize = 0.5
  controlPosition = 'top-right' // Set the position of map controls
  fontSize1 = 8.65 // Set font size for small texts
  fontSize2 = 12.36 // Set font size for larger texts
} else {
  // For larger screens
  zoomLevel = 15.7 // Set map zoom level
  smallCircleSize = 23
  largeCircleSize = 35
  customMarkerSize = 1 // Set marker size for larger screens
  controlPosition = 'bottom-right' // Set control position for larger screens
  fontSize1 = 11.65 // Set font size for small texts
  fontSize2 = 15.36 // Set font size for larger texts
}

map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/martincase/cm0ctf9r3000001pi70h3bgil',
  center: [-73.9857, 40.758],
  zoom: zoomLevel,
  attributionControl: false,
})

nav = new mapboxgl.NavigationControl()
map.addControl(nav, controlPosition)

markers = {}
let currentPopup = null

// Function to toggle category visibility
function toggleCategory(element, category) {
  const list = element.nextElementSibling
  const arrow = element.querySelector('.arrow')
  list.style.display = list.style.display === 'block' ? 'none' : 'block'
  arrow.classList.toggle('collapsed')

  // Hide or show markers based on category
  pois.forEach((poi) => {
    if (poi.main_cat === category) {
      markers[poi.ID].getElement().style.display = 'flex' // Show markers of selected category
    } else {
      markers[poi.ID].getElement().style.display = 'none' // Hide markers of other categories
    }
  })
}

function showPoi(title) {
  const poi = pois.find((p) => p.title === title)
  if (poi) {
    map.flyTo({
      center: [poi.ubication.lng, poi.ubication.lat],
      zoom: 20,
      speed:0.5,
      essential: true,
    })

    if (markers[poi.ID]) {
      // Close the current popup if it is open
      if (currentPopup) {
        currentPopup.remove()
      }

      // Set the new popup as the current one and open it
      currentPopup = markers[poi.ID].getPopup()
      markers[poi.ID].togglePopup()
    }
  } else {
    alert('POI not found!')
  }
}

// Add POI markers to the map
map.on('load', () => {
  pois.forEach((poi) => {
    const el = document.createElement('div')
    el.className = 'custom-marker'
    el.style.backgroundColor = poi.color
    el.style.color = poi.colorfont
    el.textContent = poi.num

    // Set the size of the marker based on the `size` property
    const markerSize = poi.size === 'little' ? smallCircleSize : largeCircleSize
    el.style.width = `${markerSize}px`
    el.style.height = `${markerSize}px`
    el.style.lineHeight = `${markerSize}px` // To center the text vertically

    const marker = new mapboxgl.Marker(el)
      .setLngLat([poi.ubication.lng, poi.ubication.lat])
      .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<h3>${poi.title}</h3><p>${poi.main_cat}</p><a href="${poi.link.url}" target="${poi.link.target}">${poi.link.title}</a>`
        )
      )
      .addTo(map)

    // Store marker by ID
    markers[poi.ID] = marker
  })

  // Load custom image for map markers
  map.loadImage('3TS-Logo.png', function (error, image) {
    if (error) throw error
    map.addImage('custom-icon', image)
  })

  // Add custom point and polygon with the image
  map.addSource('point', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [centerTimes.lng - 0.0017, centerTimes.lat + 0.0007],
          },
        },
      ],
    },
  })

  map.addLayer({
    id: 'custom-points',
    type: 'symbol',
    source: 'point',
    layout: { 'icon-image': 'custom-icon', 'icon-size': customMarkerSize },
  })
})
