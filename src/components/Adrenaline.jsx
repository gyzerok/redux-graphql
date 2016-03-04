/* @flow */

import React, { Component, PropTypes } from 'react';

import performQuery from '../network/performQuery';
import performMutation from '../network/performMutation';

export default class Adrenaline extends Component {
  static childContextTypes = {
    renderLoading: PropTypes.func,
    query: PropTypes.func,
    mutate: PropTypes.func,
  }

  static propTypes = {
    endpoint: PropTypes.string,
    renderLoading: PropTypes.func,
    children: PropTypes.element.isRequired,
  }

  static defaultProps = {
    endpoint: '/graphql',
    renderLoading: renderLoading,
  }

  getChildContext() {
    const { endpoint } = this.props;

    return {
      renderLoading: this.props.renderLoading,
      query: (queries, args) => {
        const specs = queries();
        const query = Object.keys(specs).reduce((acc, key) => {
          return `${acc} ${specs[key]}`;
        }, '');
        const graphQLQuery = `
          query AdrenalineQuery {
            ${query}
          }
        `.replace(/\s+/g, ' ').trim();

        return performQuery(endpoint, graphQLQuery, args);
      },
      mutate: (...args) => performMutation(endpoint, ...args),
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
