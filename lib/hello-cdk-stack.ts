import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import { Duration, Stack, aws_iam as iam, aws_s3 as s3 } from "aws-cdk-lib";
import { PythonFunction } from '@aws-cdk/aws-lambda-python-alpha';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class HelloCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // オブジェクトを書き込むLambda
    const iamRoleForLambdaWriter = new iam.Role(
      this,
      "iamRoleForLambdaWriter",
      {
        assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
      },
    );

    // コンテンツを配置するS3
    const bucket = new s3.Bucket(this, "TmpBucket");
    // Lambda(Writer)に対するバケットポリシー
    bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:PutObject"],
        principals: [iamRoleForLambdaWriter],
        resources: [bucket.bucketArn + "/*"],
      }),
    );

    // Define the Lambda function resource
    const myFunction = new lambda.DockerImageFunction(this, 'AssetFunction', {
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, '../src'), {
        cmd: ["index.handler"],
      }),
      architecture: lambda.Architecture.ARM_64,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(30),
      role: iamRoleForLambdaWriter,
      environment: {
        S3_BUCKET_NAME: bucket.bucketName,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
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
