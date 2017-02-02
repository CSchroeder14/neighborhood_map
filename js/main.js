/** Global variables  */
var map;
var markers = [];
var infoWindow;

/*wunderground.com Weather api */

jQuery(document).ready(function($) {
    $.ajax({
        url : "http://api.wunderground.com/api/e013dbc22a35253a/geolookup/conditions/q/PA/Pittsburgh.json",
        dataType : "jsonp",
        success : function(parsed_json) {
            var location = parsed_json['location']['city'];
            var temp_f = parsed_json['current_observation']['temp_f'];
            document.getElementById("temperature-box").innerHTML = ("Current temperature in " + location + " is " + temp_f +" °F"); },
        error: function (textStatus, errorThrown) {
            alert('Temperature API failed to load.');
        }
    });
});

/** Location information */
var places = [
    {name:"Redbeard's Bar & Grill",  
    city: "Pittsburgh",
    location:"201 Shiloh St, Pittsburgh, PA 15211",  
    lat:40.4305550,
    lng:-80.0072240},

    {name:"DiFiore's Ice Cream Delite",    
    city: "Pittsburgh",     
    location:"120 Shiloh St, Pittsburgh, PA 15211",                                
    lat:40.4310660,
    lng:-80.0073210},

    {name:"Caliban Book Shop",   
    city: "Pittsburgh",
    location:"410 S Craig St, Pittsburgh, PA 15213",  
    lat:40.4449190,
    lng:-79.9490090},

    {name:"Carnegie Museum of Natural History",   
    city: "Pittsburgh",
    location:"4400 Forbes Ave, Pittsburgh, PA 15213",  
    lat:40.4431960,
    lng:-79.9499150},

    {name:"Gaby et Jules",   
    city: "Pittsburgh",
    location:"5837 Forbes Ave, Pittsburgh, PA 15217",  
    lat:40.4382570,
    lng:-79.9215130}
];

/* Knockout binding */
$(function() {
    var myPlaces = places;
    var viewModel = {
        myPlaces: ko.observableArray(myPlaces),
        setContent: function() {
            alert("value.name");
        },
        query: ko.observable(''),
        search: function(value) {
            console.log('search: ' + value);
            viewModel.myPlaces.removeAll();
            for(var x = 0; x < places.length; x++) {
                if(places[x].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                    console.log('visible: ' + places[x].name);
                    viewModel.myPlaces.push(places[x]);
                    markers[x].setVisible(true);
                } else {
                    console.log('invisible: ' + markers[x].title );
                    markers[x].setVisible(false);
                }
            }
        }
    };
    viewModel.query.subscribe(viewModel.search);
    ko.applyBindings(viewModel);
});

/* Initializes google map & markers. */
function initialize() {
    var bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        mapTypeId: 'roadmap',
        zoom: 16
    };
                    
/* Displays map on page */
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    
/* Loops through array of markers */  
    for( i = 0; i < places.length; i++ ) {
        var position = new google.maps.LatLng(places[i].lat, places[i].lng);
        bounds.extend(position);
        marker = new google.maps.Marker({
            position: position,
            animation: google.maps.Animation.DROP,
            title: places[i].name
        });

        infoWindow = new google.maps.InfoWindow(), marker, i;

        markers.push(marker);
        
/* Each marker to have own content */  
        google.maps.event.addListener(markers[i], 'click', (function(marker, i) {
            return function() {
                showMarkerContent(marker, i);
            }
        })(markers[i], i));

        markers[i].setMap(map);
    }

    map.fitBounds(bounds);
}

/* Shows content when item is selected */
function showContent(name) {
    console.log(name);
    
    for(var x = 0; x < markers.length; x++) {
        if (markers[x].title.indexOf(name) >= 0){
            console.log('found: ' + name);
            markers[x].setAnimation(google.maps.Animation.BOUNCE);
            stopAnimation(markers[x]);
            showMarkerContent(markers[x], x);
        }
    }
}

/* Stops marker bounce animation */
function stopAnimation(marker) {
    setTimeout(function () {
        marker.setAnimation(null);
    }, 2000);
}

function showMarkerContent(marker, i) {
    try {
        infoWindow.setContent('<div id="info_content">' 
            + '<h3>' + places[i].name + '</h3>' 
            + '<p>' + places[i].city +'</p>' 
            + '<p>' + places[i].location +'</p>' 
            +'</div>');
        infoWindow.open(map, marker);
        showStreetView(i);
    } catch(err) {
        console.log('error: ' + err);
    }
}

/* Street view */
function showStreetView(i) {
    var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('street_view'), {
            position: {lat: places[i].lat, lng: places[i].lng},
            pov: {
                heading: 34,
                pitch: 10
            }
        }
    );
    map.setStreetView(panorama);
}

