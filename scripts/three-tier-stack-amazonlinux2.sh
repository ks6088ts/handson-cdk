#!/bin/bash

set -eu

# Install Apache HTTP Server on Amazon Linux2
# ref. https://httpd.apache.org/docs/current/en/install.html

sudo yum -y install httpd
sudo systemctl enable httpd
sudo systemctl start httpd

# EC2 User Data Example in AWS CDK - Complete Guide
# ref. https://bobbyhadz.com/blog/aws-cdk-ec2-userdata-example
echo "<h1>Hello World from $(hostname -f)</h1>" > /var/www/html/index.html

# Install MySQL client
# sudo yum -y install https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm
# sudo yum-config-manager --disable mysql80-community
# sudo yum-config-manager --enable mysql57-community
# sudo yum -y install mysql-community-client
