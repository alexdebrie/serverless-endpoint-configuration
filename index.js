'use strict';

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.provider = this.serverless.getProvider('aws');

    this.commands = {
      endpoints: {
        commands: {
          set: {
            usage: 'Sets your endpoint configuration to the desired type',
            lifecycleEvents: [
              'set',
            ]
          },
        },
      },
    };

    this.hooks = {
      'endpoints:set:set': this.setEndpointType.bind(this),
    };
  }
  
  validate() {
    if (!this.serverless.service.custom || !this.serverless.service.custom.endpoint || !this.serverless.service.custom.endpoint.type) {
      throw new Error("Must include 'type' parameter in 'endpoint' section of 'custom' block.")
    }
    this.endpointType = this.serverless.service.custom.endpoint.type.toUpperCase();
    if (['REGIONAL', 'EDGE'].indexOf(this.endpointType) == -1 ) {
      throw new Error(`Endpoint type is ${this.endpointType}. Must be REGIONAL or EDGE`);
    }
  }

  setEndpointType() {
    this.validate();
    this.getRestApi()
      .then((restApi) => {
        const restApiId = restApi.PhysicalResourceId;
        return this.setEndpointTypeForRestApi(restApiId);
      }).then(() => {
        this.serverless.cli.log(`Endpoint configuration set to ${this.endpointType}`);
      }).catch((err) => {
        throw new Error(err);  
      });
  }

  getRestApi() {
    const stackName = this.provider.naming.getStackName(this.options.stage);
    const stackResourcesPromise = this.provider.request('CloudFormation',
      'listStackResources',
      { StackName: stackName },
      this.options.stage,
      this.options.region);

    return stackResourcesPromise
      .then((data) => {
        const restApis = data.StackResourceSummaries
          .filter((resource) => {
            return resource.ResourceType == 'AWS::ApiGateway::RestApi';
          })

        if (restApis) {
          return restApis[0];
        }
    })
    throw new Error('Could not find RestApi in service');
  }
  
  setEndpointTypeForRestApi(restApiId) {
    const params = {
      restApiId,
      patchOperations: [
        {
          op: 'replace',
          path: "/endpointConfiguration/types/EDGE",
          value: this.endpointType
        }
      ]
    };
    return this.provider.request('APIGateway',
      'updateRestApi',
      params
    )
  }
}

module.exports = ServerlessPlugin;
