 /**
   * HTTP API integration
   */
 export default http(name, params = {}, options = {}) {
    this.definition.States[name] = {
      Type: 'Task',
      Resource: 'arn:aws:states:::http:invoke',
      Parameters: {
        Method: params.method || 'GET',
        URL: params.url,
        Headers: params.headers || {},
        Authentication: params.auth,
        RequestBody: params.body,
        QueryParameters: params.queryParameters,
        ConnectionTimeout: params.timeout || 30,
        ...params
      },
      ResultSelector: {
        'statusCode.$': '$.StatusCode',
        'headers.$': '$.Headers',
        'body.$': '$.Body'
      },
      ResultPath: options.resultPath || '$',
      ...this._getCommonTaskOptions(options)
    };

    this.currentState = name;
    return this;
  }