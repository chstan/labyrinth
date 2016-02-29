import React from 'react';

import HeaderNav from './HeaderNav';
import Toaster from './Toaster';

import './Welcome.scss';

class Welcome extends React.Component {
  render() {
    return (
      <div>
        <div className="app-wrapper">
          <HeaderNav />
          <div className="app-contents">
            { this.props.children }
          </div>
        </div>
        <Toaster />
      </div>
    );
  }
}

export default Welcome;
