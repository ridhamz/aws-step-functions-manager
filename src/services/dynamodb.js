/**
 * AWS DynamoDB integration
 */
function dynamoDB(name, action, params = {}, options = {}) {
  const actions = {
    getItem: 'arn:aws:states:::dynamodb:getItem',
    putItem: 'arn:aws:states:::dynamodb:putItem',
    deleteItem: 'arn:aws:states:::dynamodb:deleteItem',
    updateItem: 'arn:aws:states:::dynamodb:updateItem',
    query: 'arn:aws:states:::dynamodb:query',
    scan: 'arn:aws:states:::dynamodb:scan',
  };

  this.definition.States[name] = {
    Type: 'Task',
    Resource: actions[action],
    Parameters: {
      ...params,
      TableName: params.TableName,
    },
    ResultPath: options.resultPath || '$',
    ...this._getCommonTaskOptions(options),
  };

  this.currentState = name;
  return this;
}

module.exports = dynamoDB;
