# 0005. Python 実行環境の選択

## Status

Accepted

## Context

ブラウザ上で Python コードを実行できる環境が必要。
サーバーレスで動作する必要がある。

## Decision

[Pyodide](https://pyodide.org/en/stable/) を選択する

## Consequences

- **メリット**
  - ブラウザ内で Python を実行可能
  - サーバーサイドの処理が不要
  - 成熟した技術で実装例が多い
  - NumPy、Pandas などの主要ライブラリが利用可能
- **デメリット**
  - 初期ロード時間が長い（数十MB）
  - メモリ使用量が多い
