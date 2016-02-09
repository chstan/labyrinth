/* eslint-disable react/prop-types */
/* We disable the react/prop-types rules in JSX files
that fetch data using Relay, because the embedded query fragment
largely serves at the prop validation. Subject to change at my whim. */

import React from 'react';
import Relay from 'react-relay';
import Chamber from './Chamber';
import LogoutForm from './Logout';

class App extends React.Component {
  render() {
    return (
      <div>
        <LogoutForm />
        <h1>Chambers you curate</h1>
        <ul>
          {this.props.viewer.curatedChambers.edges.map(
            edge =>
            <li key={edge.node.id}>
              <Chamber chamber={edge.node} />
            </li>
          )}
        </ul>
      </div>
    );
  }
}

export default Relay.createContainer(App, {
  fragments: {
    viewer: () => Relay.QL`
    fragment on User {
      curatedChambers(first: 10) {
        edges {
          node {
            id,
            ${ Chamber.getFragment('chamber') },
          }
        }
      },
    }`,
  },
});
