/* @flow */

import 'whatwg-fetch';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from 'react-router';
import { history } from 'react-router/lib/BrowserHistory';

import routes from './routes';
import { Adrenaline, createGraphQLAdaptor } from '../../../../src';
import schema from 'shared/schema';

const adaptor = createGraphQLAdaptor('/graphql', schema);

const rootNode = document.getElementById('root');
ReactDOM.render(
  <Adrenaline adaptor={adaptor}>
    <Router history={history} children={routes} />
  </Adrenaline>,
  rootNode
);
