# AKB48 Fan Deep Personality Test | AKB48 粉絲深度 MBTI | AKB48ファン深度性格診断

![Version](https://img.shields.io/badge/Version-2026.07.03-pink)
![License](https://img.shields.io/badge/License-Non--Commercial-blue)
![Platform](https://img.shields.io/badge/Platform-Web-orange)
![Cloud Save](https://img.shields.io/badge/Cloud%20Result-Optional-lightblue)

---

## Project Overview | 專案簡介 | プロジェクト概要

**[ZH]** 這是一個為 AKB48 粉絲製作的互動式 MBTI / 推し相性測驗。完成 60 題後，系統會計算你的追星人格、五維度分佈、Soulmate 成員與自選推し成員相性，並可輸出結果卡圖片。

**[EN]** AKB48 Fan Deep Personality Test is an interactive MBTI-style fan quiz. After 60 questions, it calculates your stan personality, five-dimension profile, soulmate member, and optional oshi compatibility, then exports a shareable result card.

**[JP]** AKB48 Fan Deep Personality Test は、ファン向けの MBTI 風相性診断です。60問の回答後、推し活人格、5軸分布、Soulmate メンバー、任意の推しメン相性を計算し、結果カードとして出力できます。

---

## Main Features | 功能說明 | 主な機能

### 1. 60-question Quiz
* **[ZH]** 分頁式 60 題測驗，支援進度條、返回修改與逐題解鎖。
* **[EN]** Card-style 60-question quiz with progress, back navigation, and sequential unlock.
* **[JP]** 全60問のカード式診断。進捗表示、戻る操作、順番解放に対応します。

### 2. MBTI-style Result
* **[ZH]** 生成 4 字母 MBTI、E/S/T/J/A 五維度百分比與深度解說。
* **[EN]** Produces a 4-letter MBTI-style result, E/S/T/J/A percentages, and detailed explanation.
* **[JP]** 4文字タイプ、E/S/T/J/A の割合、詳しい解説を表示します。

### 3. Member Compatibility
* **[ZH]** 以成員資料庫計算 Soulmate，並可選擇推し成員做相性比較。
* **[EN]** Calculates a soulmate member from the member database and compares with a selected oshi.
* **[JP]** メンバーデータから Soulmate を算出し、選択した推しメンとの相性も比較できます。

### 4. Result Card Export
* **[ZH]** 使用 html2canvas 輸出結果卡 PNG，適合保存或分享到社群。
* **[EN]** Exports a result card PNG using html2canvas for saving or social sharing.
* **[JP]** html2canvas により結果カード PNG を生成し、保存や共有に使えます。

### 5. Optional Tool48 Account / Cloud Results
* **[ZH]** 測驗可本機完成；登入後可選擇保存私人 Cloud Results。
* **[EN]** The quiz works locally; signed-in users may optionally save private Cloud Results.
* **[JP]** 診断はローカルで利用できます。ログイン後は任意で private Cloud Results を保存できます。

---

## Technical Highlights | 技術亮點 | 技術的特徴

* **localStorage Auto-save**: Answers survive refresh during the quiz.
* **Chart.js Radar Chart**: Visualizes personality dimensions.
* **html2canvas Export Mode**: Separates web-only and export-only elements for clean result cards.
* **Multilingual i18n**: `langs.json` contains UI text, questions, and result explanations.
* **Privacy-first Design**: We will not disclose personal data without explicit consent.

---

## Quick Start | 快速開始 | クイックスタート

Do not open `index.html` directly if the browser blocks JSON fetch. Use a local server:

```bash
python -m http.server 4181
```

Open:

```text
http://127.0.0.1:4181/
```

---

## File Structure | 檔案結構 | ファイル構成

* `index.html` - Quiz UI, account popover, result sections, export area.
* `style.css` - Cyber-pink glass UI, quiz cards, result layout, export styles.
* `script.js` - Quiz flow, scoring, compatibility, charts, export, optional cloud result.
* `members.json` - Member profile, nickname, photo, generation, compatibility coordinates.
* `langs.json` - Questions, UI copy, result explanations, and multilingual text.

---

## Maintenance | 維護 | メンテナンス

* Update questions and UI text in `langs.json`.
* Update member data and compatibility coordinates in `members.json`.
* Keep local quiz completion working without login.
* Treat Cloud Results as private unless the user explicitly opts into a future public feature.
* When changing export layout, verify the generated PNG rather than only the live page.

---

## Disclaimer | 免責聲明 | 免責事項

**[ZH]** 本測驗是非官方、非商業粉絲娛樂工具，並非心理學、醫療或專業性格診斷。所有 AKB48 相關名稱、圖片、商標及素材權利屬 AKB48、DH Co., Ltd. 及各自權利持有人。

**[EN]** This quiz is an unofficial, non-commercial fan entertainment tool. It is not a psychological, medical, or professional personality diagnosis. All AKB48-related names, images, trademarks, and materials belong to AKB48, DH Co., Ltd., and their respective rights holders.

**[JP]** 本診断は非公式・非商用のファン向けエンタメです。心理学、医療、専門的な性格診断ではありません。AKB48 関連の名称、画像、商標、素材の権利は AKB48、DH Co., Ltd. および各権利者に帰属します。

---

## Created by | 製作 | 制作

**ゴメン先生 (gomensensei)**
