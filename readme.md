# AWS Step Functions Manager

A powerful and developer-friendly Node.js library for building, deploying, and managing AWS Step Functions workflows. This library provides an intuitive builder pattern for creating state machines and includes utilities for deployment and execution management.

## Features

- 🏗️ **Intuitive Builder API**: Create Step Functions workflows using a fluent, chainable API
- 🔌 **Service Integrations**: Built-in support for various AWS services and HTTP APIs
- 🚀 **Deployment Management**: Deploy and update state machines directly to AWS
- 📊 **Execution Controls**: Start, stop, and monitor workflow executions
- 🛠️ **Multiple Service Support**:
  - AWS Lambda
  - DynamoDB
  - SQS
  - SNS
  - EventBridge
  - API Gateway
  - HTTP APIs
  - Batch
  - ECS
  - Step Functions (nested workflows)

## Installation

```bash
npm install aws-step-functions-manager
```

## Usage

### Building a Simple Workflow

```js
const { StepFunctionsBuilder } = require('aws-step-functions-manager');

const workflow = new StepFunctionsBuilder()
  .startWith('ProcessOrder')
  .lambda(
    'ProcessOrder',
    'arn:aws:lambda:region:account:function:process-order'
  )
  .next('ValidatePayment')
  .lambda(
    'ValidatePayment',
    'arn:aws:lambda:region:account:function:validate-payment'
  )
  .next('SendConfirmation')
  .lambda(
    'SendConfirmation',
    'arn:aws:lambda:region:account:function:send-confirmation'
  )
  .end()
  .build();
```

### Deploying a Workflow

```js
const { StepFunctionsExecuter } = require('aws-step-functions-manager');

const deployer = new StepFunctionsExecuter({
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'YOUR_ACCESS_KEY',
    secretAccessKey: 'YOUR_SECRET_KEY',
  },
});

async function deployWorkflow() {
  const result = await deployer.deploy({
    name: 'MyWorkflow',
    definition: workflow,
    roleArn: 'arn:aws:iam::account-id:role/service-role/MyStepFunctionsRole',
  });

  console.log('Workflow deployed:', result);
}
```
