import expect from 'expect';
import { TestUtils } from 'adrenaline';

import schema from '../../../server/schema';
import TodoApp from '../TodoApp';

expect.extend(TestUtils.expect);

describe('Queries regression', () => {
  it('for TodoApp', () => {
    expect(TodoApp).toBeValidAgainst(schema);
  });
});
