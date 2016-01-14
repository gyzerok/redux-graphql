/* @flow */

export const createTodo = `
  mutation AppMutation($input: TodoInput) {
    createTodo(input: $input) {
      id
    }
  }
`;
