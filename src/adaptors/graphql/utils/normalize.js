import { isArray, isEqual } from 'lodash';

export default function normalize(parsedSchema, data) {
  const keys = Object.keys(data);
  const isQuery = parsedSchema.hasOwnProperty('Query')
    && keys.every(key => parsedSchema.Query.hasOwnProperty(key));
  const isMutation = parsedSchema.hasOwnProperty('Mutation')
    && keys.every(key => parsedSchema.Mutation.hasOwnProperty(key));

  const bag = {};
  if (isQuery) {
    normalizeAny(parsedSchema, 'Query', bag, data);
  }
  else if (isMutation) {
    normalizeAny(parsedSchema, 'Mutation', bag, data);
  }
  else {
    throw new Error('Unrecognized GraphQL result');
  }

  return bag;
}

function normalizeAny(parsedSchema, typename, bag, data) {
  if (data === null || data === undefined) {
    return null;
  }

  if (typename === undefined) {
    return data;
  }

  if (isArray(typename)) {
    return normalizeArray(parsedSchema, typename[0], bag, data);
  }

  if (!data.hasOwnProperty('id')) {
    return normalizeObject(parsedSchema, typename, bag, data);
  }

  return normalizeType(parsedSchema, typename, bag, data);
}

function normalizeArray(parsedSchema, typename, bag, data) {
  return data.map(item => normalizeAny(parsedSchema, typename, bag, item));
}

function normalizeObject(parsedSchema, typename, bag, data) {
  const itemSchema = parsedSchema[typename];
  const normalized = {};
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const node = normalizeAny(parsedSchema, itemSchema[key], bag, data[key]);
      normalized[key] = node;
    }
  }
  return normalized;
}

function normalizeType(parsedSchema, typename, bag, data) {
  const id = data.id;

  if (!bag[typename]) {
    bag[typename] = {};
  }

  if (!bag[typename][id]) {
    bag[typename][id] = {};
  }

  const stored = bag[typename][id];
  const normalized = normalizeObject(parsedSchema, typename, bag, data);
  merge(stored, normalized);

  return id;
}

function merge(entityA, entityB) {
  for (const key in entityB) {
    if (!entityB.hasOwnProperty(key) || isEqual(entityA[key], entityB[key])) {
      continue;
    }
    entityA[key] = entityB[key];
  }
}
