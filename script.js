/* =========================================
   2026 AKB48 粉絲深度性格鑑定 - 緣分與演算法最終版
   ========================================= */

// ==========================================
// 核心演算法組件 1：MBTI 官方 16 型人格相性基數表
// ==========================================
const mbtiBaseMatrix = {
    'INFP': { ENFJ:90, ENTJ:90, INFP:80, ENFP:80, INFJ:80, INTJ:80, INTP:75, ENTP:75, ISFP:60, ESFP:60, ISTP:60, ESTP:60, ISFJ:50, ESFJ:50, ISTJ:50, ESTJ:50 },
    'ENFP': { INFJ:90, INTJ:90, INFP:80, ENFP:80, ENFJ:80, ENTJ:80, INTP:75, ENTP:75, ISFP:60, ESFP:60, ISTP:60, ESTP:60, ISFJ:50, ESFJ:50, ISTJ:50, ESTJ:50 },
    'INFJ': { ENFP:90, ENTP:90, INFP:80, INFJ:80, ENFJ:80, INTJ:80, INTP:75, ENTJ:75, ISFP:60, ESFP:60, ISTP:60, ESTP:60, ISFJ:50, ESFJ:50, ISTJ:50, ESTJ:50 },
    'ENFJ': { INFP:90, ISFP:90, ENFP:80, INFJ:80, ENFJ:80, INTJ:80, INTP:75, ENTP:75, ENTJ:75, ESFP:60, ISTP:60, ESTP:60, ISFJ:50, ESFJ:50, ISTJ:50, ESTJ:50 },
    'INTP': { ENTJ:90, ESTJ:90, INFP:75, ENFP:75, INFJ:75, ENFJ:75, INTP:80, ENTP:80, INTJ:80, ISFP:60, ESFP:60, ISTP:60, ESTP:60, ISFJ:50, ESFJ:50, ISTJ:50 },
    'ENTP': { INFJ:90, INTJ:90, INFP:75, ENFP:75, ENFJ:75, INTP:80, ENTP:80, ENTJ:80, ISFP:60, ESFP:60, ISTP:60, ESTP:60, ISFJ:50, ESFJ:50, ISTJ:50, ESTJ:50 },
    'INTJ': { ENFP:90, ENTP:90, INFP:80, INFJ:80, ENFJ:80, INTP:80, INTJ:80, ENTJ:80, ISFP:60, ESFP:60, ISTP:60, ESTP:60, ISFJ:50, ESFJ:50, ISTJ:50, ESTJ:50 },
    'ENTJ': { INFP:90, INTP:90, ENFP:80, INFJ:75, ENFJ:75, ENTP:80, INTJ:80, ENTJ:80, ISFP:60, ESFP:60, ISTP:60, ESTP:60, ISFJ:50, ESFJ:50, ISTJ:50, ESTJ:50 },
    'ISFP': { ENFJ:90, ESFJ:90, ISFP:80, ESFP:80, ISTP:80, ESTP:80, ISFJ:75, ISTJ:75, INFP:60, ENFP:60, INFJ:60, INTJ:60, INTP:60, ENTP:60, ENTJ:60, ESTJ:50 },
    'ESFP': { ISFJ:90, ISTJ:90, ISFP:80, ESFP:80, ISTP:80, ESTP:80, ESFJ:75, INFP:60, ENFP:60, INFJ:60, ENFJ:60, INTP:60, ENTP:60, INTJ:60, ENTJ:60, ESTJ:50 },
    'ISTP': { ESTJ:90, ENTJ:90, ISFP:80, ESFP:80, ISTP:80, ESTP:80, ISFJ:75, ISTJ:75, INFP:60, ENFP:60, INFJ:60, ENFJ:60, INTP:60, ENTP:60, INTJ:60, ESFJ:50 },
    'ESTP': { ISFJ:90, ISTJ:90, ISFP:80, ESFP:80, ISTP:80, ESTP:80, ESTJ:75, INFP:60, ENFP:60, INFJ:60, ENFJ:60, INTP:60, ENTP:60, INTJ:60, ENTJ:60, ESFJ:50 },
    'ISFJ': { ESFP:90, ESTP:90, ISFJ:80, ESFJ:80, ISTJ:80, ESTJ:80, ISFP:75, ISTP:75, INFP:50, ENFP:50, INFJ:50, ENFJ:50, INTP:50, ENTP:50, INTJ:50, ENTJ:50 },
    'ESFJ': { ISFP:90, ISTP:90, ISFJ:80, ESFJ:80, ISTJ:80, ESTJ:80, ESFP:75, ESTP:75, INFP:50, ENFP:50, INFJ:50, ENFJ:50, INTP:50, ENTP:50, INTJ:50, ENTJ:50 },
    'ISTJ': { ESFP:90, ESTP:90, ISFJ:80, ESFJ:80, ISTJ:80, ESTJ:80, ISFP:75, ISTP:75, INFP:50, ENFP:50, INFJ:50, ENFJ:50, INTP:50, ENTP:50, INTJ:50, ENTJ:50 },
    'ESTJ': { INTP:90, ISTP:90, ISFJ:80, ESFJ:80, ISTJ:80, ESTJ:80, ESTP:75, ISFP:50, ESFP:50, INFP:50, ENFP:50, INFJ:50, ENFJ:50, ENTP:50, INTJ:50, ENTJ:50 }
};

