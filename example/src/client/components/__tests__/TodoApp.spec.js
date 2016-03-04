import expect from 'expect';
import adrenalineTestUtils from 'adrenaline/lib/graphql/test-utils/expect';

import schema from '../../../../shared/schema';
import TodoApp from '../TodoApp';

expect.extend(adrenalineTestUtils);

describe('Queries regression', () => {
  it('for TodoApp', () => {
    expect(TodoApp).toBeValidAgainst(schema);
  });
});
