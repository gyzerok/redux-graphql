/* @flow */

import React, { Component } from 'react';
import invariant from 'invariant';
import getDisplayName from '../../../utils/getDisplayName';
import { isString, isObject } from 'lodash';

export default function createDumbComponent(DecoratedComponent, specs) {
  const displayName = `DumbComponent(${getDisplayName(DecoratedComponent)})`;

  invariant(
    specs.hasOwnProperty('fragments'),
    '%s have not fragments declared',
    displayName
  );

  const { fragments } = specs;

  invariant(
    isObject(fragments),
    'Fragments have to be declared as object in %s',
    displayName
  );

  return class extends Component {
    static displayName = displayName;
    static DecoratedComponent = DecoratedComponent;

    static getFragment(key) {
      invariant(
        isString(key),
        'You cant call getFragment(key: string) without string key in %s',
        displayName
      );

      invariant(
        fragments.hasOwnProperty(key),
        'Component %s has no fragment %s',
        displayName,
        key
      );

      return fragments[key]
        .replace(/\s+/g, ' ')
        .replace('fragment', '...')
        .trim();
    }

    render() {
      return (
        <DecoratedComponent {...this.props} />
      );
    }
  };
}
