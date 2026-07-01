/* =========================================
   2026 AKB48 粉絲深度性格鑑定 - 緣分與演算法最終版
   ========================================= */

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
let oshiOptionsHTML = ""; // 儲存 optgroup HTML
const SUPABASE_URL = "https://jappifgnjssqxvjodgiv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_oXfJyHkRtn1BHBw-9ictBQ__01qBCZg";
const CLOUD_TABLE = "personality_results";
const LOCAL_RESULT_KEY = "akb_last_result";
let currentResultState = null;
let currentResultCloudId = "";
let cloud = { client: null, user: null, records: [], ready: false, busy: false, statusKey: "cloudLocalOnly", messageKey: "", messageVars: {} };
let cloudEventsBound = false;

function isSelectableMember(member) {
    return Boolean(member) && member.active !== false && member.selectable !== false && member.hiddenFromSelection !== true;
}

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

function t(key, vars = {}) {
    let value = i18nData.ui?.[key]?.[currentLang] || i18nData.ui?.[key]?.en || key;
    Object.entries(vars).forEach(([name, replacement]) => {
        value = String(value).split(`{${name}}`).join(replacement == null ? "" : String(replacement));
    });
    return value;
}

function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

function formatCloudTime(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    try {
        return new Intl.DateTimeFormat(currentLang, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);
    } catch (_error) {
        return date.toLocaleString();
    }
}

function setAccountToggleLabel(label) {
    const text = document.querySelector("#accountToggleBtn .account-toggle-label");
    if (text) text.textContent = label;
}

function getCloudDisplayName() {
    return cloud.user?.user_metadata?.display_name || cloud.user?.email || t("cloudAccount");
}

function applyPlaceholderTranslations(lang) {
    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        const value = i18nData.ui?.[key]?.[lang] || i18nData.ui?.[key]?.en;
        if (value) el.setAttribute("placeholder", value);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const langRes = await fetch('langs.json');
        i18nData = await langRes.json();
        
        await loadMembers(); 

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

    bindCloudEvents();
    initCloudSave();
});

function applyLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18nData.ui[key] && i18nData.ui[key][lang]) el.innerHTML = i18nData.ui[key][lang];
    });
    applyPlaceholderTranslations(lang);

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
        const isOshi = document.getElementById('oshi-select').value !== "";
        applyDynamicAnimations(currentDisplayMember.comp, isOshi);
    }
    updateCloudUI();
    refreshCloudMessageLanguage();
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
    
    track.addEventListener('input', handleSliderInput);   
    track.addEventListener('change', handleSliderChange); 
    
    track.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
            e.target.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    track.addEventListener('mouseup', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
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
}

function handleSliderInput(e) {
    if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
        const slider = e.target;
        slider.classList.add('touched'); 
        const qId = parseInt(slider.id.replace('q', ''));
        userAnswers[qId] = parseInt(slider.value); 
        localStorage.setItem('akb_answers', JSON.stringify(userAnswers));
        
        updateProgress(); 
        checkPageCompletion();
    }
}

