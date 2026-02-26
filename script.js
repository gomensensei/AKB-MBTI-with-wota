/* =========================================
   2026 AKB48 粉絲深度性格鑑定 (無後端・多語言終極版)
   ========================================= */

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
let matchResultsGlobal = []; 

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [memRes, langRes] = await Promise.all([
            fetch('./members.json'),
            fetch('./langs.json')
        ]);
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

        // 防呆寫法：確保有 lang-switcher 先綁定
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

    // 防呆寫法：確保有 start-btn 先綁定
    const startBtn = document.getElementById('start-btn');
    if(startBtn) {
        startBtn.addEventListener('click', () => {
            document.getElementById('page-landing').classList.add('hidden');
            document.getElementById('page-quiz').classList.remove('hidden');
            renderQuiz();
            setTimeout(updateUI, 50); 
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    document.getElementById('prev-btn')?.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            updateUI();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    document.getElementById('next-btn')?.addEventListener('click', () => {
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
});

function applyLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18nData.ui[key] && i18nData.ui[key][lang]) {
            el.innerHTML = i18nData.ui[key][lang];
        }
    });

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

    let firstUnanswered = 1;
    for(let i=1; i<=60; i++) {
        if(userAnswers[i] === undefined) { firstUnanswered = i; break; }
    }
    const targetBox = document.getElementById(`qbox-${firstUnanswered}`);
    if (targetBox) targetBox.classList.add('active');
}

