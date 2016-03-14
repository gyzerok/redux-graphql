/* @flow */

import React, { Component, PropTypes } from 'react';
import { createDumbContainer } from 'adrenaline';

import TodoItem from './TodoItem';

class TodoList extends Component {
  static propTypes = {
    todos: PropTypes.array,
  }

  static defaultProps = {
    todos: [],
  }

  render() {
    const { todos } = this.props;

    return (
      <ul>
        {todos.map(todo =>
          <TodoItem key={todo.id} todo={todo} />
        )}
      </ul>
    );
  }
}

export default createDumbContainer({
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
})(TodoList);
