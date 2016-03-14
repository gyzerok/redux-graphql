/* @flow */

import React, { Component, PropTypes } from 'react';

import performQuery from '../network/performQuery';
import performMutation from '../network/performMutation';


export default class Adrenaline extends Component {
  static childContextTypes = {
    query: PropTypes.func,
    mutate: PropTypes.func,
  }

  static propTypes = {
    endpoint: PropTypes.string,
    children: PropTypes.element.isRequired,
  }

  static defaultProps = {
    endpoint: '/graphql',
  }

  getChildContext() {
    const { endpoint } = this.props;

    return {
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