function handleSliderChange(e) {
    if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
        const slider = e.target;
        const qId = parseInt(slider.id.replace('q', ''));
        const nextBox = document.getElementById(`qbox-${qId + 1}`);
        if (nextBox) {
            nextBox.classList.add('active'); 
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

    const tipText = document.getElementById('progress-tip-text');
    const milestones = { 20: 'stage_20', 30: 'stage_30', 40: 'stage_40', 50: 'stage_50' };
    
    if (tipText && milestones[count]) {
        try {
            const stageData = i18nData.progress_tips?.[milestones[count]];
            if (stageData) {
                const options = stageData[currentLang] || stageData['zh-HK'] || stageData['en'] || [];
                if (options.length > 0) {
                    const randomTip = options[Math.floor(Math.random() * options.length)];
                    tipText.innerText = randomTip;
                    tipText.style.opacity = '1';
                    setTimeout(() => { tipText.style.opacity = '0'; }, 3500); 
                }
            }
        } catch (e) {
            console.error("鼓勵語載入錯誤:", e);
        }
    }
}

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
    
    let matchResults = membersDB.filter(isSelectableMember).map(m => {
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

function getAvatarBgStyle(colors) {
    if (!colors || colors.length === 0) return 'background-color: #FF1493;'; 
    if (colors.length === 1) return `background-color: ${colors[0]};`; 
    if (colors.length === 2) {
        return `background-image: linear-gradient(135deg, ${colors[0]} 0%, ${colors[0]} 50%, ${colors[1]} 50%, ${colors[1]} 100%);`;
    }
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

function getMemberBadgesHtml(userPerc) {
    if (!i18nData.badges) return ""; 

    const dimensions = [
        { key: 'E', val: userPerc.E }, { key: 'J', val: userPerc.J },
        { key: 'T', val: userPerc.T }, { key: 'S', val: userPerc.S }, { key: 'A', val: userPerc.A }
    ];
    dimensions.sort((a, b) => Math.abs(b.val - 50) - Math.abs(a.val - 50)); 
    
    let badgesHtml = '<div class="badge-container">';
    dimensions.slice(0, 3).forEach(d => {
        let tierClass = "achievement-badge";
        let tierKey = "";
        if (d.key === 'A') {
            if (d.val >= 80) { tierKey = 'high'; tierClass += " legendary"; }
            else if (d.val >= 40) tierKey = 'mid'; else tierKey = 'low';
        } else {
            if (d.val >= 90) { tierKey = 'tier5'; tierClass += " legendary"; }
            else if (d.val >= 70) tierKey = 'tier4';
            else if (d.val >= 40) tierKey = 'tier3';
            else if (d.val >= 11) tierKey = 'tier2';
            else { tierKey = 'tier1'; tierClass += " legendary"; }
        }
        const badgeText = i18nData.badges[d.key][tierKey][currentLang] || i18nData.badges[d.key][tierKey]['en'];
        badgesHtml += `<span class="${tierClass}">${badgeText}</span>`;
    });
    badgesHtml += '</div>';
    return badgesHtml;
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
            <div id="export-card" style="padding: 30px 15px; position: relative; display: flex; flex-direction: column; align-items: center; min-height: 850px; justify-content: space-around;">
                
                <div class="landing-header" style="text-align:center; width: 100%;">
                    <span class="subtitle" style="font-size: 16px; letter-spacing: 3px;">${ui.result_subtitle[currentLang]}</span>
                    <h2 style="font-size: 52px; color: var(--cyber-pink); margin: 10px 0 0 0; line-height: 1;">${userMbtiStr}</h2>
                    
                    <h3 style="font-size: 22px; color: var(--text-main); margin-top: 5px; margin-bottom: 15px;">${userTitle}</h3>
                    
                    ${getMemberBadgesHtml(userPerc)}
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
        <div class="web-only" style="margin-top: 25px; background: white; border-radius: 166px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <h4 style="margin-bottom: 10px; text-align:center;">${ui.select_oshi_label[currentLang]}</h4>
            <select id="oshi-select" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ccc; font-size:16px;">
                <option value="">${ui.select_oshi_default[currentLang] || "-- 請選擇神推成員 --"}</option>
                ${oshiOptionsHTML}
            </select>
        </div>
        <div id="back-to-best3-container" class="web-only" style="display: none; margin-top: 15px;">
            <button id="back-to-best3-btn" class="cyber-btn" style="background: #e0e0e0; color: #333; box-shadow: none;">${ui.btn_back_best3[currentLang]}</button>
        </div>
        
        <div class="web-only result-actions" style="display: flex; gap: 10px; margin-top: 20px;">
            <button id="download-btn" class="cyber-btn" style="flex: 1; background: #2d3436;">${ui.btn_download[currentLang]}</button>
            <button id="share-x-btn" class="cyber-btn" style="flex: 1; background: #000; color: #fff;">${ui.btn_share_x?.[currentLang] || ui.btn_share_x?.en || 'Share to X'}</button>
        </div>
        <div class="web-only result-actions" style="margin-top: 10px;">
            <button id="copy-link-btn" class="cyber-btn" style="width: 100%; background: var(--cyber-pink); color: #fff;">${ui.btn_copy_link?.[currentLang] || ui.btn_copy_link?.en || 'Copy result link'}</button>
        </div>
    `;
    setCurrentResultState();
    updateCloudUI();

    if(myRadarChart) myRadarChart.destroy();
    const ctx = document.getElementById('radarChart').getContext('2d');
    myRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ui.radar_labels[currentLang],
            datasets: [{ data: [userPerc.E, userPerc.S, userPerc.T, userPerc.J, userPerc.A], backgroundColor: 'rgba(255, 20, 147, 0.4)', borderColor: '#FF1493', borderWidth: 3, pointRadius: 4, pointBackgroundColor: '#FF1493' }]
        },
        options: {
            layout: { padding: { left: 35, right: 35, top: 35, bottom: 35 } }, 
            maintainAspectRatio: true, responsive: true, animation: { duration: 2500, easing: 'easeOutQuart' },
            scales: { r: { angleLines: { color: 'rgba(0,0,0,0.1)' }, grid: { color: 'rgba(0,0,0,0.08)' }, ticks: { display: true, stepSize: 20, backdropColor: 'transparent', color: '#999', font: { size: 10 } }, suggestedMin: 0, suggestedMax: 100, pointLabels: { padding: window.innerWidth < 400 ? 2 : 8, font: { size: window.innerWidth < 400 ? 10 : 13 } } } }, 
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
            label: oshi.name_ja, data: [oshi.mbti_scores.E, oshi.mbti_scores.S, oshi.mbti_scores.T, oshi.mbti_scores.J, oshi.mbti_scores.A || 50], 
            backgroundColor: 'rgba(0, 206, 209, 0.15)', borderColor: '#00CED1', borderWidth: 2, borderDash: [5, 5], pointRadius: 3 
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
            const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: "#FFF5F8", windowWidth: 540, windowHeight: 960 });
            const link = document.createElement('a'); 
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
        const isOshi = document.getElementById('oshi-select').value !== "";
        const relationTitle = isOshi ? st.aishou : st.unmei;
        const memberHash = `#${currentDisplayMember.name_ja.replace(/\s+/g, '')}`;
        const tweetText = `【${st.mbti}${userMbtiStr} ${userTitle}】\n✨ ${relationTitle}${currentDisplayMember.name_ja} (${currentDisplayMember.comp}%)\n\n${st.check}\n👇 ${shareUrl}\n\n#AKB48 #MBTI ${memberHash} #性格診断`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
    });

    document.getElementById('copy-link-btn').addEventListener('click', () => {
        const url = window.location.href; 
        navigator.clipboard.writeText(url).then(() => {
            alert(t('copy_link_success'));
        });
    });
}

function getCurrentResultLabel() {
    return i18nData.mbti_titles?.[userMbtiStr]?.[currentLang] || userMbtiStr || t("cloudUntitledResult");
}

function summarizeMatch(member) {
    if (!member) return null;
    return {
        id: member.id,
        name: member.name_ja,
        nickname: member.nickname || "",
        generation: member.ki || "",
        mbti_type: member.mbti_type || "",
        compatibility: member.comp,
        diffs: member.diffs || {}
    };
}

function buildCurrentResultState() {
    if (!userMbtiStr || !Array.isArray(matchResultsGlobal) || matchResultsGlobal.length === 0) return null;
    const resultLabel = getCurrentResultLabel();
    const topMatches = matchResultsGlobal.slice(0, 3).map(summarizeMatch).filter(Boolean);
    const percentages = { ...userPerc };
    const answerSnapshot = { ...userAnswers };
    const payload = {
        tool: "AKB-MBTI-with-wota",
        type: "fan-personality-result",
        version: 1,
        language: currentLang,
        result_type: "fan_personality_test",
        result_label: resultLabel,
        mbti_code: userMbtiStr,
        user_percentages: percentages,
        top_matches: topMatches,
        display_member_id: currentDisplayMember?.id || matchResultsGlobal[0]?.id || "",
        answers: answerSnapshot,
        matches: matchResultsGlobal,
        url_hash: window.location.hash,
        saved_locally_at: new Date().toISOString()
    };

    return {
        result_type: "fan_personality_test",
        result_label: resultLabel,
        mbti_code: userMbtiStr,
        score_data: {
            percentages,
            top_matches: topMatches
        },
        answers: answerSnapshot,
        payload
    };
}

function setCurrentResultState() {
    const state = buildCurrentResultState();
    if (!state) return null;
    currentResultState = state;
    try {
        localStorage.setItem(LOCAL_RESULT_KEY, JSON.stringify(state.payload));
    } catch (error) {
        console.warn("Could not save local result snapshot:", error);
    }
    return state;
}

function setCloudBusy(isBusy) {
    cloud.busy = isBusy;
    updateCloudUI();
}

function renderCloudMessage(message) {
    const safeMessage = message || "";
    const popoverMessage = document.getElementById("cloudMessage");
    const hubMessage = document.getElementById("cloudHubMessage");
    if (popoverMessage) popoverMessage.textContent = safeMessage;
    if (hubMessage) hubMessage.textContent = safeMessage;
}

function setCloudMessage(message) {
    cloud.messageKey = "";
    cloud.messageVars = {};
    renderCloudMessage(message);
}

function setCloudMessageKey(key, vars = {}) {
    cloud.messageKey = key;
    cloud.messageVars = { ...vars };
    renderCloudMessage(t(key, vars));
}

function refreshCloudMessageLanguage() {
    if (!cloud.messageKey) return;
    renderCloudMessage(t(cloud.messageKey, cloud.messageVars));
}

function getCloudStatusText(statusKey) {
    if (statusKey) return t(statusKey, { count: cloud.records.length });
    if (!cloud.ready) return t("cloudUnavailable");
    if (!cloud.user) return t("cloudLocalOnly");
    return t("cloudSaveAvailable");
}

function renderCloudResults() {
    const list = document.getElementById("cloudResultsList");
    const empty = document.getElementById("cloudResultsEmpty");
    if (!list || !empty) return;

    list.innerHTML = "";
    if (!cloud.ready) {
        empty.hidden = false;
        empty.textContent = t("cloudUnavailable");
        return;
    }
    if (!cloud.user) {
        empty.hidden = false;
        empty.textContent = t("cloudLoginRequiredForResults");
        return;
    }
    if (!cloud.records.length) {
        empty.hidden = false;
        empty.textContent = t("cloudNoResults");
        return;
    }

    empty.hidden = true;
    cloud.records.forEach(record => {
        const payload = normalizeCloudObject(record.payload);
        const label = record.result_label || payload.result_label || t("cloudUntitledResult");
        const code = record.mbti_code || payload.mbti_code || "";
        const topMatch = payload.top_matches?.[0]?.name || "";
        const metaParts = [
            formatCloudTime(record.created_at || record.updated_at),
            topMatch ? t("cloudTopMatch", { name: topMatch }) : ""
        ].filter(Boolean);
        const card = document.createElement("div");
        card.className = "cloud-result-card";
        card.innerHTML = `
            <div class="cloud-result-main">
                <div>
                    <span class="cloud-result-title">${escapeHtml(label)}</span>
                    <span class="cloud-result-meta">${escapeHtml(metaParts.join(" / "))}</span>
                </div>
                <span class="cloud-result-code">${escapeHtml(code || "--")}</span>
            </div>
            <div class="cloud-result-actions">
                <button class="cloud-form-button primary" type="button" data-cloud-action="view" data-id="${escapeHtml(record.id)}">${escapeHtml(t("cloudViewResult"))}</button>
                <button class="cloud-form-button delete" type="button" data-cloud-action="delete" data-id="${escapeHtml(record.id)}">${escapeHtml(t("cloudDeleteResult"))}</button>
            </div>
        `;
        card.querySelectorAll("button").forEach(button => {
            button.disabled = cloud.busy;
        });
        list.appendChild(card);
    });
}

function updateCloudUI(statusKey) {
    if (statusKey) cloud.statusKey = statusKey;
    const loggedIn = Boolean(cloud.user);
    const hasResult = Boolean(currentResultState || (userMbtiStr && matchResultsGlobal.length > 0));
    const statusText = getCloudStatusText(statusKey || cloud.statusKey);

    const cloudStatus = document.getElementById("cloudStatus");
    const cloudHubStatus = document.getElementById("cloudHubStatus");
    if (cloudStatus) cloudStatus.textContent = statusText;
    if (cloudHubStatus) cloudHubStatus.textContent = statusText;

    const form = document.getElementById("cloudLoginForm");
    const actions = document.getElementById("cloudActions");
    if (form) form.hidden = loggedIn || !cloud.ready;
    if (actions) actions.hidden = !loggedIn;

    const userLabel = document.getElementById("cloudUserLabel");
    if (userLabel) userLabel.textContent = loggedIn ? getCloudDisplayName() : "";
    setAccountToggleLabel(loggedIn ? getCloudDisplayName() : t("accountNavGuest"));

    ["cloudNicknameInput", "cloudEmailInput", "cloudPasswordInput", "cloudSignInBtn", "cloudSignUpBtn"].forEach(id => {
        const node = document.getElementById(id);
        if (node) node.disabled = cloud.busy || loggedIn || !cloud.ready;
    });

    const logoutBtn = document.getElementById("cloudLogoutBtn");
    const saveBtn = document.getElementById("cloudSaveCurrentBtn");
    const loadBtn = document.getElementById("cloudLoadResultsBtn");
    if (logoutBtn) logoutBtn.disabled = cloud.busy;
    if (saveBtn) saveBtn.disabled = cloud.busy || !cloud.ready || !loggedIn || !hasResult;
    if (loadBtn) loadBtn.disabled = cloud.busy || !cloud.ready || !loggedIn;

    renderCloudResults();
}

function requireCloudLogin(silent = false) {
    const ok = Boolean(cloud.client && cloud.ready && cloud.user);
    if (!ok && !silent) {
        updateCloudUI("cloudLocalOnly");
        setCloudMessageKey("cloudLoginRequired");
        const popover = document.getElementById("accountPopover");
        const toggle = document.getElementById("accountToggleBtn");
        if (popover && toggle) {
            popover.hidden = false;
            toggle.setAttribute("aria-expanded", "true");
        }
    }
    return ok;
}

async function initCloudSave() {
    updateCloudUI("cloudLocalOnly");
    if (!window.supabase?.createClient) {
        cloud.ready = false;
        updateCloudUI("cloudUnavailable");
        setCloudMessageKey("cloudUnavailable");
        return;
    }

    try {
        cloud.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        });
        cloud.ready = true;
        const { data, error } = await cloud.client.auth.getSession();
        if (error) throw error;
        cloud.user = data.session?.user || null;

        cloud.client.auth.onAuthStateChange(async (_event, session) => {
            cloud.user = session?.user || null;
            cloud.records = [];
            cloud.statusKey = "";
            if (!cloud.user) {
                currentResultCloudId = "";
                setCloudMessageKey("cloudLoggedOut");
                updateCloudUI("cloudLocalOnly");
                return;
            }
            await loadCloudResults({ silent: true });
            setCloudMessageKey("cloudSignedIn");
            updateCloudUI("cloudSaveAvailable");
        });

        if (cloud.user) await loadCloudResults({ silent: true });
        updateCloudUI(cloud.user ? "cloudSaveAvailable" : "cloudLocalOnly");
    } catch (error) {
        console.warn("Cloud Save unavailable:", error);
        cloud.ready = false;
        setCloudMessageKey("cloudUnavailable");
        updateCloudUI("cloudUnavailable");
    }
}

