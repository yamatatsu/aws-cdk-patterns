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

```sh
yarn cdk deploy --all
```

### 2. script の実行

- AWS Foundational Security Best Practices の ec2-7 に対応する script  
  `./scripts/fsbp-ec2-7.sh`
  - 参考: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#ec2-7-remediation
- CIS AWS Foundations Benchmark controls の 1.9 に対応する script  
  `./scripts/cis-1.9.sh`
  - 参考: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.9-remediation

SecurityHub のスコアはすぐには上がってこない。Findings は遅れて Pass してくれるので、寝て待つこと。

### 3. 手動でしか対応できないこと

TBD (Root ユーザーの MFA とかは Web コンソールからの操作になる)

### 4. 対応しない Findings

以下で示す Finding は 未対応。

- ハードウェア MFA デバイス
  - Root アカウントが WebAuthn に対応したらルールもそれに揃えて変わるはず。
  - re:invent 2020 で AWS SSO が WebAuthn 対応したし、Root アカウントもそのうち対応される。はず。対応されたい。願い。
  - https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#iam-6-remediation
  - https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.14-remediation

以下で示す Finding は suppressed としてマークする。

- [NIST Special Publication 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html#memsecret) からの解離
  - 古いパスワードポリシーの慣習には従わない
  - https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#iam-7-remediation
  - https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.11-remediation
  - https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.5-remediation
  - https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.6-remediation
  - https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.7-remediation
  - https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.8-remediation
  - https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.10-remediation
