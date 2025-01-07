/**
 * AWS Batch integration
 */
function batch(name, params = {}, options = {}) {
  this.definition.States[name] = {
    Type: 'Task',
    Resource: 'arn:aws:states:::batch:submitJob',
    Parameters: {
      JobName: params.jobName,
      JobDefinition: params.jobDefinition,
      JobQueue: params.jobQueue,
      Parameters: params.parameters,
      ContainerOverrides: params.containerOverrides,
    },
    ResultPath: options.resultPath || '$',
    ...this._getCommonTaskOptions(options),
  };

  this.currentState = name;
  return this;
}

module.exports = batch;
