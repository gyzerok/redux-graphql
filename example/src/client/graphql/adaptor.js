import { createStore } from 'redux';

const UPDATE_CACHE = 'UPDATE_CACHE'
const INVALIDATE = 'INVALIDATE';

export default function createAdaptor(endpoint) {
  const store = createStore(reducer);

  return {
    resolve(queries, args) {
      const specs = queries(args);
      const query = Object.keys(specs).reduce((acc, key) => {
        return `${acc} ${specs[key]}`;
      }, '');
      const graphQLQuery = `
        query AdrenalineQuery {
          ${query}
        }
      `.replace(/\s+/g, ' ').trim();

      const state = store.getState();
      if (state[graphQLQuery]) {
        return Promise.resolve(state[graphQLQuery]);
      }

      return performQuery(endpoint, graphQLQuery).then(res => {
        store.dispatch({
          type: UPDATE_CACHE,
          payload: {
            query: graphQLQuery,
            data: res.data,
          },
        });
        return res.data;
      });
    },

    mutate(mutation, variables, files) {
      return performMutation(endpoint, mutation, variables, files)
        .then(res => {
          store.dispatch({
            type: INVALIDATE,
            payload: {},
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

function reducer(state = {}, { type, payload }) {
  switch (type) {
    case UPDATE_CACHE:
      return {
        ...state,
        [payload.query]: payload.data,
      };
    case INVALIDATE:
      return {};
    default:
      return state;
  }
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

function performMutation(endpoint, mutation, variables) {
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
