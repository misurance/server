import React, { PropTypes } from 'react'
import {default as Firebase} from 'firebase'

const Feed = React.createClass({
  update: function(snapshot)   {
    var self = this;
    var index = self.state.feedItems.map(x => x.userId).indexOf(snapshot.key());
    if (index >= 0) {
      self.state.feedItems[index] = {
        userId: snapshot.key(),
        state: snapshot.val().state,
      };
    }
    else {
      self.state.feedItems.push({
        userId: snapshot.key(),
        state: snapshot.val().state,
      });
    }

    self.setState(self.state);
    console.log(self.state.feedItems.length);
  },

  componentDidMount: function() {
    var self = this;
    var ref = new Firebase("https://intense-inferno-8553.firebaseio.com").child('active');
    ref.on("child_changed", function(snapshot) {
      self.update(snapshot);
    });
    ref.on("child_added", function(snapshot, prevChildKey) {
      self.update(snapshot);
    });
  },

  getInitialState: function() {
    return {
      feedItems : []
    };
  },

  render () {
    var createFeedItem = (event) => <li key={event.userId}>{event.userId} | {event.state}</li>;
    return (
      <ul className='feed'>
        {this.state.feedItems.map(createFeedItem)}
      </ul>
    )
  }
})

export default Feed
