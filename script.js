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
    return 70; 
}

// ==========================================
// 核心演算法組件 2：固定緣分值產生器
// ==========================================
function getSeededLuck(userPerc, memberId) {
    const seedString = `${Math.round(userPerc.E)}_${Math.round(userPerc.S)}_${memberId}`;
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
        hash = ((hash << 5) - hash) + seedString.charCodeAt(i);
        hash |= 0; 
    }
    return (Math.abs(hash) % 40) / 10; 
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


   // ==========================================
    // 🌟 放在這裡！與其他按鈕的綁定並列
    // ==========================================
    document.getElementById('toggle-about-btn')?.addEventListener('click', () => {
        const aboutContent = document.getElementById('about-content');
        if (aboutContent) {
            aboutContent.classList.toggle('hidden');
        }
    });

    document.getElementById('start-btn')?.addEventListener('click', () => {
        document.getElementById('page-landing').classList.add('hidden');
        document.getElementById('page-quiz').classList.remove('hidden');
        renderQuiz();
        updateUI(); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

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
                calculateResults(); 
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
    

    track.addEventListener('input', handleSliderInput);   // 拖曳中或點擊瞬間：只更新數值與UI
    track.addEventListener('change', handleSliderChange); // 放開瞬間：跳下一題
    
    // 解決中立位置點擊無反應（點擊瞬間觸發 input 記錄答案，放開時觸發 change 跳下一題）
    track.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
            // 點下去的瞬間強制更新一次值
            e.target.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    track.addEventListener('mouseup', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
            // 放開的瞬間觸發跳轉
            e.target.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });
    track.addEventListener('touchstart', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
            e.target.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
            e.target.dispatchEvent(new Event('change', { bubbles: true }));
        }
    });

    let firstUnanswered = 1;
    for(let i=1; i<=60; i++) { if(userAnswers[i] === undefined) { firstUnanswered = i; break; } }
    const targetBox = document.getElementById(`qbox-${firstUnanswered}`);
    if (targetBox) targetBox.classList.add('active');
} // renderQuiz 結束

// 拆分出來的函數 1：只負責記錄分數和變色 (不跳轉)
function handleSliderInput(e) {
    if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
        const slider = e.target;
        slider.classList.add('touched'); // 變成粉紅色
        const qId = parseInt(slider.id.replace('q', ''));
        userAnswers[qId] = parseInt(slider.value); // 記錄分數
        localStorage.setItem('akb_answers', JSON.stringify(userAnswers));
        
        updateProgress(); 
        checkPageCompletion();
    }
}

