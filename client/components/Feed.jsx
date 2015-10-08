import React, { PropTypes } from 'react'

const Feed = React.createClass({
  getInitialState: function() {
    return {
      feedItems : []
    };
  },
  render () {
    var createFeedItem = (event) => <li key={event.key}>{event.time} {event.message}</li>;
    return (
      <ul>
        {this.state.feedItems.map(createFeedItem)}
      </ul>
    )
  }
})

export default Feed
