let words = [];
let currentWordIndex = 0;
let isPlaying = false;
let timeout;
let startTime = 0;
let totalPauseDuration = 0;
let pauseStart = 0;
let baseInterval = 60000 / 300;
let pausesEnabled = false;

const elements = {
    fileInput: document.getElementById('fileInput'),
    wpmSlider: document.getElementById('wpmSlider'),
    playPause: document.getElementById('playPause'),
    replay: document.getElementById('replay'),
    stats: document.getElementById('stats'),
    pauseToggle: document.getElementById('pauseToggle'),
    themeToggle: document.getElementById('themeToggle'),
    fastReverse: document.getElementById('fastReverse'),
    progressBar: document.getElementById('progressBar')
};

elements.themeToggle.addEventListener('click', toggleTheme);
elements.fileInput.addEventListener('change', handleFileUpload);
elements.wpmSlider.addEventListener('input', updateSpeed);
elements.playPause.addEventListener('click', togglePlay);
elements.replay.addEventListener('click', replay);
elements.pauseToggle.addEventListener('click', togglePauses);
elements.fastReverse.addEventListener('click', function () {
    currentWordIndex = Math.max(0, currentWordIndex - 10);
    if (isPlaying) {
        clearTimeout(timeout);
        showNextWord();
    } else {
        showCurrentWord();
    }
    updateButtonStates();
    updateProgressBar();
});
elements.pauseToggle.setAttribute('data-tooltip', "Pause on punctuation");


function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    elements.themeToggle.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌚';
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file.name.endsWith('.txt')) {
        alert('Please select a .txt file');
        return;
    }

    elements.progressBar.style.display = 'block';
    const reader = new FileReader();

    reader.onload = function (e) {
        isPlaying = false;
        startTime = 0;
        totalPauseDuration = 0;
        pauseStart = 0;
        clearTimeout(timeout);

        const text = e.target.result;
        words = processText(text);
        currentWordIndex = 0;
        resetStats();
        showCurrentWord();

        elements.playPause.disabled = false;
        elements.replay.disabled = false;
        elements.pauseToggle.disabled = false;
        elements.wpmSlider.disabled = false;
        updateButtonStates();
        updateProgressBar();
    };

    reader.readAsText(file);
}

function processText(text) {
    const tokens = text.split(/(\s+)/);
    const processedWords = [];

    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].trim().length === 0) continue;

        const wordInfo = {
            word: tokens[i].replace(/\n/g, ' ').trim(),
            followedByNewline: /\n/.test(tokens[i + 1] || ''),
        };

        const matches = wordInfo.word.match(/^(\S*?)([.,!?;:]+)?$/);
        if (matches) {
            wordInfo.word = matches[1] || '';
            wordInfo.punctuation = matches[2] || '';
        }

        processedWords.push(wordInfo);
        if (tokens[i + 1]) i++;
    }
    return processedWords.filter(w => w.word.length > 0 || w.punctuation.length > 0);
}



function updateSpeed() {
    baseInterval = 60000 / elements.wpmSlider.value;
}



function togglePlay() {
    if (words.length === 0 || currentWordIndex >= words.length) return;

    isPlaying = !isPlaying;
    elements.playPause.textContent = isPlaying ? '⏸️' : '▶️';
    elements.playPause.disabled = words.length === 0;

    if (isPlaying) {
        if (startTime === 0) startTime = Date.now();
        if (pauseStart) {
            totalPauseDuration += Date.now() - pauseStart;
            pauseStart = 0;
        }
        showNextWord();
    } else {
        pauseStart = Date.now();
        clearTimeout(timeout);
    }
}

function showCurrentWord() {
    if (currentWordIndex >= words.length) return;
    updateProgressBar();

    const wordInfo = words[currentWordIndex];
    const fullWord = wordInfo.word + (wordInfo.punctuation || '');
    const highlightPosition = Math.floor((fullWord.length - 1) * 0.4);

    const highlightChar = fullWord[highlightPosition] || '';
    const before = fullWord.slice(0, highlightPosition);
    const after = fullWord.slice(highlightPosition + 1);

    document.querySelector('.highlight').innerHTML =
        `${highlightChar}
                <div class="arrows arrow-up">↓</div>
                <div class="arrows arrow-down">↑</div>`;
    document.querySelector('.word-before').textContent = before;
    document.querySelector('.word-after').textContent = after;
}

function showNextWord() {
    if (!isPlaying || currentWordIndex >= words.length) return;

    currentWordIndex++;
    updateButtonStates();
    showCurrentWord();

    if (currentWordIndex >= words.length) {
        stopPlayback();
        updateProgressBar();
        return;
    }

    const delay = calculateDelay(words[currentWordIndex]);
    timeout = setTimeout(showNextWord, delay);
}

function calculateDelay(wordInfo) {
    if (!pausesEnabled) return baseInterval;

    let multiplier = 1;
    if (wordInfo.followedByNewline) multiplier = 5;
    else if (wordInfo.punctuation === '.') multiplier = 3;
    else if (wordInfo.punctuation) multiplier = 2;

    return baseInterval * multiplier;
}

function stopPlayback() {
    isPlaying = false;
    elements.playPause.textContent = '▶️';
    elements.playPause.disabled = true;
    clearTimeout(timeout);
    showStats();
    startTime = 0;
    updateButtonStates();
}



function replay() {
    if (words.length === 0) return;

    if (isPlaying) togglePlay();
    currentWordIndex = 0;
    startTime = 0;
    totalPauseDuration = 0;
    elements.playPause.disabled = false;
    showCurrentWord();
    updateButtonStates();
    updateProgressBar();
}



function togglePauses() {
    pausesEnabled = !pausesEnabled;
    elements.pauseToggle.textContent = pausesEnabled ? "🚗" : "🚓";
    elements.pauseToggle.setAttribute('data-tooltip',
        pausesEnabled ? "Do not pause on punctuation" : "Pause on punctuation");
}

function showStats() {
    if (startTime === 0) return;

    const totalTime = (Date.now() - startTime - totalPauseDuration) / 1000;
    const minutes = totalTime / 60;
    const wpm = Math.round(words.length / minutes);

    let timeString;
    if (totalTime > 60) {
        timeString = `${(totalTime / 60).toFixed(1)} minutes`;
    } else {
        timeString = `${totalTime.toFixed(1)} seconds`;
    }

    elements.stats.textContent =
        `You read ${words.length} words in ${timeString} (average speed ${wpm} WPM)`;
}

function resetStats() {
    elements.stats.textContent = '';
}



function updateProgressBar() {
    let progress;
    if (currentWordIndex >= words.length - 1) {
        progress = 100;
    } else {
        progress = (currentWordIndex / (words.length - 1)) * 100;
    }
    elements.progressBar.style.width = progress + '%';
}

function updateButtonStates() {
    elements.fastReverse.disabled = words.length === 0 ||
        currentWordIndex === 0 ||
        currentWordIndex >= words.length;
}