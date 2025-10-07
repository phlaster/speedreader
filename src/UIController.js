class UIController {
    constructor(elements) {
        this.elements = elements;
    }

    showCurrentWord(wordInfo, currentWordIndex, words) {
        if (currentWordIndex >= words.length) return;

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

        this.updateProgressBar(currentWordIndex, words);
    }

    updateProgressBar(currentWordIndex, words) {
        let progress;
        if (currentWordIndex >= words.length - 1) {
            progress = 100;
        } else {
            progress = (currentWordIndex / (words.length - 1)) * 100;
        }
        this.elements.progressBar.style.width = progress + '%';
        this.elements.progressBar.style.display = 'block';
    }

    showStats(words, startTime, totalPauseDuration) {
        const totalTime = (Date.now() - startTime - totalPauseDuration) / 1000;
        const minutes = totalTime / 60;
        const wpm = Math.round(words.length / minutes);

        let timeString;
        if (totalTime > 60) {
            timeString = `${(totalTime / 60).toFixed(1)} minutes`;
        } else {
            timeString = `${totalTime.toFixed(1)} seconds`;
        }

        this.elements.stats.textContent =
            `You read ${words.length} words in ${timeString} (average speed ${wpm} WPM)`;
    }

    resetStats() {
        this.elements.stats.textContent = '';
    }

    updateButtonStates(isPlaying, currentWordIndex, words) {
        this.elements.playPause.textContent = isPlaying ? '⏸️' : '▶️';
        this.elements.playPause.disabled = words.length === 0;
        this.elements.fastReverse.disabled = words.length === 0 ||
            currentWordIndex === 0 ||
            currentWordIndex >= words.length;
        this.elements.replay.disabled = words.length === 0 || currentWordIndex <= 0;
    }
}