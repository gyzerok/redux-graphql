import { createStore, combineReducers } from 'redux';
import { graphql } from 'graphql';

import parseSchema from './parseSchema';
import normalize from './normalize';
import merge from './merge';

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

function request(endpoint, query, variables, files) {
  if (!files) {
    return fetch(endpoint, {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    }).then(res => res.json());
  }
}
