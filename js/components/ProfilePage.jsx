import React from 'react';
import Relay from 'react-relay';

import ProfileHeader from './ProfileHeader';
import ProfileRecentProgress from './ProfileRecentProgress';
import ProfileSettings from './ProfileSettings';

class ProfilePage extends React.Component {
  render() {
    return (
      <article>
        <ProfileHeader viewer={ this.props.viewer } />
        <ProfileRecentProgress viewer={ this.props.viewer } />
        <ProfileSettings viewer={ this.props.viewer } />
      </article>
    );
  }
}

export default Relay.createContainer(ProfilePage, {
  fragments: {
    viewer: () => Relay.QL`
    fragment on User {
      id,
      name,
      email,
      ${ ProfileHeader.getFragment('viewer') },
      ${ ProfileRecentProgress.getFragment('viewer') },
      ${ ProfileSettings.getFragment('viewer') },
    }`,
  },
});
