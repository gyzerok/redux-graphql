import test from 'tape';
import {
  graphql,
  GraphQLSchema,
  GraphQLString,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
} from 'graphql';
import normalize from '../normalize';
import parseSchema from '../parseSchema'

const todoType = new GraphQLObjectType({
  name: 'Todo',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    text: {
      type: GraphQLString,
    },
    nested: {
      type: nestedType,
    }
  }),
});

const userType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
    },
    name: {
      type: GraphQLString
    },
    todos: {
      type: new GraphQLList(todoType),
      resolve: (user, params, { rootValue: root }) => {
        return user.todos.map(id => root.Todo[id]);
      },
    },
    nested: {
      type: new GraphQLList(nestedType),
    }
  }),
});

const nestedType = new GraphQLObjectType({
  name: 'Nested',
  fields: () => ({
    one: {
      type: GraphQLInt,
    },
    two: {
      type: GraphQLInt,
    }
  }),
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      viewer: {
        type: userType,
        resolve: (root) => {
          return root.User['u-1'];
        },
      },
    }),
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
      updateTodo: {
        type: todoType,
        args: {
          id: {
            name: 'id',
            type: new GraphQLNonNull(GraphQLID),
          },
          text: {
            name: 'text',
            type: GraphQLString
          }
        },
        resolve: (root, { id, text }) => {
          root.Todo[id].text = text;
          return root.Todo[id];
        },
      },
    }),
  }),
});

const parsedSchema = parseSchema(schema);

test('normalize for queries', assert => {
  const data = {
    User: {
      'u-1': {
        id: 'u-1',
        name: 'User1',
        todos: ['t-1', 't-2'],
        nested: [{
          one: 1,
          two: 2,
        }, {
          one: 11,
          two: 11,
        }],
      },
    },
    Todo: {
      't-1': {
        id: 't-1',
        text: 'Hello',
        nested: {
          one: 1,
          two: 2,
        },
      },
      't-2': {
        id: 't-2',
        text: 'World',
        nested: {
          one: 11,
          two: 22,
        },
      },
    },
  };
  const query = `
    query TestQuery {
      viewer {
        id,
        name,
        todos {
          id,
          text,
          nested {
            one,
            two
          }
        },
        nested {
          one,
          two
        }
      }
    }
  `;

  graphql(schema, query, data)
    .then(res => {
      const normalized = normalize(parsedSchema, res.data);
      assert.deepEqual(normalized, data, 'should correctly normalize queries');

      assert.end();
    })
    .catch(err => assert.end(err));
});

test('normalize for mutations', assert => {
  const data = {
    User: {
      'u-1': {
        id: 'u-1',
        name: 'User1',
        todos: ['t-1', 't-2'],
      }
    },
    Todo: {
      't-1': {
        id: 't-1',
        text: 'Hello',
      },
      't-2': {
        id: 't-2',
        text: 'World',
      },
    },
  };
  const expected = {
    Todo: {
      't-1': {
        id: 't-1',
        text: 'updated text',
      },
    },
  };
  const mutation = `
    mutation TestMutation {
      updateTodo(id: "t-1", text: "updated text") {
        id,
        text
      }
    }
  `;

  graphql(schema, mutation, data)
    .then(res => {
      const normalized = normalize(parsedSchema, res.data);
      assert.deepEqual(normalized, expected, 'should correctly normalize mutations');

      assert.end();
    })
    .catch(err => assert.end(err));
});
