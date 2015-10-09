import React, { PropTypes } from 'react'

const Tech = React.createClass({
  render () {
    return (
      <div className='tech-container'>
        <h4>Powered by</h4>
        <div className='tech-lists-container'>
          <ul>
            <li>
              <img src='http://img.stackshare.io/service/531/bWTWwJZU.png'></img>
              RethinkDB
            </li>
            <li>
              <img src='http://img.stackshare.io/service/133/43sHKeth.png'></img>
              socket.io
            </li>
            <li>
              <img src='http://img.stackshare.io/service/1020/OYIaJ1KK.png'></img>
              React
            </li>
            <li>
              <img src='http://img.stackshare.io/service/1020/OYIaJ1KK.png'></img>
              React Native
            </li>
            <li>
              <img src='http://img.stackshare.io/service/116/firebase_branding_r4_FINAL_03.png'></img>
              Firebase
            </li>
            <li>
              <img src='http://img.stackshare.io/service/1011/GWnVTc9j.png'></img>
              NodeJS
            </li>
          </ul>
          <ul>
            <li>
              <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Texa_obd-log.png/440px-Texa_obd-log.png'></img>
              OBD
            </li>
            <li>
              <img src='https://pbs.twimg.com/profile_images/378800000763788802/d4652fe88de19a6c7ead52c56fa91f46_400x400.jpeg'></img>
              Rx
            </li>
            <li>
              <img src='https://pbs.twimg.com/profile_images/1332105692/OSM_fixed_512.png'></img>
              Open StreetMap
            </li>
            <li>
              <img src='http://isource.com/wp-content/uploads/2013/05/google-maps-ios-icon.jpg'></img>
              Google Maps
            </li>
            <li>
              <img src='http://img.stackshare.io/service/133/43sHKeth.png'></img>
              Heroku
            </li>
            <li>
              <img src='http://img.stackshare.io/service/98/mgD1tpPz.jpeg'></img>
              Braintree
            </li>
          </ul>
        </div>
      </div>
    )
  }
})

export default Tech
