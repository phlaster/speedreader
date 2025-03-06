export class SpeedController {
    constructor(wpmSlider) {
        this.wpmSlider = wpmSlider;
        this.baseInterval = 60000 / wpmSlider.value;
        this.pausesEnabled = false;
    }

    updateSpeed() {
        this.baseInterval = 60000 / this.wpmSlider.value;
    }

    calculateDelay(wordInfo) {
        if (!this.pausesEnabled) return this.baseInterval;

        let multiplier = 1;
        if (wordInfo.followedByNewline) multiplier = 5;
        else if (wordInfo.punctuation === '.') multiplier = 3;
        else if (wordInfo.punctuation) multiplier = 2;

        return this.baseInterval * multiplier;
    }

    togglePauses() {
        this.pausesEnabled = !this.pausesEnabled;
    }
}