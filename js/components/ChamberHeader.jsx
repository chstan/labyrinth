import React from 'react';
import Relay from 'react-relay';

import ViewerStatus from './ViewerStatus';

import './ChamberHeader.scss';

class ChamberHeader extends React.Component {
  render() {
    let statusBox = null;
    if (this.props.statusBox) {
      statusBox = <ViewerStatus status={ this.props.chamber.status } />;
    }
    return (
      <header className="chamber-header">
        <h1>{this.props.chamber.name}</h1>
        <div className="flex-right">
          { statusBox }
        </div>
      </header>
    );
  }
}

export default Relay.createContainer(ChamberHeader, {
  fragments: {
    chamber: () => Relay.QL`
    fragment on Chamber {
      name,
      status {
        ${ ViewerStatus.getFragment('status') },
      },
    }`,
  },
});
