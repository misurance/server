import React, { PropTypes } from 'react';
import {default as Map} from './components/Map.jsx';
const DashboardApp = React.createClass({
  render () {
    return (
      <div className='dashboard'>
        <nav className='deep-purple lighten-3'>
          <div className="nav-wrapper">
              <img className="brand-logo center " src='images/logo.png'/>
          </div>
        </nav>
        <Map/>
      </div>
    )
  }
})

export default DashboardApp
