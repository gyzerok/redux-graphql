/* @flow */

import React, { Component, PropTypes } from 'react';
import invariant from 'invariant';
import warning from 'warning';
import _ from 'lodash';

import getDisplayName from '../utils/getDisplayName';
import createAdaptorShape from '../utils/createAdaptorShape';
import createContainerShape from '../utils/createContainerShape';

const adaptorShape = createAdaptorShape(PropTypes);
const containerShape = createContainerShape(PropTypes);

function noop(err) {
  if (err) {
    warning(true, err);
  }
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
        adaptor: adaptorShape.isRequired,
      }).isRequired,
    }

    static childContextTypes = {
      adrenaline: containerShape.isRequired,
    }

    constructor(props, context) {
      super(props, context);
      this.state = {
        current: null, // The currently committed slice of data,args,queries
        pending: null, // The pending slice, while data is being fetched
        failed: null, // A failed slice, cleared when 'current' slice is updated
      };
    }

    getChildContext() {
      const { adrenaline } = this.context;
      const container = {
        setArgs: this.setArgs,
        state: this.state,
      };
      return {
        adrenaline: {
          ...adrenaline,
          container,
        },
      };
    }

    componentWillMount() {
      const adaptor = this.getAdaptor();
      this.setArgs(this.computeArgs(this.props));
      this.unsubscribe = adaptor.subscribe(this.resolve);
    }

    componentWillUpdate(nextProps) {
      if (this.props !== nextProps) {
        this.setArgs(this.computeArgs(nextProps));
      }
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    shouldComponentUpdate(nextProps, nextState) {
      const adaptor = this.getAdaptor();
      if (adaptor.shouldComponentUpdate) {
        return adaptor.shouldComponentUpdate(this.state, nextState);
      }
      return super.shouldComponentUpdate(nextProps, nextState);
    }

    getAdaptor = ()=> {
      const { adrenaline } = this.context;
      const { adaptor } = adrenaline;
      return adaptor;
    }

    computeArgs(props) {
      return !!specs.args ? specs.args(props) : {};
    }

    setArgs = (nextArgs, cb) => {
      this.setState({
        pending: this.slice({
          args: nextArgs,
        }),
      });
      this.resolve(nextArgs, cb);
    }

    resolve = (args = _.get(this.state, 'current.args'), cb = noop) => {
      if (typeof args === 'undefined') {
        // An update was dispatched before the first args/data have been committed.
        return cb();
      }
      const adaptor = this.getAdaptor();
      const { queries } = specs;

      // Cancel an existing/pending promise
      if (_.has(this.state, 'pending.promise')) {
        this.state.pending.promise.cancel = true;
      }

      const pendingPromise = adaptor.resolve(queries, args);
      // Set the pending load slice
      this.setState({
        pending: this.slice({
          args,
          queries,
        }),
      });

      pendingPromise
        .then(data => {
          if (pendingPromise.cancel) return;
          this.setState({
            current: this.slice({
              data,
              args,
              queries,
            }),
            pending: this.slice(),
            failed: this.slice(),
          }, cb);
        })
        .catch((err) => {
          if (pendingPromise.cancel) return;
          this.setState({
            pending: this.slice(),
            failed: this.slice({
              error: err,
            }),
          }, ()=>cb(err));
        });
    }

    render() {
      const { adrenaline } = this.context;
      const { renderLoading } = adrenaline;
      const current = this.state.current;

      if (!current) {
        return renderLoading();
      }

      const { data } = current;
      return <DecoratedComponent {...this.props} {...data} />;
    }

    /**
     * Generate a fully formed slice with proper defaults from a state slice.
     * @param  {Object} state
     * @return {Object} A state slice
     */
    slice(state = {}) {
      return _.extend({
        data: null, // The data props for the decorated component
        args: null, // The args associated with data and queries
        queries: null, // The queries used to fetch the data
        error: null, // The error produced by a failed slice resolution
      }, state);
    }
  };
}
