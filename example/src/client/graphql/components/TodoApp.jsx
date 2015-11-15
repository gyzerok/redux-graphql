/* @flow */

import React, { Component, PropTypes } from 'react';
import TodoList from './TodoList';
import * as todoMutations from '../mutations/todo';
import { createContainer } from '../../../../../src';

class TodoApp extends Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
  }

  render() {
    const { viewer, mutations } = this.props;

    return (
      <TodoList todos={viewer.todos} mutations={mutations} />
    );
  }
}

export default createContainer(TodoApp, {
  args: () => ({
    count: 2,
  }),
  queries: ({ count }) => ({
    viewer: `
      viewer {
        id,
        ${TodoList.getFragment('todos')}
      }
    `,
  }),
  /*mutations: {
    ...todoMutations,
  },*/
});
