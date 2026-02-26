/* =========================================
   2026 AKB48 粉絲深度性格鑑定 (無後端・多語言終極版)
   ========================================= */

// 1. 全局變數
let membersDB = [];
let i18nData = {};
let currentLang = "zh-HK";
let userAnswers = {};
let currentPage = 0;
const totalPages = 6;
const questionsPerPage = 10;
let userPerc = {};
let userMbtiStr = "";
let myRadarChart = null; 
let matchResultsGlobal = []; // 儲存計算後的結果以便切換語言時重繪

// 2. 初始化與載入資料庫
document.addEventListener('DOMContentLoaded', async () => {
    // 同步 Fetch 兩個 JSON 檔案
    try {
        const [memRes, langRes] = await Promise.all([
            fetch('members.json'),
            fetch('langs.json')
        ]);
        membersDB = await memRes.json();
        i18nData = await langRes.json();
        
        // 載入 localStorage 進度
        const saved = localStorage.getItem('akb_answers');
        if (saved) {
            userAnswers = JSON.parse(saved);
            const ansCount = Object.keys(userAnswers).length;
            if(ansCount === 0) currentPage = 0;
            else if (ansCount === 60) currentPage = 5; 
            else currentPage = Math.floor(ansCount / 10);
        }

        // 綁定語言切換器
        document.getElementById('lang-switcher').addEventListener('change', (e) => {
            currentLang = e.target.value;
            applyLanguage(currentLang);
        });

        // 首次套用語言 (預設 zh-HK)
        applyLanguage(currentLang);

    } catch (e) {
        console.error("載入 JSON 失敗！請確保你使用 Live Server (Localhost) 或已上傳至 GitHub Pages 運行。", e);
        alert("資料庫載入失敗，請在 Server 環境下開啟。");
    }

    // 綁定按鈕事件
    document.getElementById('start-btn').addEventListener('click', () => {
        document.getElementById('page-landing').classList.add('hidden');
        document.getElementById('page-quiz').classList.remove('hidden');
        renderQuiz();
        setTimeout(updateUI, 50); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            updateUI();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        if (!document.getElementById('next-btn').disabled) {
            if (currentPage < totalPages - 1) {
                currentPage++;
                updateUI();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                calculateResults();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });

    // 綁定返回 Best 3 按鈕
    document.getElementById('back-to-best3-btn')?.addEventListener('click', () => {
        document.getElementById('oshi-select').value = "";
        document.getElementById('oshi-select').dispatchEvent(new Event('change'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 一鍵下載
    document.getElementById('download-btn')?.addEventListener('click', () => {
        const card = document.getElementById('export-card');
        const originalBg = card.style.background;
        const originalShadow = card.style.boxShadow;
        
        card.style.background = 'linear-gradient(135deg, #fdfcfb, #f0e6ea)';
        card.style.backdropFilter = 'none';
        card.style.boxShadow = 'none'; 

        setTimeout(() => {
            html2canvas(card, { scale: 2, useCORS: true, backgroundColor: "#ffffff" }).then(canvas => {
                let link = document.createElement('a');
                link.download = 'AKB48_Personality.png';
                link.href = canvas.toDataURL();
                link.click();
                
                card.style.background = originalBg;
                card.style.backdropFilter = 'blur(12px)';
                card.style.boxShadow = originalShadow;
            });
        }, 100);
    });
});

// 3. 多語言切換引擎
function applyLanguage(lang) {
    // 更新帶有 data-i18n 的靜態 HTML 元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18nData.ui[key] && i18nData.ui[key][lang]) {
            el.innerHTML = i18nData.ui[key][lang];
        }
    });

    // 如果在測驗頁面，只更新文字，不重新 Render (避免洗走 Slider 動畫狀態)
    if (!document.getElementById('page-quiz').classList.contains('hidden')) {
        for(let i=1; i<=60; i++) {
            const qTextEl = document.getElementById(`qtext-${i}`);
            if(qTextEl && i18nData.questions[i]) {
                qTextEl.innerText = `${i}. ${i18nData.questions[i].text[lang]}`;
            }
        }
        document.querySelectorAll('.slider-labels').forEach(el => {
            el.innerHTML = `<span>${i18nData.ui.slider_disagree[lang]}</span><span>${i18nData.ui.slider_neutral[lang]}</span><span>${i18nData.ui.slider_agree[lang]}</span>`;
        });
        updateUI(); // 更新按鈕文字
    }

    // 如果在結果頁面，全面重新 Render
    if (!document.getElementById('page-result').classList.contains('hidden') && matchResultsGlobal.length > 0) {
        renderResultPage(matchResultsGlobal);
    }
}

// 4. 渲染測驗頁面
function renderQuiz() {
    const track = document.getElementById('quiz-track');
    track.innerHTML = '';

    for (let p = 0; p < totalPages; p++) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'quiz-page';
        
        for (let i = p * 10 + 1; i <= (p + 1) * 10; i++) {
            if (i > Object.keys(i18nData.questions).length) break;
            const qData = i18nData.questions[i];
            
            const qDiv = document.createElement('div');
            qDiv.className = 'question-item';
            qDiv.id = `qbox-${i}`;
            
            const isAnswered = userAnswers[i] !== undefined;
            if (isAnswered) qDiv.classList.add('active');

            const val = isAnswered ? userAnswers[i] : 4; 
            const touchedClass = isAnswered ? 'touched' : '';

            qDiv.innerHTML = `
                <div class="question-text" id="qtext-${i}">${i}. ${qData.text[currentLang]}</div>
                <div class="slider-container">
                    <div class="slider-ticks">
                        <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                    </div>
                    <input type="range" class="custom-range ${touchedClass}" id="q${i}" min="1" max="7" step="1" value="${val}">
                </div>
                <div class="slider-labels">
                    <span>${i18nData.ui.slider_disagree[currentLang]}</span>
                    <span>${i18nData.ui.slider_neutral[currentLang]}</span>
                    <span>${i18nData.ui.slider_agree[currentLang]}</span>
                </div>
            `;
            pageDiv.appendChild(qDiv);
        }
        track.appendChild(pageDiv);
    }

    track.addEventListener('input', handleSlider);
    track.addEventListener('change', handleSlider);

    // 解鎖第一題或者上一條未答的題
    let firstUnanswered = 1;
    for(let i=1; i<=60; i++) {
        if(userAnswers[i] === undefined) { firstUnanswered = i; break; }
    }
    const targetBox = document.getElementById(`qbox-${firstUnanswered}`);
    if (targetBox) targetBox.classList.add('active');
}

function handleSlider(e) {
    if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
        e.target.classList.add('touched');
        const qId = parseInt(e.target.id.replace('q', ''));
        userAnswers[qId] = parseInt(e.target.value);
        localStorage.setItem('akb_answers', JSON.stringify(userAnswers));
        
        checkPageCompletion();
        updateProgress();

        const nextBox = document.getElementById(`qbox-${qId + 1}`);
        if (nextBox && !nextBox.classList.contains('active')) {
            nextBox.classList.add('active');
            if (e.type === 'change') { 
                nextBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
}

function checkPageCompletion() {
    const startIndex = currentPage * 10 + 1;
    let allAnswered = true;
    for (let i = startIndex; i < startIndex + 10; i++) {
        if (i <= 60 && !userAnswers[i]) {
            allAnswered = false; break;
        }
    }
    
    const nextBtn = document.getElementById('next-btn');
    if (allAnswered) {
        nextBtn.classList.remove('disabled');
        nextBtn.disabled = false;
        nextBtn.classList.add('pulse-glow');
    } else {
        nextBtn.classList.add('disabled');
        nextBtn.disabled = true;
        nextBtn.classList.remove('pulse-glow');
    }
}

function updateUI() {
    const track = document.getElementById('quiz-track');
    track.style.transform = `translateX(-${(currentPage * 100) / totalPages}%)`;

    document.getElementById('prev-btn').disabled = (currentPage === 0);
    document.getElementById('prev-btn').classList.toggle('disabled', currentPage === 0);
    document.getElementById('prev-btn').innerText = i18nData.ui.btn_prev[currentLang];

    const nextBtn = document.getElementById('next-btn');
    nextBtn.textContent = (currentPage === totalPages - 1) ? i18nData.ui.btn_result[currentLang] : i18nData.ui.btn_next[currentLang];
    
    checkPageCompletion();
    updateProgress();
    
    const firstQ = document.getElementById(`qbox-${currentPage * 10 + 1}`);
    if (firstQ && userAnswers[currentPage * 10 + 1] === undefined) firstQ.classList.add('active');
}

function updateProgress() {
    const count = Object.keys(userAnswers).length;
    document.getElementById('progress-text').textContent = `${count}/60`;
    document.getElementById('progress-bar').style.width = `${(count / 60) * 100}%`;
}

// 5. 神級計算引擎 (高斯分佈)
function calculateResults() {
    let scores = { E: 0, S: 0, T: 0, J: 0, A: 0 };
    for (let i = 1; i <= 60; i++) {
        const qData = i18nData.questions[i];
        let val = userAnswers[i] || 4; 
        if (qData.rev) val = 8 - val;
        scores[qData.dim] += val;
    }

    userPerc = {
        E: ((scores.E - 12) / 72) * 100, S: ((scores.S - 12) / 72) * 100,
        T: ((scores.T - 12) / 72) * 100, J: ((scores.J - 12) / 72) * 100, A: ((scores.A - 12) / 72) * 100
    };

    userMbtiStr = (userPerc.E > 50 ? 'E' : 'I') + (userPerc.S > 50 ? 'S' : 'N') + (userPerc.T > 50 ? 'T' : 'F') + (userPerc.J > 50 ? 'J' : 'P');

    let matchResults = membersDB.map(m => {
        let M = m.mbti_scores;
        let d_squared = Math.pow(userPerc.E - M.E, 2) + Math.pow(userPerc.S - M.S, 2) + Math.pow(userPerc.T - M.T, 2) + Math.pow(userPerc.J - M.J, 2);
        let baseComp = 100 * Math.exp(-d_squared / 5000);
        
        let bonusMultiplier = 0;
        if (userMbtiStr === m.mbti_type.substring(0,4)) bonusMultiplier += 0.15; 
        if (Math.abs(userPerc.S - M.S) > 40) bonusMultiplier += 0.10; 
        if (userPerc.A < 50 && (M.A !== undefined && M.A >= 65)) bonusMultiplier += 0.05;

        let finalComp = baseComp + (100 - baseComp) * bonusMultiplier;
        return { ...m, comp: parseFloat(Math.min(99.9, finalComp).toFixed(1)) };
    });

    matchResults.sort((a, b) => b.comp - a.comp);
    matchResultsGlobal = matchResults; // 存入 Global
    localStorage.removeItem('akb_answers'); // 測完清空進度
    renderResultPage(matchResults);
}

// 動態推色外框
function getConicGradient(colors) {
    if(!colors || colors.length === 0) return '#FF1493';
    if(colors.length === 1) return colors[0];
    if(colors.length === 2) return `conic-gradient(${colors[0]} 0deg 180deg, ${colors[1]} 180deg 360deg)`;
    if(colors.length >= 3) return `conic-gradient(${colors[0]} 0deg 120deg, ${colors[1]} 120deg 240deg, ${colors[2]} 240deg 360deg)`;
}

// 6. 渲染結果頁
function renderResultPage(allMembers) {
    document.getElementById('page-quiz').classList.add('hidden');
    const resPage = document.getElementById('page-result');
    resPage.classList.remove('hidden');

    let b1 = allMembers[0], b2 = allMembers[1], b3 = allMembers[2];
    
    // 讀取語言包資料
    let b1_lang = i18nData.members_analysis[b1.id];
    let b2_lang = i18nData.members_analysis[b2.id];
    let b3_lang = i18nData.members_analysis[b3.id];
    let userTitle = i18nData.mbti_titles[userMbtiStr]?.[currentLang] || userMbtiStr;
    let ui = i18nData.ui;

    const content = document.getElementById('result-content');
    content.innerHTML = `
        <div id="export-card" style="padding: 20px; border-radius: 16px; background: var(--glass-bg);">
            <div class="landing-header" style="text-align:center; margin-bottom: 20px;">
                <span class="subtitle">${ui.result_subtitle[currentLang]}</span>
                <h2 style="font-size: 32px; color: var(--cyber-pink); margin-top:5px;">${userMbtiStr}</h2>
                <h3 style="font-size: 18px; color: var(--text-main);">${userTitle}</h3>
            </div>
            
            <div style="position: relative; width: 100%; max-width: 320px; margin: 0 auto 30px auto;">
                <canvas id="radarChart"></canvas>
            </div>

            <div id="best3-section">
                <div style="background: rgba(255,255,255,0.8); border: 2px solid var(--sakura-light); border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <div style="font-size: 20px; font-weight:bold; margin-bottom: 15px;">${ui.soulmate_title[currentLang]}</div>
                    <div style="width: 110px; height: 110px; border-radius: 50%; padding: 4px; background: ${getConicGradient(b1.colors)}; margin: 0 auto 10px auto;">
                        <img crossorigin="anonymous" src="${b1.image}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid white;">
                    </div>
                    <h3 style="font-size: 20px;">${b1.name_ja} (${b1.mbti_type})</h3>
                    <p style="color: var(--cyber-pink); font-weight: bold; font-size: 18px; margin: 5px 0;">${ui.compatibility_label[currentLang]}${b1.comp}%</p>
                    <div class="dark-badge">${b1_lang.title[currentLang]}</div>
                    
                    <ul style="font-size: 13px; color: #444; line-height: 1.6; text-align:left; margin-top:10px; padding-left:20px; list-style-type: disc;">
                        ${b1_lang.traits[currentLang].map(t => `<li style="margin-bottom:6px;">${t}</li>`).join('')}
                    </ul>
                    <div style="font-size: 13px; color: #444; line-height: 1.6; text-align:left; margin-top: 15px; padding: 12px; background: rgba(255, 20, 147, 0.05); border-left: 4px solid var(--cyber-pink); border-radius: 4px;">
                        <strong>${ui.deep_analysis_label[currentLang]}</strong>${b1_lang.analysis[currentLang]}
                    </div>
                </div>

                <div style="background: rgba(255,255,255,0.8); border-radius: 12px; padding: 15px; margin-bottom: 15px;">
                    <div style="display:flex; align-items:center; margin-bottom: 10px;">
                        <div style="width: 60px; height: 60px; border-radius: 50%; padding: 3px; background: ${getConicGradient(b2.colors)}; flex-shrink:0;">
                            <img crossorigin="anonymous" src="${b2.image}" style="width: 100%; height: 100
