import React, { PropTypes } from 'react'
import {default as Firebase} from 'firebase'
import {default as Feed} from './Feed.jsx';
import {default as Tech} from './Tech.jsx';

var map;
window.initMap = function() {
  var styles = [{"featureType":"administrative","elementType":"all","stylers":[{"visibility":"on"},{"lightness":33}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2e5d4"}]},{"featureType":"poi.park","elementType":"geometry","stylers":[{"color":"#c5dac6"}]},{"featureType":"poi.park","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":20}]},{"featureType":"road","elementType":"all","stylers":[{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#c5c6c6"}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#e4d7c6"}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#fbfaf7"}]},{"featureType":"water","elementType":"all","stylers":[{"visibility":"on"},{"color":"#acbcc9"}]}];

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 32.0667, lng: 34.8000},
    zoom: 13
  });
  map.setOptions({styles:styles});


};
const Map = React.createClass({
  getInitialState: function() {
    return {
      drivers : {}
    };
  },
  componentWillMount: function() {

  },
  componentDidMount: function() {
    var self = this;
    // Get a reference to our posts
    var ref = new Firebase("https://intense-inferno-8553.firebaseio.com").child('active');
    // Get the data on a post that has changed
    ref.on("child_changed", function(snapshot) {
      self.updateMarker(snapshot.key(), snapshot.val().location.latitude, snapshot.val().location.longitude);
    });
    ref.on("child_added", function(snapshot, prevChildKey) {
      self.updateMarker(snapshot.key(), snapshot.val().location.latitude, snapshot.val().location.longitude);
      // console.log(newPost);
    });
    // Get the data on a post that has been removed
    ref.on("child_removed", function(snapshot) {
      if (self.state.drivers[snapshot.key()]) {
        self.state.drivers[snapshot.key()].setMap(null);
        self.state.drivers[snapshot.key()] = undefined;
      }
    });

  },
  updateMarker: function (key, lat, lng){
    if (!map || !lat || !lng) return;
    // console.log(key + ': '+lat + ',' + lng);
    if (this.state.drivers[key]) {
      this.state.drivers[key].setPosition({lat: lat, lng: lng});
    }
    else{
      var image = {
        url: 'images/car.png',
        // This marker is 20 pixels wide by 32 pixels high.
        size: new google.maps.Size(32, 32),
        // The origin for this image is (0, 0).
        anchor: new google.maps.Point(16, 16),
        origin: new google.maps.Point(0,0),
        // The anchor for this image is the base of the flagpole at (0, 32).
      };
      this.state.drivers[key] = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: map,
        title: key,
        icon:image
      });
    }
  },
  render () {
    // for (var i = 0; i < this.state.activeDrivers.length; i++) {
    // var driver = this.state.activeDrivers[i];
    // console.log(driver);
    // }
    return (
      <div className='app-container'>
        <div className='feed-container'>
          <div className="events">
          <Feed/>
          </div>
          <Tech/>
        </div>
        <div className='map-container'>
          <div id='map'>
          </div>
        </div>

      </div>
    )
  }
})

export default Map
