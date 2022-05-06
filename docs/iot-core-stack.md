# iot-core-stack

## Hands-on

```bash
# crete certificates
mkdir -p credentials
CERTIFICATE_ARN=$(aws iot create-keys-and-certificate \
  --set-as-active \
  --certificate-pem-outfile ./credentials/certificate.pem.crt \
  --public-key-outfile ./credentials/public.pem.key \
  --private-key-outfile ./credentials/private.pem.key | jq -r .certificateArn)
curl --output ./credentials/AmazonRootCA1.pem https://www.amazontrust.com/repository/AmazonRootCA1.pem

# Overwrite certificateArn in cdk.json to $CERTIFICATE_ARN
# e.g. arn:aws:iot:ap-northeast-1:0000:cert/0000

export AWS_PROFILE=your-dev

# deploy a stack
yarn run cdk deploy HANDSON-CDK-IotCoreStack \
  --context environment=dev

# get endpoint
ENDPOINT=$(aws iot describe-endpoint --endpoint-type iot:Data-ATS | jq -r .endpointAddress)

# open a test client on AWS management console
# ref. https://ap-northeast-1.console.aws.amazon.com/iot/home?region=ap-northeast-1#/test

# MQTT publish
mosquitto_pub \
  --cafile ./credentials/AmazonRootCA1.pem \
  --cert ./credentials/certificate.pem.crt \
  --key ./credentials/private.pem.key \
  -h $ENDPOINT \
  -p 8883 \
  -q 1 \
  -d \
  -t handson/test \
  -m '{"timestamp": 12345, "value": 67890}'

# MQTT subscribe
mosquitto_sub \
  --cafile ./credentials/AmazonRootCA1.pem \
  --cert ./credentials/certificate.pem.crt \
  --key ./credentials/private.pem.key \
  -h $ENDPOINT \
  -p 8883 \
  -q 1 \
  -d \
  -t handson/test

# destroy certificates
# arn:aws:iot:REGION:ACCOUNT:cert/CERTIFICATE_ID
aws iot update-certificate --certificate-id $CERTIFICATE_ID --new-status INACTIVE
aws iot detach-policy --policy-name handsonCdk-iot-policy --target $CERTIFICATE_ARN
aws iot detach-thing-principal --thing-name handsonCdk-thing --principal $CERTIFICATE_ARN
aws iot delete-certificate --certificate-id $CERTIFICATE_ID

# destroy a stack
yarn run cdk destroy HANDSON-CDK-IotCoreStack \
  --context environment=dev
```

## Reference

- [Rust & Raspberry Pi で温度センサーの値を AWS IoT Core に Pub してみた](https://dev.classmethod.jp/articles/rust-rpi-publish-temp-to-aws-iot/)
