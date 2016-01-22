/* @flow */

import React, { Component, PropTypes } from 'react';
import invariant from 'invariant';

import getDisplayName from '../utils/getDisplayName';
import createAdaptorShape from '../utils/createAdaptorShape';
import createContainerShape from '../utils/createContainerShape';

const adaptorShape = createAdaptorShape(PropTypes);
const containerShape = createContainerShape(PropTypes);

function noop(err) {
  if (err) console.error(err);
}

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
      adrenaline: PropTypes.shape({
        renderLoading: PropTypes.func.isRequired,
        adaptor: adaptorShape.isRequired
      }).isRequired
    }

    static childContextTypes = {
      adrenaline: containerShape.isRequired
    }

    constructor(props, context) {
      super(props, context);
      this.state = { data: undefined };
    }

    getChildContext() {
      const { adrenaline } = this.context;
      const container = {
        state: this.state
      };
      return {
        adrenaline: {
          ...adrenaline,
          container
        }
      };
    }

    componentDidMount() {
      const adaptor = this.getAdaptor();
      this.resolve();
      this.unsubscribe = adaptor.subscribe(this.resolve);
    }

    componentWillUpdate(nextProps){
      if(this.props != nextProps){
        this.resolve();
      }
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    shouldComponentUpdate(nextProps, nextState){
      const adaptor = this.getAdaptor();
      return this.props != nextProps ||
        adaptor.shouldComponentUpdate(this.state, nextState);
    }

    getAdaptor = () => {
      const { adrenaline } = this.context;
      const { adaptor } = adrenaline;
      return adaptor;
    }

    resolve = () => {
      const adaptor = this.getAdaptor();
      const { queries } = specs;
      const args = mapPropsToArgs(this.props);

      adaptor.resolve(queries, args)
        .catch(err => {
          console.err(err);
        })
        .then(data => this.setState({ data }));
    }

    render() {
      const { adrenaline } = this.context;
      const { renderLoading } = adrenaline;

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
