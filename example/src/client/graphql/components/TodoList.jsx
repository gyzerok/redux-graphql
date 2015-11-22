/* @flow */

import React, { Component, PropTypes } from 'react';
import TodoInput from './TodoInput';
import TodoItem from './TodoItem';
import { createDumbComponent } from '../../../../../src';

class TodoList extends Component {
  static propTypes = {
    mutations: PropTypes.object.isRequired,
    todos: PropTypes.array,
  }

  static defaultProps = {
    todos: [],
  }

  render() {
    const { createTodo } = this.props.mutations;
    return (
      <div>
        <TodoInput createTodo={createTodo} />
        <ul>
          {this.props.todos.map(todo =>
            <TodoItem key={todo.id} todo={todo} />
          )}
        </ul>
      </div>
    );
  }
}

export default createDumbComponent(TodoList, {
  fragments: {
    todos: `
      fragment on User {
        todos {
          id,
          ${TodoItem.getFragment('todo')}
        }
      }
    `,
  },
});
