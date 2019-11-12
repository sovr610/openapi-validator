// Assertations

// Operations must have a non-empty `operationId`

// `operationId` should adhere to a given case convention

// `operationId` should conform to naming conventions

const pickBy = require('lodash/pickBy');
const reduce = require('lodash/reduce');
const merge = require('lodash/merge');
const each = require('lodash/each');
const { checkCase } = require('../../../utils');

module.exports.validate = function({ resolvedSpec }, config) {
  const result = {
    error: [],
    warning: []
  };

  const httpMethods = [
    'get',
    'head',
    'post',
    'put',
    'patch',
    'delete',
    'options',
    'trace'
  ];

  const operations = reduce(
    resolvedSpec.paths,
    (arr, path, pathKey) => {
      const pathOps = pickBy(path, (obj, k) => {
        return httpMethods.indexOf(k) > -1;
      });
      each(pathOps, (op, opKey) =>
        arr.push(
          merge(
            {
              path: `${pathKey}`,
              httpMethod: `${opKey}`
            },
            op
          )
        )
      );
      return arr;
    },
    []
  );

  operations.forEach(op => {
    const hasOperationId =
      op.operationId &&
      op.operationId.length > 0 &&
      !!op.operationId.toString().trim();
    if (!hasOperationId) {
      const checkStatus = config.operations.no_operation_id;
      if (checkStatus !== 'off') {
        result[checkStatus].push({
          path: `paths.${op.path}.${op.httpMethod}.operationId`,
          message: 'Operations must have a non-empty `operationId`.'
        });
      }
    } else {
      // check operationId for case convention
      const checkStatus = config.operations.operation_id_case_convention[0];
      const caseConvention = config.operations.operation_id_case_convention[1];
      const isCorrectCase = checkCase(op.operationId, caseConvention);
      if (!isCorrectCase && checkStatus != 'off') {
        result[checkStatus].push({
          path: `paths.${op.path}.${op.httpMethod}.operationId`,
          message: `operationIds must follow case convention: ${caseConvention}`
        });
      }
    }
  });

  return { errors: result.error, warnings: result.warning };
};
