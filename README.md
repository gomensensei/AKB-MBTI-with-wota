# AKB48 粉絲深度性格鑑定（MBTI × 相性配對）
繁體中文｜日本語｜English

一個專為 AKB48 粉絲而設的**純前端**性格測驗 Web App。  
完成 60 題後會得到你的 MBTI、五維度分佈（雷達圖）、🥇 Soulmate 成員，並可下拉自選推し作相性對比與解說。

> 免登入、免後端；答案只會存在你自己瀏覽器（localStorage）。

---

## ✨ 核心功能
- **60 題 × 7 分量表**：卡片式分頁作答（每頁 5–10 題可調）
- **五維度分佈雷達圖**：E/I、S/N、T/F、J/P、A/T
- **🥇 Soulmate 相性配對**：以成員座標 vs 粉絲座標計算相性%
- **自選推し對比**：選擇後顯示照片／暱稱／期數／相性%＋「點解夾／唔夾」解說
- **結果卡 PNG**：Canvas 生成，可一鍵下載分享
- **Cyber-Pink & Digital White**：玻璃感 UI、neon 粉互動回饋、櫻花粒子效果

---

## 📦 專案結構
> 依 repo 設計為 GitHub Pages 直接部署（無需 build）

```
AKB48-Personality-Test/
├─ index.html          # 頁面骨架
├─ style.css           # 主題視覺（Cyber-Pink）
├─ script.js           # 計分／相性／雷達圖／結果卡
├─ questions.json      # 題庫（60 題 + 維度 + 反向題）
├─ members.json        # 成員資料（暱稱、期數、照片、座標）
└─ analysis.json       # 成員深度解析文案（長文）
```

---

## 🚀 本機執行（必做）
⚠️ **請不要直接用瀏覽器打開 `index.html`**（會有 CORS / fetch 問題）  
請用其中一個方法開本機 server：

### 方法 A：VS Code（建議）
- 安裝 **Live Server**
- 右鍵 `index.html` → “Open with Live Server”

### 方法 B：Python
```bash
python -m http.server 8000
```
然後打開：
- http://localhost:8000

---

## 🌐 GitHub Pages 部署
1. 把所有檔案放 repo 根目錄
2. GitHub → **Settings** → **Pages**
3. Source 選 `Deploy from a branch`
4. Branch 選 `main / root`
5. 儲存後等 1–2 分鐘，網址會出現於 Pages 區域

---

## 🧠 計分與相性（概要）
- 題目以五維度分類（每維度 12 題）
- 反向題以 `8 - 分數` 計
- 百分比輸出為 0–100（用作雷達圖及 MBTI 字母判定）
- 相性% 以粉絲座標與成員座標差距計算，並可加入 Bonus 規則（如互補／同型）

> 註：此測驗屬粉絲向娛樂內容，並非心理診斷。

---

## 🧩 資料維護建議
- `members.json` 只放**可計算欄位**（座標、期數、圖片、暱稱）
- `analysis.json` 只放**長文敘事內容**（深度解析）
- 兩邊用同一個 `id` 作 key，避免資料漂移

---

## ⚖️ 聲明
- 本測驗為**粉絲向娛樂**用途，非心理／醫療診斷
- 成員解析為敘事化詮釋，僅供推し活互動想像與參考
- 不會上傳作答內容；答案只會儲存在你裝置（localStorage）

---

# 日本語（Japanese）
AKB48ファン向けの**完全フロントエンド**性格診断Webアプリです。  
60問回答すると、MBTIタイプ・5軸レーダーチャート・🥇相性最高メンバー（Soulmate）を表示し、推しを選んで比較（相性%＋解説）することもできます。

## 主な機能
- 60問（7段階）カードUI
- 5軸レーダーチャート（E/I, S/N, T/F, J/P, A/T）
- Soulmate相性%（座標ベース）
- 推し選択で比較（写真／ニックネーム／期数／相性%）
- Canvasで結果カードPNG保存
- Cyber-Pink & Digital White デザイン＋桜演出

## ローカル実行
`index.html` を直接開かず、ローカルサーバーを使用してください。
```bash
python -m http.server 8000
```

---

# English
A **pure front-end** personality quiz for AKB48 fans.  
Answer 60 questions to get your MBTI type, 5-axis radar chart, 🥇 Soulmate member match, and an optional “choose your oshi” comparison (compatibility% + explanation). No backend required.

## Features
- 60 questions (7-point scale), card-based paging
- 5-axis radar chart
- Soulmate compatibility scoring (coordinate-based)
- Oshi selection & comparison
- Canvas result card → download PNG
- Cyber-Pink & Digital White glass UI + sakura effects

## Run locally
```bash
python -m http.server 8000
```
