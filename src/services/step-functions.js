/**
   * AWS Step Functions integration
   */
function stepFunction(name, action, params = {}, options = {}) {
    const actions = {
      startExecution: 'arn:aws:states:::states:startExecution',
      startExecution.sync: 'arn:aws:states:::states:startExecution.sync'
    };

    this.definition.States[name] = {
      Type: 'Task',
      Resource: actions[action],
      Parameters: {
        StateMachineArn: params.stateMachineArn,
        Input: params.input,
        Name: params.executionName
      },
      ResultPath: options.resultPath || '$',
      ...this._getCommonTaskOptions(options)
    };

    this.currentState = name;
    return this;
  }

  module.exports = stepFunction
