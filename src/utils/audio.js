// Web Audio API Sound Synthesizer
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.5;
        this.initialized = true;
    }

    // Satisfying "pop" for speech bubbles
    playPop() {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    // Hopeful "ding" for trust increase
    playDing() {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }

    // Low "thud" for trust decrease or frown
    playSad() {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.4);

        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    }

    // Subtle footstep
    playStep() {
        if (!this.initialized) return;
        const noise = this.ctx.createBufferSource();
        const bufferSize = this.ctx.sampleRate * 0.1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, this.ctx.currentTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start();
        noise.stop(this.ctx.currentTime + 0.1);
    }

    // Adaptive Ambient Pad
    startMusic(trust) {
        if (!this.initialized) return;
        if (this.musicNodes) this.stopMusic();

        const nodes = [];
        const freqs = trust > 50 ? [220, 277, 329, 440] : [110, 138, 164, 220]; // Major vs Minor/Low

        freqs.forEach(f => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.02, this.ctx.currentTime);

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();
            nodes.push({ osc, gain });
        });

        this.musicNodes = nodes;
    }

    updateMusic(trust) {
        if (!this.musicNodes) return;
        const freqs = trust > 50 ? [220, 277, 329, 440] : [110, 138, 164, 220];
        this.musicNodes.forEach((node, i) => {
            node.osc.frequency.exponentialRampToValueAtTime(freqs[i], this.ctx.currentTime + 2);
        });
    }

    stopMusic() {
        if (this.musicNodes) {
            this.musicNodes.forEach(n => {
                n.gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1);
                n.osc.stop(this.ctx.currentTime + 1.1);
            });
            this.musicNodes = null;
        }
    }

    // Voice Synthesis (TTS)
    speak(text, isSam = true, gender = 'guy') {
        if (!window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        if (isSam) {
            // Sam remains somber and slightly lower
            utterance.pitch = 0.8;
            utterance.rate = 0.85;
            utterance.volume = 1.0;
        } else {
            // Player voice based on selected gender
            if (gender === 'girl') {
                utterance.pitch = 1.4; // Higher pitch for female voice
                utterance.rate = 1.1; // Slightly faster
            } else {
                utterance.pitch = 1.0; // Standard male-ish pitch
                utterance.rate = 1.0;
            }
            utterance.volume = 0.8;
        }

        // Try to find a nice natural voice if available
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            // Find appropriate gender voice if possible
            const preferredVoice = voices.find(v => {
                const name = v.name.toLowerCase();
                if (isSam) return name.includes('male') || name.includes('david');
                if (gender === 'girl') return name.includes('female') || name.includes('zira') || name.includes('samantha');
                return name.includes('male') || name.includes('google');
            });
            utterance.voice = preferredVoice || voices[0];
        }

        window.speechSynthesis.speak(utterance);
    }
}

export const audioManager = new SoundEngine();
