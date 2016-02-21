import React from 'react';
import Relay from 'react-relay';

import ChamberHeader from './ChamberHeader';
import AttemptsSection from './AttemptsSection';
import AttemptsChamberNavigation from './AttemptsChamberNavigation';

import './ChamberPage.scss';

// This naming is subject to change, but this is the page that represents
// the view for a attempting to learn the content in a chamber

class ChamberPage extends React.Component {
  render() {
    return (
      <main className='chamber-page attempts'>
        <ChamberHeader chamber={this.props.chamber} />

        <AttemptsSection section={this.props.chamber.section} />
      </main>
    );
    // <AttemptsChamberNavigation chamber={this.props.chamber} />
  }
}

export default Relay.createContainer(ChamberPage, {
  initialVariables: {
    viewedSection: 3,
  },
  fragments: {
    chamber: () => Relay.QL`
    fragment on Chamber {
      name,
      ${ ChamberHeader.getFragment('chamber') },
      ${ AttemptsChamberNavigation.getFragment('chamber') },
      section(id: $viewedSection) {
        ${ AttemptsSection.getFragment('section') },
      },
    }`,
  },
});
