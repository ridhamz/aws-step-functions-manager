/**
   * AWS SNS integration
   */
 export default sns(name, action, params = {}, options = {}) {
    const actions = {
      publish: 'arn:aws:states:::sns:publish'
    };

    this.definition.States[name] = {
      Type: 'Task',
      Resource: actions[action],
      Parameters: {
        ...params,
        TopicArn: params.TopicArn
      },
      ResultPath: options.resultPath || '$',
      ...this._getCommonTaskOptions(options)
    };

    this.currentState = name;
    return this;
  }