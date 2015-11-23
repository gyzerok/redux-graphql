/* @flow */

import React, { Component, PropTypes, Children } from 'react';

import createAdaptorShape from '../utils/createAdaptorShape';

const adaptorShape = createAdaptorShape(PropTypes);

export default class Adrenaline extends Component {
  static childContextTypes = {
    adrenaline: PropTypes.shape({
      renderLoading: PropTypes.func.isRequired,
      adaptor: adaptorShape.isRequired
    }).isRequired
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
      adrenaline: {
        renderLoading: this.props.renderLoading,
        adaptor: this.props.adaptor
      }
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
