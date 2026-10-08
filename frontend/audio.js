// Malta Multicloud Interconnect - Procedural Web Audio API Engine
// Zero external files, 100% offline, studio quality procedural synthesis

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.ambientGain = null;
        this.ambientSource = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    startAmbientSea() {
        if (!this.enabled) return;
        this.init();
        if (this.ambientSource) return;

        // Generate gentle ocean wave surf using pink/brown noise
        const bufferSize = this.ctx.sampleRate * 4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99 * b0 + white * 0.05;
            b1 = 0.96 * b1 + white * 0.11;
            b2 = 0.86 * b2 + white * 0.25;
            data[i] = (b0 + b1 + b2) * 0.4;
        }

        this.ambientSource = this.ctx.createBufferSource();
        this.ambientSource.buffer = buffer;
        this.ambientSource.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, this.ctx.currentTime);

        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

        this.ambientSource.connect(filter);
        filter.connect(this.ambientGain);
        this.ambientGain.connect(this.ctx.destination);
        this.ambientSource.start(0);
    }

    playDataWhoosh() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.35);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.Q.setValueAtTime(3, now);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.36);
    }

    playThunderAndCrash() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;

        // 1. Initial lightning strike snap
        const strikeOsc = this.ctx.createOscillator();
        const strikeGain = this.ctx.createGain();
        strikeOsc.type = 'sawtooth';
        strikeOsc.frequency.setValueAtTime(80, now);
        strikeGain.gain.setValueAtTime(0.4, now);
        strikeGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        strikeOsc.connect(strikeGain);
        strikeGain.connect(this.ctx.destination);
        strikeOsc.start(now);
        strikeOsc.stop(now + 0.25);

        // 2. Low rolling thunder and crumbling stone collapse
        const bufferSize = this.ctx.sampleRate * 2.5;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(60, now + 2.3);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0.7, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 2.5);

        // 3. Siren alarm
        setTimeout(() => this.playAlarm(), 400);
    }

    playAlarm() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        for (let i = 0; i < 4; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'square';
            const t = now + i * 0.25;
            osc.frequency.setValueAtTime(950, t);
            osc.frequency.setValueAtTime(650, t + 0.12);
            gain.gain.setValueAtTime(0.18, t);
            gain.gain.linearRampToValueAtTime(0.01, t + 0.24);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.25);
        }
    }

    playRestore() {
        if (!this.enabled) return;
        this.init();
        const now = this.ctx.currentTime;
        // Ascending futuristic chord (C -> E -> G -> B -> D)
        const notes = [261.63, 329.63, 392.00, 493.88, 587.33];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const t = now + idx * 0.08;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + 0.95);
        });
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled && this.ambientGain) {
            this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
        } else if (this.enabled && this.ambientGain) {
            this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        }
        return this.enabled;
    }
}

window.soundEngine = new SoundEngine();
