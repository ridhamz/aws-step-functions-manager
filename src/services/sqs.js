 /**
   * AWS SQS integration
   */
 export default sqs(name, action, params = {}, options = {}) {
    const actions = {
      sendMessage: 'arn:aws:states:::sqs:sendMessage',
      sendMessageBatch: 'arn:aws:states:::sqs:sendMessageBatch'
    };

    this.definition.States[name] = {
      Type: 'Task',
      Resource: actions[action],
      Parameters: {
        ...params,
        QueueUrl: params.QueueUrl
      },
      ResultPath: options.resultPath || '$',
      ...this._getCommonTaskOptions(options)
    };

    this.currentState = name;
    return this;
  }