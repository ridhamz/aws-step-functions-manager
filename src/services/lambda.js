/**
 * AWS Lambda integration
 */
function lambda(name, functionArn, options = {}) {
  this.definition.States[name] = {
    Type: 'Task',
    Resource: functionArn,
    ResultPath: options.resultPath || '$',
    ...this._getCommonTaskOptions(options),
  };

  this.currentState = name;
  return this;
}

module.exports = lambda;
