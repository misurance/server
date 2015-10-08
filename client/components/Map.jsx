import React, { PropTypes } from 'react'
import {default as Firebase} from 'firebase'
var map;
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
    window.initMap = function() {
      map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 32.0667, lng: 34.8000},
        zoom: 13
      });
    };
  },
  updateMarker: function (key, lat, lng){
    if (!map) return;
    console.log(key + ': '+lat + ',' + lng);
    if (this.state.drivers[key]) {
      this.state.drivers[key].setPosition({lat: lat, lng: lng});
    }
    else{
      this.state.drivers[key] = new google.maps.Marker({
        position: {lat: lat, lng: lng},
        map: map,
        title: key
      });
    }
  },
  render () {
    // for (var i = 0; i < this.state.activeDrivers.length; i++) {
    // var driver = this.state.activeDrivers[i];
    // console.log(driver);
    // }
    return (
      <div id='map'>
      </div>
    )
  }
})

export default Map
