/* eslint-disable react/prop-types */
/* We disable the react/prop-types rules in JSX files
that fetch data using Relay, because the embedded query fragment
largely serves at the prop validation. Subject to change at my whim. */

import React from 'react';
import Relay from 'react-relay';
import Chamber from './Chamber';
import LogoutForm from './Logout';

class SuggestedChambersPage extends React.Component {
  render() {
    return (
      <div>
        <LogoutForm />
        <h1>Suggestions for you</h1>
        <ul>
          {this.props.viewer.suggestedChambers.edges.map(
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

export default Relay.createContainer(SuggestedChambersPage, {
  fragments: {
    viewer: () => Relay.QL`
    fragment on User {
      suggestedChambers(first: 10) {
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
