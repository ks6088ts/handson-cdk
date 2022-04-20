# WIP
import os
import json
import boto3
import uuid

dynamodb_resource = boto3.resource("dynamodb")
TABLE_NAME = os.environ["TABLE_NAME"]
table = dynamodb_resource.Table(TABLE_NAME)

def create(event, context):
  response = table.put_item(Item={"item_id": str(uuid.uuid4()), "hello": "world"})
  print(response)
  return {
    "statusCode": 201,
    "body": json.dumps("create called")
  }

def read(event, context):
  response = table.scan()
  print(response)
  return {
    "statusCode": 200,
    "body": json.dumps(response)
  }

def update(event, context):
  print("fixme")
  return {
    "statusCode": 201,
    "body": json.dumps("update called")
  }

def delete(event, context):
  response = table.delete_item(Key={"item_id": "dummy"})
  print(response)
  return {
    "statusCode": 204,
    "body": json.dumps("delete called")
  }
