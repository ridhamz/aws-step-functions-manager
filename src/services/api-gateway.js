 /**
   * Add API Gateway integration
   */
 export default apiGateway(name, params = {}, options = {}) {
    this.definition.States[name] = {
      Type: 'Task',
      Resource: 'arn:aws:states:::apigateway:invoke',
      Parameters: {
        ApiEndpoint: params.endpoint,
        Method: params.method || 'GET',
        Path: params.path,
        QueryParameters: params.queryParameters,
        Headers: params.headers,
        RequestBody: params.body
      },
      ResultPath: options.resultPath || '$',
      ...this._getCommonTaskOptions(options)
    };

    this.currentState = name;
    return this;
  }
