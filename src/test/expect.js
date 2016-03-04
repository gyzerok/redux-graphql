import { parse } from 'graphql/language';
import { validate } from 'graphql/validation';

export default {
  toBeValidAgainst(schema) {
    const specs = this.actual.getSpecs();
    const queries = specs.queries();
    const combinedQueries = Object
      .keys(queries)
      .reduce((acc, key) => {
        return `${acc} ${queries[key]}`;
      }, '');
    const graphQLQuery = `query TestQuery { ${combinedQueries} }`;
    const errors = validate(schema, parse(graphQLQuery));

    if (errors.length === 0) return this;

    throw errors[0];
  },
};
