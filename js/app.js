// This is just a sample script. Paste your real code (javascript or HTML) here.
// Global Variables
var map;
var clientID;
var clientSecret;
var largeInfowindow;
var markers = [];

function initMap() {
    // Create a map object and specify the DOM element for display.
    map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: 37.7749,
            lng: -122.4194
        },
        zoom: 12,
        styles: styles,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
    });

    largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        var venueID = locations[i].venueID;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            icon: "https://mt.googleapis.com/vt/icon/name=icons/onion/169-ltblue-dot.png",
            title: title,
            animation: google.maps.Animation.DROP,
            venueID: venueID,
            id: i
        });
        bounds.extend(marker.position);
        // Push the marker to our array of markers.
        // markers.push(marker);
        // Create an onclick event to open an infowindow at each marker.
        locations[i].marker = marker;
        marker.addListener("click", function() {
            populateInfoWindow(this, largeInfowindow);
        });
    }
    // Extend the boundaries of the map for each marker
    map.fitBounds(bounds);

    // Activate knockout.js
    ko.applyBindings(new AppViewModel());
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // When clicked, BOUNCE the marker
    toggleBounce(marker);
    // toggleBounce(marker);
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;
        // FourSquare API Credentials
        clientID = "JIDKFDBFY0LLIHC4JVBK20ZKVFAKQVOFM3I5NMZ1SDMTV521";
        clientSecret = "YWT1QCWT5GHO1WQEIHNGVFMQC0EROZUL4K4OPMHYVANJQYCB";
        searchUrl = `https://api.foursquare.com/v2/venues/${marker.venueID}?client_id=${clientID}&client_secret=${clientSecret}&v=20171111`;
        // FourSquare API
        $.ajax({
            url: searchUrl
        }).done(function(data) {
            var contentString;
            if (data.response.venue.location.formattedAddress[2] === undefined) {
                contentString = `
                <div>
                  <h6>${marker.title}</h6>
                  <p>${data.response.venue.location.formattedAddress[0]},</p>
                  <p>${data.response.venue.location.formattedAddress[1]}</p>
                </div>
                `;
            } else {
                contentString = `
              <div>
                <h6>${marker.title}</h6>
                <p>${data.response.venue.location.formattedAddress[0]},</p>
                <p>${data.response.venue.location.formattedAddress[1]},</p>
                <p>${data.response.venue.location.formattedAddress[2]},</p>
              </div>
              `;
            }
            infowindow.setContent(contentString);
        }).fail(function() {
            alert("Unable to retrieve data from the FourSquare API.");
        });
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener("closeclick", function() {
            infowindow.setMarker = null;
        });
    }
}

// Set the animation to BOUNCE when the marker is clicked
function toggleBounce(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
        marker.setAnimation(null);
    }, 1400);
}

// View Model For The application
function AppViewModel() {
    var self = this;
    // Value of the search input
    self.searchTerm = ko.observable("");
    // Open the infowindow of the specific marker for the locations in the sidebar
    self.toggleMarker = function(location) {
        google.maps.event.trigger(location.marker, "click");
    };
    // Make the locations model into an observable array
    self.places = ko.observableArray(locations);
    // The filter array
    self.filteredLocations = ko.computed(function() {
        // Make the input value to lower case for better user experience
        var filter = self.searchTerm().toLowerCase();
        // The filter function
        return ko.utils.arrayFilter(self.places(), function(location) {
            var match = location.title.toLowerCase().indexOf(filter) !== -1;
            location.marker.setVisible(match)
            return match;
        });
    });
}

// Google Map Error Handler
function mapError() {
    alert("Unable to load the Google Map. Please try again.");
}
