/* @flow */

import 'whatwg-fetch';
import React from 'react';
import { Router } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import routes from './routes';
import { Adrenaline } from '../../../src';
import schema from 'shared/schema';
import Loader from './components/Loader';

const rootNode = document.getElementById('root');
React.render(
  <Adrenaline schema={schema} renderLoading={Loader}>
    {() => <Router history={createBrowserHistory()} children={routes} />}
  </Adrenaline>,
  rootNode
);
