import React from 'react';
import { Link } from 'react-router';

class Welcome extends React.Component {
  render() {
    return (
      <div>
        <Link to={`/login`}>Login</Link>
        { this.props.children }
      </div>
    );
  }
}

export default Welcome;