// 修正 handleSlider：確保進度條即時更新 + 題目亮起
function handleSlider(e) {
    if (e.target.tagName === 'INPUT' && e.target.type === 'range') {
        const slider = e.target;
        slider.classList.add('touched');
        const qId = parseInt(slider.id.replace('q', ''));
        
        // 1. 存入答案
        userAnswers[qId] = parseInt(slider.value);
        localStorage.setItem('akb_answers', JSON.stringify(userAnswers));
        
        // 2. 立即更新進度條與文字 (解決進度條沒計算的問題)
        updateProgress();
        checkPageCompletion();

        // 3. 強制解鎖下一題 (CSS 會處理亮起動畫)
        const nextBox = document.getElementById(`qbox-${qId + 1}`);
        if (nextBox) {
            nextBox.classList.add('active');
        }

        // 4. 當放開滑桿時捲動
        if (e.type === 'change') {
            if (nextBox) {
                setTimeout(() => {
                    nextBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        }
    }
}

/* --- 修改後的鼠標控制邏輯 (包含手機淡出) --- */
const cursor = document.getElementById('custom-cursor');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    // 移動時恢復顯示
    cursor.classList.remove('hidden');
});

document.addEventListener('click', (e) => {
    // 點擊後顯示水滴效果... (保留原本代碼)
    
    // 點擊後鼠標點淡出，直至下次點擊或移動
    setTimeout(() => {
        cursor.classList.add('hidden');
    }, 600); // 反應完畢後淡出
});

// 手機觸碰時也適用
document.addEventListener('touchstart', () => {
    cursor.classList.remove('hidden');
});

document.addEventListener('touchend', () => {
    setTimeout(() => {
        cursor.classList.add('hidden');
    }, 1000);
});

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

function renderResultPage(allMembers) {
    document.getElementById('page-quiz').classList.add('hidden');
    const resPage = document.getElementById('page-result');
    resPage.classList.remove('hidden');

    let b1 = allMembers[0], b2 = allMembers[1], b3 = allMembers[2];
    
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
                            <img crossorigin="anonymous" src="${b2.image}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 2px solid white;">
                        </div>
                        <div style="margin-left: 15px;">
                            <div style="font-size: 14px; color: #888;">${ui.partner_title[currentLang]} (${b2.comp}%)</div>
                            <div style="font-size: 16px; font-weight:bold;">${b2.name_ja} <span style="font-size:12px;color:var(--cyber-pink);">${b2.mbti_type}</span></div>
                        </div>
                    </div>
                    <ul style="font-size: 12px; color: #555; line-height: 1.5; padding-left: 15px; margin-top: 5px;">
                        ${b2_lang.traits[currentLang].map(t => `<li style="margin-bottom:4px;">${t}</li>`).join('')}
                    </ul>
                </div>

                <div style="background: rgba(255,255,255,0.8); border-radius: 12px; padding: 15px;">
                    <div style="display:flex; align-items:center; margin-bottom: 10px;">
                        <div style="width: 60px; height: 60px; border-radius: 50%; padding: 3px; background: ${getConicGradient(b3.colors)}; flex-shrink:0;">
                            <img crossorigin="anonymous" src="${b3.image}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 2px solid white;">
                        </div>
                        <div style="margin-left: 15px;">
                            <div style="font-size: 14px; color: #888;">${ui.rival_title[currentLang]} (${b3.comp}%)</div>
                            <div style="font-size: 16px; font-weight:bold;">${b3.name_ja} <span style="font-size:12px;color:var(--cyber-pink);">${b3.mbti_type}</span></div>
                        </div>
                    </div>
                    <ul style="font-size: 12px; color: #555; line-height: 1.5; padding-left: 15px; margin-top: 5px;">
                        ${b3_lang.traits[currentLang].map(t => `<li style="margin-bottom:4px;">${t}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div id="oshi-analysis-section" style="display:none; background: rgba(255,255,255,0.9); border-radius: 16px; padding: 20px; text-align: center; border: 2px solid var(--cyber-pink); margin-top:15px;">
                <div style="font-size: 18px; font-weight:bold; margin-bottom: 15px;">${ui.oshi_analysis_title[currentLang]}</div>
                <div id="oshi-avatar-container" style="width: 110px; height: 110px; border-radius: 50%; padding: 4px; margin: 0 auto 10px auto;">
                    <img id="oshi-img" crossorigin="anonymous" src="" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid white;">
                </div>
                <h3 id="oshi-name" style="font-size: 20px;"></h3>
                <p id="oshi-comp" style="color: var(--cyber-pink); font-weight: bold; font-size: 18px; margin: 5px 0;"></p>
                <div id="oshi-badge" class="dark-badge"></div>
                
                <ul id="oshi-traits" style="font-size: 13px; color: #444; line-height: 1.6; text-align:left; margin-top:15px; padding-left:20px; list-style-type: disc;"></ul>
                <div id="oshi-deep-analysis" style="font-size: 13px; color: #444; line-height: 1.6; text-align:left; margin-top: 15px; padding: 12px; background: rgba(255, 20, 147, 0.05); border-left: 4px solid var(--cyber-pink); border-radius: 4px;"></div>
            </div>
        </div>

        <div style="margin-top: 25px; background: white; border-radius: 16px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
            <h4 style="margin-bottom: 10px; text-align:center;">${ui.select_oshi_label[currentLang]}</h4>
            <select id="oshi-select" style="width: 100%; padding: 12px; border-radius: 8px; border: 1px solid #ccc; font-family: var(--font-jp); font-size:16px;">
                <option value="">${ui.select_oshi_default[currentLang]}</option>
                ${allMembers.sort((a,b)=>a.ki.localeCompare(b.ki)).map(m => `<option value="${m.id}">${m.name_ja} (${m.ki})</option>`).join('')}
            </select>
        </div>

        <div id="back-to-best3-container" style="display: none; margin-top: 15px;">
            <button id="back-to-best3-btn" class="cyber-btn" style="background: #e0e0e0; color: #333; box-shadow: none;">${ui.btn_back_best3[currentLang]}</button>
        </div>

        <div class="result-actions" style="display: flex; gap: 10px; margin-top: 20px;">
            <button id="download-btn" class="cyber-btn" style="flex: 1; background: #2d3436;">${ui.btn_download[currentLang]}</button>
            <button id="share-x-btn" class="cyber-btn" style="flex: 1; background: #000; color: #fff;">𝕏 Share</button>
        </div>
    `;

    if(myRadarChart) myRadarChart.destroy();
    const ctx = document.getElementById('radarChart').getContext('2d');
    myRadarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ui.radar_labels[currentLang],
            datasets: [{
                label: ui.radar_user_label[currentLang],
                data: [userPerc.E, userPerc.S, userPerc.T, userPerc.J, userPerc.A],
                backgroundColor: 'rgba(255, 20, 147, 0.4)',
                borderColor: '#FF1493', borderWidth: 2, pointBackgroundColor: '#FF1493'
            }]
        },
        options: { scales: { r: { angleLines: { color: 'rgba(0,0,0,0.1)' }, suggestedMin: 0, suggestedMax: 100 } }, plugins: { legend: { display: false } } }
    });

    document.getElementById('oshi-select').addEventListener('change', (e) => {
        const oshiId = e.target.value;
        const b3Sec = document.getElementById('best3-section');
        const oshiSec = document.getElementById('oshi-analysis-section');
        const backBtnCont = document.getElementById('back-to-best3-container');
        
        if (!oshiId) { 
            b3Sec.style.display = 'block'; oshiSec.style.display = 'none'; backBtnCont.style.display = 'none';
            if(myRadarChart.data.datasets.length > 1) { myRadarChart.data.datasets.pop(); myRadarChart.update(); }
            return; 
        }
        
        const oshi = allMembers.find(m => m.id === oshiId);
        const oshiLang = i18nData.members_analysis[oshiId];
        b3Sec.style.display = 'none'; oshiSec.style.display = 'block'; backBtnCont.style.display = 'block';
        
        document.getElementById('oshi-avatar-container').style.background = getConicGradient(oshi.colors);
        document.getElementById('oshi-img').src = oshi.image;
        document.getElementById('oshi-name').innerHTML = `${oshi.name_ja} <span style="font-size:14px;">(${oshi.mbti_type})</span>`;
        document.getElementById('oshi-comp').innerText = `${ui.compatibility_label[currentLang]}${oshi.comp}%`;
        document.getElementById('oshi-badge').innerText = oshiLang.title[currentLang];
        document.getElementById('oshi-traits').innerHTML = oshiLang.traits[currentLang].map(t => `<li style="margin-bottom:6px;">${t}</li>`).join('');
        document.getElementById('oshi-deep-analysis').innerHTML = `<strong>${ui.deep_analysis_label[currentLang]}</strong>${oshiLang.analysis[currentLang]}`;

        myRadarChart.data.datasets[1] = {
            label: oshi.name_ja, data: [oshi.mbti_scores.E, oshi.mbti_scores.S, oshi.mbti_scores.T, oshi.mbti_scores.J, oshi.mbti_scores.A || 50],
            backgroundColor: 'rgba(0, 206, 209, 0.2)', borderColor: '#00CED1', borderWidth: 2, borderDash: [5, 5], pointBackgroundColor: '#00CED1'
        };
        myRadarChart.update();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('back-to-best3-btn').addEventListener('click', () => {
        document.getElementById('oshi-select').value = "";
        document.getElementById('oshi-select').dispatchEvent(new Event('change'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('download-btn').addEventListener('click', () => {
        const card = document.getElementById('export-card');
        const originalBg = card.style.background;
        const originalShadow = card.style.boxShadow;
        
        card.style.background = 'linear-gradient(135deg, #fdfcfb, #f0e6ea)';
        card.style.backdropFilter = 'none';
        card.style.boxShadow = 'none'; 

        setTimeout(() => {
            html2canvas(card, { scale: 2, useCORS: true, backgroundColor: "#ffffff" }).then(canvas => {
                let link = document.createElement('a');
                link.download = `AKB48_Result_${userMbtiStr}.png`;
                link.href = canvas.toDataURL();
                link.click();
                
                card.style.background = originalBg;
                card.style.backdropFilter = 'blur(12px)';
                card.style.boxShadow = originalShadow;
            });
        }, 100);
    });

    document.getElementById('share-x-btn').addEventListener('click', async () => {
        const card = document.getElementById('export-card');
        const originalBg = card.style.background;
        const originalShadow = card.style.boxShadow;
        
        card.style.background = 'linear-gradient(135deg, #fdfcfb, #f0e6ea)';
        card.style.backdropFilter = 'none';
        card.style.boxShadow = 'none'; 

        const tweetText = `${ui.result_subtitle[currentLang]} | ${userMbtiStr} ${userTitle}\n#AKB48 #MBTI #AKB48性格鑑定`;
        const shareUrl = window.location.href;

        setTimeout(async () => {
            const canvas = await html2canvas(card, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
            
            card.style.background = originalBg;
            card.style.backdropFilter = 'blur(12px)';
            card.style.boxShadow = originalShadow;

            canvas.toBlob(async (blob) => {
                const file = new File([blob], "result.png", { type: "image/png" });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({ files: [file], title: 'AKB48 Personality Test', text: tweetText });
                    } catch (err) { console.error("Share failed:", err); }
                } else {
                    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
                    window.open(twitterUrl, '_blank');
                    alert(currentLang === 'zh-HK' ? "請手動附加剛剛下載的圖片！" : "Please attach the image manually!");
                }
            }, 'image/png');
        }, 100);
    });
}



