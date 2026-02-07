class PomodoroTimer {
    constructor() {
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.initialTime = 25 * 60;
        this.timerId = null;
        this.isRunning = false;

        // DOM Elements
        this.timeDisplay = document.getElementById('time-display');
        this.startBtn = document.getElementById('start-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.customTimeInput = document.getElementById('custom-time');

        // Audio Context (initialized on user interaction)
        this.audioContext = null;

        this.init();
    }

    init() {
        this.updateDisplay();

        this.startBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());
        this.customTimeInput.addEventListener('change', () => this.updateCustomTime());
    }

    updateCustomTime() {
        let minutes = parseInt(this.customTimeInput.value);
        if (isNaN(minutes) || minutes < 1) minutes = 1;
        if (minutes > 99) minutes = 99;

        this.customTimeInput.value = minutes;
        this.initialTime = minutes * 60;

        this.pauseTimer();
        this.timeLeft = this.initialTime;
        this.updateDisplay();
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;

        // Pad with leading zeros
        const displayMinutes = String(minutes).padStart(2, '0');
        const displaySeconds = String(seconds).padStart(2, '0');

        this.timeDisplay.textContent = `${displayMinutes}:${displaySeconds}`;
        document.title = `${displayMinutes}:${displaySeconds} - Focus`;
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        if (!this.isRunning) {
            // Initialize audio context on first user interaction if needed
            this.initAudio();

            this.isRunning = true;
            this.startBtn.textContent = 'Pause';
            this.startBtn.classList.remove('btn-primary');
            this.startBtn.classList.add('btn-secondary'); // Visual toggle style if desired, or keep logic simple
            this.customTimeInput.disabled = true; // Disable input while running

            this.timerId = setInterval(() => {
                if (this.timeLeft > 0) {
                    this.timeLeft--;
                    this.updateDisplay();
                } else {
                    this.completeTimer();
                }
            }, 1000);
        }
    }

    pauseTimer() {
        if (this.isRunning) {
            this.isRunning = false;
            this.startBtn.textContent = 'Start';
            this.startBtn.classList.add('btn-primary'); // Revert style
            this.startBtn.classList.remove('btn-secondary');
            this.customTimeInput.disabled = false; // Re-enable input
            clearInterval(this.timerId);
        }
    }

    resetTimer() {
        this.pauseTimer();
        this.timeLeft = this.initialTime;
        this.updateDisplay();
        document.title = 'Modern Pomodoro';
    }

    completeTimer() {
        this.pauseTimer();
        this.playNotificationSound();
        // Optional: Reset logic or stay at 00:00
        // this.timeLeft = this.initialTime; 
        // this.updateDisplay();
    }

    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playNotificationSound() {
        if (!this.audioContext) this.initAudio();

        // Resume context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const now = this.audioContext.currentTime;

        // Play 3 beeps
        this.playBeep(now);
        this.playBeep(now + 0.6);
        this.playBeep(now + 1.2);
    }

    playBeep(startTime) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Sound configuration: A pleasant bell-like tone
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, startTime); // C5
        oscillator.frequency.exponentialRampToValueAtTime(1046.5, startTime + 0.1); // C6 (chirp effect)

        gainNode.gain.setValueAtTime(0.5, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

        oscillator.start(startTime);
        oscillator.stop(startTime + 0.5);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new PomodoroTimer();
});
