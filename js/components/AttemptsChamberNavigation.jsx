import React from 'react';
import Relay from 'react-relay';

import SectionNavItem from './SectionNavItem';

import './AttemptsChamberNavigation.scss';

class AttemptsChamberNavigation extends React.Component {
  render() {
    return (
      <nav className="sidenav">
        <ul>
          {
            this.props.chamber.sections.map(section =>
              <li key={ section.id } >
                <SectionNavItem
                  section={ section }
                  chamber={ this.props.chamber }
                  active={ this.props.viewedSection === section.dbId }
                />
              </li>
            )
          }
        </ul>
      </nav>
    );
  }
}

export default Relay.createContainer(AttemptsChamberNavigation, {
  fragments: {
    chamber: () => Relay.QL`
    fragment on Chamber {
      name,
      ${ SectionNavItem.getFragment('chamber') },
      sections {
        id,
        dbId,
        ${ SectionNavItem.getFragment('section') },
      },
    }`,
  },
});
