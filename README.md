# 🌸 2026 AKB48 粉絲深度性格鑑定 (Oshi Matcher)

這是一個專為 AKB48 粉絲打造的 **純前端無後端 (No-Backend) 深度性格測試 Web App**。
結合 MBTI 心理學理論與真實飯圈情境，透過 60 條精心設計的問題，精準測出粉絲的「追星人格」，並利用「高斯歐幾里得演算法」計算出與 48 位現役成員的靈魂契合度。

🌐 **支援 7 國語言即時切換**：繁體中文(香港)、简体中文、日本語、한국어、English、ภาษาไทย、Bahasa Indonesia。

---

## ✨ 核心特色 (Key Features)

* **🧠 神級配對演算法**：放棄傳統的線性加減分，採用「歐幾里得距離平方 + 高斯鐘形曲線 (Gaussian Bell Curve)」，嚴懲偏科差異，並配合「無盡逼近加分法」，讓 99% 的契合度成為真正的傳說，杜絕分數通脹。
* **🌍 終極多語言架構 (i18n)**：採用字典分離技術 (`langs.json`)，一鍵瞬間切換全站 7 國語言（包含 UI、題目、16 種 MBTI 稱號、48 位成員深度解析），無需重新載入頁面。
* **🎨 Cyber-Pink 毛玻璃 UI**：
    * **Glassmorphism**：全站採用現代毛玻璃透視排版。
    * **Fluid Gradient**：背景加入 15 秒慢速流體漸變動畫，極具呼吸感。
    * **互動特效**：自定義 Neon 鼠標、點擊水滴波浪，以及背景持續飄落的「名残り桜」唯美花瓣特效 (`canvas-confetti`)。
* **📊 動態雷達圖對比**：使用 `Chart.js` 動態繪製粉絲的能量分佈。在選擇「神推 (Kamioshi)」後，圖表會自動疊加粉絲與成員的雙線雷達圖，直觀展示契合度。
* **📸 一鍵匯出 IG Story**：整合 `html2canvas`，粉絲只需點擊按鈕，即可將帶有多色應援色圓環的專屬結果卡片，完美無縫截圖並下載成 PNG 分享。
* **🛡️ 極致防呆與進度儲存**：
    * 使用 `localStorage` 自動儲存每題進度，斷網或重整也不怕白做。
    * 自製磁吸滑桿 (Range Slider) 與動態 Opacity 解鎖引導。
    * 未答完當頁 10 題無法進入下一頁，完成後按鈕會有脈衝發光 (Pulse Glow) 提示。

---

## 📂 專案架構 (Project Structure)

專案採用嚴格的 **Separation of Concerns (關注點分離)** 架構，極易維護與擴充：

```text
📦 AKB48-Personality-Test
 ┣ 📜 index.html      # 網頁骨架、UI 容器與外部套件引入 (Chart.js, html2canvas)
 ┣ 📜 style.css       # 視覺設計、RWD 手機優先排版、微動畫與櫻花 CSS
 ┣ 📜 script.js       # 核心大腦：處理 Fetch、計分邏輯、DOM 操作與雷達圖繪製
 ┣ 📜 members.json    # 輕量資料庫：存放 48 位成員基本屬性 (ID, 應援色, 圖片, MBTI分數)

 ┗ 📜 langs.json      # 巨型多語言字典：存放所有需要翻譯的文字、60 題題庫及深度解析

📝 授權與聲明 (Disclaimer)
本專案為粉絲自製企劃 (Fan-made Project)，與 AKB48 官方營運團隊無關。

專案內使用的成員圖片及相關資訊僅供交流與娛樂用途。

開源代碼歡迎社群 Fork 並改造成其他偶像團體的版本，但請保留原作者 Credit。

Developed with ゴメン先生 for AKB48 20th/21st Anniversary.
