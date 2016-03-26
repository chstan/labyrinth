import React from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';

import EditSectionNavItem from './EditSectionNavItem';
import svgs from './SVGs';

import routerUtils from '../utils/router';

class EditChamberNavigation extends React.Component {
  render() {
    return (
      <nav className="sidenav">
        <ul>
          <Link to={ routerUtils.forEditChamber(this.props.chamber) }
            className="section-nav-item primary"
          >
            <strong>{ this.props.chamber.name }</strong>
          </Link>
          {
            this.props.chamber.sections.map(section =>
              <li key={ section.id } >
                <EditSectionNavItem
                  section={ section }
                  chamber={ this.props.chamber }
                  active={ this.props.viewedSection === section.dbId }
                />
              </li>
            )
          }
          <li>
            <Link to={ routerUtils.forAddSection(this.props.chamber) }
              className="section-nav-item action"
            >
              <span className="icon">{ svgs.plus }</span>
              Add a new section
            </Link>
          </li>
        </ul>
      </nav>
    );
  }
}

export default Relay.createContainer(EditChamberNavigation, {
  fragments: {
    chamber: () => Relay.QL`
    fragment on Chamber {
      dbId,
      name,
      ${ EditSectionNavItem.getFragment('chamber') },
      sections {
        dbId,
        id,
        name,
        ${ EditSectionNavItem.getFragment('section') },
      },
    }`,
  },
});
