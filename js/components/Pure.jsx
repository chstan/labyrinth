import React from 'react';
import { Link } from 'react-router';

class NavItem extends React.Component {
  render() {
    return (
      <Link to={ this.props.href } className={ this.props.className }>
        <span className={ this.props.iconClassName }>
          { this.props.icon }
        </span>
        { this.props.content }
      </Link>
    );
  }
}

export {
  NavItem,
};