function bindCloudEvents() {
    if (cloudEventsBound) return;
    cloudEventsBound = true;
    const popover = document.getElementById("accountPopover");
    const toggle = document.getElementById("accountToggleBtn");

    toggle?.addEventListener("click", () => {
        if (!popover) return;
        popover.hidden = !popover.hidden;
        toggle.setAttribute("aria-expanded", String(!popover.hidden));
    });

    document.addEventListener("click", event => {
        if (!popover || popover.hidden) return;
        if (popover.contains(event.target) || toggle?.contains(event.target)) return;
        popover.hidden = true;
        toggle?.setAttribute("aria-expanded", "false");
    });

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && popover) {
            popover.hidden = true;
            toggle?.setAttribute("aria-expanded", "false");
        }
    });

    document.getElementById("cloudLoginForm")?.addEventListener("submit", loginCloudAccount);
    document.getElementById("cloudLogoutBtn")?.addEventListener("click", logoutCloudAccount);
    document.getElementById("cloudSaveCurrentBtn")?.addEventListener("click", () => saveCurrentResultToCloud());
    document.getElementById("cloudLoadResultsBtn")?.addEventListener("click", () => loadCloudResults());
    document.getElementById("cloudResultsList")?.addEventListener("click", event => {
        const button = event.target.closest("button[data-cloud-action]");
        if (!button) return;
        const id = button.dataset.id;
        if (button.dataset.cloudAction === "view") loadCloudResult(id);
        if (button.dataset.cloudAction === "delete") deleteCloudResult(id);
    });
}

