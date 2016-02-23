import React from 'react';
import Relay from 'react-relay';
import _ from 'lodash';

import ChamberHeader from './ChamberHeader';
import AttemptsSection from './AttemptsSection';
import AttemptsChamberNavigation from './AttemptsChamberNavigation';

import routerUtils from '../utils/router';

import './ChamberPage.scss';

// This naming is subject to change, but this is the page that represents
// the view for a attempting to learn the content in a chamber

class ChamberPage extends React.Component {
  render() {
    const router = this.context.router;
    const indexOfCurrent = _.findIndex(this.props.chamber.sections, {
      dbId: parseInt(this.props.params.sectionId, 10),
    });
    const chamber = this.props.chamber;
    const nextSection = _.get(chamber.sections, indexOfCurrent + 1);
    const navigateToNextSection = () => {
      if (nextSection) {
        const pathname = routerUtils.forAttemptsSection(chamber, nextSection);
        router.push({ pathname });
      } else {
        // TODO this should go somewhere more interesting
        router.push('/');
      }
    };
    return (
      <main className="chamber-page attempts">
        <ChamberHeader chamber={ this.props.chamber } />

        <AttemptsSection
          section={ this.props.chamber.section }
          onComplete={ navigateToNextSection }
        />
      </main>
    );
    // <AttemptsChamberNavigation chamber={this.props.chamber} />
  }
}

ChamberPage.contextTypes = {
  router: React.PropTypes.object.isRequired,
};

export default Relay.createContainer(ChamberPage, {
  initialVariables: {
    viewedSection: 3,
  },
  fragments: {
    chamber: () => Relay.QL`
    fragment on Chamber {
      dbId,
      name,
      ${ ChamberHeader.getFragment('chamber') },
      ${ AttemptsChamberNavigation.getFragment('chamber') },
      section(id: $viewedSection) {
        ${ AttemptsSection.getFragment('section') },
      },
      sections {
        dbId,
        name,
      }
    }`,
  },
});
