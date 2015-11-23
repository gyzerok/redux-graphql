import { createStore, combineReducers } from 'redux';
import { graphql } from 'graphql';
import { values } from 'lodash';

import parseSchema from './utils/parseSchema';
import normalize from './utils/normalize';
import merge from './utils/merge';

const UPDATE_CACHE = 'UPDATE_CACHE';

export default function createAdaptor(endpoint, schema) {
  const parsedSchema = parseSchema(schema);
  const reducers = Object.keys(parsedSchema).reduce((acc, key) => {
    return {
      ...acc,
      [key]: createReducer(key),
    };
  });
  const reducer = combineReducers(reducers);
  const store = createStore(reducer);

  return {
    resolve(queries, args, isDataLoaded) {
      const specs = queries(args);
      const query = Object.keys(specs).reduce((acc, key) => {
        return `${acc} ${specs[key]}`;
      }, '');
      const graphQLQuery = `
        query AdrenalineQuery {
          ${query}
        }
      `.replace(/\s+/g, ' ').trim();

      return graphql(schema, graphQLQuery, store.getState())
        .then(res => {
          if (isDataLoaded(res.data)) {
            return res.data;
          }

          return performQuery(endpoint, graphQLQuery).then(res => {
            store.dispatch({
              type: UPDATE_CACHE,
              payload: normalize(parsedSchema, res.data),
            })

            return res.data;
          });
        });
    },

    mutate(specs, variables, files) {
      const { mutation, updateCache } = specs;

      return performMutation(endpoint, mutation, variables, files)
        .then(res => {
          store.dispatch({
            type: UPDATE_CACHE,
            payload: normalize(parsedSchema, res.data),
          });

          updateCache.forEach((fn) => {
            const { parentId, parentType, resolve } = fn(Object.values(res.data)[0]);
            const state = store.getState();
            const parent = state[parentType][parentId];

            if (!parent) return;

            store.dispatch({
              type: UPDATE_CACHE,
              payload: {
                [parentType]: {
                  [parent.id]: resolve(parent),
                },
              },
            });
          });

          return Promise.resolve();
        });
    },

    subscribe(listener) {
      return store.subscribe(listener);
    },

    shouldComponentUpdate(prevState, nextState) {
      return prevState !== nextState;
    },
  };
}

function createReducer(key) {
  return (state = null, { type, payload }) => {
    switch (type) {
      case UPDATE_CACHE:
        if (state === null) {
          return values(payload[key]);
        }
        return state.reduce((acc, item) => {
          if (!payload[key][item.id]) {
            return [...acc, item];
          }
          return [...acc, merge(item, payload[key][item.id])];
        }, []);
      default:
        return state;
    }
  };
}

function performQuery(endpoint, query) {
  return fetch(endpoint, {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  }).then(res => res.json());
}

function performMutation(endpoint, mutation, variables, files) {
  if (!files) {
    return fetch(endpoint, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    }).then(res => res.json());
  }

  const formData = new FormData();
  formData.append('query', mutation);
  formData.append('variables', JSON.stringify(variables));
  if (files) {
    for (const filename in files) {
      if (files.hasOwnProperty(filename)) {
        formData.append(filename, files[filename]);
      }
    }
  }
  return fetch(endpoint, {
    method: 'post',
    body: formData,
  }).then(res => res.json());
}