async function loginCloudAccount(event) {
    event.preventDefault();
    if (!cloud.client) {
        setCloudMessageKey("cloudUnavailable");
        updateCloudUI("cloudUnavailable");
        return;
    }

    const action = event.submitter?.dataset.authAction === "signup" ? "signup" : "signin";
    const nickname = document.getElementById("cloudNicknameInput")?.value.trim() || "";
    const email = document.getElementById("cloudEmailInput")?.value.trim() || "";
    const password = document.getElementById("cloudPasswordInput")?.value || "";

    if (!email || !password) {
        setCloudMessageKey("cloudMissingEmailPassword");
        return;
    }
    if (action === "signup" && !nickname) {
        setCloudMessageKey("cloudMissingSignup");
        return;
    }

    setCloudBusy(true);
    setCloudMessageKey(action === "signup" ? "cloudSigningUp" : "cloudSigningIn");

    let result;
    try {
        result = action === "signup"
            ? await cloud.client.auth.signUp({ email, password, options: { data: { display_name: nickname }, emailRedirectTo: window.location.href } })
            : await cloud.client.auth.signInWithPassword({ email, password });
    } catch (error) {
        result = { error };
    }

    setCloudBusy(false);
    const passwordInput = document.getElementById("cloudPasswordInput");
    if (passwordInput) passwordInput.value = "";

    if (result.error) {
        console.warn(result.error);
        setCloudMessage(result.error.message || t("cloudActionFailed"));
        updateCloudUI("cloudActionFailed");
        return;
    }

    cloud.user = result.data.session?.user || cloud.user;
    setCloudMessageKey(action === "signup" && !result.data.session ? "cloudSignupNeedsConfirm" : "cloudSignedIn");
    if (cloud.user) {
        await loadCloudResults({ silent: true });
        const popover = document.getElementById("accountPopover");
        const toggle = document.getElementById("accountToggleBtn");
        if (popover) popover.hidden = true;
        toggle?.setAttribute("aria-expanded", "false");
    }
    updateCloudUI(cloud.user ? "cloudSaveAvailable" : "cloudLocalOnly");
}

