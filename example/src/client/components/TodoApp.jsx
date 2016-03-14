/* @flow */

import React, { Component, PropTypes } from 'react';
import { container } from 'adrenaline';

import TodoInput from './TodoInput';
import TodoList from './TodoList';
import Loader from './Loader';
import { createTodo } from '../mutations/todo';

class TodoApp extends Component {
  static propTypes = {
    viewer: PropTypes.object,
  }

  createTodo = (args) => {
    this.props.mutate({
      mutation: createTodo,
      variables: { input: args },
    });
  }

  render() {
    const { viewer, isFetching } = this.props;

    if (isFetching) {
      return <Loader />;
    }

    return (
      <div>
        <TodoInput createTodo={this.createTodo} />
        <TodoList todos={viewer.todos} />
      </div>
    );
  }
}

export default container({
  queries: () => ({
    viewer: `
      viewer {
        id,
        ${TodoList.getFragment('todos')}
      }
    `,
  }),
})(TodoApp);
