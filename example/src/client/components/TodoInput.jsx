import React, { Component, PropTypes } from 'react';

const ENTER_KEY_CODE = 13;

export default class TodoInput extends Component {
  static propTypes = {
    createTodo: PropTypes.func.isRequired,
  }

  onEnter = (e) => {
    const { createTodo } = this.props;
    const input = this._input;

    if (!input.value.length) return;

    if (e.keyCode === ENTER_KEY_CODE) {
      createTodo({ text: input.value });
      input.value = '';
    }
  }

  render() {
    return (
      <input
        ref={(input) => { this._input = input }}
        type="text"
        onKeyDown={this.onEnter}
        autoFocus="true"
      />
    );
  }
}
