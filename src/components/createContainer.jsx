/* @flow */

import React, { Component, PropTypes } from 'react';
import invariant from 'invariant';

import getDisplayName from '../utils/getDisplayName';
import createAdaptorShape from '../utils/createAdaptorShape';

const adaptorShape = createAdaptorShape(PropTypes);

export default function createContainer(DecoratedComponent, specs) {
  const displayName = `AdrenalineContainer(${getDisplayName(DecoratedComponent)})`;

  invariant(
    specs !== null && specs !== undefined,
    `${displayName} requires configuration.`
  );
  invariant(
    typeof specs.queries === 'function',
    `You have to define 'queries' as a function.`
  );

  return class extends Component {
    static displayName = displayName
    static DecoratedComponent = DecoratedComponent

    static contextTypes = {
      renderLoading: PropTypes.func.isRequired,
      adaptor: adaptorShape.isRequired,
    }

    constructor(props, context) {
      super(props, context);

      const { adaptor } = context;
      //DecoratedComponent.prototype.shouldComponentUpdate = adaptor.shouldComponentUpdate;

      const initialArgs = specs.args(props);

      this.state = {
        data: {},
        args: specs.args(props),
      };

      const dataKeys = Object.keys(specs.queries(initialArgs));
      const { propTypes } = DecoratedComponent;
      const requiredKeys = dataKeys.filter(key =>
        propTypes[key] && !propTypes[key].isRequired
      );

      this.isDataLoaded = (data = {}) => requiredKeys.every(key => {
        return data[key] !== null && data[key] !== undefined
      });
    }

    componentDidMount() {
      const { adaptor } = this.context;
      this.unsubscribe = adaptor.subscribe(this.fetch);
      this.fetch();
    }

    componentWillUnmount() {
      this.unsubscribe();
    }

    setArgs = (nextArgs, cb) => {
      this.fetch(nextArgs, cb);
    }

    fetch = (nextArgs = {}, cb) => {
      const { adaptor } = this.context;
      const { queries } = specs;
      const args = {
        ...this.state.args,
        ...nextArgs,
      };

      adaptor.resolve(queries, args, this.isDataLoaded)
        .then(data => {
          this.setState({
            data: {
              ...this.state.data,
              ...data,
            },
            args
          }, cb);
        })
        .catch(cb);
    }

    render() {
      const { renderLoading } = this.context;
      const { data, args } = this.state;

      if (!this.isDataLoaded(data)) {
        return renderLoading();
      }

      return (
        <DecoratedComponent
          {...this.props}
          {...data}
          args={args}
          setArgs={this.setArgs} />
      );
    }
  };
}
