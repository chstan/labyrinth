import React from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';

import svgs from './SVGs';

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
      <Link to={ navUrl } className={ classNames }>
        <span className={ iconClasses }>
          { statusIcon.icon }
        </span>
        { this.props.section.name }
      </Link>
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
