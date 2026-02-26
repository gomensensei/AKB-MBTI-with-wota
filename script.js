/* =========================================
   2026 AKB48 粉絲深度性格鑑定 - 演算法與視覺終極版
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
            if (currentPage < totalPages - 1) { currentPage++; updateUI(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
            else { calculateResults(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
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
            if(qTextEl && i18nData.questions[i]) qTextEl.innerHTML = `${i}. ${i18nData.questions[i].text[lang]}`; // 支援 <br> 換行
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
// 核心升級：MBTI 餘弦波 (Cosine) 演算法
// 完美解決中間值成員霸榜，並極大化獎勵「極端互補」
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
        E: ((scores.E - 12) / 72) * 100, S: ((scores.S - 12) / 72) * 100, T: ((scores.T - 12) / 72) * 100, J: ((scores.J - 12) / 72) * 100, A: ((scores.A - 12) / 72) * 100
    };
    userMbtiStr = (userPerc.E > 50 ? 'E' : 'I') + (userPerc.S > 50 ? 'S' : 'N') + (userPerc.T > 50 ? 'T' : 'F') + (userPerc.J > 50 ? 'J' : 'P');
    
    let matchResults = membersDB.map(m => {
        let M = m.mbti_scores;
        let diffE = Math.abs(userPerc.E - M.E);
        let diffS = Math.abs(userPerc.S - M.S);
        let diffT = Math.abs(userPerc.T - M.T);
        let diffJ = Math.abs(userPerc.J - M.J);

        // 使用餘弦波函數 (Cosine Wave)：y = 75 + 25 * cos(diff * π / 50)
        // 效果：差距 0 = 100分，差距 100 = 100分，差距 50 = 50分 (精準懲罰半桶水)
        let matchE = 75 + 25 * Math.cos(diffE * Math.PI / 50);
        let matchT = 75 + 25 * Math.cos(diffT * Math.PI / 50);
        let matchJ = 75 + 25 * Math.cos(diffJ * Math.PI / 50);
        
        // S/N 認知功能必須相近才能溝通，保持直線衰減
        let matchS = 100 - diffS; 

        // 總分計算 (S/N 權重略高，因為世界觀不同最容易吵架)
        let baseComp = (matchE + matchS * 1.5 + matchT + matchJ) / 4.5;
        
        // A/T (堅韌度) 互補加成
        if (userPerc.A < 50 && (M.A !== undefined && M.A >= 65)) baseComp += 3;
        
        return { 
            ...m, 
            comp: parseFloat(Math.max(0, Math.min(99.9, baseComp)).toFixed(1)),
            diffs: { E: diffE, S: diffS, T: diffT, J: diffJ }
        };
    });
    
    matchResults.sort((a, b) => b.comp - a.comp);
    matchResultsGlobal = matchResults; 
    localStorage.removeItem('akb_answers'); 
    renderResultPage(matchResults);
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
    // 大於 70 視為極端互補 (除了 S 維度)
    else if (dimKey !== 'S' && diff >= 70) status = "comp"; 
    
    return isShortLabel ? data[status][currentLang] : data[status].desc[currentLang];
}

function renderMainDisplay(member, titleLabel) {
    const mLang = i18nData.members_analysis[member.id];
    const ui = i18nData.ui;
    const cb = `?v=${new Date().getTime()}`;

    return `
        <div style="font-size: 18px; font-weight:bold; margin-bottom: 15px; color: var(--cyber-pink);">${titleLabel}</div>
        <div style="width: 120px; height: 120px; border-radius: 50%; padding: 4px; background: ${getConicGradient(member.colors)}; margin: 0 auto 12px auto;">
            <img crossorigin="anonymous" src="${member.image}${cb}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid white;">
        </div>
        <h3 style="font-size: 22px; margin-bottom: 5px;">${member.name_ja} <span style="font-size:14px; opacity:0.7;">(${member.mbti_type})</span></h3>
        <p style="color: var(--cyber-pink); font-weight: 800; font-size: 24px; margin: 5px 0 10px 0;">${ui.compatibility_label[currentLang] || ''} ${member.comp}%</p>
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
            datasets: [{ 
                data: [userPerc.E, userPerc.S, userPerc.T, userPerc.J, userPerc.A], 
                backgroundColor: 'rgba(255, 20, 147, 0.4)', 
                borderColor: '#FF1493', 
                borderWidth: 3, 
                pointRadius: 4,
                pointBackgroundColor: '#FF1493'
            }]
        },
        options: { 
            scales: { 
                r: { 
                    angleLines: { color: 'rgba(0,0,0,0.1)' }, 
                    grid: { color: 'rgba(0,0,0,0.08)' },
                    ticks: { display: true, stepSize: 20, backdropColor: 'transparent', color: '#999', font: { size: 10 } }, 
                    suggestedMin: 0, 
                    suggestedMax: 100 
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
            if(myRadarChart.data.datasets.length > 1) { myRadarChart.data.datasets.pop(); myRadarChart.update(); }
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

        const oldWidth = container.style.width;
        const oldHeight = container.style.height;
        const oldPos = container.style.position;
        
        container.style.width = "540px";
        container.style.height = "960px";
        container.style.position = "fixed";
        container.style.top = "0";
        container.style.left = "0";
        container.style.zIndex = "9999";
        
        window.scrollTo(0, 0);

        try {
            const canvas = await html2canvas(container, { scale: 2, useCORS: true, backgroundColor: "#fdfcfb", width: 540, height: 960 });
            const link = document.createElement('a');
            link.download = `AKB48_${userMbtiStr}_Result.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } finally {
            webOnly.forEach(el => el.style.display = 'block');
            exportOnly.forEach(el => el.style.display = 'none');
            container.style.width = oldWidth;
            container.style.height = oldHeight;
            container.style.position = oldPos;
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
        
        const st = shareTexts[currentLang] || shareTexts['en'];
        const shareUrl = window.location.href;
        const isOshi = currentDisplayMember.id !== b1.id;
        
        const memberHash = `#${currentDisplayMember.name_ja.replace(/\s+/g, '')}`;
        const relationTitle = isOshi ? st.oshi : st.soulmate;
        const mbtiLine = `【${st.mbti}${userMbtiStr} ${userTitle}】`;
        const matchLine = `💖 ${relationTitle}${currentDisplayMember.name_ja} (${currentDisplayMember.comp}%)`;
        const tags = `#AKB48 #MBTI ${memberHash} #性格鑑定`;
        
        const tweetText = `${mbtiLine}\n${matchLine}\n\n${st.check}\n👇 ${shareUrl}\n\n${tags}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
    });
}
