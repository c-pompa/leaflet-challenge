// 1. **Get your data set**

// ![3-Data](Images/3-Data.png)

// The USGS provides earthquake data in a number of different formats, updated every 5 minutes. Visit the [USGS GeoJSON Feed](http://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php) page and pick a data set to visualize. When you click on a data set, for example 'All Earthquakes from the Past 7 Days', you will be given a JSON representation of that data. You will be using the URL of this JSON to pull in the data for our visualization.

// ![4-JSON](Images/4-JSON.png)
// sd
// 2. **Import & Visualize the Data**

// Create a map using Leaflet that plots all of the earthquakes from your data set based on their longitude and latitude.

// * Your data markers should reflect the magnitude of the earthquake in their size and color. Earthquakes with higher magnitudes should appear larger and darker in color.

// * Include popups that provide additional information about the earthquake when a marker is clicked.

// * Create a legend that will provide context for your map data.

// * Your visualization should look something like the map above.


// Create the tile layer that will be the background of our map

// Initialize all of the LayerGroups we'll be using

// An array which will be used to store created cityMarkers


// Perform an API call to the Citi Bike Station Information endpoint
var data = d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson", function(data) {


    // console.log(data);
    var features = data.features;
    var earthquakeMarkers = [];
    var heatArray = [];

    for (var i = 0; i < features.length; i++) {

        // create custom icon
        var earthquakeIcon = L.icon({
            iconUrl: './static/images/noun_Earthquake_709338.svg',
            iconSize: [features[i].properties.mag * 6, features[i].properties.mag * 12], // size of the icon
            popupAnchor: [0, -15]
        });
        // create popup contents
        var customPopup = `<b>Location:</b> ${features[i].properties.place} <br> <b>Magnitude:</b> ${features[i].properties.mag}`;

        // specify popup options 
        var customOptions = {
            'maxWidth': '500',
            'className': getStyle(features[i].properties.mag)
        }

        function getStyle(d) {
            if (2.49 > d) {
                return 'custom';
            } else if (3.0 > d) {
                return 'custom2';
            } else if (d > 3.1) {
                return 'custom3';
            }
        };


        // loop through the cities array, create a new marker, push it to the cityMarkers array
        earthquakeMarkers.push(
            L.marker([features[i].geometry.coordinates[1], features[i].geometry.coordinates[0]], { icon: earthquakeIcon }).bindPopup(customPopup, customOptions)
        );

        if (location) {
            heatArray.push([features[i].geometry.coordinates[1], features[i].geometry.coordinates[0]]);
        }


    };


    // Add all the cityMarkers to a new layer group.
    // Now we can handle them as one group instead of referencing each individually



    var earthquakeLayer = L.layerGroup(earthquakeMarkers);
    var heat = L.heatLayer(heatArray, {
        radius: 60,
        blur: 40
    });

    // Define variables for our tile layers
    var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 15,
        id: "light-v10",
        accessToken: API_KEY
    });

    var dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 15,
        id: "dark-v10",
        accessToken: API_KEY
    });

    // Only one base layer can be shown at a time
    var baseMaps = {
        Light: light,
        Dark: dark
    };

    // Overlays that may be toggled on or off
    var overlayMaps = {
        'Earthquakes': earthquakeLayer,
        'Heat Map': heat
    };

    // Create map object and set default layers
    var myMap = L.map("map", {
        center: [34.0522, -118.2437],
        zoom: 8,
        layers: [light, earthquakeLayer]
    });

    // Pass our map layers into our layer control
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);


    // Set up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend ");


        var legendInfo = `<h2>${features.length}</h2> Earthquakes recorded <br>in the past 7 days`;

        div.innerHTML = legendInfo;

        div.innerHTML += " <br>Magnitude Ranges: <ul class='range1'> 2.5 & below</ul><ul class='range2'> 2.5 - 3.0 </ul><ul class='range3'> 3.1+ </ul> ";
        return div;

    };

    // Adding legend to the map
    legend.addTo(myMap);

});