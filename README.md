Adrenaline
==========

**Note: Currently docs are under development!**

[React](https://github.com/facebook/react) bindings for [Redux](https://github.com/rackt/redux) with [Relay](https://github.com/facebook/relay) in mind.

[![build status](https://img.shields.io/travis/gyzerok/adrenaline/master.svg?style=flat-square)](https://travis-ci.org/gyzerok/adrenaline)
[![npm version](https://img.shields.io/npm/v/adrenaline.svg?style=flat-square)](https://www.npmjs.com/package/adrenaline)
[![npm downloads](https://img.shields.io/npm/dm/adrenaline.svg?style=flat-square)](https://www.npmjs.com/package/adrenaline)

Personally I've found [Redux](https://github.com/rackt/redux) the best [Flux](https://github.com/facebook/flux) implementation for now. On the other hand I think that ideas behind [GraphQL](https://github.com/facebook/graphql) and [Relay](https://github.com/facebook/relay) are really great. Currently Relay API feels to be tightly coupled with Facebook cases and ecosystem. This project is an attempt to provide simplier Relay-like API with an ability to use full Redux features (time-travel, middlewares, etc...).

## Why?

 - **Redux:** Its super developer-friendly! I love an idea of middlewares and higher-order stores. I'd like to keep using these. But if you want to use Relay you have to forget about this. It was true until Adrenaline :)
 - **Relay connections:** Most of the time I do not need connections. The problem is Relay forces me to use them.
 - **Relay mutations `getConfigs`:** As a developer you have no freedom to handle this cuz you can chose only predefined strategies like `RANGE_ADD`. In Adrenaline there is an ability to use more functional and extensible way to handle this.
 - **Relay routes:** Imagine usage of Relay routes with react-router. If you want to move your view from one route to another you would have to fix it in two places: in RR routes and Relay routes. Here I found react-redux idea with smart component much better.

## Installation

`npm install --save adrenaline`

Adrenaline requires **React 0.13 or later.**

Adrenaline uses `fetch` under the hood so you need to install polyfill by yourself.

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

## API

### Cache

First thing you need to know in order to use Adrenaline is how your client cache looks like. Your local client cache consists of normalized data. Adrenaline automatically normalizes data for you based on your GraphQL schema.

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

### `<Adrenaline endpoint schema createStore>`

Root of your application should be wrapped with Adrenaline component.

#### Props

  - `endpoint`: URL to your GraphQL endpoint.
  - `schema`: An instance of GraphQL schema you are using.
  - `createStore`: Function for creating a store. Reducers would be created automatically, you just need to provide this function in order to be able to configure it with custom middlewares and higher-order stores. If nothing is provided `Redux.createStore` will be used.
  - `storeKey`: String to specify the object on your store in which the Adrenaline state is stored.

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

### `createSmartComponent(Component, { initialArgs, query, mutations })`

This function is the main building block for your application. It is similar to [react-redux smart component](https://github.com/rackt/react-redux#smart-components-are-connect-ed-to-redux) but with ability to declare your data query with GraphQL.

  - `Component`: Its your component which would be wrapped.
  - `initialArgs`: This is an are your arguments which would be applied to your query. You can declare it as a plain object or as a function of props.
  - `query`: Your GraphQL query string.
  - `mutations`: Your mutations which would be binded to dispatch.

**Note:** When you use `createSmartComponent` you need do declare `propTypes` in your decorated component. If you declare prop as `isRequired` your view wouldnt be showed until data is available.

```javascript
import React, { Component, PropTypes } from 'react';
import { createSmartComponent } from 'adrenaline';
import TodoList from './TodoList';

class UserItem extends Component {
  static propTypes = {
    viewer: PropTypes.object.isRequired,
  }
  /* ... */
}

// With initialArgs as a plain object
export default createSmartComponent(UserItem, {
  initialArgs: {
    id: 1,
  },
  query: `
    query Q($id: ID!) {
      viewer(id: $id) {
        id,
        name,
        ${TodoList.getFragment('todos')}
      }
    }
  `,
});

// Or with initialArgs as a function of props
export default createSmartComponent(UserItem, {
  initialArgs: (props) => ({
    id: props.userId,
  }),
  query: `
    query Q($id: ID!) {
      viewer(id: $id) {
        id,
        name,
        ${TodoList.getFragment('todos')}
      }
    }
  `,
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
  initialArgs: (props) => ({
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

## Way to 1.0
 - Queries batching
 - Isomorphism
 - Somehow solve necessity of implementing cache resolve in the GraphQL schema
 - Memoize fieldASTs to reduce overhead for query parsing
