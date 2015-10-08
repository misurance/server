import React, { PropTypes } from 'react'
const Map = React.createClass({
  // mixins: [ReactFireMixin],
  componentWillMount: function() {
    // this.bindAsArray(new Firebase("https://intense-inferno-8553.firebaseio.com/"), "users");
  },
  componentDidMount: function() {
    window.initMap = function() {
      console.log(document.getElementById('map'));
      var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 32.0961256, lng: 34.7789511},
        zoom: 14
      });
    };
  },
  render () {
    return (
      <div id='map'>
      </div>
    )
  }
})

export default Map