// 拆分出來的函數 2：只負責跳到下一題
function handleSliderChange(e) {
    if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
        const slider = e.target;
        const qId = parseInt(slider.id.replace('q', ''));
        
        const nextBox = document.getElementById(`qbox-${qId + 1}`);
        if (nextBox) {
            nextBox.classList.add('active'); 
            // 如果不是該頁的最後一題，才平滑捲動到下一題
            if (qId % 10 !== 0) { 
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
    let scores = { E: 0, S: 0, T: 0, J: 0, A: 0 };
    for (let i = 1; i <= 60; i++) {
        const qData = i18nData.questions[i];
        let val = userAnswers[i] || 4; 
        if (qData.rev) val = 8 - val;
        scores[qData.dim] += val;
    }
    
    userPerc = {
        E: ((scores.E - 12) / 72) * 100, 
        S: ((scores.S - 12) / 72) * 100, 
        T: ((scores.T - 12) / 72) * 100, 
        J: ((scores.J - 12) / 72) * 100, 
        A: ((scores.A - 12) / 72) * 100
    };
    
    userMbtiStr = (userPerc.E > 50 ? 'E' : 'I') + (userPerc.S > 50 ? 'S' : 'N') + (userPerc.T > 50 ? 'T' : 'F') + (userPerc.J > 50 ? 'J' : 'P');
    
    let matchResults = membersDB.map(m => {
        let M = m.mbti_scores;
        let diffE = Math.abs(userPerc.E - M.E);
        let diffS = Math.abs(userPerc.S - M.S);
        let diffT = Math.abs(userPerc.T - M.T);
        let diffJ = Math.abs(userPerc.J - M.J);

        let tierBaseScore = getMbtiBaseScore(userMbtiStr, m.mbti_type);
        if (tierBaseScore <= 50) tierBaseScore = 55; 

        let simBonusE = (50 - diffE) / 25; 
        let simBonusS = (50 - diffS) / 20; 
        let simBonusT = (50 - diffT) / 25; 
        let simBonusJ = (50 - diffJ) / 25; 
        let compBonusE = Math.cos(diffE * Math.PI / 50); 
        let compBonusJ = Math.cos(diffJ * Math.PI / 50); 

        let modifier = simBonusE + simBonusS + simBonusT + simBonusJ + compBonusE + compBonusJ;
        let baseComp = tierBaseScore + modifier;

        if (userPerc.A < 50 && (M.A !== undefined && M.A >= 65)) baseComp += 1.5;

        if (m.ki === "17期" || m.ki === "18期" || m.ki === "19期" || m.ki === "20期" || m.ki === "21期") {
            baseComp += 0.8;
        }
        
        baseComp = Math.max(0, Math.min(96, baseComp));
        const luckFactor = getSeededLuck(userPerc, m.id);
        let finalComp = baseComp + luckFactor;
        
        return { 
            ...m, 
            comp: parseFloat(Math.max(0, Math.min(99.9, finalComp)).toFixed(1)),
            diffs: { E: diffE, S: diffS, T: diffT, J: diffJ }
        };
    });
    
    matchResults.sort((a, b) => b.comp - a.comp);
    
    let topScore = matchResults[0].comp;
    if (topScore < 92) {
        let boost = 93.5 - topScore; 
        matchResults = matchResults.map((m, index) => {
            let individualBoost = boost * Math.max(0, (1 - index * 0.15));
            let newComp = m.comp + individualBoost;
            if (index === 0) {
                let fixedExtraBonus = (getSeededLuck(userPerc, m.id) / 3.9) * 2.5; 
                newComp += fixedExtraBonus;
            }
            return {
                ...m,
                comp: parseFloat(Math.min(99.9, newComp).toFixed(1))
            };
        });
        matchResults.sort((a, b) => b.comp - a.comp);
    }
    
    matchResultsGlobal = matchResults; 
    localStorage.removeItem('akb_answers'); 
    
    const finalTopCompScore = matchResultsGlobal[0].comp;
    showLoadingAndReveal(finalTopCompScore);
}

// ==========================================
// 專為 html2canvas 截圖防呆的背景生成器
// ==========================================
function getAvatarBgStyle(colors) {
    if (!colors || colors.length === 0) return 'background-color: #FF1493;'; // 預設單色粉紅
    if (colors.length === 1) return `background-color: ${colors[0]};`; // 單推色
    
    // 雙推色：明確寫出 0%-50% 和 50%-100%，並使用 background-image
    if (colors.length === 2) {
        return `background-image: linear-gradient(135deg, ${colors[0]} 0%, ${colors[0]} 50%, ${colors[1]} 50%, ${colors[1]} 100%);`;
    }
    
    // 三推色：明確寫出 33.3% 區間
    if (colors.length >= 3) {
        return `background-image: linear-gradient(135deg, ${colors[0]} 0%, ${colors[0]} 33.3%, ${colors[1]} 33.3%, ${colors[1]} 66.6%, ${colors[2]} 66.6%, ${colors[2]} 100%);`;
    }
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

    return `
        <div style="font-size: 18px; font-weight:bold; margin-bottom: 15px; color: var(--cyber-pink);">${titleLabel}</div>
        
<div class="result-avatar" style="width: 120px; height: 120px; border-radius: 50%; padding: 4px; ${getAvatarBgStyle(member.colors)} margin: 0 auto 12px auto; transition: all 0.3s ease;">
            <img crossorigin="anonymous" src="${member.image}${cb}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid white;">
        </div>
        
        <h3 style="font-size: 22px; margin-bottom: 5px;">${member.name_ja} <span style="font-size:14px; opacity:0.7;">(${member.mbti_type})</span></h3>
        
        <p class="comp-score-container" style="color: var(--cyber-pink); font-weight: 800; font-size: 24px; margin: 5px 0 10px 0; display:flex; justify-content:center; align-items:center;">
            ${ui.compatibility_label[currentLang] || ''} <span class="comp-score" style="margin-left:5px;">0.0%</span>
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
        </div>

        <div id="deep-analysis-box" style="text-align: left; background: rgba(255, 20, 147, 0.05); border-left: 4px solid var(--cyber-pink); border-radius: 4px; padding: 15px; font-size: 14px; color: #444; line-height: 1.6;">
            <strong>${ui.deep_analysis_label[currentLang]}</strong><br>${mLang.analysis[currentLang]}
        </div>
    `;
}

function renderResultPage(allMembers) {
    document.getElementById('page-quiz').classList.add('hidden');
    const resPage = document.getElementById('page-result');
    resPage.classList.remove('hidden');
    let b1 = allMembers[0], b2 = allMembers[1], b3 = allMembers[2];
    currentDisplayMember = b1; 
window.history.replaceState(null, null, `#result=${userMbtiStr}&score=${currentDisplayMember.comp}&oshi=${currentDisplayMember.id}`);
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
            layout: { 
                padding: { left: 35, right: 35, top: 35, bottom: 35 } 
            }, 
            maintainAspectRatio: true, 
            responsive: true,
            animation: { duration: 2500, easing: 'easeOutQuart' },
            scales: {
                r: {
                    angleLines: { color: 'rgba(0,0,0,0.1)' },
                    grid: { color: 'rgba(0,0,0,0.08)' },
                    ticks: { 
                        display: true, 
                        stepSize: 20, 
                        backdropColor: 'transparent', 
                        color: '#999', 
                        font: { size: 10 } 
                    },
                    suggestedMin: 0, 
                    suggestedMax: 100,
                    // 🌟 終極修復偏右：大幅減少手機版字體大小及距離
                    pointLabels: { 
                        padding: window.innerWidth < 400 ? 2 : 8, // 手機版將字體貼緊五角形
                        font: { size: window.innerWidth < 400 ? 10 : 13 } // 手機版字體縮細到 10px
                    }
                } 
            }, 
            plugins: { legend: { display: false } } 
        }
    });
   
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
            applyDynamicAnimations(b1.comp, false);
           
           window.history.replaceState(null, null, `#result=${userMbtiStr}&score=${currentDisplayMember.comp}&oshi=${currentDisplayMember.id}`);
           
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
        applyDynamicAnimations(oshi.comp, true);

       window.history.replaceState(null, null, `#result=${userMbtiStr}&score=${currentDisplayMember.comp}&oshi=${currentDisplayMember.id}`);
       
    });

    document.getElementById('back-to-best3-btn').addEventListener('click', () => {
        document.getElementById('oshi-select').value = ""; 
        document.getElementById('oshi-select').dispatchEvent(new Event('change'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 下載截圖
    document.getElementById('download-btn').addEventListener('click', async () => {
        const container = document.getElementById('export-container');
        const webOnly = document.querySelectorAll('.web-only'); 
        const exportOnly = document.querySelectorAll('.export-only');
        
        webOnly.forEach(el => el.style.display = 'none'); 
        exportOnly.forEach(el => el.style.display = 'grid'); 
        
        container.classList.add('exporting-mode');
        const deepBox = document.getElementById('deep-analysis-box');
        if(deepBox) deepBox.style.display = 'block';

        window.scrollTo(0, 0);
        
        try {
            const canvas = await html2canvas(container, { 
                scale: 2, 
                useCORS: true, 
                backgroundColor: "#FFF5F8",
                windowWidth: 540,
                windowHeight: 960 
            });
            const link = document.createElement('a'); 
// 🌟 更新檔名規則：AKB48_MBTI_ESFP_ゆいゆい_92.png
const safeName = currentDisplayMember.nickname || currentDisplayMember.name_ja;
const formattedScore = Math.round(currentDisplayMember.comp);
link.download = `AKB48_MBTI_${userMbtiStr}_${safeName}_${formattedScore}.png`;
            link.href = canvas.toDataURL("image/png"); 
            link.click();
        } finally {
            webOnly.forEach(el => el.style.display = 'block'); 
            exportOnly.forEach(el => el.style.display = 'none');
            container.classList.remove('exporting-mode');
        }
    });
   
document.getElementById('share-x-btn').addEventListener('click', () => {
        const shareTexts = {
            'zh-HK': { mbti: "我的追星人格：", unmei: "命中注定的神推：", aishou: "我的神推相性：", check: "🌸 尋找與你最契合的 AKB48 成員：" },
            'zh-CN': { mbti: "我的追星人格：", unmei: "命中注定的神推：", aishou: "我的神推相性：", check: "🌸 寻找与你最契合的 AKB48 成员：" },
            'ja': { mbti: "私のオタク人格：", unmei: "運命の推しメン：", aishou: "神推しとの相性：", check: "🌸 あなたと「神相性」なAKB48メンバーを診断：" },
            'ko': { mbti: "나의 덕질 성격:", unmei: "운명의 오시멘:", aishou: "나의 카미오시 상성:", check: "🌸 나의 AKB48 소울메이트 테스트:" },
            'en': { mbti: "My Stan Personality:", unmei: "My Fated Member:", aishou: "My Compatibility:", check: "🌸 Find your AKB48 soulmate:" },
            'th': { mbti: "บุคลิกการติ่งของฉัน:", unmei: "โซลเมตของฉัน:", aishou: "ความเข้ากันได้กับคามิโอชิ:", check: "ค้นหาโซลเมต AKB48 ของคุณ:" },
            'id': { mbti: "Kepribadian Stan Saya:", unmei: "Belahan Jiwaku:", aishou: "Kecocokan Kami-Oshi Saya:", check: "Temukan soulmate AKB48 kamu:" }
        };
        const st = shareTexts[currentLang] || shareTexts['en']; 
        const shareUrl = window.location.href; 
        
        // 判斷是第一名還是自選神推
        const isOshi = document.getElementById('oshi-select').value !== "";
        const relationTitle = isOshi ? st.aishou : st.unmei;
        
        const memberHash = `#${currentDisplayMember.name_ja.replace(/\s+/g, '')}`;
        
        // 組成推文
        const tweetText = `【${st.mbti}${userMbtiStr} ${userTitle}】\n✨ ${relationTitle}${currentDisplayMember.name_ja} (${currentDisplayMember.comp}%)\n\n${st.check}\n👇 ${shareUrl}\n\n#AKB48 #MBTI ${memberHash} #性格診断`;
        
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
    });
}

// ==========================================
// 動畫與特效引擎區
// ==========================================
let oshiHeartInterval = null; 

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
            
            document.getElementById('page-quiz').classList.add('hidden');
            document.getElementById('page-result').classList.remove('hidden');
            renderResultPage(matchResultsGlobal);
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
if (bestCompScore >= 85) {
                const giantHeart = document.getElementById('giant-heart-overlay');
                
                // 🌟 1. 動畫開始：鎖死畫面，防止使用者往下捲動 🌟
                document.body.style.overflow = 'hidden'; 
                
                giantHeart.classList.remove('hidden');
                giantHeart.style.opacity = '1';
                
                setTimeout(() => {
                    giantHeart.style.opacity = '0';
                    setTimeout(() => {
                        giantHeart.classList.add('hidden');
                        
                        // 🌟 2. 動畫結束 (心心淡出後)：解鎖畫面，恢復捲動 🌟
                        document.body.style.overflow = ''; 
                        
                    }, 500);
                    
                    if (typeof confetti !== 'undefined') {
                        confetti({ particleCount: 200, spread: 360, startVelocity: 40, origin: {y: 0.4}, zIndex: 2147483647, ticks: 150 });
                    }
                    applyDynamicAnimations(bestCompScore, false);
                }, 4500);
            } else {
                if (typeof confetti !== 'undefined') {
                    confetti({ particleCount: 100, spread: 160, startVelocity: 30, origin: {y: 0.6}, zIndex: 2147483647 });
                }
                applyDynamicAnimations(bestCompScore, false);
            }
        }, 500);
    }, 1500);
}