function getMbtiBaseScore(userType, memberType) {
    if (mbtiBaseMatrix[userType] && mbtiBaseMatrix[userType][memberType]) {
        return mbtiBaseMatrix[userType][memberType];
    }
    return 70; // 預設安全值
}

// ==========================================
// 核心演算法組件 2：固定緣分值產生器 (防止隨機失憶症)
// ==========================================
function getSeededLuck(userPerc, memberId) {
    const seedString = `${Math.round(userPerc.E)}_${Math.round(userPerc.S)}_${memberId}`;
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
        hash = ((hash << 5) - hash) + seedString.charCodeAt(i);
        hash |= 0; 
    }
    return (Math.abs(hash) % 40) / 10; // 產生 0.0 ~ 3.9 嘅微調分數
}

let membersDB = [];
let i18nData = {};
let currentLang = "zh-HK";
let userAnswers = {};
let currentPage = 0;
const totalPages = 6;
let userPerc = {};
let userMbtiStr = "";
let myRadarChart = null; 
let matchResultsGlobal = []; 
let currentDisplayMember = null; 

function detectLanguage() {
    const lang = navigator.language || navigator.userLanguage;
    const lowerLang = lang.toLowerCase();
    if (lowerLang.includes('zh-hk') || lowerLang.includes('zh-tw')) return 'zh-HK';
    if (lowerLang.includes('zh')) return 'zh-CN';
    if (lowerLang.includes('ja')) return 'ja';
    if (lowerLang.includes('ko')) return 'ko';
    if (lowerLang.includes('th')) return 'th';
    if (lowerLang.includes('id')) return 'id';
    return 'en';
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [memRes, langRes] = await Promise.all([ fetch('members.json'), fetch('langs.json') ]);
        membersDB = await memRes.json();
        i18nData = await langRes.json();
        
        const saved = localStorage.getItem('akb_answers');
        if (saved) {
            userAnswers = JSON.parse(saved);
            const ansCount = Object.keys(userAnswers).length;
            if(ansCount === 0) currentPage = 0;
            else if (ansCount === 60) currentPage = 5; 
            else currentPage = Math.floor(ansCount / 10);
        }

        currentLang = localStorage.getItem('akb_lang') || detectLanguage();
        const langBtn = document.getElementById('lang-switcher');
        if(langBtn) {
            langBtn.value = currentLang; 
            langBtn.addEventListener('change', (e) => {
                currentLang = e.target.value;
                localStorage.setItem('akb_lang', currentLang);
                applyLanguage(currentLang);
            });
        }
        applyLanguage(currentLang);
    } catch (e) { console.error("載入 JSON 失敗:", e); }

    document.getElementById('start-btn')?.addEventListener('click', () => {
        document.getElementById('page-landing').classList.add('hidden');
        document.getElementById('page-quiz').classList.remove('hidden');
        renderQuiz();
        updateUI(); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('prev-btn')?.addEventListener('click', () => {
        if (currentPage > 0) { currentPage--; updateUI(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });

document.getElementById('next-btn')?.addEventListener('click', () => {
        if (!document.getElementById('next-btn').disabled) {
            if (currentPage < totalPages - 1) { 
                currentPage++; 
                updateUI(); 
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
            } else { 
                // 當是最後一頁時，執行計算
                calculateResults(); 
                // 注意：這裡移除了 window.scrollTo，因為 Loading 畫面通常是固定在螢幕正中央的
            }
        }
    });
});

function applyLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18nData.ui[key] && i18nData.ui[key][lang]) el.innerHTML = i18nData.ui[key][lang];
    });

    if (!document.getElementById('page-quiz').classList.contains('hidden')) {
        for(let i=1; i<=60; i++) {
            const qTextEl = document.getElementById(`qtext-${i}`);
            if(qTextEl && i18nData.questions[i]) qTextEl.innerHTML = `${i}. ${i18nData.questions[i].text[lang]}`;
        }
        document.querySelectorAll('.slider-labels').forEach(el => {
            el.innerHTML = `<span>${i18nData.ui.slider_disagree[lang]}</span><span>${i18nData.ui.slider_neutral[lang]}</span><span>${i18nData.ui.slider_agree[lang]}</span>`;
        });
        updateUI(); 
    }
    if (!document.getElementById('page-result').classList.contains('hidden') && matchResultsGlobal.length > 0) {
        renderResultPage(matchResultsGlobal);
    }
}

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
                    <div class="slider-ticks"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
                    <input type="range" class="custom-range ${touchedClass}" id="q${i}" min="1" max="7" step="1" value="${val}">
                </div>
                <div class="slider-labels">
                    <span>${i18nData.ui.slider_disagree[currentLang]}</span><span>${i18nData.ui.slider_neutral[currentLang]}</span><span>${i18nData.ui.slider_agree[currentLang]}</span>
                </div>
            `;
            pageDiv.appendChild(qDiv);
        }
        track.appendChild(pageDiv);
    }
track.addEventListener('input', handleSlider);
    track.addEventListener('change', handleSlider);
    
    // 🌟 新增：解決中立位置無法直接點擊的問題
    track.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
            e.target.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    track.addEventListener('touchstart', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
            e.target.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }, { passive: true });

    let firstUnanswered = 1;
    for(let i=1; i<=60; i++) { if(userAnswers[i] === undefined) { firstUnanswered = i; break; } }
    const targetBox = document.getElementById(`qbox-${firstUnanswered}`);
    if (targetBox) targetBox.classList.add('active');
}

function handleSlider(e) {
    if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
        const slider = e.target;
        slider.classList.add('touched');
        const qId = parseInt(slider.id.replace('q', ''));
        userAnswers[qId] = parseInt(slider.value);
        localStorage.setItem('akb_answers', JSON.stringify(userAnswers));
        
        updateProgress(); 
        checkPageCompletion();

        const nextBox = document.getElementById(`qbox-${qId + 1}`);
        if (nextBox) {
            nextBox.classList.add('active'); 
            if (e.type === 'change' && qId % 10 !== 0) { 
                setTimeout(() => nextBox.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
            }
        }
    }
}

function checkPageCompletion() {
    const startIndex = currentPage * 10 + 1;
    let allAnswered = true;
    for (let i = startIndex; i < startIndex + 10; i++) {
        if (i <= 60 && !userAnswers[i]) { allAnswered = false; break; }
    }
    const nextBtn = document.getElementById('next-btn');
    if (allAnswered) {
        nextBtn.classList.remove('disabled'); nextBtn.disabled = false; nextBtn.classList.add('pulse-glow');
    } else {
        nextBtn.classList.add('disabled'); nextBtn.disabled = true; nextBtn.classList.remove('pulse-glow');
    }
}

function updateUI() {
    const track = document.getElementById('quiz-track');
    track.style.transform = `translateX(-${(currentPage * 100) / totalPages}%)`;
    const prevBtn = document.getElementById('prev-btn');
    prevBtn.disabled = (currentPage === 0);
    prevBtn.classList.toggle('disabled', currentPage === 0);
    prevBtn.innerText = i18nData.ui.btn_prev[currentLang];
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

// ==========================================
// 核心演算法組件 3：終極計分與排序引擎
// ==========================================
function calculateResults() {
    // 1. 計算用家答題分數
    let scores = { E: 0, S: 0, T: 0, J: 0, A: 0 };
    for (let i = 1; i <= 60; i++) {
        const qData = i18nData.questions[i];
        let val = userAnswers[i] || 4; 
        if (qData.rev) val = 8 - val;
        scores[qData.dim] += val;
    }
    
    // 2. 轉換為百分比與 MBTI 字串
    userPerc = {
        E: ((scores.E - 12) / 72) * 100, 
        S: ((scores.S - 12) / 72) * 100, 
        T: ((scores.T - 12) / 72) * 100, 
        J: ((scores.J - 12) / 72) * 100, 
        A: ((scores.A - 12) / 72) * 100
    };
    
    userMbtiStr = (userPerc.E > 50 ? 'E' : 'I') + (userPerc.S > 50 ? 'S' : 'N') + (userPerc.T > 50 ? 'T' : 'F') + (userPerc.J > 50 ? 'J' : 'P');
    
    // 3. 逐一比對資料庫成員
    let matchResults = membersDB.map(m => {
        let M = m.mbti_scores;
        let diffE = Math.abs(userPerc.E - M.E);
        let diffS = Math.abs(userPerc.S - M.S);
        let diffT = Math.abs(userPerc.T - M.T);
        let diffJ = Math.abs(userPerc.J - M.J);

        // A. 取得 MBTI 官方相性基數 (宏觀定調)
        let tierBaseScore = getMbtiBaseScore(userMbtiStr, m.mbti_type);
        if (tierBaseScore <= 50) tierBaseScore = 55; // 保底機制，防止 N型沙漠

        // B. 餘弦波與線性微調 (微觀排位)
        let simBonusE = (50 - diffE) / 25; 
        let simBonusS = (50 - diffS) / 20; 
        let simBonusT = (50 - diffT) / 25; 
        let simBonusJ = (50 - diffJ) / 25; 
        let compBonusE = Math.cos(diffE * Math.PI / 50); 
        let compBonusJ = Math.cos(diffJ * Math.PI / 50); 

        let modifier = simBonusE + simBonusS + simBonusT + simBonusJ + compBonusE + compBonusJ;
        let baseComp = tierBaseScore + modifier;

        // C. A/T 堅韌度互補加成
        if (userPerc.A < 50 && (M.A !== undefined && M.A >= 65)) baseComp += 1.5;

// 🌟 【新增：新世代光環加成 (Rookie Bonus)】 🌟
        // 針對 17期 至 21期 成員，給予 0.8 分嘅微小加成，增加佢哋嘅曝光率
        if (m.ki === "17期" || m.ki === "18期" || m.ki === "19期" || m.ki === "20期" || m.ki === "21期") {
            baseComp += 0.8;
        }
       
        // D. 智能封頂，預留空間畀緣分值
        baseComp = Math.max(0, Math.min(96, baseComp));

        // E. 加入固定緣分值 (0.0 ~ 3.9)
        const luckFactor = getSeededLuck(userPerc, m.id);
        let finalComp = baseComp + luckFactor;
        
        return { 
            ...m, 
            comp: parseFloat(Math.max(0, Math.min(99.9, finalComp)).toFixed(1)),
            diffs: { E: diffE, S: diffS, T: diffT, J: diffJ }
        };
    });
    
    // 4. 初步排序
    matchResults.sort((a, b) => b.comp - a.comp);
    
    // ==========================================
    // 5. 相對神推保底機制 (Curve Grading) - 確保極致 UX 體驗
    // ==========================================
    let topScore = matchResults[0].comp;
    if (topScore < 92) {
        let boost = 93.5 - topScore; 
        
        matchResults = matchResults.map((m, index) => {
            let individualBoost = boost * Math.max(0, (1 - index * 0.15));
            let newComp = m.comp + individualBoost;
            
            // 用固定緣分值做偽隨機突破，確保唔會隨機失憶
            if (index === 0) {
                let fixedExtraBonus = (getSeededLuck(userPerc, m.id) / 3.9) * 2.5; 
                newComp += fixedExtraBonus;
            }
            
            return {
                ...m,
                comp: parseFloat(Math.min(99.9, newComp).toFixed(1))
            };
        });
        
        // 重新排序確保名次正確
        matchResults.sort((a, b) => b.comp - a.comp);
    }
    // ==========================================
    
    // 6. 儲存結果與觸發畫面
    matchResultsGlobal = matchResults; 
    localStorage.removeItem('akb_answers'); 
    
    const finalTopCompScore = matchResultsGlobal[0].comp;
    
    // 呼叫 Loading 動畫 (進入結果頁)
    if(typeof showLoadingAndReveal === 'function') {
        showLoadingAndReveal(finalTopCompScore);
    } else {
        renderResultPage(matchResultsGlobal);
    }
}

function getConicGradient(colors) {
    if(!colors || colors.length === 0) return '#FF1493';
    if(colors.length === 1) return colors[0];
    if(colors.length === 2) return `conic-gradient(${colors[0]} 0deg 180deg, ${colors[1]} 180deg 360deg)`;
    if(colors.length >= 3) return `conic-gradient(${colors[0]} 0deg 120deg, ${colors[1]} 120deg 240deg, ${colors[2]} 240deg 360deg)`;
}

function getDimDetail(diff, dimKey, isShortLabel = false) {
    const data = i18nData.dim_analysis?.[dimKey];
    if (!data) return ""; 
    let status = "neutral";
    if (diff <= 25) status = "sim"; 
    else if (dimKey !== 'S' && diff >= 70) status = "comp"; 
    return isShortLabel ? data[status][currentLang] : data[status].desc[currentLang];
}

function renderMainDisplay(member, titleLabel) {
    const mLang = i18nData.members_analysis[member.id];
    const ui = i18nData.ui;
    const cb = `?v=${new Date().getTime()}`;
    
    // 判斷是否為超神推 (95%+) 來決定要不要加愛心
    const isSuperMatch = member.comp >= 95;
    const heartHtml = isSuperMatch ? `<span class="match-heart" style="display:inline-block; margin-left: 5px;">💖</span>` : '';

    return `
        <div style="font-size: 18px; font-weight:bold; margin-bottom: 15px; color: var(--cyber-pink);">${titleLabel}</div>
        
        <div class="result-avatar" style="width: 120px; height: 120px; border-radius: 50%; padding: 4px; background: ${getConicGradient(member.colors)}; margin: 0 auto 12px auto; transition: all 0.3s ease;">
            <img crossorigin="anonymous" src="${member.image}${cb}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid white;">
        </div>
        
        <h3 style="font-size: 22px; margin-bottom: 5px;">${member.name_ja} <span style="font-size:14px; opacity:0.7;">(${member.mbti_type})</span></h3>
        
        <p style="color: var(--cyber-pink); font-weight: 800; font-size: 24px; margin: 5px 0 10px 0;">
            ${ui.compatibility_label[currentLang] || ''} <span class="comp-score">${member.comp}%</span>${heartHtml}
        </p>
        
        <div class="dark-badge" style="font-size: 14px; padding: 8px 15px;">${mLang.title[currentLang]}</div>
        
        <div class="export-only" style="display: none; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
            <div style="background: #fdf2f7; color: #d63384; padding: 8px; border-radius: 8px; font-size: 13px; font-weight: bold;">${getDimDetail(member.diffs.E, 'E', true)}</div>
            <div style="background: #fdf2f7; color: #d63384; padding: 8px; border-radius: 8px; font-size: 13px; font-weight: bold;">${getDimDetail(member.diffs.S, 'S', true)}</div>
            <div style="background: #fdf2f7; color: #d63384; padding: 8px; border-radius: 8px; font-size: 13px; font-weight: bold;">${getDimDetail(member.diffs.T, 'T', true)}</div>
            <div style="background: #fdf2f7; color: #d63384; padding: 8px; border-radius: 8px; font-size: 13px; font-weight: bold;">${getDimDetail(member.diffs.J, 'J', true)}</div>
        </div>
        
        <div class="web-only" style="text-align: left; margin-top: 20px; font-size: 14px; color: #444; border-top: 1px solid #eee; padding-top: 15px; line-height: 1.6;">
            <p style="margin-bottom:12px;"><strong>E/I:</strong> <span style="color: var(--cyber-pink); font-weight:bold;">${getDimDetail(member.diffs.E, 'E', true)}</span> - ${getDimDetail(member.diffs.E, 'E', false)}</p>
            <p style="margin-bottom:12px;"><strong>S/N:</strong> <span style="color: var(--cyber-pink); font-weight:bold;">${getDimDetail(member.diffs.S, 'S', true)}</span> - ${getDimDetail(member.diffs.S, 'S', false)}</p>
            <p style="margin-bottom:12px;"><strong>T/F:</strong> <span style="color: var(--cyber-pink); font-weight:bold;">${getDimDetail(member.diffs.T, 'T', true)}</span> - ${getDimDetail(member.diffs.T, 'T', false)}</p>
            <p style="margin-bottom:15px;"><strong>J/P:</strong> <span style="color: var(--cyber-pink); font-weight:bold;">${getDimDetail(member.diffs.J, 'J', true)}</span> - ${getDimDetail(member.diffs.J, 'J', false)}</p>
            <div style="background: rgba(255, 20, 147, 0.05); border-left: 4px solid var(--cyber-pink); border-radius: 4px; padding: 15px;">
                <strong>${ui.deep_analysis_label[currentLang]}</strong><br>${mLang.analysis[currentLang]}
            </div>
        </div>
    `;
}

function renderResultPage(allMembers) {
    document.getElementById('page-quiz').classList.add('hidden');
    const resPage = document.getElementById('page-result');
    resPage.classList.remove('hidden');
    let b1 = allMembers[0], b2 = allMembers[1], b3 = allMembers[2];
    currentDisplayMember = b1; 
    let userTitle = i18nData.mbti_titles[userMbtiStr]?.[currentLang] || userMbtiStr;
    let ui = i18nData.ui;
    const cb = `?v=${new Date().getTime()}`;
    const content = document.getElementById('result-content');
    content.innerHTML = `
        <div id="export-container" style="background: linear-gradient(135deg, #fdfcfb, #f0e6ea); width: 100%; max-width: 540px; margin: 0 auto; overflow: hidden; border-radius: 20px;">
            <div id="export-card" style="padding: 40px 15px; position: relative; display: flex; flex-direction: column; align-items: center; min-height: 850px; justify-content: space-around;">
                <div class="landing-header" style="text-align:center; width: 100%;">
                    <span class="subtitle" style="font-size: 16px; letter-spacing: 3px;">${ui.result_subtitle[currentLang]}</span>
                    <h2 style="font-size: 52px; color: var(--cyber-pink); margin: 10px 0 0 0; line-height: 1;">${userMbtiStr}</h2>
                    <h3 style="font-size: 22px; color: var(--text-main); margin-top: 8px;">${userTitle}</h3>
                </div>
                <div id="radar-wrapper" style="position: relative; width: 320px; margin: 20px auto;">
                    <canvas id="radarChart"></canvas>
                </div>
                <div id="main-display-section" style="background: white; border: 2px solid var(--sakura-light); border-radius: 24px; padding: 25px 20px; text-align: center; box-shadow: 0 15px 35px rgba(255,20,147,0.12); width: 92%; max-width: 480px;">
                    ${renderMainDisplay(b1, ui.soulmate_title[currentLang])}
                </div>
            </div>
        </div>
        <div id="web-best-list" class="web-only" style="margin-top: 20px;">
            <div style="background: rgba(255,255,255,0.7); border: 1px dashed var(--sakura-light); padding: 15px; border-radius: 12px; margin-bottom: 10px; display: flex; align-items: center;">
                <img crossorigin="anonymous" src="${b2.image}${cb}" style="width:55px; height:55px; border-radius:50%; margin-right:15px; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <div>
                    <div style="font-size:12px; color: #888;">2nd Match (${b2.comp}%)</div>
                    <div style="font-size:16px; font-weight:bold;">${b2.name_ja} <span style="font-size:12px; color:var(--cyber-pink);">${b2.mbti_type}</span></div>
                </div>
            </div>
            <div style="background: rgba(255,255,255,0.7); border: 1px dashed var(--sakura-light); padding: 15px; border-radius: 12px; display: flex; align-items: center;">
                <img crossorigin="anonymous" src="${b3.image}${cb}" style="width:55px; height:55px; border-radius:50%; margin-right:15px; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <div>
                    <div style="font-size:12px; color: #888;">3rd Match (${b3.comp}%)</div>
                    <div style="font-size:16px; font-weight:bold;">${b3.name_ja} <span style="font-size:12px; color:var(--cyber-pink);">${b3.mbti_type}</span></div>
                </div>
            </div>
        </div>
        <div class="web-only" style="margin-top: 25px; background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <h4 style="margin-bottom: 10px; text-align:center;">${ui.select_oshi_label[currentLang]}</h4>
            <select id="oshi-select" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ccc; font-size:16px;">
                <option value="">${ui.select_oshi_default[currentLang]}</option>
                ${[...allMembers].sort((a,b)=>a.ki.localeCompare(b.ki)).map(m => `<option value="${m.id}">${m.name_ja} (${m.ki})</option>`).join('')}
            </select>
        </div>
        <div id="back-to-best3-container" class="web-only" style="display: none; margin-top: 15px;">
            <button id="back-to-best3-btn" class="cyber-btn" style="background: #e0e0e0; color: #333; box-shadow: none;">${ui.btn_back_best3[currentLang]}</button>
        </div>
        <div class="web-only result-actions" style="display: flex; gap: 10px; margin-top: 20px;">
            <button id="download-btn" class="cyber-btn" style="flex: 1; background: #2d3436;">${ui.btn_download[currentLang]}</button>
            <button id="share-x-btn" class="cyber-btn" style="flex: 1; background: #000; color: #fff;">分享到 𝕏</button>
        </div>
    `;
    if(myRadarChart) myRadarChart.destroy();
    const ctx = document.getElementById('radarChart').getContext('2d');
myRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ui.radar_labels[currentLang],
            datasets: [{ data: [userPerc.E, userPerc.S, userPerc.T, userPerc.J, userPerc.A], backgroundColor: 'rgba(255, 20, 147, 0.4)', borderColor: '#FF1493', borderWidth: 3, pointRadius: 4, pointBackgroundColor: '#FF1493' }]
        },
        options: {
            // 🌟 【新增 1】：畫布四周加 Padding，確保最邊緣嘅字唔會出界被 Crop
            layout: {
                padding: {
                    left: 25,
                    right: 25,
                    top: 20,
                    bottom: 20
                }
            },
            animation: {
                duration: 2500,           // 動畫持續 2.5 秒
                easing: 'easeOutQuart'    // 絲滑的減速效果
            },
            scales: {
                r: {
                    angleLines: { color: 'rgba(0,0,0,0.1)' },
                    grid: { color: 'rgba(0,0,0,0.08)' },
                    ticks: { display: true, stepSize: 20, backdropColor: 'transparent', color: '#999', font: { size: 10 } },
                    suggestedMin: 0, 
                    suggestedMax: 100,
                    // 🌟 【新增 2】：加大外圍文字 (例如"審美(S)") 同雷達網角位嘅距離
                    pointLabels: {
                        padding: 10
                    }
                } 
            }, 
            plugins: { 
                legend: { display: false } 
            } 
        }
    });
   
// 1. 選擇神推的選單事件 (加入了動畫觸發)
    document.getElementById('oshi-select').addEventListener('change', (e) => {
        const oshiId = e.target.value;
        const bestList = document.getElementById('web-best-list');
        const backBtnCont = document.getElementById('back-to-best3-container');
        const mainSection = document.getElementById('main-display-section');
        
        if (!oshiId) { 
            currentDisplayMember = b1; 
            mainSection.innerHTML = renderMainDisplay(b1, ui.soulmate_title[currentLang]);
            bestList.style.display = 'block'; 
            backBtnCont.style.display = 'none';
            if(myRadarChart.data.datasets.length > 1) { 
                myRadarChart.data.datasets.pop(); 
                myRadarChart.update(); 
            }
            // 🌟 回到第一名：觸發動畫，但關閉神推小愛心 (false)
            applyDynamicAnimations(b1.comp, false);
            return; 
        }
        
        const oshi = allMembers.find(m => m.id === oshiId);
        currentDisplayMember = oshi; 
        mainSection.innerHTML = renderMainDisplay(oshi, ui.oshi_analysis_title[currentLang]);
        bestList.style.display = 'none'; 
        backBtnCont.style.display = 'block';
        
        myRadarChart.data.datasets[1] = { 
            label: oshi.name_ja, 
            data: [oshi.mbti_scores.E, oshi.mbti_scores.S, oshi.mbti_scores.T, oshi.mbti_scores.J, oshi.mbti_scores.A || 50], 
            backgroundColor: 'rgba(0, 206, 209, 0.15)', 
            borderColor: '#00CED1', 
            borderWidth: 2, 
            borderDash: [5, 5], 
            pointRadius: 3 
        };
        myRadarChart.update(); 
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // 🌟 選擇神推：觸發動畫，並開啟神推專屬小愛心 (true)
        applyDynamicAnimations(oshi.comp, true);
    });

    // 2. 返回 Best 3 按鈕事件
    document.getElementById('back-to-best3-btn').addEventListener('click', () => {
        document.getElementById('oshi-select').value = ""; 
        document.getElementById('oshi-select').dispatchEvent(new Event('change'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 3. 下載按鈕事件 (已加入防 Crop 底與深度分析顯示邏輯)
    document.getElementById('download-btn').addEventListener('click', async () => {
        const container = document.getElementById('export-container');
        const webOnly = document.querySelectorAll('.web-only'); 
        const exportOnly = document.querySelectorAll('.export-only');
        
        // 隱藏網頁專用元素，顯示匯出專用元素
        webOnly.forEach(el => el.style.display = 'none'); 
        exportOnly.forEach(el => el.style.display = 'grid'); 
        
        // 🌟 新增：套用截圖專用排版 (縮細雷達、顯示深度分析)
        container.classList.add('exporting-mode');

        const oldWidth = container.style.width; 
        const oldHeight = container.style.height; 
        const oldPos = container.style.position;
        
        container.style.width = "540px"; 
        container.style.height = "auto"; // 改用 auto 讓內容自然撐開
        container.style.position = "absolute"; // 改用 absolute 避免 fixed 帶來的滾動截斷問題
        container.style.top = "0"; 
        container.style.left = "0"; 
        container.style.zIndex = "-1"; // 移到背景層避免遮擋
        
        window.scrollTo(0, 0);
        
        try {
            // 使用 windowWidth 確保 html2canvas 擷取完整寬度
            const canvas = await html2canvas(container, { 
                scale: 2, 
                useCORS: true, 
                backgroundColor: "#fdfcfb",
                windowWidth: 540
            });
            const link = document.createElement('a'); 
            link.download = `AKB48_${userMbtiStr}_Result.png`; 
            link.href = canvas.toDataURL("image/png"); 
            link.click();
        } finally {
            // 恢復原本排版
            webOnly.forEach(el => el.style.display = 'block'); 
            exportOnly.forEach(el => el.style.display = 'none');
            container.classList.remove('exporting-mode');
            container.style.width = oldWidth; 
            container.style.height = oldHeight; 
            container.style.position = oldPos;
            container.style.zIndex = "";
        }
    });
   
    document.getElementById('share-x-btn').addEventListener('click', () => {
        const shareTexts = {
            'zh-HK': { mbti: "我的追星人格：", soulmate: "我的靈魂伴侶：", oshi: "我的神推相性：", check: "測測你的 AKB48 靈魂成員：" },
            'zh-CN': { mbti: "我的追星人格：", soulmate: "我的灵魂伴侣：", oshi: "我的神推相性：", check: "测测你的 AKB48 灵魂成员：" },
            'ja': { mbti: "私のオタク人格：", soulmate: "運命のパートナー：", oshi: "神推しとの相性：", check: "あなたのAKB48ソウルメイトを診断：" },
            'ko': { mbti: "나의 덕질 성격:", soulmate: "나의 소울메이트:", oshi: "나의 카미오시 상성:", check: "나의 AKB48 소울메이트 테스트:" },
            'en': { mbti: "My Stan Personality:", soulmate: "My Soulmate:", oshi: "My Kami-Oshi Compatibility:", check: "Find your AKB48 soulmate:" },
            'th': { mbti: "บุคลิกการติ่งของฉัน:", soulmate: "โซลเมตของฉัน:", oshi: "ความเข้ากันได้กับคามิโอชิ:", check: "ค้นหาโซลเมต AKB48 ของคุณ:" },
            'id': { mbti: "Kepribadian Stan Saya:", soulmate: "Belahan Jiwaku:", oshi: "Kecocokan Kami-Oshi Saya:", check: "Temukan soulmate AKB48 kamu:" }
        };
        const st = shareTexts[currentLang] || shareTexts['en']; const shareUrl = window.location.href; const isOshi = currentDisplayMember.id !== b1.id;
        const memberHash = `#${currentDisplayMember.name_ja.replace(/\s+/g, '')}`;
        const relationTitle = isOshi ? st.oshi : st.soulmate;
        const tweetText = `【${st.mbti}${userMbtiStr} ${userTitle}】\n💖 ${relationTitle}${currentDisplayMember.name_ja} (${currentDisplayMember.comp}%)\n\n${st.check}\n👇 ${shareUrl}\n\n#AKB48 #MBTI ${memberHash} #性格鑑定`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
    });
}

