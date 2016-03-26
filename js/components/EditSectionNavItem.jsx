import React from 'react';
import Relay from 'react-relay';

import { NavItem } from './Pure';

import routerUtils from '../utils/router';


import './SectionNavItem.scss';

class EditSectionNavItem extends React.Component {
  render() {
    const editUrl = routerUtils.forEditSection(this.props.chamber, this.props.section);
    const classNames = `edit section-nav-item ${this.props.active ? 'active' : ''}`;
    return (
      <NavItem href={ editUrl } className={ classNames }
        content={ this.props.section.name }
      />
  );
  }
}

export default Relay.createContainer(EditSectionNavItem, {
  fragments: {
    chamber: () => Relay.QL`
    fragment on Chamber {
      dbId,
      name,
    }`,
    section: () => Relay.QL`
    fragment on Section {
      dbId,
      name,
    }`,
  },
});