function applyDynamicAnimations(compScore, isOshi = false) {
    const avatar = document.querySelector('.result-avatar'); 
    const compText = document.querySelector('.comp-score'); 

    if (oshiHeartInterval) clearInterval(oshiHeartInterval);

    if (avatar) {
        avatar.className = 'result-avatar pulse-border'; 
        if (compScore >= 90) avatar.classList.add('thick-pulse-border');
    }

    if (compText) {
        compText.className = 'comp-score pulse-text'; 
        compText.innerHTML = "0.0%"; // 開始前歸零
        
        animateCountUp(compText, compScore, () => {
            if (compScore >= 95) {
                compText.classList.add('burst-light-anim');
                setTimeout(() => {
                    compText.innerHTML = `${compScore.toFixed(1)}% <span class="match-heart" style="display:inline-block; margin-left: 5px; animation: heart-beat 1s infinite;">💖</span>`;
                }, 500);
            } else {
                compText.innerHTML = `${compScore.toFixed(1)}%`;
            }
        });
    }

    if (isOshi && typeof confetti !== 'undefined') {
        const heartPath = 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z';
        const heartShape = confetti.shapeFromPath({ path: heartPath, matrix: [0.033, 0, 0, 0.033, -5, -5] });
        
        oshiHeartInterval = setInterval(() => {
            if(!document.querySelector('.result-avatar')) return; 
            const rect = document.querySelector('.result-avatar').getBoundingClientRect();
            const x = (rect.left + rect.width / 2 + randomInRange(-30, 30)) / window.innerWidth;
            const y = (rect.top + 20) / window.innerHeight;
            
            confetti({
                particleCount: 1, startVelocity: randomInRange(10, 15), gravity: -0.05, 
                ticks: 200, shapes: [heartShape], colors: ['#FF1493', '#FF69B4', '#ffb7c5'],
                scalar: randomInRange(0.5, 1.0), origin: {x, y}, drift: randomInRange(-0.5, 0.5), zIndex: 999
            });
        }, 600); 
    }
}

