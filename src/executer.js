// Package: step-functions-manager
// File: src/deployer.js

const {
  SFNClient,
  CreateStateMachineCommand,
  UpdateStateMachineCommand,
  StartExecutionCommand,
  DescribeExecutionCommand,
  ListExecutionsCommand,
  DeleteStateMachineCommand,
  StopExecutionCommand,
} = require('@aws-sdk/client-sfn');

const { IAMClient, GetRoleCommand } = require('@aws-sdk/client-iam');

class StepFunctionsExecuter {
  constructor(config = {}) {
    this.sfnClient = new SFNClient(config);
    this.iamClient = new IAMClient(config);
  }

  /**
   * Deploy a state machine
   */
  async deploy(params) {
    try {
      const {
        name,
        definition,
        roleArn,
        type = 'STANDARD',
        tags = [],
        update = false,
      } = params;

      // Validate role ARN
      await this._validateRole(roleArn);

      const baseParams = {
        name,
        definition:
          typeof definition === 'string'
            ? definition
            : JSON.stringify(definition),
        roleArn,
        type,
        tags: tags.map((tag) => ({
          key: tag.key,
          value: tag.value,
        })),
      };

      if (update) {
        // Update existing state machine
        const command = new UpdateStateMachineCommand({
          stateMachineArn: await this._getStateMachineArn(name),
          ...baseParams,
        });
        const response = await this.sfnClient.send(command);
        return {
          status: 'updated',
          arn: response.stateMachineArn,
          updateDate: response.updateDate,
        };
      } else {
        // Create new state machine
        const command = new CreateStateMachineCommand(baseParams);
        const response = await this.sfnClient.send(command);
        return {
          status: 'created',
          arn: response.stateMachineArn,
          creationDate: response.creationDate,
        };
      }
    } catch (error) {
      throw new Error(`Deployment failed: ${error.message}`);
    }
  }

  /**
   * Start a state machine execution
   */
  async startExecution(params) {
    try {
      const {
        stateMachineArn,
        name = `exec-${Date.now()}`,
        input = {},
      } = params;

      const command = new StartExecutionCommand({
        stateMachineArn,
        name,
        input: typeof input === 'string' ? input : JSON.stringify(input),
      });

      const response = await this.sfnClient.send(command);
      return {
        executionArn: response.executionArn,
        startDate: response.startDate,
      };
    } catch (error) {
      throw new Error(`Execution start failed: ${error.message}`);
    }
  }

  /**
   * Get execution status and results
   */
  async getExecutionStatus(executionArn) {
    try {
      const command = new DescribeExecutionCommand({
        executionArn,
      });

      const response = await this.sfnClient.send(command);
      return {
        status: response.status,
        startDate: response.startDate,
        stopDate: response.stopDate,
        input: JSON.parse(response.input),
        output: response.output ? JSON.parse(response.output) : null,
        error: response.error,
        cause: response.cause,
      };
    } catch (error) {
      throw new Error(`Failed to get execution status: ${error.message}`);
    }
  }

  /**
   * List executions for a state machine
   */
  async listExecutions(params) {
    try {
      const {
        stateMachineArn,
        statusFilter,
        maxResults = 100,
        nextToken,
      } = params;

      const command = new ListExecutionsCommand({
        stateMachineArn,
        statusFilter,
        maxResults,
        nextToken,
      });

      const response = await this.sfnClient.send(command);
      return {
        executions: response.executions.map((execution) => ({
          executionArn: execution.executionArn,
          name: execution.name,
          status: execution.status,
          startDate: execution.startDate,
          stopDate: execution.stopDate,
        })),
        nextToken: response.nextToken,
      };
    } catch (error) {
      throw new Error(`Failed to list executions: ${error.message}`);
    }
  }

  /**
   * Stop a running execution
   */
  async stopExecution(params) {
    try {
      const { executionArn, error, cause } = params;

      const command = new StopExecutionCommand({
        executionArn,
        error,
        cause,
      });

      const response = await this.sfnClient.send(command);
      return {
        stopDate: response.stopDate,
      };
    } catch (error) {
      throw new Error(`Failed to stop execution: ${error.message}`);
    }
  }

  /**
   * Delete a state machine
   */
  async deleteStateMachine(stateMachineArn) {
    try {
      const command = new DeleteStateMachineCommand({
        stateMachineArn,
      });

      await this.sfnClient.send(command);
      return {
        status: 'deleted',
        arn: stateMachineArn,
      };
    } catch (error) {
      throw new Error(`Failed to delete state machine: ${error.message}`);
    }
  }

  /**
   * Wait for execution to complete
   */
  async waitForExecution(executionArn, checkInterval = 1000) {
    try {
      while (true) {
        const status = await this.getExecutionStatus(executionArn);

        if (
          ['SUCCEEDED', 'FAILED', 'TIMED_OUT', 'ABORTED'].includes(
            status.status
          )
        ) {
          return status;
        }

        await new Promise((resolve) => setTimeout(resolve, checkInterval));
      }
    } catch (error) {
      throw new Error(`Failed while waiting for execution: ${error.message}`);
    }
  }

  /**
   * Validate IAM role
   */
  async _validateRole(roleArn) {
    try {
      const roleName = roleArn.split('/').pop();
      const command = new GetRoleCommand({ RoleName: roleName });
      await this.iamClient.send(command);
    } catch (error) {
      throw new Error(`Invalid IAM role: ${error.message}`);
    }
  }

  /**
   * Get state machine ARN from name
   */
  async _getStateMachineArn(name) {
    // You might want to implement caching here
    return `arn:aws:states:${this.sfnClient.config.region}:${this.sfnClient.config.credentials.accountId}:stateMachine:${name}`;
  }
}

module.exports = StepFunctionsExecuter;
