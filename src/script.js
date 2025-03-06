import { TextProcessor } from './TextProcessor.js';
import { SpeedController } from './SpeedController.js';
import { UIController } from './UIController.js';
import { EventHandlers } from './EventHandlers.js';

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

const textProcessor = new TextProcessor();
const speedController = new SpeedController(elements.wpmSlider);
const uiController = new UIController(elements);
const eventHandlers = new EventHandlers(elements, textProcessor, speedController, uiController);