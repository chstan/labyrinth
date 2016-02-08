import React from 'react';
import { Link } from 'react-router';

class Welcome extends React.Component {
  render() {
    return (
      <div>
        <p>You are on the welcome page.</p>
        <Link to={`/login`}>Login</Link>
        { this.props.children }
      </div>
    );
  }
}

export default Welcome;
