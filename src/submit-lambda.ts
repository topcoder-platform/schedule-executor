/**
 * Represents a lambda handler responsible for receiving events from
 * API Gateway and initiating step function.
 */
import { URL } from 'url';
import AWS from 'aws-sdk';
import { processAPILambda, randomString } from './helper';
import { APIGatewayProxyEvent, InputData } from './types';
import { BadRequestError } from './errors';
import { getDynamoTableName, getStateMachineARN } from './config';

const dynamodb = new AWS.DynamoDB();
const sfn = new AWS.StepFunctions();

/**
 * Check if given url is valid HTTP or HTTPs url.
 * @param url the url to check
 */
function _isValidUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Check if request body is valid.
 * @param body the request body
 */
function _validateInput(body: string | null) {
  let input: InputData = null!;
  if (!body) {
    throw new BadRequestError('HTTP body must be defined');
  }
  try {
    input = JSON.parse(body);
  } catch (e) {
    throw new BadRequestError('Invalid JSON body');
  }
  if (!input.url) {
    throw new BadRequestError('url is required');
  }
  if (!_isValidUrl(input.url)) {
    throw new BadRequestError('url is invalid');
  }
  if (!input.method) {
    throw new BadRequestError('method is required');
  }
  const allowedMethods = ['get', 'put', 'post', 'delete', 'patch'];
  if (!allowedMethods.includes(input.method)) {
    throw new BadRequestError(
      `method '${
        input.method
      }' is not invalid. Allowed values: ${allowedMethods.join(', ')}.`
    );
  }
  if (input.payload != null && typeof input.payload !== 'string') {
    throw new BadRequestError('payload must be a string');
  }
  if (input.payload && input.method === 'get') {
    throw new BadRequestError('payload is not allowed for "get" method');
  }
  if (input.headers != null) {
    if (typeof input.headers !== 'object') {
      throw new BadRequestError('headers must be an object');
    }
    Object.entries(input.headers).forEach(([key, value]) => {
      if (typeof value !== 'string') {
        throw new BadRequestError(`header value ${key} must be a string`);
      }
    });
  }

  if (input.scheduleTime == null) {
    throw new BadRequestError('scheduleTime is required');
  } else {
    const date = new Date(input.scheduleTime);
    if (date.toString() === 'Invalid Date') {
      throw new BadRequestError('scheduleTime is invalid date');
    }
    // max schedule date can be max 1 year ahead
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (date.getTime() > maxDate.getTime()) {
      throw new BadRequestError(
        'scheduleTime delay is too long. Max schedule is 1 year.'
      );
    }
    input.scheduleTime = date.toISOString();
  }

  return input;
}

/**
 * Main lambda handler for submitting.
 */
export async function handler(event: APIGatewayProxyEvent) {
  return await processAPILambda(async () => {
    if (event.isBase64Encoded) {
      throw new BadRequestError('Binary data not supported.');
    }
    const input = _validateInput(event.body);
    const id = randomString(20);
    input.id = id;
    const serialized = JSON.stringify(input);

    await dynamodb
      .putItem({
        TableName: getDynamoTableName(),
        Item: {
          id: { S: id },
          input: { S: serialized },
        },
      })
      .promise();

    await sfn
      .startExecution({
        name: id,
        input: serialized,
        stateMachineArn: getStateMachineARN(),
      })
      .promise();

    return { id };
  });
}
