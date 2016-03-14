/* @flow */

import React, { Component, PropTypes } from 'react';
import invariant from 'invariant';

import getDisplayName from '../utils/getDisplayName';
import shallowEqual from '../utils/shallowEqual';


export default function createContainer(DecoratedComponent, specs) {
  const displayName = `AdrenalineContainer(${getDisplayName(DecoratedComponent)})`;

  invariant(
    specs !== null && specs !== undefined,
    `${displayName} requires configuration.`
  );

  invariant(
    typeof specs.queries === 'function',
    `You have to define 'queries' as a function in ${displayName}.`
  );

  invariant(
    !specs.args || typeof specs.args === 'function',
    `You have to define 'args' as a function in ${displayName}.`
  );

  function mapPropsToArgs(props) {
    return !!specs.args ? specs.args(props) : props;
  }

  return class extends Component {
    static displayName = displayName
    static DecoratedComponent = DecoratedComponent

    static contextTypes = {
      renderLoading: PropTypes.func,
      query: PropTypes.func,
      mutate: PropTypes.func,
    }

    static getSpecs() {
      return specs;
    }

    constructor(props, context) {
      super(props, context);

      this.state = {
        data: null,
      };
    }

    componentWillMount() {
      this.query();
    }

    componentWillUpdate(nextProps) {
      if (!shallowEqual(this.props, nextProps)) {
        this.query();
      }
    }

    componentWillUnmount() {
      //this.unsubscribe();
    }

    query = () => {
      const { queries } = specs;
      const args = mapPropsToArgs(this.props);

      this.setState({ data: null }, () => {
        this.context.query(queries, args)
          .catch(err => {
            console.err(err);
          })
          .then(data => this.setState({ data }));
      });
    }

    mutate = (...args) => {
      return this.context.mutate(...args)
        .then(() => this.query());
    }

    render() {
      const { data } = this.state;
      const isFetching = data === null;
      const args = mapPropsToArgs(this.props);

      const dataOrDefault = isLoading ? {} : data;

      return (
        <DecoratedComponent
          {...this.props}
          {...dataOrDefault}
          isFetching={isFetching}
          mutate={this.mutate}
          args={args} />
      );
    }
  };
}
