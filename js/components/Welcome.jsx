import React from 'react';

import HeaderNav from './HeaderNav';

import './Welcome.scss';

class Welcome extends React.Component {
  render() {
    return (
      <div className="app-wrapper">
        <HeaderNav />
        <div className="app-contents">
          { this.props.children }
        </div>
      </div>
    );
  }
}

export default Welcome;
