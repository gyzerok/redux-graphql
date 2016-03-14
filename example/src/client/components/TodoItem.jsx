/* @flow */

import React, { Component, PropTypes } from 'react';
import { presenter } from 'adrenaline';

class TodoItem extends Component {
  static propTypes = {
    todo: PropTypes.object.isRequired,
  }

  render() {
    const { todo } = this.props;

    return (
      <li>{todo.text}</li>
    );
  }
}

export default presenter({
  fragments: {
    todo: `
      fragment on Todo {
        text
      }
    `,
  },
})(TodoItem);
