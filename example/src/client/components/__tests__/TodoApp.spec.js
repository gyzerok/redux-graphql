import expect from 'expect';
import adrenalineTestUtils from 'adrenaline/lib/test-utils/expect';

import schema from '../../../server/schema';
import TodoApp from '../TodoApp';

expect.extend(adrenalineTestUtils);

describe('Queries regression', () => {
  it('for TodoApp', () => {
    expect(TodoApp).toBeValidAgainst(schema);
  });
});
