import React, { PropTypes } from 'react';
import {default as Map} from './components/Map.jsx';
import {default as Feed} from './components/Feed.jsx';
const DashboardApp = React.createClass({
  render () {
    return (
      <div className='app-container'>
        <div className='map-container'>
        <Map/>
        </div>
        
      </div>
    )
  }
})

export default DashboardApp
