import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { Route, browserHistory } from 'react-router';
import { RelayRouter } from 'react-router-relay';

import App from './components/App';
import Welcome from './components/Welcome';
import Login from './components/Login';

import AppQueries from './queries/AppQueries';

ReactDOM.render(
  <RelayRouter history={browserHistory}>
  <Route path="/" component={Welcome}>
    <Route path="/login" component={Login} />
    <Route path="test" component={App} queries={AppQueries} />
  </Route>
  </RelayRouter>
  ,
  document.getElementById('root')
);
