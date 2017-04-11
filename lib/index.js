/* eslint-disable no-underscore-dangle */
const graphqlSchema = require('lib/graphql/schema');

module.exports = (graphqlSchema) => {

  const isScalarType = (field) => {
    try {
      const type = field.type.ofType || field.type; // a field of type GraphQLNonNull will respond to ofType whereas a GraphQLString would not.
      return type._scalarConfig;
    } catch (err) {
      return false;
    }
  };

  const getMutationSignature = (args) => {
    if (args.length > 0) {
      const argsStr = args.map(arg => `$${arg.name}: ${arg.type.toString()}`).join(', ');
      return `(${argsStr})`;
    }
    return '';
  };

  const getMutationArguments = (args) => {
    if (args.length > 0) {
      const argsStr = args.map(arg => `${arg.name}: $${arg.name}`).join(', ');
      return `(${argsStr})`;
    }
    return '';
  };

  return (mutation) => {
    const args = graphqlSchema._mutationType._fields[mutation].args;
    const mutationSignature = getMutationSignature(args);
    const mutationArguments = getMutationArguments(args);

    const returnableFields = graphqlSchema._mutationType._fields[mutation].type._fields;
    const mutationReturnValues = Object.keys(returnableFields)
      .map(key => isScalarType(returnableFields[key]) ? `${key}` : null) // eslint-disable-line no-confusing-arrow
      .filter(Boolean)
      .join('\n        ');

    const x = `
      mutation ${mutation}${mutationSignature} {
        ${mutation}${mutationArguments} {
          ${mutationReturnValues}
        }
      }
    `;

    // console.log(x);

    return x;
  };
}
