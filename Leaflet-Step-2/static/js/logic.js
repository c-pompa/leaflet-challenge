// Add Techtonic Plate Later as an option
var techtonicLayer = L.layerGroup();
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(techtonicData) {
    L.geoJSON(techtonicData, {
        color: 'orange',
        weight: 2
    }).addTo(techtonicLayer);
});

// Perform an API call to the Citi Bike Station Information endpoint
var data = d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson", function(data) {
    // When the first API call is complete, perform another call to the Citi Bike Station Status endpoint



    // console.log(techtonicData.features[1].geometry.coordinates);
    var features = data.features;
    // var techtonic = techtonicData.features;
    var techtonicArray = [];
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
            techtonicArray.push([]);
        }
        if (location) {
            heatArray.push([features[i].geometry.coordinates[1], features[i].geometry.coordinates[0]]);
        }


    };


    // Add all the cityMarkers to a new layer group.
    // Now we can handle them as one group instead of referencing each individually



    var earthquakeLayer = L.layerGroup(earthquakeMarkers);

    var heat = L.heatLayer(heatArray, {
        minOpacity: .20,
        radius: 55,
        blur: 15,
        max: 1.0
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
        'Techtonic Plates': techtonicLayer,
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