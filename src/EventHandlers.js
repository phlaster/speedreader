class EventHandlers {
    constructor(elements, textProcessor, speedController, uiController) {
        this.elements = elements;
        this.textProcessor = textProcessor;
        this.speedController = speedController;
        this.uiController = uiController;
        this.words = [];
        this.currentWordIndex = 0;
        this.isPlaying = false;
        this.timeout = null;
        this.startTime = 0;
        this.totalPauseDuration = 0;
        this.pauseStart = 0;

        this.initEventListeners();
        this.uiController.updateButtonStates(this.isPlaying, this.currentWordIndex, this.words);
        this.elements.themeToggle.setAttribute('data-tooltip', 'Dark theme');
    }

    initEventListeners() {
        this.elements.themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        this.elements.fileInput.addEventListener('change', this.handleFileUpload.bind(this));
        this.elements.wpmSlider.addEventListener('input', this.updateSpeed.bind(this));
        this.elements.playPause.addEventListener('click', this.togglePlay.bind(this));
        this.elements.replay.addEventListener('click', this.replay.bind(this));
        this.elements.pauseToggle.addEventListener('click', this.togglePauses.bind(this));
        this.elements.fastReverse.addEventListener('click', this.fastReverse.bind(this));
    }

    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        this.elements.themeToggle.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌚';
        this.elements.themeToggle.setAttribute('data-tooltip', 
            document.body.classList.contains('dark-theme') ? 'Light theme' : 'Dark theme');
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file.name.endsWith('.txt')) {
            alert('Please select a .txt file');
            return;
        }

        this.elements.progressBar.style.display = 'block';
        const reader = new FileReader();

        reader.onload = (e) => {
            this.isPlaying = false;
            this.startTime = 0;
            this.totalPauseDuration = 0;
            this.pauseStart = 0;
            clearTimeout(this.timeout);

            const text = e.target.result;
            this.words = this.textProcessor.processText(text);
            this.currentWordIndex = 0;
            this.uiController.resetStats();
            this.uiController.showCurrentWord(this.words[this.currentWordIndex], this.currentWordIndex, this.words);

            this.elements.playPause.disabled = false;
            this.elements.replay.disabled = false;
            this.elements.pauseToggle.disabled = false;
            this.elements.wpmSlider.disabled = false;
            this.uiController.updateButtonStates(this.isPlaying, this.currentWordIndex, this.words);
            this.uiController.updateProgressBar(this.currentWordIndex, this.words);
        };

        reader.readAsText(file);
    }

    updateSpeed() {
        this.speedController.updateSpeed();
    }

    togglePlay() {
        if (this.words.length === 0 || this.currentWordIndex >= this.words.length) return;

        this.isPlaying = !this.isPlaying;
        this.uiController.updateButtonStates(this.isPlaying, this.currentWordIndex, this.words);

        if (this.isPlaying) {
            if (this.startTime === 0) this.startTime = Date.now();
            if (this.pauseStart) {
                this.totalPauseDuration += Date.now() - this.pauseStart;
                this.pauseStart = 0;
            }
            this.showNextWord();
        } else {
            this.pauseStart = Date.now();
            clearTimeout(this.timeout);
        }
    }

    replay() {
        if (this.words.length === 0) return;

        if (this.isPlaying) this.togglePlay();
        this.currentWordIndex = 0;
        this.startTime = 0;
        this.totalPauseDuration = 0;
        this.elements.playPause.disabled = false;
        this.uiController.showCurrentWord(this.words[this.currentWordIndex], this.currentWordIndex, this.words);
        this.uiController.updateButtonStates(this.isPlaying, this.currentWordIndex, this.words);
        this.uiController.updateProgressBar(this.currentWordIndex, this.words);
    }

    togglePauses() {
        this.speedController.togglePauses();
        this.elements.pauseToggle.textContent = this.speedController.pausesEnabled ? "🚗" : "🚓";
        this.elements.pauseToggle.setAttribute('data-tooltip',
            this.speedController.pausesEnabled ? "Do not pause on punctuation" : "Pause on punctuation");
    }

    fastReverse() {
        this.currentWordIndex = Math.max(0, this.currentWordIndex - 10);
        if (this.isPlaying) {
            clearTimeout(this.timeout);
            this.showNextWord();
        } else {
            this.uiController.showCurrentWord(this.words[this.currentWordIndex], this.currentWordIndex, this.words);
        }
        this.uiController.updateButtonStates(this.isPlaying, this.currentWordIndex, this.words);
        this.uiController.updateProgressBar(this.currentWordIndex, this.words);
    }

    showNextWord() {
        if (!this.isPlaying || this.currentWordIndex >= this.words.length) return;

        this.currentWordIndex++;
        this.uiController.updateButtonStates(this.isPlaying, this.currentWordIndex, this.words);
        this.uiController.showCurrentWord(this.words[this.currentWordIndex], this.currentWordIndex, this.words);

        if (this.currentWordIndex >= this.words.length) {
            this.stopPlayback();
            this.uiController.updateProgressBar(this.currentWordIndex, this.words);
            return;
        }

        const delay = this.speedController.calculateDelay(this.words[this.currentWordIndex]);
        this.timeout = setTimeout(this.showNextWord.bind(this), delay);
    }

    stopPlayback() {
        this.isPlaying = false;
        this.elements.playPause.textContent = '▶️';
        this.elements.playPause.disabled = true;
        clearTimeout(this.timeout);
        this.uiController.showStats(this.words, this.startTime, this.totalPauseDuration);
        this.startTime = 0;
        this.uiController.updateButtonStates(this.isPlaying, this.currentWordIndex, this.words);
    }
}