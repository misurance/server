import React, { PropTypes } from 'react'
import {default as Firebase} from 'firebase'

const Feed = React.createClass({
  getInitialState: function() {
    return {
      feedItems : []
    };
  },
  render () {
    var createFeedItem = (event) => <li key={event.key}>{event.time} {event.message}</li>;
    return (
      <ul className='feed'>
        {this.state.feedItems.map(createFeedItem)}
      </ul>
    )
  }
})

export default Feed
