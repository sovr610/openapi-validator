const expect = require('expect');
const {
  validate
} = require('../../../../src/plugins/validation/2and3/semantic-validators/operation-ids-ibm');

const config = require('../../../../src/.defaultsForValidator').defaults.shared;

describe('validation plugin - semantic - operation-ids-ibm', function() {
  describe('Swagger 2', function() {
    it('should complain about a missing operationId', function() {
      const spec = {
        paths: {
          '/CoolPath': {
            put: {
              consumes: ['consumes'],
              summary: 'this is a summary',
              parameters: [
                {
                  name: 'BadParameter',
                  in: 'body',
                  schema: {
                    required: ['Property'],
                    properties: [
                      {
                        name: 'Property'
                      }
                    ]
                  }
                }
              ]
            }
          }
        }
      };

      const res = validate({ resolvedSpec: spec }, config);
      expect(res.warnings.length).toEqual(1);
      expect(res.warnings[0].path).toEqual('paths./CoolPath.put.operationId');
      expect(res.warnings[0].message).toEqual(
        'Operations must have a non-empty `operationId`.'
      );
      expect(res.errors.length).toEqual(0);
    });

    it('should complain about an empty operationId', function() {
      const spec = {
        paths: {
          '/CoolPath': {
            put: {
              consumes: ['consumes'],
              summary: 'this is a summary',
              operationId: ' ',
              parameters: [
                {
                  name: 'BadParameter',
                  in: 'body',
                  schema: {
                    required: ['Property'],
                    properties: [
                      {
                        name: 'Property'
                      }
                    ]
                  }
                }
              ]
            }
          }
        }
      };

      const res = validate({ resolvedSpec: spec }, config);
      expect(res.warnings.length).toEqual(1);
      expect(res.warnings[0].path).toEqual('paths./CoolPath.put.operationId');
      expect(res.warnings[0].message).toEqual(
        'Operations must have a non-empty `operationId`.'
      );
      expect(res.errors.length).toEqual(0);
    });

    it('should complain about an operationId with the wrong case', function() {
      const spec = {
        paths: {
          '/CoolPath': {
            put: {
              consumes: ['consumes'],
              summary: 'this is a summary',
              operationId: 'coolPathPut',
              parameters: [
                {
                  name: 'BadParameter',
                  in: 'body',
                  schema: {
                    required: ['Property'],
                    properties: [
                      {
                        name: 'Property'
                      }
                    ]
                  }
                }
              ]
            }
          }
        }
      };

      const res = validate({ resolvedSpec: spec }, config);
      expect(res.warnings.length).toEqual(1);
      expect(res.warnings[0].path).toEqual('paths./CoolPath.put.operationId');
      expect(res.warnings[0].message).toEqual(
        'operationIds must follow case convention: lower_snake_case'
      );
      expect(res.errors.length).toEqual(0);
    });

    it('should not complain about a valid operationId', function() {
      const spec = {
        paths: {
          '/CoolPath': {
            put: {
              consumes: ['consumes'],
              summary: 'this is a summary',
              operationId: 'cool_path_put',
              parameters: [
                {
                  name: 'BadParameter',
                  in: 'body',
                  schema: {
                    required: ['Property'],
                    properties: [
                      {
                        name: 'Property'
                      }
                    ]
                  }
                }
              ]
            }
          }
        }
      };

      const res = validate({ resolvedSpec: spec }, config);
      expect(res.warnings.length).toEqual(0);
      expect(res.errors.length).toEqual(0);
    });
  });
});
