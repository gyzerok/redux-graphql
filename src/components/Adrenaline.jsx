/* @flow */

import React, { Component, PropTypes } from 'react';

export default class Adrenaline extends Component {
  static childContextTypes = {
    renderLoading: PropTypes.func.isRequired,
  }

  static propTypes = {
    renderLoading: PropTypes.func,
    children: PropTypes.element.isRequired,
  }

  static defaultProps = {
    renderLoading: renderLoading,
  }

  getChildContext() {
    return {
      renderLoading: this.props.renderLoading,
    };
  }

  render() {
    const { children } = this.props;
    return children;
  }
}

function renderLoading() {
  return <div>Loading...</div>;
}
