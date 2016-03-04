/* @flow */

import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';

import routes from './routes';
import { Adrenaline } from 'adrenaline';
import createAdaptor from './adaptor';
import schema from 'shared/schema';

const history = createBrowserHistory();
const adaptor = createAdaptor('/graphql');

const rootNode = document.getElementById('root');
ReactDOM.render(
  <Adrenaline adaptor={adaptor}>
    <Router history={history} routes={routes} />
  </Adrenaline>,
  rootNode
);
