# serverless-endpoint-configuration

A [Serverless plugin](https://github.com/serverless/serverless) to set API Gateway endpoint configuration for your Serverless services.

AWS recently announced [regional API endpoints](https://aws.amazon.com/about-aws/whats-new/2017/11/amazon-api-gateway-supports-regional-api-endpoints/) for API Gateway. However, this configuration is not yet supported in CloudFormation. This plugin lets you programmatically set your endpoints with a single command 🎉.

# Usage

1. Install the plugin in your Serverless service:

  ```bash
  $ npm install --save-dev serverless-endpoint-configuration
  ```

2. Add configuration to your `serverless.yml`:

  ```yml
  plugins:
      - serverless-endpoint-configuration
  
  custom:
      endpoint:
        type: 'REGIONAL'
        updateOnDeploy: true # Default is true
  ```

3. Run `sls deploy` to deploy your application with your configured endpoint!

# Configuration

By default, it will update the endpoint configuration after a deploy. If you prefer more granular control, you can set `updateOnDeploy: false` in your `serverless.yml`:

```yml
custom:
  endpoint:
    type: 'REGIONAL'
    updateOnDeploy: false
```

Then you can run `sls endpoints set` to manually update your endpoint configuration.

# Limitations

- Updating configuration can take a few minutes. If you try to change back and forth too quickly, it will throw an error.
- I'd like to add a `get` command to check current config, but the [`getRestApi`](http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/APIGateway.html#getRestApi-property) method from the SDK is not returning endpointConfiguration as noted in the docs.
- This plugin will probably become irrelevant when AWS adds endpoint configuration support to CloudFormation. Enjoy it while it lasts!
