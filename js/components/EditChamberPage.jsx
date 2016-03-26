import React from 'react';
import Relay from 'react-relay';

import ChamberHeader from './ChamberHeader';
import EditChamberNavigation from './EditChamberNavigation';

class EditChamberPage extends React.Component {
  render() {
    let viewedSection = parseInt(this.props.params.sectionId, 10);
    viewedSection = isNaN(viewedSection) ? null : viewedSection;
    return (
      <main className="chamber-page edit">
        <EditChamberNavigation
          chamber={ this.props.chamber }
          viewedSection={ viewedSection }
        />
      <article>
        <ChamberHeader
          chamber={ this.props.chamber }
          statusBox={ false }
        />
        { this.props.children }
      </article>
      </main>
    );
  }
}

export default Relay.createContainer(EditChamberPage, {
  fragments: {
    chamber: () => Relay.QL`
    fragment on Chamber {
      dbId,
      name,
      ${ EditChamberNavigation.getFragment('chamber') },
      ${ ChamberHeader.getFragment('chamber') },
    }`,
    viewer: () => Relay.QL`
    fragment on User {
      role,
    }`,
  },
});