// ==========================================
// 動畫與特效引擎區 (終極版)
// ==========================================

let oshiHeartInterval = null; // 控制神推細心心飄落的計時器

// 1. Loading 圓圈與巨型愛心展示
function showLoadingAndReveal(bestCompScore) {
    const loader = document.getElementById('loading-overlay');
    loader.style.display = 'flex';
    loader.classList.remove('hidden');
    
    const progressCircle = loader.querySelector('.progress');
    progressCircle.style.transition = 'none';
    progressCircle.style.strokeDashoffset = '283';
    void progressCircle.offsetWidth;
    progressCircle.style.transition = 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
    progressCircle.style.strokeDashoffset = '0';
    
    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.classList.add('hidden');
            loader.style.opacity = '1'; 
            
            // 切換頁面
            document.getElementById('page-quiz').classList.add('hidden');
            document.getElementById('page-result').classList.remove('hidden');
            renderResultPage(matchResultsGlobal);
            
            // 【解決問題 2】：畫面顯示後立刻滑到最上方，確保看到雷達圖生成
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // 【解決問題 4】：巨型愛心與漫天櫻花爆發
            if (bestCompScore >= 85) {
                const giantHeart = document.getElementById('giant-heart-overlay');
                giantHeart.classList.remove('hidden');
                giantHeart.style.opacity = '1';
                
                // 讓愛心撲通跳 4.5 秒 (1.5秒 x 3次)
                setTimeout(() => {
                    giantHeart.style.opacity = '0';
                    setTimeout(() => giantHeart.classList.add('hidden'), 500);
                    
                    // 爆出快閃漫天櫻花 (ticks 設為 150 讓它快點消失)
                    if (typeof confetti !== 'undefined') {
                        confetti({ particleCount: 200, spread: 360, startVelocity: 40, origin: {y: 0.4}, zIndex: 2147483647, ticks: 150 });
                    }
                    // 愛心結束後才開始跑數字和頭像發光
                    applyDynamicAnimations(bestCompScore, false);
                }, 4500);
            } else {
                // 如果沒有 95%，直接爆發普通彩帶並跑數字
                if (typeof confetti !== 'undefined') {
                    confetti({ particleCount: 100, spread: 160, startVelocity: 30, origin: {y: 0.6}, zIndex: 2147483647 });
                }
                applyDynamicAnimations(bestCompScore, false);
            }
        }, 500);
    }, 1500);
}

