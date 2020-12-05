#!/usr/bin/env bash

# https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.9-remediation
aws iam update-account-password-policy --minimum-password-length=14
