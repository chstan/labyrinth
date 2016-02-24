import React from 'react';

import { Link } from 'react-router';

import './HeaderNav.scss';

class HeaderNav extends React.Component {
  render() {
    return (
      <nav className="header-nav">
        <div className="branding">Labyrinth</div>
        <div className="controls">
          <Link to={`/login`}>Login</Link>
        </div>
      </nav>
    )
  }
}

export default HeaderNav;
