import React from 'react';
import Relay from 'react-relay';

class ProfileRecentProgress extends React.Component {
  render() {
    return (
      <div>ProfileRecentProgress</div>
    );
  }
}

export default Relay.createContainer(ProfileRecentProgress, {
  fragments: {
    viewer: () => Relay.QL`
    fragment on User {
      id,
    }`,
  },
});
