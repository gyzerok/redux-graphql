import { createStore, combineReducers } from 'redux';
import { graphql } from 'graphql';

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
      // FIXME: better handle mutation case
      if (typeof isDataLoaded !== 'function') {
        const mutation = queries;
        const files = isDataLoaded;
        return request(endpoint, mutation, args, files)
          .then(res => {
            store.dispatch({
              type: UPDATE_CACHE,
              payload: normalize(parsedSchema, res.data),
            });

            return Promise.resolve();
          });
      }

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

          return request(endpoint, graphQLQuery).then(res => {
            store.dispatch({
              type: UPDATE_CACHE,
              payload: normalize(parsedSchema, res.data),
            })

            return Promise.resolve();
          });
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
  return (state = {}, { type, payload }) => {
    switch (type) {
      case UPDATE_CACHE:
        return merge(state, payload[key] || {});
      default:
        return state;
    }
  };
}

function request(...args) {
  if (args.length > 2) {
    return performMutation(...args);
  }

  return performQuery(...args);
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
        query: mutation.mutation,
        variables: { input: variables },
      }),
    }).then(res => res.json());
  }

  const formData = new FormData();
  formData.append('query', mutation.mutation);
  formData.append('variables', JSON.stringify({ input: variables }));
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
