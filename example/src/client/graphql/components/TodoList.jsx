/* @flow */

import React, { Component, PropTypes } from 'react';
import { createDumbComponent } from '../../../../../src';

import TodoItem from './TodoItem';

class TodoList extends Component {
  static propTypes = {
    todos: PropTypes.array,
  }

  static defaultProps = {
    todos: [],
  }

  render() {
    return (
      <ul>
        {this.props.todos.map(todo =>
          <TodoItem key={todo.id} todo={todo} />
        )}
      </ul>
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
