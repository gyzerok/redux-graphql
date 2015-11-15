import { reduce } from 'lodash';
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLEnumType,
} from 'graphql';

export default function parseSchema(schema) {
  const typeMap = schema.getTypeMap();
  const userTypes = reduce(typeMap, (acc, val, key) => {
    if (key.startsWith('__')) return acc;
    if (isScalar(val) || isEnum(val) || isNested(val)) return acc;

    return {
      ...acc,
      [key]: {
        ...reduce(val.getFields(), (memo, field, name) => {
          const typename = parseType(field.type);
          return typename ? { ...memo, [name]: typename } : memo;
        }, {}),
      },
    };
  }, {});
  return userTypes;
}

function parseType(type) {
  if (isDefined(type) && !isNested(type)) return type.name;
  if (isComplex(type)) return parseType(type.ofType);
  if (isList(type)) {
    const childType = type.ofType;
    if (isDefined(childType) && !isNested(childType)) return [childType.name];
  }
}

function isComplex(type) {
  return type instanceof GraphQLNonNull;
}

function isList(type) {
  return type instanceof GraphQLList;
}

function isScalar(type) {
  return type instanceof GraphQLScalarType;
}

function isEnum(type) {
  return type instanceof GraphQLEnumType;
}

function isDefined(type) {
  return !(
    isList(type)
    || isComplex(type)
    || isScalar(type)
  );
}

function isNested(type) {
  return !isScalar(type)
    && !isEnum(type)
    && !type.getFields().hasOwnProperty('id')
    && type.name !== 'Query'
    && type.name !== 'Mutation';
}