async function logoutCloudAccount() {
    if (!cloud.client) return;
    setCloudBusy(true);
    const { error } = await cloud.client.auth.signOut();
    setCloudBusy(false);
    if (error) {
        console.warn(error);
        setCloudMessage(error.message || t("cloudLogoutFailed"));
        updateCloudUI("cloudActionFailed");
        return;
    }
    cloud.user = null;
    cloud.records = [];
    currentResultCloudId = "";
    setCloudMessageKey("cloudLoggedOut");
    updateCloudUI("cloudLocalOnly");
}

function buildCloudRow() {
    const state = setCurrentResultState();
    if (!state || !cloud.user) return null;
    return {
        user_id: cloud.user.id,
        result_type: state.result_type,
        result_label: state.result_label,
        mbti_code: state.mbti_code,
        score_data: state.score_data,
        answers: state.answers,
        payload: {
            ...state.payload,
            cloud_record_id: currentResultCloudId || null,
            saved_to_cloud_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
    };
}

async function saveCurrentResultToCloud(options = {}) {
    if (!requireCloudLogin(options.silent)) return false;
    const row = buildCloudRow();
    if (!row) {
        if (!options.silent) setCloudMessageKey("cloudNoCurrentResult");
        updateCloudUI("cloudLocalOnly");
        return false;
    }

    setCloudBusy(true);
    let result;
    try {
        result = currentResultCloudId
            ? await cloud.client.from(CLOUD_TABLE).update(row).eq("id", currentResultCloudId).eq("user_id", cloud.user.id).select("id").single()
            : await cloud.client.from(CLOUD_TABLE).insert(row).select("id").single();
    } catch (error) {
        result = { data: null, error };
    }
    setCloudBusy(false);

    if (result.error) {
        console.warn(result.error);
        setCloudMessage(result.error.message || t("cloudSaveFailedLocalKept"));
        updateCloudUI("cloudSaveFailedLocalKept");
        return false;
    }

    currentResultCloudId = result.data.id;
    await loadCloudResults({ silent: true });
    setCloudMessageKey(options.auto ? "cloudAutoSaveSuccess" : "cloudSaveSuccess");
    updateCloudUI("cloudSaved");
    return true;
}

async function autoSaveCurrentResultToCloud() {
    if (!cloud.user || !cloud.ready || !currentResultState) {
        updateCloudUI(cloud.user ? "cloudSaveAvailable" : "cloudLocalOnly");
        return;
    }
    await saveCurrentResultToCloud({ auto: true, silent: true });
}

async function loadCloudResults(options = {}) {
    if (!requireCloudLogin(options.silent)) return;
    setCloudBusy(true);
    let response;
    try {
        response = await cloud.client
            .from(CLOUD_TABLE)
            .select("id,user_id,result_type,result_label,mbti_code,score_data,answers,payload,created_at,updated_at")
            .eq("user_id", cloud.user.id)
            .order("created_at", { ascending: false });
    } catch (error) {
        response = { data: null, error };
    }
    setCloudBusy(false);

    const { data, error } = response;
    if (error) {
        console.warn(error);
        setCloudMessage(error.message || t("cloudActionFailed"));
        updateCloudUI("cloudActionFailed");
        return;
    }

    cloud.records = Array.isArray(data) ? data : [];
    if (!options.silent) setCloudMessageKey("cloudResultsLoaded", { count: cloud.records.length });
    updateCloudUI(options.silent ? undefined : "cloudSaveAvailable");
}

function normalizeCloudObject(value) {
    if (!value) return {};
    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch (_error) {
            return {};
        }
    }
    return typeof value === "object" ? value : {};
}

