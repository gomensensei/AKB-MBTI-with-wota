/* =========================================
   2026 AKB48 粉絲深度性格鑑定 - 終極完美版
   ========================================= */

// 1. 全局變數
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
let currentDisplayMember = null; // 用於追蹤當前顯示的成員（Top 1 或神推），以便分享到 X

// 2. 自動偵測語言
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

// 3. 初始化
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

// 4. 語言套用與渲染
function applyLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18nData.ui[key] && i18nData.ui[key][lang]) el.innerHTML = i18nData.ui[key][lang];
    });

    if (!document.getElementById('page-quiz').classList.contains('hidden')) {
        for(let i=1; i<=60; i++) {
            const qTextEl = document.getElementById(`qtext-${i}`);
            if(qTextEl && i18nData.questions[i]) qTextEl.innerText = `${i}. ${i18nData.questions[i].text[lang]}`;
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
            // 修復跨頁滾動 Bug：只有在不是每頁最後一題 (10, 20, 30...) 時才自動向下滑動
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

// 5. 新演算法：相似與互補雙軌制
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

        // 新演算法：E/I, T/F, J/P 極端相似或完全互補皆為高分；S/N 認知功能差異大容易誤解，需極度相似
        let matchE = 100 - Math.min(diffE, 100 - diffE) * 1.5;
        let matchT = 100 - Math.min(diffT, 100 - diffT) * 1.2;
        let matchJ = 100 - Math.min(diffJ, 100 - diffJ) * 1.2;
        let matchS = 100 - diffS; 

        let baseComp = (matchE + matchS * 2 + matchT + matchJ) / 5;
        
        // 堅韌度互補加成
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

// 6. 維度文字分析器
function getDimDetail(diff, dimKey, isShortLabel = false) {
    const data = i18nData.dim_analysis?.[dimKey];
    if (!data) return ""; // 防呆
    
    let status = "neutral";
    if (diff <= 25) status = "sim"; // 差距小 = 相似共鳴
    else if (dimKey !== 'S' && diff >= 70) status = "comp"; // 差距大 = 完美互補 (除了S)
    
    return isShortLabel ? data[status][currentLang] : data[status].desc[currentLang];
}

// 7. 動態生成主視圖 (共用給 Best 1 與神推)
function renderMainDisplay(member, titleLabel) {
    const mLang = i18nData.members_analysis[member.id];
    const ui = i18nData.ui;
    const cb = `?v=${new Date().getTime()}`; // 解決圖片 CORS 快取問題

    return `
        <div style="font-size: 18px; font-weight:bold; margin-bottom: 12px; color: var(--cyber-pink);">${titleLabel}</div>
        <div style="width: 110px; height: 110px; border-radius: 50%; padding: 4px; background: ${getConicGradient(member.colors)}; margin: 0 auto 10px auto;">
            <img crossorigin="anonymous" src="${member.image}${cb}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid white;">
        </div>
        <h3 style="font-size: 20px;">${member.name_ja} <span style="font-size:14px; opacity:0.7;">(${member.mbti_type})</span></h3>
        <p style="color: var(--cyber-pink); font-weight: 800; font-size: 22px; margin: 5px 0;">${ui.compatibility_label[currentLang] || ''} ${member.comp}%</p>
        <div class="dark-badge">${mLang.title[currentLang]}</div>
        
        <div class="export-only" style="display: none; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 15px;">
            <div style="background: #fdf2f7; color: #d63384; padding: 6px; border-radius: 8px; font-size: 12px; font-weight: bold;">${getDimDetail(member.diffs.E, 'E', true)}</div>
            <div style="background: #fdf2f7; color: #d63384; padding: 6px; border-radius: 8px; font-size: 12px; font-weight: bold;">${getDimDetail(member.diffs.S, 'S', true)}</div>
            <div style="background: #fdf2f7; color: #d63384; padding: 6px; border-radius: 8px; font-size: 12px; font-weight: bold;">${getDimDetail(member.diffs.T, 'T', true)}</div>
            <div style="background: #fdf2f7; color: #d63384; padding: 6px; border-radius: 8px; font-size: 12px; font-weight: bold;">${getDimDetail(member.diffs.J, 'J', true)}</div>
        </div>

        <div class="web-only" style="text-align: left; margin-top: 15px; font-size: 13px; color: #444; border-top: 1px solid #eee; padding-top: 15px;">
            <p style="margin-bottom:10px;"><strong>E/I:</strong> <span style="color: var(--cyber-pink); font-weight:bold;">${getDimDetail(member.diffs.E, 'E', true)}</span> - ${getDimDetail(member.diffs.E, 'E', false)}</p>
            <p style="margin-bottom:10px;"><strong>S/N:</strong> <span style="color: var(--cyber-pink); font-weight:bold;">${getDimDetail(member.diffs.S, 'S', true)}</span> - ${getDimDetail(member.diffs.S, 'S', false)}</p>
            <p style="margin-bottom:10px;"><strong>T/F:</strong> <span style="color: var(--cyber-pink); font-weight:bold;">${getDimDetail(member.diffs.T, 'T', true)}</span> - ${getDimDetail(member.diffs.T, 'T', false)}</p>
            <p style="margin-bottom:15px;"><strong>J/P:</strong> <span style="color: var(--cyber-pink); font-weight:bold;">${getDimDetail(member.diffs.J, 'J', true)}</span> - ${getDimDetail(member.diffs.J, 'J', false)}</p>
            
            <div style="background: rgba(255, 20, 147, 0.05); border-left: 4px solid var(--cyber-pink); border-radius: 4px; padding: 12px;">
                <strong>${ui.deep_analysis_label[currentLang]}</strong>${mLang.analysis[currentLang]}
            </div>
        </div>
    `;
}

// 8. 總成與渲染頁面
function renderResultPage(allMembers) {
    document.getElementById('page-quiz').classList.add('hidden');
    const resPage = document.getElementById('page-result');
    resPage.classList.remove('hidden');

    let b1 = allMembers[0], b2 = allMembers[1], b3 = allMembers[2];
    currentDisplayMember = b1; // 預設顯示 Top 1

    let userTitle = i18nData.mbti_titles[userMbtiStr]?.[currentLang] || userMbtiStr;
    let ui = i18nData.ui;
    const cb = `?v=${new Date().getTime()}`;

    const content = document.getElementById('result-content');
    content.innerHTML = `
        <div id="export-container" style="background: linear-gradient(135deg, #fdfcfb, #f0e6ea); width: 100%; max-width: 400px; margin: 0 auto; overflow: hidden; border-radius: 16px;">
            <div id="export-card" style="padding: 30px 20px; position: relative;">
                <div class="landing-header" style="text-align:center; margin-bottom: 20px;">
                    <span class="subtitle">${ui.result_subtitle[currentLang]}</span>
                    <h2 style="font-size: 32px; color: var(--cyber-pink); margin-top:5px; margin-bottom:0;">${userMbtiStr}</h2>
                    <h3 style="font-size: 16px; color: var(--text-main); margin-top:0;">${userTitle}</h3>
                </div>
                
                <div style="position: relative; width: 220px; margin: 0 auto 10px auto;">
                    <canvas id="radarChart"></canvas>
                </div>

                <div id="main-display-section" style="background: white; border: 2px solid var(--sakura-light); border-radius: 20px; padding: 20px; text-align: center; box-shadow: 0 10px 25px rgba(255,20,147,0.1);">
                    ${renderMainDisplay(b1, ui.soulmate_title[currentLang])}
                </div>
            </div>
        </div>

        <div id="web-best-list" class="web-only" style="margin-top: 20px;">
            <div style="background: rgba(255,255,255,0.7); border: 1px dashed var(--sakura-light); padding: 15px; border-radius: 12px; margin-bottom: 10px; display: flex; align-items: center;">
                <img crossorigin="anonymous" src="${b2.image}${cb}" style="width:50px; height:50px; border-radius:50%; margin-right:15px; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <div>
                    <div style="font-size:12px; color: #888;">${ui.partner_title[currentLang]} (${b2.comp}%)</div>
                    <div style="font-size:16px; font-weight:bold;">${b2.name_ja} <span style="font-size:12px; color:var(--cyber-pink);">${b2.mbti_type}</span></div>
                </div>
            </div>
            <div style="background: rgba(255,255,255,0.7); border: 1px dashed var(--sakura-light); padding: 15px; border-radius: 12px; display: flex; align-items: center;">
                <img crossorigin="anonymous" src="${b3.image}${cb}" style="width:50px; height:50px; border-radius:50%; margin-right:15px; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
                <div>
                    <div style="font-size:12px; color: #888;">${ui.rival_title[currentLang]} (${b3.comp}%)</div>
                    <div style="font-size:16px; font-weight:bold;">${b3.name_ja} <span style="font-size:12px; color:var(--cyber-pink);">${b3.mbti_type}</span></div>
                </div>
            </div>
        </div>

        <div class="web-only" style="margin-top: 25px; background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <h4 style="margin-bottom: 10px; text-align:center;">${ui.select_oshi_label[currentLang]}</h4>
            <select id="oshi-select" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ccc; font-family: var(--font-jp); font-size:16px;">
                <option value="">${ui.select_oshi_default[currentLang]}</option>
                ${[...allMembers].sort((a,b)=>a.ki.localeCompare(b.ki)).map(m => `<option value="${m.id}">${m.name_ja} (${m.ki})</option>`).join('')}
            </select>
        </div>

        <div id="back-to-best3-container" class="web-only" style="display: none; margin-top: 15px;">
            <button id="back-to-best3-btn" class="cyber-btn" style="background: #e0e0e0; color: #333; box-shadow: none;">${ui.btn_back_best3[currentLang]}</button>
        </div>

        <div class="web-only result-actions" style="display: flex; gap: 10px; margin-top: 20px;">
            <button id="download-btn" class="cyber-btn" style="flex: 1; background: #2d3436;">${ui.btn_download[currentLang]}</button>
            <button id="share-x-btn" class="cyber-btn" style="flex: 1; background: #000; color: #fff;">𝕏 Share</button>
        </div>
    `;

    // 繪製雷達圖
    if(myRadarChart) myRadarChart.destroy();
    const ctx = document.getElementById('radarChart').getContext('2d');
    myRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ui.radar_labels[currentLang],
            datasets: [{ label: 'You', data: [userPerc.E, userPerc.S, userPerc.T, userPerc.J, userPerc.A], backgroundColor: 'rgba(255, 20, 147, 0.4)', borderColor: '#FF1493', borderWidth: 2, pointRadius: 0 }]
        },
        options: { scales: { r: { angleLines: { display: false }, ticks: { display: false }, suggestedMin: 0, suggestedMax: 100 } }, plugins: { legend: { display: false } } }
    });

    // 選擇神推事件
    document.getElementById('oshi-select').addEventListener('change', (e) => {
        const oshiId = e.target.value;
        const bestList = document.getElementById('web-best-list');
        const backBtnCont = document.getElementById('back-to-best3-container');
        const mainSection = document.getElementById('main-display-section');
        
        if (!oshiId) { 
            // 恢復顯示 Top 1
            currentDisplayMember = b1;
            mainSection.innerHTML = renderMainDisplay(b1, ui.soulmate_title[currentLang]);
            bestList.style.display = 'block'; 
            backBtnCont.style.display = 'none';
            if(myRadarChart.data.datasets.length > 1) { myRadarChart.data.datasets.pop(); myRadarChart.update(); }
            return; 
        }
        
        // 切換為神推分析
        const oshi = allMembers.find(m => m.id === oshiId);
        currentDisplayMember = oshi;
        mainSection.innerHTML = renderMainDisplay(oshi, ui.oshi_analysis_title[currentLang]);
        bestList.style.display = 'none'; 
        backBtnCont.style.display = 'block';
        
        myRadarChart.data.datasets[1] = { label: oshi.name_ja, data: [oshi.mbti_scores.E, oshi.mbti_scores.S, oshi.mbti_scores.T, oshi.mbti_scores.J, oshi.mbti_scores.A || 50], backgroundColor: 'rgba(0, 206, 209, 0.1)', borderColor: '#00CED1', borderWidth: 2, borderDash: [5, 5], pointBackgroundColor: '#00CED1' };
        myRadarChart.update();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('back-to-best3-btn').addEventListener('click', () => {
        document.getElementById('oshi-select').value = "";
        document.getElementById('oshi-select').dispatchEvent(new Event('change'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // 完美 4:5 匯出截圖功能
    document.getElementById('download-btn').addEventListener('click', async () => {
        const container = document.getElementById('export-container');
        const webOnly = document.querySelectorAll('.web-only');
        const exportOnly = document.querySelectorAll('.export-only');
        
        // 儲存原始 display 狀態，然後切換
        const webOriginals = Array.from(webOnly).map(el => el.style.display);
        webOnly.forEach(el => el.style.display = 'none');
        exportOnly.forEach(el => el.style.display = 'grid'); // 顯示簡約標籤
        
        // 強制鎖定 4:5 (400px x 500px)
        const oldWidth = container.style.width;
        const oldHeight = container.style.height;
        container.style.width = "400px";
        container.style.height = "500px";
        
        const canvas = await html2canvas(container, { 
            scale: 3, 
            useCORS: true, 
            backgroundColor: "#fdfcfb",
            width: 400,
            height: 500
        });

        // 恢復網頁原狀
        webOnly.forEach((el, i) => el.style.display = webOriginals[i]);
        exportOnly.forEach(el => el.style.display = 'none');
        container.style.width = oldWidth;
        container.style.height = oldHeight;

        const link = document.createElement('a');
        link.download = `AKB48_${userMbtiStr}_Result.png`;
        link.href = canvas.toDataURL();
        link.click();
    });

    // 𝕏 Share 功能 (動態帶入目前顯示的成員名稱與契合度)
    document.getElementById('share-x-btn').addEventListener('click', () => {
        const shareUrl = window.location.href;
        const isOshi = currentDisplayMember.id !== b1.id;
        
        // 根據目前畫面是看 Top 1 還是看神推，給予不同的宣傳語
        const relationTitle = isOshi ? "我的神推相性是" : "我的靈魂伴侶是";
        const mbtiLine = `【我的追星人格：${userMbtiStr} ${userTitle}】`;
        const matchLine = `💖 ${relationTitle}：${currentDisplayMember.name_ja} (${currentDisplayMember.comp}% 契合度)`;
        const tags = `#AKB48 #MBTI #性格鑑定`;
        
        const tweetText = `${mbtiLine}\n${matchLine}\n\n測測你的 AKB48 靈魂成員：\n👇 ${shareUrl}\n\n${tags}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
    });
}