// 2. 負責所有頭像發光、Count Up 與神推心心的通用函數 (解決問題 3, 5, 6, 7)
function applyDynamicAnimations(compScore, isOshi = false) {
    const avatar = document.querySelector('.result-avatar'); 
    const compText = document.querySelector('.comp-score'); 

    // 清除之前的神推飄心心計時器
    if (oshiHeartInterval) clearInterval(oshiHeartInterval);

    // 頭像發光與變厚
    if (avatar) {
        avatar.className = 'result-avatar pulse-border'; // 重置並加上基礎呼吸
        if (compScore >= 90) avatar.classList.add('thick-pulse-border');
    }

    // 觸發 Count Up 和爆光
    if (compText) {
        compText.className = 'comp-score pulse-text'; // 重置
        if (compScore >= 90) {
            // 重新觸發爆光動畫 (先移除再加入)
            compText.classList.remove('burst-light-anim');
            void compText.offsetWidth; 
            compText.classList.add('burst-light-anim');
        }
        animateCountUp(compText, compScore);
    }

    // 【解決問題 5】：選擇神推時，頭像附近飄出細心心
    if (isOshi && typeof confetti !== 'undefined') {
        const heartPath = 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z';
        const heartShape = confetti.shapeFromPath({ path: heartPath, matrix: [0.033, 0, 0, 0.033, -5, -5] });
        
        oshiHeartInterval = setInterval(() => {
            if(!document.querySelector('.result-avatar')) return; // 防止切換頁面報錯
            const rect = document.querySelector('.result-avatar').getBoundingClientRect();
            // 從頭像上半部隨機飄出
            const x = (rect.left + rect.width / 2 + randomInRange(-30, 30)) / window.innerWidth;
            const y = (rect.top + 20) / window.innerHeight;
            
            confetti({
                particleCount: 1, startVelocity: randomInRange(10, 15), gravity: -0.05, // 負重力=向上飄
                ticks: 200, shapes: [heartShape], colors: ['#FF1493', '#FF69B4', '#ffb7c5'],
                scalar: randomInRange(0.5, 1.0), origin: {x, y}, drift: randomInRange(-0.5, 0.5), zIndex: 999
            });
        }, 600); // 每 0.6 秒飄一顆
    }
}

// 3. 數字慢慢跳動，結束時散開粉色粒子
function animateCountUp(element, finalValue) {
    let duration = 1500; 
    let startTimestamp = null;
    element.innerText = "0.0%"; 

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOut = progress * (2 - progress); 
        
        element.innerText = (easeOut * finalValue).toFixed(1) + '%';
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.innerText = finalValue.toFixed(1) + '%';
            triggerPinkParticles(element);
        }
    };
    window.requestAnimationFrame(step);
}

// 4. 粉色粒子散開 (維持原樣)
function triggerPinkParticles(element) {
    if (typeof confetti === 'undefined') return;
    const rect = element.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    
    confetti({
        particleCount: 40, spread: 80, startVelocity: 15,
        colors: ['#FF1493', '#FFB6C1', '#FFFFFF'], ticks: 36, origin: { x, y }, zIndex: 2147483647
    });
}


// 全局點擊水波回饋
document.addEventListener('click', function(e) {
    let ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.left = (e.clientX - 10) + 'px';
    ripple.style.top = (e.clientY - 10) + 'px';
    
    document.body.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
});


// 輔助工具：生成指定範圍內的隨機數 (畀神推心心動畫用)
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}