function findCloudRecord(recordId) {
    return cloud.records.find(record => String(record.id) === String(recordId));
}

function loadCloudResult(recordId) {
    const record = findCloudRecord(recordId);
    if (!record) {
        setCloudMessageKey("cloudNoRecordSelected");
        return;
    }

    const payload = normalizeCloudObject(record.payload);
    const matches = Array.isArray(payload.matches) ? payload.matches : [];
    const percentages = normalizeCloudObject(payload.user_percentages || record.score_data?.percentages);
    const answers = normalizeCloudObject(payload.answers || record.answers);
    const code = record.mbti_code || payload.mbti_code || "";

    if (!matches.length || !code || Object.keys(percentages).length === 0) {
        setCloudMessageKey("cloudActionFailed");
        updateCloudUI("cloudActionFailed");
        return;
    }

    userMbtiStr = code;
    userPerc = percentages;
    userAnswers = answers;
    matchResultsGlobal = matches;
    currentResultCloudId = record.id;

    document.getElementById("page-landing")?.classList.add("hidden");
    document.getElementById("page-quiz")?.classList.add("hidden");
    document.getElementById("page-result")?.classList.remove("hidden");
    renderResultPage(matchResultsGlobal);
    setCloudMessageKey("cloudLoadSuccess");
    updateCloudUI("cloudSaveAvailable");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteCloudResult(recordId) {
    if (!requireCloudLogin()) return;
    const record = findCloudRecord(recordId);
    if (!record) {
        setCloudMessageKey("cloudNoRecordSelected");
        return;
    }

    const label = record.result_label || record.mbti_code || t("cloudUntitledResult");
    if (!window.confirm(t("cloudConfirmDeleteResult", { label }))) return;

    setCloudBusy(true);
    let response;
    try {
        response = await cloud.client
            .from(CLOUD_TABLE)
            .delete()
            .eq("id", record.id)
            .eq("user_id", cloud.user.id);
    } catch (error) {
        response = { error };
    }
    setCloudBusy(false);

    if (response.error) {
        console.warn(response.error);
        setCloudMessage(response.error.message || t("cloudActionFailed"));
        updateCloudUI("cloudActionFailed");
        return;
    }

    if (String(currentResultCloudId) === String(record.id)) currentResultCloudId = "";
    await loadCloudResults({ silent: true });
    setCloudMessageKey("cloudDeleteSuccess");
    updateCloudUI("cloudDeleted");
}

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
            autoSaveCurrentResultToCloud();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            if (bestCompScore >= 85) {
                const giantHeart = document.getElementById('giant-heart-overlay');
                document.body.style.overflow = 'hidden'; 
                giantHeart.classList.remove('hidden');
                giantHeart.style.opacity = '1';
                
                setTimeout(() => {
                    giantHeart.style.opacity = '0';
                    setTimeout(() => {
                        giantHeart.classList.add('hidden');
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
        compText.innerHTML = "0.0%"; 
        
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

function randomInRange(min, max) { return Math.random() * (max - min) + min; }

document.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return; 

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
    
    setTimeout(() => { if(ripple.parentNode) ripple.remove(); }, 600);

    if (typeof confetti !== 'undefined') {
        const petalPath = 'M15 0 Q 30 15 15 40 Q 0 15 15 0 Z';
        const petalShape = confetti.shapeFromPath({ path: petalPath, matrix: [0.4, 0, 0, 0.4, -7.5, -10] });
        const xPercent = e.clientX / window.innerWidth;
        const yPercent = e.clientY / window.innerHeight;

        confetti({
            particleCount: 10, spread: 120, startVelocity: 8, gravity: 0.15, drift: randomInRange(-0.8, 0.8), 
            colors: ['#FFB7C5', '#FFC0CB', '#F8C8DC'], shapes: [petalShape], scalar: randomInRange(0.5, 0.8), 
            origin: { x: xPercent, y: yPercent }, zIndex: 99999, ticks: 350
        });
    }
});

let player; 
let isMusicEnabled = false;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player-container', {
        height: '100%', width: '100%', videoId: 'Aw2NpveLOFs', 
        host: 'https://www.youtube-nocookie.com',
        playerVars: { 'autoplay': 0, 'rel': 0, 'controls': 1, 'modestbranding': 1, 'enablejsapi': 1, 'playsinline': 1 },
        events: { 'onReady': onPlayerReady }
    });
}

function onPlayerReady(event) {
    event.target.mute();
    event.target.playVideo();
    setTimeout(() => {
        if (!isMusicEnabled) {
            event.target.pauseVideo();
            event.target.seekTo(0);
            event.target.unMute();
        }
    }, 5000);
}

function toggleMusic() {
    const wrap = document.getElementById('footer-mv-wrap');
    const btn = document.getElementById('music-toggle-btn');
    const onText = (i18nData.ui.btn_music_on && i18nData.ui.btn_music_on[currentLang]) ? i18nData.ui.btn_music_on[currentLang] : "🎵 名残り桜：開";
    const offText = (i18nData.ui.btn_music_off && i18nData.ui.btn_music_off[currentLang]) ? i18nData.ui.btn_music_off[currentLang] : "🎵 名残り桜：關";

    if (!isMusicEnabled) {
        if (player && typeof player.playVideo === 'function') player.playVideo(); 
        wrap.classList.remove('hidden');
        btn.innerHTML = onText;
        btn.style.background = "rgba(255, 20, 147, 0.15)";
        btn.style.color = "var(--cyber-pink)";
        btn.style.border = "1px solid var(--cyber-pink)";
        isMusicEnabled = true;
    } else {
        if (player && typeof player.pauseVideo === 'function') player.pauseVideo(); 
        wrap.classList.add('hidden');
        btn.innerHTML = offText;
        btn.style.background = "transparent";
        btn.style.color = "var(--text-muted)";
        btn.style.border = "1px solid rgba(255,255,255,0.3)";
        isMusicEnabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const footer = document.getElementById('site-footer');
    const mvWrap = document.getElementById('footer-mv-wrap');

    if ('IntersectionObserver' in window && footer && mvWrap) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    mvWrap.classList.remove('floating-mode');
                    mvWrap.classList.add('docked-mode');
                } else {
                    mvWrap.classList.remove('docked-mode');
                    mvWrap.classList.add('floating-mode');
                }
            });
        }, { root: null, threshold: 0.05 });
        observer.observe(footer);
    }
});

// 定義分組加載成員嘅函數 (已整合多國語言)
async function loadMembers() {
    try {
        const response = await fetch('members.json');
        membersDB = await response.json();

        const groups = {};
        
        // 按 ki (期數) 進行分組
        membersDB.filter(isSelectableMember).forEach(m => { 
            const gen = m.ki || '其他'; 
            if(!groups[gen]) groups[gen] = []; 
            groups[gen].push(m); 
        });

        // 轉化為 HTML optgroup 同 option 字串，儲存備用
        let html = "";
        for (const [gen, mems] of Object.entries(groups)) {
            html += `<optgroup label="${gen}">`;
            mems.forEach(m => {
                html += `<option value="${m.id}">${m.name_ja} (${m.nickname || m.name_ja})</option>`;
            });
            html += `</optgroup>`;
        }
        
        oshiOptionsHTML = html;
        
    } catch (error) { 
        console.error("載入成員資料失敗:", error); 
    }
}