function animateCountUp(element, finalValue, onComplete) {
    let duration = 1500; 
    let startTimestamp = null;
    element.innerHTML = "0.0%"; 

    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOut = progress * (2 - progress); 
        
        element.innerHTML = (easeOut * finalValue).toFixed(1) + '%';
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            element.innerHTML = finalValue.toFixed(1) + '%';
            triggerPinkParticles(element);
            if (onComplete) onComplete(); 
        }
    };
    window.requestAnimationFrame(step);
}

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

function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// ==========================================
// 全局點擊水波與櫻花噴發回饋 (溫和微風版)
// ==========================================
document.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return; // 只限滑鼠左鍵

    // --- 1. 產生水波漣漪 ---
    const existingRipples = document.querySelectorAll('.ripple-effect');
    existingRipples.forEach(r => r.remove());

    let ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    
    const size = 15; 
    const offset = size / 2;
    
    ripple.style.width = size + 'px';
    ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - offset) + 'px';
    ripple.style.top = (e.clientY - offset) + 'px';
    
    document.body.appendChild(ripple);
    
    setTimeout(() => {
        if(ripple.parentNode) ripple.remove();
    }, 600);

// --- 2. 點擊飄落櫻花 (唯美微風版 - 修復隱形問題) ---
    if (typeof confetti !== 'undefined') {
        // 🌸 1. 花瓣 SVG (約 30x40 尺寸)
        const petalPath = 'M15 0 Q 30 15 15 40 Q 0 15 15 0 Z';
        
        // 🌸 2. 【修復關鍵】：將縮放倍數由 0.04 改為 0.5，並將偏移量改為置中
        const petalShape = confetti.shapeFromPath({ path: petalPath, matrix: [0.4, 0, 0, 0.4, -7.5, -10] });

        const xPercent = e.clientX / window.innerWidth;
        const yPercent = e.clientY / window.innerHeight;

        confetti({
            particleCount: 10,                // 每次 5 塊
            spread: 120,                      
            startVelocity: 8,                // 柔和初速
            gravity: 0.15,                   // 輕盈飄落
            drift: randomInRange(-0.8, 0.8), // 微風左右吹
            colors: ['#FFB7C5', '#FFC0CB', '#F8C8DC'], // 柔和櫻花色
            shapes: [petalShape],       
            
            // 🌸 3. 【修復關鍵】：加大最終顯示比例，確保肉眼清晰可見
            scalar: randomInRange(0.5, 0.8), 
            
            origin: { x: xPercent, y: yPercent }, 
            zIndex: 99999,              
            ticks: 350                       // 存活時間
        });
    }
});


