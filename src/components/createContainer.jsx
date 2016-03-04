/* @flow */

import React, { Component, PropTypes } from 'react';
import invariant from 'invariant';

import getDisplayName from '../utils/getDisplayName';

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
    }

    static getSpecs() {
      return specs;
    }

    constructor(props, context) {
      super(props, context);
      this.state = { data: undefined };
    }

    componentDidMount() {
      this.resolve();
    }

    componentWillUpdate(nextProps) {
      if (this.props !== nextProps) {
        this.resolve();
      }
    }

    componentWillUnmount() {
      //this.unsubscribe();
    }

    resolve = () => {
      const { queries } = specs;
      const args = mapPropsToArgs(this.props);

      this.setState({ data: undefined }, () => {
        this.context.query(queries, args)
          .catch(err => {
            console.err(err);
          })
          .then(data => this.setState({ data }));
      });
    }

    render() {
      const { renderLoading } = this.context;

      const { data } = this.state;
      const args = mapPropsToArgs(this.props);

      if (typeof data === 'undefined') {
        return renderLoading();
      }

      return (
        <DecoratedComponent
          {...this.props}
          {...data}
          args={args} />
      );
    }
  };
}
