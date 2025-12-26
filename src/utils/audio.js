// Web Audio API Sound Synthesizer
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.initialized = false;
        this.cache = {}; // Cache for decoded audio assets
        this.voices = []; // Cache for TTS voices
        this.owlInterval = null; // Interval for owl hooting
        this.ttsEnabled = true; // User preference
        this.currentTrack = null; // To avoid restarting same track
    }

    init() {
        if (this.initialized) return;
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.connect(this.ctx.destination);
        this.masterGain.gain.value = 0.5;

        // Pre-load voices to avoid "first try" default voice bug
        this.loadVoices();

        this.initialized = true;
    }

    setVolume(value) {
        if (!this.initialized) return;
        this.masterGain.gain.setTargetAtTime(value, this.ctx.currentTime, 0.1);
    }

    toggleTTS(enabled) {
        this.ttsEnabled = enabled;
        if (!enabled) {
            this.stopSpeaking();
        }
    }

    stopSpeaking() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }

    loadVoices() {
        const populate = () => {
            this.voices = window.speechSynthesis.getVoices();
        };

        populate();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = populate;
        }
    }

    // Load external assets (like rain.mp3)
    async getBuffer(url) {
        if (this.cache[url]) return this.cache[url];
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
            this.cache[url] = audioBuffer;
            return audioBuffer;
        } catch (e) {
            console.error("Failed to load audio asset:", url, e);
            return null;
        }
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

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }

    playHeartbeat() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Low drum-like sound
        osc.frequency.setValueAtTime(50, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.1);

        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t);
        osc.stop(t + 0.15);
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

    // Sound when finding a clue
    playInvestigate() {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    async playVictory() {
        if (!this.initialized) return;
        this.stopMusic();

        try {
            const buffer = await this.getBuffer('/ThemeAudio/victory.mp3');
            if (buffer) {
                const source = this.ctx.createBufferSource();
                source.buffer = buffer;

                const gain = this.ctx.createGain();
                gain.gain.value = 0.4;

                source.connect(gain);
                gain.connect(this.masterGain);

                source.start();
                this.musicNodes = [{ source, gain }];
            }
        } catch (e) {
            console.error("Failed to play victory sound:", e);
        }
    }

    async playMenuMusic() {
        if (!this.initialized || this.currentTrack === 'menu') return;

        try {
            const buffer = await this.getBuffer('/ThemeAudio/bc.mp3');
            if (buffer) {
                const source = this.ctx.createBufferSource();
                source.buffer = buffer;
                source.loop = true;

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.001, this.ctx.currentTime); // Start silent

                source.connect(gain);
                gain.connect(this.masterGain);
                source.start();

                // Cross-fade logic
                if (this.musicNodes) {
                    this.musicNodes.forEach(n => {
                        if (n.gain) n.gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2);
                        if (n.source) n.source.stop(this.ctx.currentTime + 2.1);
                        if (n.osc) n.osc.stop(this.ctx.currentTime + 2.1);
                    });
                }

                gain.gain.exponentialRampToValueAtTime(0.3, this.ctx.currentTime + 2);
                this.musicNodes = [{ source, gain }];
                this.currentTrack = 'menu';
            }
        } catch (e) {
            console.error("Failed to play menu music:", e);
        }
    }

    // Adaptive Ambient Pad
    async startAmbient(arg1, arg2 = 50) {
        if (!this.initialized) return;

        // Cross-fade: Start fading out existing music immediately
        if (this.musicNodes) {
            this.musicNodes.forEach(n => {
                if (n.gain) n.gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2);
                if (n.source) n.source.stop(this.ctx.currentTime + 2.1);
                if (n.osc) n.osc.stop(this.ctx.currentTime + 2.1);
            });
        }

        // Handle flexible arguments: startAmbient(theme) or startAmbient(trust, theme)
        let theme = 'park';
        let trust = 50;

        if (typeof arg1 === 'string') {
            theme = arg1; // Called as startAmbient('park')
            if (typeof arg2 === 'number') trust = arg2;
        } else if (typeof arg1 === 'number') {
            trust = arg1; // Called as startAmbient(50, 'park')
            if (typeof arg2 === 'string') theme = arg2;
        }

        const nodes = [];

        // Special handling for Park Theme with MP3
        if (theme === 'park') {
            const buffer = await this.getBuffer('/ThemeAudio/park.mp3');
            if (buffer) {
                const source = this.ctx.createBufferSource();
                source.buffer = buffer;
                source.loop = true;
                const gain = this.ctx.createGain();

                // Softer volume for background with fade-in
                gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.3, this.ctx.currentTime + 2);

                source.connect(gain);
                gain.connect(this.masterGain);
                source.start();
                nodes.push({ source, gain });
                this.musicNodes = nodes;
                return; // Exit early, don't play synth pad if MP3 works
            }
        }

        // Special handling for Campus Theme with MP3
        if (theme === 'campus') {
            const buffer = await this.getBuffer('/ThemeAudio/campus.mp3');
            if (buffer) {
                const source = this.ctx.createBufferSource();
                source.buffer = buffer;
                source.loop = true;
                const gain = this.ctx.createGain();

                // Reduced volume as requested with fade-in
                gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.1, this.ctx.currentTime + 2);

                source.connect(gain);
                gain.connect(this.masterGain);
                source.start();
                nodes.push({ source, gain });
                this.musicNodes = nodes;
                return; // Exit early
            }
        }

        let freqs = trust > 50 ? [220, 277, 329, 440] : [110, 138, 164, 220];
        let type = 'sine';
        let volume = 0.02;

        // Special handling for Office Theme with Owl sfx
        if (theme === 'office') {
            type = 'sine';
            freqs = freqs.map(f => f * 0.5); // Lower, starker
            volume = 0.01;

            // Schedule periodic Owl hooting
            const playOwl = async () => {
                const buffer = await this.getBuffer('/ThemeAudio/owl.mp3');
                if (buffer && this.musicNodes) { // Check musicNodes to ensure we haven't stopped
                    const source = this.ctx.createBufferSource();
                    source.buffer = buffer;
                    const gain = this.ctx.createGain();
                    gain.gain.value = 0.25; // Subtle background hoot
                    source.connect(gain);
                    gain.connect(this.masterGain);
                    source.start();
                }
            };

            // Initial delay then interval
            setTimeout(playOwl, 5000 + Math.random() * 5000);
            this.owlInterval = setInterval(playOwl, 25000); // Every 25 seconds
        } else if (theme === 'campus') {
            type = 'triangle';
            freqs = freqs.map(f => f * 1.5); // Higher tension
            volume = 0.015;
        } else if (theme === 'rainy_street') {
            type = 'sine';
            freqs = freqs.map(f => f * 0.8);
            volume = 0.03;
        }

        freqs.forEach(f => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(f, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(volume, this.ctx.currentTime + 2); // Smooth fade-in

            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start();
            nodes.push({ osc, gain, baseFreq: f });
        });

        // Add real rain audio asset for rainy theme
        if (theme === 'rainy_street') {
            const buffer = await this.getBuffer('/ThemeAudio/rain.mp3');
            if (buffer) {
                const source = this.ctx.createBufferSource();
                source.buffer = buffer;
                source.loop = true;
                const gain = this.ctx.createGain();
                gain.gain.value = 0.2;
                source.connect(gain);
                gain.connect(this.masterGain);
                source.start();
                nodes.push({ source, gain });
            }
        }

        this.musicNodes = nodes;
    }

    updateMusic(trust) {
        if (!this.musicNodes) return;
        const isHigh = trust > 50;
        if (this.isHighTrust === isHigh) return; // Prevent thrashing
        this.isHighTrust = isHigh;

        const freqs = isHigh ? [220, 277, 329, 440] : [110, 138, 164, 220];

        this.musicNodes.forEach((node, i) => {
            if (node.osc) {
                const targetFreq = freqs[i] || node.baseFreq;
                node.osc.frequency.exponentialRampToValueAtTime(targetFreq, this.ctx.currentTime + 2);
            }
        });
    }

    stopMusic() {
        if (this.musicNodes) {
            this.musicNodes.forEach(n => {
                if (n.gain) n.gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1);
                if (n.osc) n.osc.stop(this.ctx.currentTime + 1.1);
                if (n.source) n.source.stop(this.ctx.currentTime + 1.1);
            });
            this.musicNodes = null;
            this.currentTrack = null;
        }

        if (this.owlInterval) {
            clearInterval(this.owlInterval);
            this.owlInterval = null;
        }
    }

    // Voice Synthesis (TTS)
    speak(text, isSam = true, gender = 'guy', voiceParams = null, onEnd = null) {
        if (!this.ttsEnabled || !window.speechSynthesis) {
            if (onEnd) onEnd();
            return;
        }

        // Prevent error logging for intentional interruptions
        if (this.utterance) {
            this.utterance.onerror = null;
        }

        // Force-cancel previous speech thoroughly before starting new
        window.speechSynthesis.cancel();

        // Ensure voices are loaded if empty
        if (!this.voices || this.voices.length === 0) {
            this.voices = window.speechSynthesis.getVoices();
        }

        // Use a consistent internal reference to prevent garbage collection
        this.utterance = new SpeechSynthesisUtterance(text);

        // --- CRITICAL FIX FOR LONG SENTENCES ---
        this.utterance.onend = () => {
            this.utterance = null;
            if (onEnd) onEnd();
        };

        this.utterance.onerror = (event) => {
            if (event.error === 'interrupted' || event.error === 'canceled') return;
            console.warn("TTS Error/Interrupt:", event);
            this.utterance = null;
        };

        this.utterance.onboundary = () => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.pause();
                window.speechSynthesis.resume();
            }
        };

        // Use Voice Parameters if provided, otherwise fallback to defaults
        if (voiceParams) {
            this.utterance.pitch = voiceParams.pitch || 1.0;
            this.utterance.rate = voiceParams.rate || 0.9;
        } else if (isSam) {
            this.utterance.pitch = 0.7; // Deep, somber
            this.utterance.rate = 0.75; // Slower, weighted
        } else if (gender === 'girl') {
            this.utterance.pitch = 1.4;
            this.utterance.rate = 1.0;
        } else {
            this.utterance.pitch = 1.0;
            this.utterance.rate = 0.95;
        }
        this.utterance.volume = 1.0;

        const voices = this.voices.length > 0 ? this.voices : window.speechSynthesis.getVoices();

        if (voices.length > 0) {
            const preferredVoice = voices.find(v => {
                const name = v.name.toLowerCase();
                const lang = v.lang.toLowerCase();
                if (!lang.includes('en')) return false;

                if (isSam) {
                    return name.includes('david') || name.includes('mark') || (name.includes('male') && !name.includes('female'));
                }
                if (gender === 'girl') {
                    return name.includes('zira') || name.includes('samantha') || name.includes('female') || name.includes('hazel') || name.includes('susan');
                }
                return name.includes('david') || name.includes('google us english') || (name.includes('male') && !name.includes('female'));
            });

            if (preferredVoice) {
                this.utterance.voice = preferredVoice;
                if (gender === 'girl' && (preferredVoice.name.toLowerCase().includes('zira') || preferredVoice.name.toLowerCase().includes('samantha'))) {
                    this.utterance.pitch = 1.1;
                }
            } else {
                this.utterance.voice = voices.find(v => {
                    const n = v.name.toLowerCase();
                    return gender === 'girl' ? n.includes('female') : (n.includes('male') && !n.includes('female'));
                }) || voices[0];
            }
        }

        window.speechSynthesis.speak(this.utterance);
    }
}

export const audioManager = new SoundEngine();
