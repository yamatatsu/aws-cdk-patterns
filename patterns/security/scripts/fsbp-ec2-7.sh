#!/usr/bin/env bash

# https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#ec2-7-remediation
aws ec2 enable-ebs-encryption-by-default
