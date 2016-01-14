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
    `You have to define 'queries' as a function in${displayName}.`
  );

  invariant(
    !specs.args || typeof specs.args === 'function',
    `You have to define 'args' as a function in ${displayName}.`
  );

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
      this.isNotMounted = true;
      this.state = {};
    }

    getChildContext() {
        const { adrenaline } = this.context;
        const container = {
            setArgs: this.setArgs,
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
      this.isNotMounted= false;
      this.setArgs(this.computeArgs(this.props));
      this.unsubscribe = adaptor.subscribe(this.resolve);
    }

    componentWillUpdate(nextProps){
        if(this.props != nextProps){
            this.setArgs(this.computeArgs(nextProps));
        }
    }

    componentWillUnmount() {
      this.isNotMounted = true;
      this.unsubscribe();
    }

    shouldComponentUpdate(nextProps, nextState){
      const adaptor = this.getAdaptor();
      return this.props != nextProps ||
        adaptor.shouldComponentUpdate(this.state, nextState);
    }

    getAdaptor = ()=> {
        const { adrenaline } = this.context;
        const { adaptor } = adrenaline;
        return adaptor;
    }

    computeArgs(props) {
        return !!specs.args ? specs.args(props) : props;
    }

    setArgs = (nextArgs, cb) => {
      this.resolve(nextArgs, cb);
    }

    resolve = (args = this.state.args, cb = noop) => {
      if(typeof args == 'undefined'){
          // An update was dispatched before the first args/data have been committed.
          return cb();
      }
      const adaptor = this.getAdaptor();
      const { queries } = specs;

      adaptor.resolve(queries, args)
        .then(data => {
          if (this.isNotMounted) {
            return cb();
          }

          this.setState({
            data: data,
            args
          }, cb);
        })
        .catch(cb);
    }

    render() {
      const { adrenaline } = this.context;
      const { adaptor, renderLoading } = adrenaline;
      const { data, args } = this.state;

      if(typeof data == 'undefined'){
          return renderLoading();
      }

      return (
        <DecoratedComponent
          {...this.props}
          {...data} />
      );
    }
  };
}
