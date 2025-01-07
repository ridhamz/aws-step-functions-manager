 /**
   * AWS EventBridge integration
   */
 export default  eventBridge(name, params = {}, options = {}) {
    this.definition.States[name] = {
      Type: 'Task',
      Resource: 'arn:aws:states:::events:putEvents',
      Parameters: {
        Entries: params.Entries
      },
      ResultPath: options.resultPath || '$',
      ...this._getCommonTaskOptions(options)
    };

    this.currentState = name;
    return this;
  }