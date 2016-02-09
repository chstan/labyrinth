import React from 'react';

class LogoutForm extends React.Component {
  render() {
    return (
      <form id="logout" action="/revoke" method="POST">
        <button className="logout" type="submit">Logout</button>
      </form>
    );
  }
}

export default LogoutForm;
