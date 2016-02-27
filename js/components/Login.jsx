import React from 'react';

class Login extends React.Component {
  render() {
    return (
      <form action="/auth" method="POST">
        <div className="input-group">
          <label><input name="email" placeholder="email" type="email"/></label>
        </div>
        <div className="input-group">
          <label><input name="password" placeholder="password" type="password"/></label>
        </div>
        <button type="submit">Login</button>
      </form>
    );
  }
}

export default Login;
