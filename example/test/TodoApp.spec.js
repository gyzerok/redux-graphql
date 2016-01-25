import expect from 'expect';
import { parse } from 'graphql/language';
import { validate } from 'graphql/validation';

import schema from '../src/shared/schema';
import TodoApp from '../src/client/graphql/components/TodoApp';

describe('Queries regression', () => {
  it('for TodoApp', (done) => {
    const queries = TodoApp.getQueries()();
    const combinedQueries = Object
      .keys(queries)
      .reduce((acc, key) => {
        return `${acc} ${queries[key]}`;
      }, '');
    const graphQLQuery = `query TestQuery { ${combinedQueries} }`;

    const errors = validate(schema, parse(graphQLQuery));
    if (errors.length === 0) return done();

    throw errors[0];
  });
});
