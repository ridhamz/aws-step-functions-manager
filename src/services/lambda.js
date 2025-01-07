  /**
   * AWS Lambda integration
   */
  export default lambda(name, functionArn, options = {},_getCommonTaskOptions) {
    this.definition.States[name] = {
      Type: 'Task',
      Resource: functionArn,
      ResultPath: options.resultPath || '$',
      _getCommonTaskOptions(options)
    };
    
    this.currentState = name;
    return this;
  }