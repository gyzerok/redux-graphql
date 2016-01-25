/* @flow */

import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLSchema,
} from 'graphql';

const todoType = new GraphQLObjectType({
  name: 'Todo',
  description: 'Todo type',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'Todo id',
    },
    text: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Todo text',
    },
    owner: {
      type: userType,
      resolve: (todo, _, { rootValue: root }) => {
        return root.findUser();
      },
    },
    createdAt: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'Todo creation date',
    },
  }),
});

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
      args: {
        count: {
          name: 'count',
          type: GraphQLInt,
        },
      },
      resolve: (user, params, { rootValue: root }) => {
        return root.findTodo(params);
      },
    },
  }),
});

const enumType = new GraphQLEnumType({
  name: 'Test',
  values: {
    ONE: {
      value: 1,
    },
    TWO: {
      value: 2,
    },
  },
});

const todoInput = new GraphQLInputObjectType({
  name: 'TodoInput',
  fields: () => ({
    text: { type: GraphQLString },
  }),
});

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      viewer: {
        type: userType,
        resolve: (root) => {
          return root.findUser();
        },
      },
      test: {
        type: enumType,
        resolve: () => 1,
      },
    }),
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
      createTodo: {
        type: todoType,
        args: {
          input: {
            type: todoInput,
          },
        },
        resolve: (root, { input }) => {
          return root.createTodo(input);
        },
      },
    }),
  }),
});
