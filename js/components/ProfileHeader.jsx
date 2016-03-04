import React from 'react';
import Relay from 'react-relay';
import moment from 'moment';

import './ProfileHeader.scss';

class ProfileHeader extends React.Component {
  render() {
    const roleDisplay = {
      STUDENT: 'Student',
      CURATOR: 'Curator',
      ADMIN: 'Site Administrator',
    };

    const accountCreatedOn = moment(this.props.viewer.accountCreatedOn);
    let dateString;
    if (accountCreatedOn.isValid()) {
      dateString = `since ${ accountCreatedOn.format('MMM YYYY') }`;
    }

    return (
      <div className="profile-header">
        <img className="profile-picture" />
        <div className="profile-basics">
          <span className="name">{ this.props.viewer.name }</span>
          <span className="email">{ this.props.viewer.email }</span>
        </div>
        <div className="profile-role">
          <span className="role">{ roleDisplay[this.props.viewer.role] },&nbsp;</span>
          <span className="date">{ dateString }</span>
        </div>
      </div>
    );
  }
}

export default Relay.createContainer(ProfileHeader, {
  fragments: {
    viewer: () => Relay.QL`
    fragment on User {
      id,
      name,
      email,
      role,
      accountCreatedOn,
    }`,
  },
});
