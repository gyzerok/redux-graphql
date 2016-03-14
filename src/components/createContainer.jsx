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
    !specs.variables || typeof specs.variables === 'function',
    `You have to define 'variables' as a function in ${displayName}.`
  );

  function mapPropsToVariables(props) {
    return !!specs.variables ? specs.variables(props) : {};
  }

  return class extends Component {
    static displayName = displayName
    static DecoratedComponent = DecoratedComponent

    static contextTypes = {
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
      const variables = mapPropsToVariables(this.props);

      this.setState({ data: null }, () => {
        this.context.query(queries, variables)
          .catch(err => {
            console.err(err);
          })
          .then(data => this.setState({ data }));
      });
    }

    mutate = ({ mutation = '', variables = {}, files = null, invalidate = true }) => {
      return this.context.mutate(mutation, variables, files)
        .then(() => {
          if (invalidate) {
            this.query();
          }
        });
    }

    render() {
      const { data } = this.state;
      const isFetching = data === null;
      const variables = mapPropsToVariables(this.props);

      const dataOrDefault = isFetching ? {} : data;

      return (
        <DecoratedComponent
          {...this.props}
          {...dataOrDefault}
          isFetching={isFetching}
          mutate={this.mutate}
          variables={variables} />
      );
    }
  };
}
