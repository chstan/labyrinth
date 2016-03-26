import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import { Route, browserHistory } from 'react-router';
import { RelayRouter } from 'react-router-relay';

import Welcome from './components/Welcome';
import Login from './components/Login';
import SuggestedChambersPage from './components/SuggestedChambersPage';

import ChamberPage from './components/ChamberPage';
import EditChamberPage from './components/EditChamberPage';
import EditSectionPage from './components/EditSectionPage';
import AddChamberPage from './components/AddChamberPage';
import AddSectionPage from './components/AddSectionPage';

import ProfilePage from './components/ProfilePage';

import AppQueries from './queries/AppQueries';
import ChamberQueries from './queries/ChamberQueries';
import EditChamberQueries from './queries/EditChamberQueries';

import '../scss/main.scss';
import 'normalize-scss';

function prepareSectionParams(params) {
  return {
    chamberId: params.chamberId,
    viewedSection: params.sectionId ? parseInt(params.sectionId, 10) : null,
  };
}

ReactDOM.render(
  <RelayRouter history={browserHistory}>
    <Route path="/" component={Welcome}>
      <Route path="login" component={Login} />
      <Route path="learn" component={SuggestedChambersPage} queries={AppQueries} />
      <Route path="learn/chamber/:chamberId/:chamberName/:sectionId/:sectionName"
        component={ChamberPage} queries={ChamberQueries}
        queryParams={['viewedSection']} prepareParams={prepareSectionParams}
      />
      <Route path="edit/chamber/:chamberId/:chamberName"
        component={EditChamberPage} queries={EditChamberQueries}
      >
        <Route path=":sectionId/:sectionName"
          component={EditSectionPage} queries={EditChamberQueries}
          queryParams={['viewedSection']} prepareParams={prepareSectionParams}
        />
      </Route>
      <Route path="add/chamber"
        component={AddChamberPage} queries={AppQueries}
      />
      <Route path="add/:chamberId/:chamberName/section"
        component={AddSectionPage} queries={EditChamberQueries}
      />
      <Route path="profile" component={ProfilePage} queries={AppQueries} />
    </Route>
  </RelayRouter>,
  document.getElementById('root')
);
