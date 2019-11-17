// Assertations

// Operations must have a non-empty `operationId`

// `operationId` should adhere to a given case convention

// `operationId` should conform to naming conventions

const pickBy = require('lodash/pickBy');
const reduce = require('lodash/reduce');
const merge = require('lodash/merge');
const each = require('lodash/each');
const { checkCase } = require('../../../utils');

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

module.exports.validate = function({ resolvedSpec }, config) {
  const result = {
    error: [],
    warning: []
  };
  const fixes = [];

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

  // First get a set of all operationIds to make sure we don't create a duplicate.
  //var allOperationIds = new Set(operations.map(op => op.operationId));

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

        const fix = fixOperationId(op, resolvedSpec);
        //console.log('fixOperationId: ', JSON.stringify(fix, null, 2));
        fixes.push(fix);
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

        const fix = fixOperationId(op, resolvedSpec);
        //console.log('fixOperationId: ', JSON.stringify(fix, null, 2));
        fixes.push(fix);
      }
    }
  });

  return { errors: result.error, warnings: result.warning, fixes };
};

function fixOperationId(op, resolvedSpec) {
  // We'll use a heuristic to decide if this path is part of a resource oriented API.
  // If path ends in path param, look for corresponding create/list path
  // Conversely, if no path param, look for path with path param

  const isResourceOriented = op.path.endsWith('}')
    ? Object.keys(resolvedSpec.paths).includes(
        op.path.replace('/\\{[A-Za-z0-9-_]+\\}$', '')
      )
    : Object.keys(resolvedSpec.paths).some(p => p.startsWith(op.path + '/{'));

  if (isResourceOriented) {
    // create a map with the verbs to use in operationIds for this path

    const verbs = Object.keys(resolvedSpec.paths[op.path])
      .filter(s => httpMethods.includes(s))
      .reduce((map, s) => {
        map[s] = s.toLowerCase();
        return map;
      }, {});

    if (!op.path.endsWith('}')) {
      // Collection verbs
      verbs['post'] = 'create';
      verbs['get'] = 'list';
    } else {
      // Instance verbs
      if (verbs['patch']) {
        verbs['patch'] = 'update';
      } else if (verbs['post']) {
        verbs['post'] = 'update';
      }
      verbs['put'] = 'replace';
    }

    // Now find the noun. Use the final non-parameter path segment
    const noun = op.path
      .split('/')
      .filter(s => !s.startsWith('{'))
      .slice(-1)[0];

    const newOperationId = verbs[op.httpMethod] + '_' + noun;
    return {
      op: 'add',
      path: ['paths', op.path, op.httpMethod, 'operationId'].join('.'),
      value: newOperationId
    };
  } else {
    // Use last path segment
    if (!op.path.endsWith('}')) {
      const newOperationId = op.path.split('/').slice(-1)[0];
      return {
        op: 'add',
        path: ['paths', op.path, op.httpMethod, 'operationId'].join('.'),
        value: newOperationId
      };
    }
  }
}
