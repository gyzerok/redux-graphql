import test from 'tape';
import {
  graphql,
  GraphQLSchema,
  GraphQLString,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLEnumType,
} from 'graphql';
import parseSchema from '../parseSchema'

test('parseSchema', (assert) => {
  test1(assert);
  test2(assert);
  assert.end();
});

function test1(assert) {
  let todoType = new GraphQLObjectType({
    name: 'Todo',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLID),
      },
      text: {
        type: GraphQLString,
      },
      nested: {
        type: new GraphQLList(nestedType),
      }
    })
  });

  let userType = new GraphQLObjectType({
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
      },
      nested: {
        type: nestedType,
      }
    })
  });

  let nestedType = new GraphQLObjectType({
    name: 'Nested',
    fields: () => ({
      hello: {
        type: GraphQLString,
        resolve: () => 'world',
      }
    }),
  });

  let schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: () => ({
        viewer: {
          type: userType,
        }
      }),
    }),
  });

  let expected = {
    Query: {
      viewer: 'User',
    },
    User: {
      todos: ['Todo'],
    },
    Todo: {},
  }
  assert.deepEqual(parseSchema(schema), expected, 'supports simple types');
}

function test2(assert) {
  let enumType = new GraphQLEnumType({
    name: 'TestEnum',
    values: {
      ONE: {
        value: 1,
      },
      TWO: {
        value: 2,
      },
    },
  });

  let objectType = new GraphQLObjectType({
    name: 'TestObject',
    fields: () => ({
      id: {
        type: new GraphQLNonNull(GraphQLID),
        enum: enumType,
      }
    }),
  });

  let schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: () => ({
        object: {
          type: objectType,
        }
      }),
    }),
  });

  let expected = {
    Query: {
      object: 'TestObject',
    },
    TestObject: {},
  }
  assert.deepEqual(parseSchema(schema), expected, 'supports GraphQLEnumType');
}
