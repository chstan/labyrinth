import React from 'react';
import Relay from 'react-relay';

class ChamberPage extends React.Component {
  render() {
    return (
      <article>
        This is stubbed.
      </article>
    );
  }
}

export default Relay.createContainer(ChamberPage, {
  fragments: {
    chamber: () => Relay.QL`
    fragment on Chamber {
      name,
    }`,
  },
});
