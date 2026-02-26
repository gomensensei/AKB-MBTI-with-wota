# 2026 AKB48 Fan Deep Personality Test  
（AKB48 粉絲深度性格鑑定 / AKB48ファン深度性格診断）

---

## 繁體中文（zh-HK）

### 簡介
呢個係一個 **完全前端（無需後端）**、可以直接部署到 **GitHub Pages** 嘅互動式 Web 測驗。  
完成 60 題後，你會得到：

- 你嘅 **MBTI（4 字母）** ＋ **五維度百分比分佈（E/S/T/J/A）**
- 與你相性最高嘅 **🥇 Soulmate 成員**（相性 %、照片、暱稱）
- **雷達圖**（Chart.js）
- 可自選 **推し成員** 做對比（相性%、成員資訊、解說）
- 一鍵生成 **結果卡 PNG**（html2canvas）
- 一鍵分享到 **X（Twitter）**
- 全站支援 **多語言切換**（以 `langs.json` 為核心）

> 站內已包含社群預覽用嘅 OG/Twitter meta（適用 GitHub Pages）。

### Demo（GitHub Pages）
部署後網址（示例）：  
`https://<你的帳號>.github.io/<repo>/`

### 主要特色（重點功能）
- **60 題分頁卡片式測驗**：每頁顯示固定題數、支援上一頁修改、進度條顯示
- **作答自動儲存**：refresh 後唔會冇晒（localStorage）
- **逐題解鎖效果**：未答題項透明度降低、答完先解鎖下一題
- **相性演算法**：由五維度百分比向量計算相性%，排序找出 Soulmate
- **Cyber-Pink & Digital White** 視覺主題：玻璃擬態 UI + 霓虹粉互動回饋
- **點擊回饋**：粉紅水滴波紋 + 少量櫻花花瓣彈出
- **結果匯出 PNG**：固定尺寸、可作分享圖
- **匯出模式樣式切換**：匯出時隱藏 web-only 元素、顯示 export-only 元素（確保結果卡乾淨）

### 專案結構
```
.
├─ index.html      # 網頁骨架、外部套件引入（Chart.js / html2canvas / confetti）
├─ style.css       # Cyber-Pink 玻璃擬態 UI、游標與動畫、匯出模式樣式
├─ script.js       # 測驗流程、localStorage、自動解鎖、計分/配對、雷達圖、匯出與分享
├─ members.json    # 成員資料庫（照片、暱稱、期別、MBTI 座標）
└─ langs.json      # 題庫 + UI 文案 + 各 MBTI 深度解析（多語系）
```

### 本機運行（必讀）
⚠️ **唔好直接 double-click 開 `index.html`**（瀏覽器會阻擋 JSON fetch）。  
請用其中一種方法開 local server：

**A) VS Code Live Server（推薦）**  
1. 安裝 Live Server extension  
2. 右鍵 `index.html` → “Open with Live Server”

**B) Python**
```bash
python -m http.server 8000
```
然後打開：`http://localhost:8000/`

### 自訂/擴充（常用入口）
- 改 UI 文案 / 題目 / 多語：`langs.json`
- 改成員資料：`members.json`（照片、暱稱、期別、MBTI 座標）
- 改主題色/視覺：`style.css`（CSS 變數）
- 改相性邏輯：`script.js`（配對計分與排序）

---

## 日本語（ja）

### 概要
このプロジェクトは **バックエンド不要の完全フロントエンド** Web診断です。  
**GitHub Pages** にそのまま配置して動作します。

60問回答後に得られるもの：
- あなたの **MBTI（4文字）** と **5軸パーセンテージ（E/S/T/J/A）**
- **🥇 Soulmate（最高相性メンバー）**：相性%、写真、ニックネーム
- **レーダーチャート**（Chart.js）
- **推しメン選択**で比較（相性%、メンバー情報、解説）
- **結果カード PNG を1クリック保存**（html2canvas）
- **X（Twitter）へ共有**
- `langs.json` を中心に **多言語切替**

### デモ（GitHub Pages）
デプロイ後：  
`https://<your-account>.github.io/<repo>/`

### 主な機能
- **カードUIのページング（全60問）**＋進捗バー＋戻る操作
- **自動保存（localStorage）**：更新しても回答が消えない
- **順番解放**：未回答の設問は薄く表示、回答後に次が解放
- **相性計算**：5軸パーセンテージのベクトルから相性%を算出、Soulmateを決定
- **Cyber-Pink & Digital White** ガラスUI＋ネオン演出
- **クリック演出**：リップル + 桜花びら
- **PNG書き出し**：共有用の結果カードを生成
- **書き出し専用CSSモード**：export-only / web-only を切替

### ローカル実行（重要）
⚠️ 直接 `index.html` を開かないでください（JSON fetch が失敗します）。  
ローカルサーバーで起動してください。

```bash
python -m http.server 8000
```
→ `http://localhost:8000/`

### ファイル構成
```
index.html / style.css / script.js / members.json / langs.json
```

---

## English (en)

### Overview
A **pure front-end (no backend)** interactive web quiz for AKB48 fans, ready for **GitHub Pages**.

After completing **60 questions**, you’ll get:
- Your **MBTI (4-letter)** + **5-dimension percentages (E/S/T/J/A)**
- **🥇 Soulmate member** (compatibility %, photo, nickname)
- A **Radar chart** (Chart.js)
- Optional **Kami-Oshi selection** for comparison (compatibility %, member info, explanation)
- One-click **Result Card PNG export** (html2canvas)
- One-click sharing to **X (Twitter)**
- Multi-language switching powered by `langs.json`

### Demo (GitHub Pages)
After deploying:  
`https://<your-account>.github.io/<repo>/`

### Key Features
- **Card-style pagination** (60 questions) + progress bar + back navigation
- **Auto-save answers** to `localStorage` (safe against refresh)
- **Sequential unlock UX** (inactive questions are dimmed until answered)
- **Compatibility scoring** based on 5-dimension percentage vectors + ranking for Soulmate
- **Cyber-Pink & Digital White** glassmorphism UI + neon interactions
- **Click feedback**: ripple + sakura petals
- **PNG Export**: shareable result card image
- **Export-only CSS mode** for clean screenshots (toggle web-only/export-only)

### Run Locally (Important)
⚠️ Do **NOT** open `index.html` directly (JSON fetch will be blocked).

```bash
python -m http.server 8000
```
Open: `http://localhost:8000/`

### Project Structure
```
.
├─ index.html
├─ style.css
├─ script.js
├─ members.json
└─ langs.json
```

### Customization
- Questions/UI text & multi-language: `langs.json`
- Member database: `members.json`
- Theme/UI: `style.css` (CSS variables)
- Matching logic: `script.js`

---

## License / Notice
This is a fan-made project for entertainment and UI/UX experimentation.  
AKB48-related names/images belong to their respective owners.
