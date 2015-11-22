/* @flow */

export const createTodo = {
  mutation: `
    mutation AppMutation($input: TodoInput) {
      createTodo(input: $input) {
        id,
        text,
        createdAt,
        owner {
          id
        }
      }
    }
  `,
  collisionKey: ({ id }) => `todo_${id}`,
  updateCache: [
    (todo) => ({
      parentId: todo.owner.id,
      parentType: 'User',
      resolve: (parent) => {
        return {
          ...parent,
          todos: [...parent.todos, todo.id],
        };
      },
    }),
  ],
};