// ==========================================
// 音樂播放器與吸附邏輯 (Intersection Observer)
// ==========================================

function toggleMusic() {
    const wrap = document.getElementById('footer-mv-wrap');
    const iframe = document.getElementById('footer-yt-player');
    const btn = document.getElementById('music-toggle-btn');
    const videoId = 'Aw2NpveLOFs'; // 名残り桜 MV ID

    // 取得多語言文字
    const onText = (i18nData.ui.btn_music_on && i18nData.ui.btn_music_on[currentLang]) ? i18nData.ui.btn_music_on[currentLang] : "🎵 名残り桜：開";
    const offText = (i18nData.ui.btn_music_off && i18nData.ui.btn_music_off[currentLang]) ? i18nData.ui.btn_music_off[currentLang] : "🎵 名残り桜：關";

    if (wrap.classList.contains('hidden')) {
        // 開啟音樂
        iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        wrap.classList.remove('hidden');
        btn.innerHTML = onText;
        btn.style.background = "rgba(255, 20, 147, 0.15)";
        btn.style.color = "var(--cyber-pink)";
        btn.style.border = "1px solid var(--cyber-pink)";
    } else {
        // 關閉音樂
        iframe.src = '';
        wrap.classList.add('hidden');
        btn.innerHTML = offText;
        btn.style.background = "transparent";
        btn.style.color = "var(--text-muted)";
        btn.style.border = "1px solid rgba(255,255,255,0.3)";
    }
}

// 監聽器：當頁面滑到最底 (Footer 出現) 時，讓播放器自動歸位
document.addEventListener('DOMContentLoaded', () => {
    const footer = document.getElementById('site-footer');
    const mvWrap = document.getElementById('footer-mv-wrap');

    if ('IntersectionObserver' in window && footer && mvWrap) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // 如果 Footer 進入了螢幕畫面
                if (entry.isIntersecting) {
                    mvWrap.classList.remove('floating-mode');
                    mvWrap.classList.add('docked-mode');
                } else {
                    // 如果用家滑回上面 (離開了 Footer)
                    mvWrap.classList.remove('docked-mode');
                    mvWrap.classList.add('floating-mode');
                }
            });
        }, { 
            root: null,
            threshold: 0.05 // 只要 Footer 露出 5% 就觸發歸位
        });

        observer.observe(footer);
    }
});














