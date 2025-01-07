/**
 * AWS ECS integration
 */
function ecs(name, params = {}, options = {}) {
  this.definition.States[name] = {
    Type: 'Task',
    Resource: 'arn:aws:states:::ecs:runTask',
    Parameters: {
      Cluster: params.cluster,
      TaskDefinition: params.taskDefinition,
      LaunchType: params.launchType || 'FARGATE',
      NetworkConfiguration: params.networkConfiguration,
    },
    ResultPath: options.resultPath || '$',
    ...this._getCommonTaskOptions(options),
  };

  this.currentState = name;
  return this;
}

module.exports = ecs;
