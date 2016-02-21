import React from 'react';
import Relay from 'react-relay';

class AttemptsChamberNavigation extends React.Component {
  render() {
    return (
      <ul>This will have controls to go to different sections</ul>
    );
  }
}

export default Relay.createContainer(AttemptsChamberNavigation, {
  fragments: {
    chamber: () => Relay.QL`
    fragment on Chamber {
      name,
    }`,
  },
});
