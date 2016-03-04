/* @flow */

import React from 'react';
import { Route } from 'react-router';
import App from './components/App';
import TodoApp from './components/TodoApp';

export default (
  <Route component={App}>
    <Route path="/example/graphql" component={TodoApp} />
  </Route>
);
