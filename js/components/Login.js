import React from 'react';

class Login extends React.Component {
  render() {
    return (
      <form action="/auth" method="POST">
        <label><input name="email" placeholder="email" /></label>
        <label><input name="password" placeholder="password" /></label>
        <button type="submit">Login</button>
      </form>
    );
  }
}

export default Login;
