/* =========================================
   2026 AKB48 粉絲深度性格鑑定 - 最終修正版
   ========================================= */

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

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [memRes, langRes] = await Promise.all([
            fetch('./members.json'),
            fetch('./langs.json')
        ]);
        membersDB = await memRes.json();
        i18nData = await langRes.json();
        
        // 載入進度
        const saved = localStorage.getItem('akb_answers');
        if (saved) {
            userAnswers = JSON.parse(saved);
        }

        const langBtn = document.getElementById('lang-switcher');
        if(langBtn) {
            langBtn.addEventListener('change', (e) => {
                currentLang = e.target.value;
                applyLanguage(currentLang);
            });
        }

        applyLanguage(currentLang);

    } catch (e) {
        console.error("載入 JSON 失敗:", e);
    }

    // 事件綁定
    document.getElementById('start-btn')?.addEventListener('click', () => {
        document.getElementById('page-landing').classList.add('hidden');
        document.getElementById('page-quiz').classList.remove('hidden');
        renderQuiz();
        setTimeout(updateUI, 50); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('prev-btn')?.addEventListener('click', () => {
        if (currentPage > 0) { currentPage--; updateUI(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    });

    document.getElementById('next-btn')?.addEventListener('click', () => {
        if (!document.getElementById('next-btn').disabled) {
            if (currentPage < totalPages - 1) { currentPage++; updateUI(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
            else { calculateResults(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
        }
    });
});

// 修正：handleSlider 確保進度條即時更新 + 亮起下一題
function handleSlider(e) {
    if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
        const slider = e.target;
        slider.classList.add('touched');
        const qId = parseInt(slider.id.replace('q', ''));
        
        // 儲存答案
        userAnswers[qId] = parseInt(slider.value);
        localStorage.setItem('akb_answers', JSON.stringify(userAnswers));
        
        // 1. 即時更新進度條文字與 Bar
        updateProgress();
        checkPageCompletion();

        // 2. 強制解鎖並亮起下一題 (CSS 會處理動畫)
        const nextBox = document.getElementById(`qbox-${qId + 1}`);
        if (nextBox) {
            nextBox.classList.add('active');
        }

        // 3. 放手時自動捲動
        if (e.type === 'change' && nextBox) {
            setTimeout(() => {
                nextBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }
}

function updateProgress() {
    const count = Object.keys(userAnswers).length;
    const progText = document.getElementById('progress-text');
    const progBar = document.getElementById('progress-bar');
    if(progText) progText.textContent = `${count}/60`;
    if(progBar) progBar.style.width = `${(count / 60) * 100}%`;
}

function applyLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18nData.ui[key] && i18nData.ui[key][lang]) el.innerHTML = i18nData.ui[key][lang];
    });
    if (!document.getElementById('page-quiz').classList.contains('hidden')) {
        for(let i=1; i<=60; i++) {
            const qEl = document.getElementById(`qtext-${i}`);
            if(qEl) qEl.innerText = `${i}. ${i18nData.questions[i].text[lang]}`;
        }
        updateUI(); 
    }
    if (!document.getElementById('page-result').classList.contains('hidden')) renderResultPage(matchResultsGlobal);
}

function renderQuiz() {
    const track = document.getElementById('quiz-track');
    track.innerHTML = '';
    for (let p = 0; p < totalPages; p++) {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'quiz-page';
        for (let i = p * 10 + 1; i <= (p + 1) * 10; i++) {
            const qData = i18nData.questions[i];
            const qDiv = document.createElement('div');
            qDiv.className = 'question-item';
            qDiv.id = `qbox-${i}`;
            if (userAnswers[i] !== undefined) qDiv.classList.add('active');
            
            qDiv.innerHTML = `
                <div class="question-text" id="qtext-${i}">${i}. ${qData.text[currentLang]}</div>
                <div class="slider-container">
                    <input type="range" class="custom-range ${userAnswers[i]?'touched':''}" id="q${i}" min="1" max="7" value="${userAnswers[i]||4}">
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
    
    // 首題預設亮起
    const firstQ = document.getElementById(`qbox-${currentPage * 10 + 1}`);
    if (firstQ) firstQ.classList.add('active');
    updateProgress();
}

function checkPageCompletion() {
    const start = currentPage * 10 + 1;
    let ok = true;
    for (let i = start; i < start + 10; i++) { if (i <= 60 && !userAnswers[i]) { ok = false; break; } }
    const nBtn = document.getElementById('next-btn');
    if(nBtn) { nBtn.disabled = !ok; nBtn.classList.toggle('disabled', !ok); }
}

function updateUI() {
    const track = document.getElementById('quiz-track');
    if(track) track.style.transform = `translateX(-${(currentPage * 100) / totalPages}%)`;
    const pBtn = document.getElementById('prev-btn');
    if(pBtn) { pBtn.disabled = (currentPage === 0); pBtn.classList.toggle('disabled', (currentPage === 0)); }
    const nBtn = document.getElementById('next-btn');
    if(nBtn) nBtn.textContent = (currentPage === totalPages - 1) ? i18nData.ui.btn_result[currentLang] : i18nData.ui.btn_next[currentLang];
    checkPageCompletion();
}

// 計算邏輯與渲染結果頁 (簡化版，確保不報錯)
function calculateResults() {
    let scores = { E: 0, S: 0, T: 0, J: 0, A: 0 };
    for (let i = 1; i <= 60; i++) {
        const q = i18nData.questions[i];
        let v = userAnswers[i] || 4;
        if (q.rev) v = 8 - v;
        scores[q.dim] += v;
    }
    userPerc = { E: ((scores.E-12)/72)*100, S: ((scores.S-12)/72)*100, T: ((scores.T-12)/72)*100, J: ((scores.J-12)/72)*100, A: ((scores.A-12)/72)*100 };
    userMbtiStr = (userPerc.E > 50 ? 'E' : 'I') + (userPerc.S > 50 ? 'S' : 'N') + (userPerc.T > 50 ? 'T' : 'F') + (userPerc.J > 50 ? 'J' : 'P');
    
    matchResultsGlobal = membersDB.map(m => {
        let d2 = Math.pow(userPerc.E-m.mbti_scores.E, 2) + Math.pow(userPerc.S-m.mbti_scores.S, 2) + Math.pow(userPerc.T-m.mbti_scores.T, 2) + Math.pow(userPerc.J-m.mbti_scores.J, 2);
        return { ...m, comp: parseFloat(Math.min(99.9, 100 * Math.exp(-d2/5000)).toFixed(1)) };
    }).sort((a,b) => b.comp - a.comp);
    
    renderResultPage(matchResultsGlobal);
}

function renderResultPage(allMembers) {
    document.getElementById('page-quiz').classList.add('hidden');
    document.getElementById('page-result').classList.remove('hidden');
    const b1 = allMembers[0];
    const b1_l = i18nData.members_analysis[b1.id];
    document.getElementById('result-content').innerHTML = `
        <div id="export-card" class="glass-panel">
            <h2 style="text-align:center; color:var(--cyber-pink);">${userMbtiStr}</h2>
            <div style="text-align:center; margin-bottom:20px;">
                <img src="${b1.image}" style="width:120px; height:120px; border-radius:50%; border:3px solid var(--cyber-pink);">
                <h3>Soulmate: ${b1.name_ja}</h3>
                <p>${b1_l.analysis[currentLang]}</p>
            </div>
        </div>
        <button onclick="location.reload()" class="cyber-btn">再測一次</button>
    `;
}

/* --- 鼠標優化邏輯 (解決手機干擾 + 淡出) --- */
const cursor = document.getElementById('custom-cursor');
document.addEventListener('mousemove', (e) => {
    if(window.innerWidth > 768) {
        cursor.style.opacity = "1";
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
});

document.addEventListener('click', (e) => {
    // 點擊後淡出
    cursor.classList.add('fade-out');
    setTimeout(() => { cursor.style.opacity = "0"; cursor.classList.remove('fade-out'); }, 500);
    
    // 水滴效果
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
});
