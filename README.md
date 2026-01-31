# VTGCI component example for React(Next.js)
## 概要
VTGCI(Virtual Talents Group Common Infrastructure)を導入した、あるいはそれに互換性を持たせたAPIサーバーを用いてYouTubeの動画情報を取得し、カード形式で列挙するコンポーネントです。

このバージョンではAPIバージョン **3.0** に対応します。  
対応するVTGCIのバージョンは **25.12** になります。

## 使い方
1. 制作中の Next.js プロジェクトに `lib` 以下と、`components` 以下のファイルをコピーします
2. 使用するページなどで `VideoFeed` コンポーネントを使用します
3. 環境変数や `.env.local` ファイルで次の3項目を設定します
   - `NEXT_PUBLIC_VTGCI_API_ORIGIN_URL`: スキーマを含めたAPIサーバーのURL  
     例: `https://infra.virtlive.jp`
   - `NEXT_PUBLIC_VTGCI_YTAPI_BASE_PATH`: YouTube API Proxy v3のベースパス  
     例: `/api/youtube/v3`
   - `NEXT_PUBLIC_VTGCI_WS_BASE_PATH`: YouTube API Proxy WebSocket Serviceのベースパス  
     例: `/ws/youtube`
4. 不具合や要件に応じてコードやデザインをを修正・変更します

Tips: 環境変数等を使用せず、URLをハードコードすることも出来ます。

## 試したい場合
### VTGCI導入済みの場合
既に動画を取得している場合は、上記 3 の設定を本リポジトリのコードに行う事で、テスト機能が使用出来ます。  
テスト機能を用いる場合は、`pnpm install` で依存関係をインストールし、`pnpm dev` で開発サーバーを起動します。

### VTGCI未導入の場合
特に設定すること無くテスト機能を実行すると、VirtLive!共通基盤(VLCI)の同機能を用いて表示が行われます。  
VirtLive!共通基盤を用いたテスト機能はぶいぎーく！メンバーと、VirtLive!所属タレントのものが取得出来ます。

## ライセンス
Apache License, Version 2.0
