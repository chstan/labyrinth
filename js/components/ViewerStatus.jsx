import React from 'react';
import Relay from 'react-relay';

import './ViewerStatus.scss';

// ViewerStatus renders a progress badge for a chamber

class ViewerStatus extends React.Component {
  render() {
    const { solvedCount, sectionCount } = this.props.status;
    const statusText = `${ solvedCount } / ${ sectionCount }`;
    return (
      <div className="viewer-status">{ statusText }</div>
    );
  }
}

export default Relay.createContainer(ViewerStatus, {
  fragments: {
    status: () => Relay.QL`
    fragment on ChamberStatus {
      solvedCount,
      sectionCount,
    }`,
  },
});
