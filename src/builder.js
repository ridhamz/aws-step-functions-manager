const { default: http } = require('./http');
const { default: apiGateway } = require('./services/api-gateway');
const { default: batch } = require('./services/batch');
const { default: dynamodb } = require('./services/daynamodb');
const { default: ecs } = require('./services/ecs');
const { default: eventBridge } = require('./services/event-bridge');
const { default: lambda } = require('./services/lambda');
const { default: sns } = require('./services/sns');
const { default: sqs } = require('./services/sqs');

class StepFunctionsBuilder {
  constructor(options = {}) {
    this.definition = {
      Comment: options.comment || 'Step Functions Workflow',
      StartAt: null,
      States: {},
    };
    this.currentState = null;
    this.stateMachine = null;
  }

  /**
   * Start the workflow with a task
   */
  startWith(stateName) {
    this.definition.StartAt = stateName;
    this.currentState = stateName;
    return this;
  }

  /**
   * Add a choice state
   */
  choice(name, choices) {
    this.definition.States[name] = {
      Type: 'Choice',
      Choices: choices.map((choice) => ({
        Variable: choice.variable,
        [choice.condition]: choice.value,
        Next: choice.next,
      })),
      Default: choices.find((c) => c.isDefault)?.next,
    };

    this.currentState = name;
    return this;
  }

  /**
   * Add a parallel state
   */
  parallel(name, branches, options = {}) {
    this.definition.States[name] = {
      Type: 'Parallel',
      Branches: branches.map((branch) => ({
        StartAt: branch.startAt,
        States: branch.states,
      })),
      ...this._getCommonTaskOptions(options),
    };

    this.currentState = name;
    return this;
  }

  /**
   * Add a map state
   */
  map(name, iterator, options = {}) {
    this.definition.States[name] = {
      Type: 'Map',
      ItemsPath: options.itemsPath || '$',
      MaxConcurrency: options.maxConcurrency || 0,
      Iterator: iterator,
      ...this._getCommonTaskOptions(options),
    };

    this.currentState = name;
    return this;
  }

  /**
   * Add a wait state
   */
  wait(name, options = {}) {
    this.definition.States[name] = {
      Type: 'Wait',
      ...(options.seconds && { Seconds: options.seconds }),
      ...(options.timestamp && { Timestamp: options.timestamp }),
      ...(options.secondsPath && { SecondsPath: options.secondsPath }),
      ...(options.timestampPath && { TimestampPath: options.timestampPath }),
      Next: options.next,
    };

    this.currentState = name;
    return this;
  }

  /**
   * Add a pass state
   */
  pass(name, options = {}) {
    this.definition.States[name] = {
      Type: 'Pass',
      ...(options.result && { Result: options.result }),
      ...(options.resultPath && { ResultPath: options.resultPath }),
      ...this._getCommonTaskOptions(options),
    };

    this.currentState = name;
    return this;
  }

  /**
   * Add error handling
   */
  addCatch(stateName, catchers) {
    if (!this.definition.States[stateName]) {
      throw new Error(`State ${stateName} not found`);
    }

    this.definition.States[stateName].Catch = catchers.map((catcher) => ({
      ErrorEquals: Array.isArray(catcher.errors)
        ? catcher.errors
        : [catcher.errors],
      Next: catcher.next,
      ...(catcher.resultPath && { ResultPath: catcher.resultPath }),
    }));

    return this;
  }

  /**
   * Add retry policy
   */
  addRetry(stateName, retriers) {
    if (!this.definition.States[stateName]) {
      throw new Error(`State ${stateName} not found`);
    }

    this.definition.States[stateName].Retry = retriers.map((retrier) => ({
      ErrorEquals: Array.isArray(retrier.errors)
        ? retrier.errors
        : [retrier.errors],
      IntervalSeconds: retrier.interval || 1,
      MaxAttempts: retrier.maxAttempts || 3,
      BackoffRate: retrier.backoffRate || 2.0,
    }));

    return this;
  }

  /**
   * End the current state
   */
  end() {
    if (this.currentState && this.definition.States[this.currentState]) {
      this.definition.States[this.currentState].End = true;
    }
    return this;
  }

  /**
   * Set the next state
   */
  next(stateName) {
    if (this.currentState && this.definition.States[this.currentState]) {
      this.definition.States[this.currentState].Next = stateName;
    }
    return this;
  }

  /**
   * Get common task options
   */
  _getCommonTaskOptions(options) {
    return {
      ...(options.next && { Next: options.next }),
      ...(options.end && { End: true }),
      ...(options.timeoutSeconds && { TimeoutSeconds: options.timeoutSeconds }),
      ...(options.heartbeatSeconds && {
        HeartbeatSeconds: options.heartbeatSeconds,
      }),
    };
  }

  /**
   * Build the state machine definition
   */
  build() {
    if (!this.definition.StartAt) {
      throw new Error('StartAt state must be defined');
    }
    return this.definition;
  }
}

// attach services
StepFunctionsBuilder.prototype.lambda = lambda;
StepFunctionsBuilder.prototype.ecs = ecs;
StepFunctionsBuilder.prototype.batch = batch;
StepFunctionsBuilder.prototype.dynamoDb = dynamodb;
StepFunctionsBuilder.prototype.eventBridge = eventBridge;
StepFunctionsBuilder.prototype.apiGateway = apiGateway;
StepFunctionsBuilder.prototype.sns = sns;
StepFunctionsBuilder.prototype.sqs = sqs;
StepFunctionsBuilder.prototype.http = http;

module.exports = StepFunctionsBuilder;
