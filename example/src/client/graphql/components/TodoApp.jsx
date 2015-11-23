/* @flow */

import React, { Component, PropTypes } from 'react';
import { createContainer } from '../../../../../src';
import createContainerShape from '../../../../../src/utils/createContainerShape';

import TodoInput from './TodoInput';
import TodoList from './TodoList';
import { createTodo } from '../mutations/todo';

const containerShape = createContainerShape(PropTypes);

class TodoApp extends Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
  }
  static contextTypes = {
    adrenaline: containerShape.isRequired
  }

  createTodo = (args) => {
    const { adrenaline } = this.context;
    const { adaptor } = adrenaline;
    adaptor.mutate(createTodo, { input: args });
  }

  render() {
    const { viewer, mutations } = this.props;

    return (
      <div>
        <TodoInput createTodo={this.createTodo} />
        <TodoList todos={viewer.todos} mutations={mutations} />
      </div>
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
});
