Adrenaline
==========

**Note: Currently docs are under development!**

[React](https://github.com/facebook/react) bindings for [Redux](https://github.com/rackt/redux) with [Relay](https://github.com/facebook/relay) in mind.

[![build status](https://img.shields.io/travis/gyzerok/adrenaline/master.svg?style=flat-square)](https://travis-ci.org/gyzerok/adrenaline)
[![npm version](https://img.shields.io/npm/v/adrenaline.svg?style=flat-square)](https://www.npmjs.com/package/adrenaline)
[![npm downloads](https://img.shields.io/npm/dm/adrenaline.svg?style=flat-square)](https://www.npmjs.com/package/adrenaline)

Personally I've found [Redux](https://github.com/rackt/redux) the best [Flux](https://github.com/facebook/flux) implementation for now. On the other hand I think that ideas behind [GraphQL](https://github.com/facebook/graphql) and [Relay](https://github.com/facebook/relay) are really great. Currently Relay API feels to be tightly coupled with Facebook cases and ecosystem. This project is an attempt to provide simpler Relay-like API with an ability to use full Redux features (time-travel, middleware, etc...) with support for non GraphQL apis.

## Why?

 - **Redux:** Its super developer-friendly! I love an idea of middleware and higher-order stores. I'd like to keep using these. But if you want to use Relay you have to forget about this. It was true until Adrenaline :)
 - **REST:** Do you have already have a stable API? Is it impossible or costly to migrate to GraphQL?  Well, don't fret because Adrenaline's adapter API helps you to implement a data fetching and caching strategy.
 - **Relay connections:** Most of the time I do not need connections. The problem is Relay forces me to use them.
 - **Relay mutations `getConfigs`:** As a developer you have no freedom to handle this because you can chose only predefined strategies like `RANGE_ADD`. In Adrenaline there is an ability to use more functional and extensible way to handle this.
 - **Relay routes:** Imagine usage of Relay routes with react-router. If you want to move your view from one route to another you would have to fix it in two places: in RR routes and Relay routes. Here I found react-redux idea with smart component much better.

## Installation

`npm install --save adrenaline`

Note: Adrenaline requires **React 0.14 or later.** Containers make use of 0.14's parent based context for propagating state changes.

Adrenaline's GraphQL strategy  uses `fetch` under the hood so you need to install polyfill by yourself.

## Concepts
* Queries and Args - Containers define their data requirements with respect to
  * `args(props): Object`) A transformation of props that affect changes in your container's query requirements. Args are optional, because queries can be computed directly from props. But, args
  will be spread as props along the same lifecycle as the data resolved for queries. In this way, you
  can be sure that certain props (like id's or filters) that are tightly coupled to queries are updated
  when the associated data is loaded.
  * `queries(args): Object`) A function that returns a map of queries (the schema for which should be understood by your adapter strategy for fetching data) keyed by prop names.
* Adapter - The Adrenaline adapter describes the strategy for fetching and resolving data from
  both your API and cache. The adapter will dispatch actions when necessary to cache data with
  a paired reducer. When implementing your own reducer, it's recommended to keep the reducer
  close and in mind due to the tight relationship between data resolution and cache actions.
* Container - A container represents a node in your redux tree that describes and resolves
data requirements in the form of queries. Adrenaline containers will react to changes in 'args'
or the state tree and resolve data props that are exposed via React's
[Context](https://facebook.github.io/react/docs/context.html). Varying behaviors can be
built around the state that containers expose (loading indicators, failure messages, etc.)
but the most common use case is implemented by `createContainerComponent`, which renders
nothing until data props are fetched and spread to a decorated component.

## API

### Adapter
The Adapter is the principal interface that you will implement to define your query, fetch, and
caching strategy for your API. Your adapter must be an object with the following function
* ```resolve(state, dispatch, queries): Promise(dataProps)``` - The resolve function
  * `state` - `(Object)` The adrenaline cache.
  * `dispatch` - `(Function)` Used to dispatch actions representing cache updates.
  * `queries` - `(Object)` The queries for which to resolve data for. The result of a container's query requirements, typically the keys represent the props that will be spread on a component and the values are understood by the adapter
  * returns a `Promise` that resolves to an Object representing the loaded data props (from cache or API) to spread or propagate to components.

#### Example
Note: this trivial example just demonstrates how an adapter and reducer _could_
fetch and cache resources from an arbitrary API and how the adapter relates to
reducer and actions.
```
import { createAction, handleAction } from 'redux-actions';
export const UPDATE_CACHE = "UPDATE_CACHE";
const updateCache = createAction(UPDATE_CACHE);
export const reducer = handleAction(UPDATE_CACHE, (state, {resource})=>
  Object.assign({}, state, { [resource.id]: resource }));

export const resourceAdapter = {
  resolve: (state, dispatch, queries) => {
      const dataProps = {};
      return Promise.all( queries.map((query, prop) => {
        if (query.id in state) {
          dataProps[prop] = state[query.id];
          return Promise.resolve();
        } else {
          return fetch(`/api/resource/${query.id}`)
            .then((response)=>{
              const resource = response.json();
              updateCache(resource);
              dataProps[prop] = resource;
            })
        }
      }))
      .then(() => dataProps); // resolve the data props
  }
}
```

### `<AdrenalineProvider getState, subscribe, dispatch>`
Adrenaline requires a Provider (usually close to the root of your application tree), similar to the [react-redux `<Provider>`](https://github.com/rackt/react-redux/blob/master/docs/api.md#provider-store).
The provider's purpose is to expose an api to containers (_through context_), binding
them to a store (redux or otherwise) and an Adrenaline adapter strategy for resolving state
and fetching data.

Thankfully, Adrenaline comes with a built-in redux-based provider that binds Adrenaline to the redux store. Place it after your redux provider and the store will be retrieved from context. Optional props 'stateSelector' and 'actionType' allow you to adjust the domain in the state tree that adapters
will resolve from and restricted set of actions that containers subscribe to for triggering data refresh.
`<AdrenalineReduxProvider [stateSelector=(state)=>state], [actionType="*"]>`

####Example
Building upon the resource adapter example, we place the adrenaline's cache at a sub-domain
in the state tree and optimize containers by ensuring they only subscribe to and re-resolve
data props after 'UPDATE_CACHE' actions.
```
import { createStore, combineReducers} from 'redux';
import { Provider } from 'react-redux';
import { AdrenalineReduxProvider } from 'adrenaline';
import { resourceAdapter, reducer, UPDATE_CACHE } from './util/ResourceAdapter';
const store = combineReducers({
  'adrenalineCache': reducer
});
ReactDOM.render(
  <Provider store={store}>
    <AdrenalineReduxProvider
      adapter={resourceAdapter}
      stateSelector={ (state) => state.adrenalineCache }
      actionType={UPDATE_CACHE} >
      { /* Your application */ }
    </AdrenalineReduxProvider>
  </Provider>
  , document.body);
```

### `createContainer(options)`
Containers are created from specifications of data requirements and maintain
and expose state about data fetch. They request data to be resolved using the
adapter and store bindings made accessible to them by the Adrenaline Provider,
and react to prop changes.

Options can be one of the following:
* `function(props)` - Through which query requirements are computed directly from props.
* `Object` - An object
  * `args(props): Object` - A function returning props that should be treated as args to
  your queries and exposed by containers for gating prop changes alone the data resolution lifecycle.
  * `queries(props): Object` - The queries function.

#### Example
A container's state is accessible through context and can be handled manually to
build custom behavior. The container exposes 'current', 'pending', and 'failed'
args and data for this purpose.
```
import { containerShape } from 'adrenaline';
const ResourceContainer = createContainer({
  args: (props) => ({ id: props.id }),
  queries: (args) => ({
    myResource: { id: args.id }
  })
}));
const statelessComponent = (props, context) => {
  const currentState = context.adrenaline.container.current;
  if (!currentState ) { return null; }
  const { data, args } = currentState;
  return <div>Resource id:{ args.id } name:{ data.myResource.name }</div>;
}
statelessComponent.contextTypes = { adrenaline: containerShape };
```

#### `createContainerComponent(specs)(target)`
An es7 compatible decorator that implements a container that spreads data props
to the target. This is the most common use case that simply defers rendering of
the target component until an initial set of data props is available and updates
target props as the query requirements change or the cache is updated.

##### Example
In the following example, `ResourceComponent` will actually be exported as a
container component that fetches and updates the data prop 'myResource' using
Adrenaline.
```
@createContainerComponent({
  args: (props) => ({ id: props.id })
  queries: (args) => ({
    myResource: { id: args.id }
  })
})
export class ResourceComponent {
  static propTypes: {
    id: PropTypes.number.isRequired,
    myResource: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired
    })
  }
  render(){
    return <div>Resource id:{ this.props.id } name:{ this.props.myResource.name }</div>;
  }
}
```

### Note!
Adrenaline is working towards a 1.0.0 release, and the documentation is a work in progress.
While Adrenaline endeavors to be a library like Relay for building data driven applications,
the simplest one-size-fits-all GraphQL implementation exists to familiarize you with
concepts and provide immediately useful functionality.

### GraphQL

First thing you need to know in order to use Adrenaline is what your client cache looks like. Your local client cache consists of normalized data. Adrenaline automatically normalizes data for you based on your GraphQL schema.

Suppose you do have following types in your schema:
```javascript
const userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    name: {
      type: GraphQLString,
    },
    todos: {
      type: new GraphQLList(todoType),
      resolve: (user) => {
        // Your resolve logic
      },
    },
  }),
});

const todoType = new GraphQLObjectType({
  name: 'Todo',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    text: {
      type: GraphQLString,
    },
    owner: {
      type: userType,
      resolve: (todo) => {
        // Your resolve logic
      }
    },
  }),
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      viewer: {
        type: userType,
        resolve: () => {
          // Your resolve logic
        }
      }
    }),
  }),
});
```
Assume in the database you have one user with two todos. Then your cache might be:
```javascript
{
  User: {
    1: {
      id: 1,
      name: 'John Wick',
      todos: [1, 2],
    },
  },
  Todo: {
    1: {
      id: 1,
      text: 'Kill my enemies',
      owner: 1,
    },
    2: {
      id: 2,
      text: 'Drink some whiskey',
      owner: 1,
    },
  },
}
```

### GraphQL schema

In order to make things work you need to declare schema with one little addition. For all `resolve` function you need to declare behaviour for the client-side. One possible solution for this is to set global `__CLIENT__` variable and use it inside resolve functions.

With an example below it might looks like the following:
```javascript
const userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    name: {
      type: GraphQLString,
    },
    todos: {
      type: new GraphQLList(todoType),
      resolve: (user, _, { rootValue: root }) => {
        if (__CLIENT__) {
          return user.todos.map(id => root.Todo[id]);
        }
        // resolve from database here
      },
    },
  }),
});

const todoType = new GraphQLObjectType({
  name: 'Todo',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    text: {
      type: GraphQLString,
    },
    owner: {
      type: userType,
      resolve: (todo, _, { rootValue: root }) => {
        if (__CLIENT__) {
          return root.User[todo.owner.id];
        }
        // resolve from database here
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      viewer: {
        type: userType,
        args: {
          id: {
            name: 'id',
            type: new GraphQLNonNull(GraphQLID),
          },
        },
        resolve: (root, { id }) => {
          if (__CLIENT__) {
            return root.User[id];
          }
          // resolve from database here
        },
      },
    }),
  }),
});
```

### `createDumbComponent(Component, { fragments })`

As in [react-redux dumb components idea](https://github.com/rackt/react-redux#dumb-components-are-unaware-of-redux) all your dumb components may be declared as simple React components. But if you want to declare your data requirements in similar to Relay way you can use `createDumbComponent` function.

```javascript
import React, { Component } from 'react';
import { createDumbComponent } from 'adrenaline';

class TodoList extends Component {
  /* ... */
}

export default createDumbComponent(TodoList, {
  fragments: {
    todos: `
      User {
        todos {
          id,
          text
        }
      }
    `,
  },
});
```


### Mutations

Mutations should be declared as a plain objects. Simple mutation can be declared in the following way:
```javascript
const createTodo = {
  mutation: `
    mutation YourMutationName($text: String, $owner: ID) {
      createTodo(text: $text, owner: $owner) {
        id,
        text,
        owner {
          id
        }
      }
    }
  `,
}
```
Then you can use this mutation with your component
```javascript
import React, { Component, PropTypes } from 'react';
import { createSmartComponent } from 'adrenaline';

class UserItem extends Component {
  static propTypes = {
    mutations: PropTypes.object.isRequired,
    viewer: PropTypes.object.isRequired,
  }

  onSomeButtonClick() {
    this.props.mutations.createTodo({
      text: 'Hello, World',
      owner: this.props.viewer.id,
    });
  }
}

const createTodo = /* ... */

export default createSmartComponent(UserItem, {
  initialVariables: (props) => ({
    id: props.userId,
  }),
  query: `
    query Q($id: ID!) {
      viewer(id: $id) {
        id,
        name,
        todos {
          ${TodoList.getFragment('todos')}
        }
      }
    }
  `,
  mutations: {
    createTodo,
  },
});
```

But sometimes you need to update some references in order to make your client data consistent. Thats why there is an `updateCache` property which stands for an array of actions which need to be done in order to make data consistent. Those actions are quite similar to reducers. They have to return state pieces to update internal cache.
```javascript
const createTodo = {
  mutation: `
    mutation YourMutationName($text: String, $owner: ID) {
      createTodo(text: $text, owner: $owner) {
        id,
        text,
        owner {
          id
        }
      }
    }
  `,
  updateCache: [
    (todo) => ({
      parentId: todo.owner.id,
      parentType: 'Todo',
      resolve: (parent) => {
        return {
          ...parent,
          todos: parent.todos.concat([todo.id]),
        };
      },
    })
  ],
}
```


## Known issues

Here is a list of know issues. This issues are just convensions to make all the things work together. Currently there are other things to solve before solving these issues. Be sure they would be resolved before 1.0.

### Only `id`

Currently **Adrenaline** supports only `id` as a name for id attribute on your type.

```javascript
// Invalid
const fooType = new GraphQLObjectType({
  name: 'Foo',
  fields: () => {
    customIdName: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Entity id',
    },
    baz: {
      type: GraphQLString,
      description: 'some stuff',
    },
  },
});

// Valid
const fooType = new GraphQLObjectType({
  name: 'Foo',
  fields: () => {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Entity id',
    },
    baz: {
      type: GraphQLString,
      description: 'some stuff',
    },
  },
});
```

### `id` is required

For now you have to require `id` field inside your queries and mutations in order for normalization to work correctly. You do not have to required `id` only for embedded types.

### Root query and mutation fields

Currently you have to name your root fields as `Query` and `Mutation`.

## Way to 1.0
 - Queries batching
 - Isomorphism
 - Somehow solve necessity of implementing cache resolve in the GraphQL schema
 - Memoize fieldASTs to reduce overhead for query parsing
