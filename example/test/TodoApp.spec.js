import expect from 'expect';
import { parse } from 'graphql/language';
import { validate } from 'graphql/validation';
import adrenalineTestUtils from 'adrenaline/lib/adaptors/graphql/test-utils/expect';

import schema from '../src/shared/schema';
import TodoApp from '../src/client/graphql/components/TodoApp';

expect.extend(adrenalineTestUtils);

describe('Queries regression', () => {
  it('for TodoApp', () => {
    expect(TodoApp).toBeValidAgainst(schema);
  });
});
