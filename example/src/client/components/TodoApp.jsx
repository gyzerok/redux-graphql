/* @flow */

import React, { Component, PropTypes } from 'react';
import { createContainer } from 'adrenaline';

import TodoInput from './TodoInput';
import TodoList from './TodoList';
import { createTodo } from '../mutations/todo';

class TodoApp extends Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
  }

  createTodo = (args) => {
    /*
    const { adrenaline } = this.context;
    const { adaptor } = adrenaline;
    adaptor.mutate(createTodo, { input: args });
    */
  }

  render() {
    const { viewer } = this.props;

    return (
      <div>
        <TodoInput createTodo={this.createTodo} />
        <TodoList todos={viewer.todos} />
      </div>
    );
  }
}

export default createContainer(TodoApp, {
  args: () => ({}),
  queries: () => ({
    viewer: `
      viewer {
        id,
        ${TodoList.getFragment('todos')}
      }
    `,
  }),
});
