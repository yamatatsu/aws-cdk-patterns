# security

- AWS アカウントにおけるセキュリティ監視設定を一通り ON にする。
- セキュリティ監視によって指摘される一般的なも問題に対応する。

## How to use

### 0. 準備

AWS ChatBot は Slack と OAuth で連携する関係上コンソールから有効化するしかない。

- AWS コンソールにログイン
- AWS ChatBot の Slack 連携を有効にする(OAuth)
- 画面上に表示される`SLACK_WORKSPACE_ID`をコピーしておく
- `cp .env.sample .env`
- .env ファイルに`SLACK_WORKSPACE_ID`を設定
- .env ファイルに`SLACK_CHANNEL_ID`を設定(通知先の Slack Channnel の ID)

### 1. CDK の適用

#### 1.1 実行

```sh
yarn cdk deploy --all
```

#### 1.2 手動で解決済みにする

CDK 実行によって解決可能だが、自動では解決済みとして判定されてない Findings に関して手動で resolve としてマークする必要がある。

AWS console の security hub のとこから title が以下の Finding を resolve にする。

- 1.1 Avoid the use of the "root" account
- 3.1 Ensure a log metric filter and alarm exist for unauthorized API calls
- 3.2 Ensure a log metric filter and alarm exist for Management Console sign-in without MFA
- 3.3 Ensure a log metric filter and alarm exist for usage of "root" account
- 3.4 Ensure a log metric filter and alarm exist for IAM policy changes
- 3.5 Ensure a log metric filter and alarm exist for CloudTrail configuration changes
- 3.6 Ensure a log metric filter and alarm exist for AWS Management Console authentication failures
- 3.7 Ensure a log metric filter and alarm exist for disabling or scheduled deletion of customer created CMKs
- 3.8 Ensure a log metric filter and alarm exist for S3 bucket policy changes
- 3.9 Ensure a log metric filter and alarm exist for AWS Config configuration changes
- 3.10 Ensure a log metric filter and alarm exist for security group changes
- 3.11 Ensure a log metric filter and alarm exist for changes to Network Access Control Lists (NACL)
- 3.12 Ensure a log metric filter and alarm exist for changes to network gateways
- 3.13 Ensure a log metric filter and alarm exist for route table changes
- 3.14 Ensure a log metric filter and alarm exist for VPC changes

### 2. script の実行

- AWS Foundational Security Best Practices の ec2-7 に対応する script  
  `./scripts/fsbp-ec2-7.sh`
  - 参考: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#ec2-7-remediation
- CIS AWS Foundations Benchmark controls の 1.9 に対応する script  
  `./scripts/cis-1.9.sh`
  - 参考: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.9-remediation

### 3. 手動でしか対応できないこと

TBD

### 4. 対応しない Findings

以下で示す Finding は suppressed としてマークする

- ハードウェア MFA デバイス
  - Root アカウントが WebAuthn に対応したらルールもそれに揃えて変わるはず。
  - re:invent 2020 で AWS SSO が WebAuthn 対応したし、Root アカウントもそのうち対応される。はず。対応されたい。願い。
  - https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#iam-6-remediation
  - https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.14-remediation
- [NIST Special Publication 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html#memsecret) からの解離
  - 古いパスワードポリシーの慣習には従わない
  - https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#iam-7-remediation
  - https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.11-remediation
  - https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.5-remediation
  - https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.6-remediation
  - https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.7-remediation
  - https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.8-remediation
  - https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.10-remediation
