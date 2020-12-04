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

```sh
batch-update-findings --finding-identifiers Id="<findingID>",ProductArn="<productARN>" --workflow Status="<workflowStatus>"
```

### 2. script の実行

- AWS Foundational Security Best Practices の ec2-7 に対応する script(CDK ではできなかった)

  `./scripts/fsbp-ec2-7.sh`

  - 参考: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-standards-fsbp-controls.html#ec2-7-remediation

### 3. 手動でしか対応できないこと

#### 3.1 Root アカウントの MFA 有効化

Root アカウントの MFA を有効化しないと「Critical!!」って怒られるので対応する。

やり方: https://docs.aws.amazon.com/securityhub/latest/userguide/securityhub-cis-controls.html#cis-1.14-remediation

できたら手動で resolve としてマークする。

```sh
batch-update-findings --finding-identifiers Id="<findingID>",ProductArn="<productARN>" --workflow Status="<workflowStatus>"
batch-update-findings --finding-identifiers Id="<findingID>",ProductArn="<productARN>" --workflow Status="<workflowStatus>"
```
