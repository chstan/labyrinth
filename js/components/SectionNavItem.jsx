import React from 'react';
import Relay from 'react-relay';

import svgs from './SVGs';
import { NavItem } from './Pure';

import routerUtils from '../utils/router';

import './SectionNavItem.scss';

class SectionNavItem extends React.Component {
  render() {
    const navUrl = routerUtils.forAttemptsSection(
      this.props.chamber, this.props.section);

    const statusIconOptions = {
      COMPLETE: {
        icon: svgs.check,
        class: 'completed',
      },
      FRONTIER: {
        icon: svgs.blank,
        class: '',
      },
      LOCKED: {
        icon: svgs.lock,
        class: 'locked',
      },
    };

    const statusIcon = statusIconOptions[this.props.section.status];
    const iconClasses = `icon ${ statusIcon.class }`;
    const classNames = `section-nav-item ${this.props.active ? 'active' : ''}`;

    return (
      <NavItem href={ navUrl} className={ classNames } icon={ statusIcon.icon }
        iconClassName={ iconClasses } content={ this.props.section.name }
      />
    );
  }
}

export default Relay.createContainer(SectionNavItem, {
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
      status,
    }`,
  },
});
