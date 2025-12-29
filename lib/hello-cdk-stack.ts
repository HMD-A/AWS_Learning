import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { aws_lambda, Stack, StackProps } from 'aws-cdk-lib';
import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class HelloCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

      // Define the Lambda function resource
    const myFunction = new PythonFunction(this, "HelloWorldFunction",{        
      runtime: aws_lambda.Runtime.PYTHON_3_11,
      entry: 'src/lambda/hello',
      handler: 'handler',
      bundling: {
        assetExcludes: ['.env', '.venv', 'venv', '__pycache__', '*.pyc'],
      },
    });

    // Define the Lambda function URL resource
    const myFunctionUrl = myFunction.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    // Define a CloudFormation output for your URL
    new cdk.CfnOutput(this, "myFunctionUrlOutput", {
      value: myFunctionUrl.url,
    })
  }
}
