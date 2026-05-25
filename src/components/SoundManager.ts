/**
 * Web Audio API synthesizer for premium cinematic real-time sound effects.
 * Fulfills the requirement for an immersive audio experience without relying on flaky third-party links.
 */

class CinematicAcoustics {
  private ctx: AudioContext | null = null;
  private ambientOscs: { osc: OscillatorNode; gain: GainNode }[] = [];
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // resume if suspended (standard browser security precaution)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play a brilliant, sparkling success wind chime (golden harp arpeggio)
  playSuccess() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Pentatonic scale starting at C5: C5(523Hz), D5(587Hz), E5(659Hz), G5(784Hz), A5(880Hz), C6(1046Hz)
      const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
      
      notes.forEach((freq, idx) => {
        const timeOffset = idx * 0.08;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        // High crystal chime using Triangle/Sine hybrid
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + timeOffset);
        
        // Add subtle vibrato
        osc.frequency.linearRampToValueAtTime(freq + 15, now + timeOffset + 0.3);

        gain.gain.setValueAtTime(0, now + timeOffset);
        gain.gain.linearRampToValueAtTime(0.12, now + timeOffset + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + 0.65);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + timeOffset);
        osc.stop(now + timeOffset + 0.7);
      });
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  }

  // Play a comical soft 8-bit retro/glitch buzzer for wrong quiz clicks
  playFailure() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const oscVal = this.ctx.createOscillator();
      const gainVal = this.ctx.createGain();

      oscVal.type = 'sawtooth';
      // Retro pitch drop
      oscVal.frequency.setValueAtTime(140, now);
      oscVal.frequency.linearRampToValueAtTime(60, now + 0.45);

      gainVal.gain.setValueAtTime(0, now);
      gainVal.gain.linearRampToValueAtTime(0.15, now + 0.05);
      gainVal.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      oscVal.connect(gainVal);
      gainVal.connect(this.ctx.destination);

      oscVal.start(now);
      oscVal.stop(now + 0.5);
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  }

  // Play a brilliant golden sweeping magical chime for structural slides or letter opening
  playLetterSlide() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Magical swelling chords sweep
      const baseFreqs = [196.00, 246.94, 293.66, 392.00, 493.88]; // G major chord root
      
      baseFreqs.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        // Sweeping up an octave
        osc.frequency.exponentialRampToValueAtTime(freq * 2, now + 1.2);

        filter.type = 'lowpass';
        filter.Q.setValueAtTime(10, now);
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(3000, now + 1.0);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.4);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.9);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + 1.6);
      });
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  }

  // Play general micro interaction tick clicks
  playTick() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(400, now + 0.06);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch (e) {
      // Ignored
    }
  }

  // Web Audio Synth for luxurious ambient background atmosphere
  // Plays sweet major third chord hum to trigger a cinematic emotion
  toggleAmbient(forceState?: boolean) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const shouldPlay = forceState !== undefined ? forceState : !this.isAmbientPlaying;
      if (shouldPlay === this.isAmbientPlaying) return;

      if (shouldPlay) {
        const now = this.ctx.currentTime;
        this.ambientGain = this.ctx.createGain();
        this.ambientGain.gain.setValueAtTime(0, now);
        this.ambientGain.gain.linearRampToValueAtTime(0.15, now + 2.0); // Smooth 2s fade-in
        this.ambientGain.connect(this.ctx.destination);

        // Warm chord G Major 9: G2(98Hz), B2(123Hz), D3(146Hz), F#3(185Hz), A3(220Hz)
        const chordArr = [98.00, 123.47, 146.83, 185.00, 220.00];

        chordArr.forEach((frequency) => {
          const oscNode = this.ctx!.createOscillator();
          const oscGain = this.ctx!.createGain();

          oscNode.type = 'sine';
          oscNode.frequency.setValueAtTime(frequency, now);

          // Subtle LFO-like pitching for rich acoustic movement
          const lfo = this.ctx!.createOscillator();
          const lfoGain = this.ctx!.createGain();
          lfo.frequency.value = 0.15; // super slow
          lfoGain.gain.value = 0.8; // subtle
          lfo.connect(lfoGain);
          lfoGain.connect(oscNode.frequency);
          lfo.start();

          // Set low individual volumes to blend nicely
          oscGain.gain.value = 0.25;

          oscNode.connect(oscGain);
          oscGain.connect(this.ambientGain!);
          
          oscNode.start(now);
          this.ambientOscs.push({ osc: oscNode, gain: oscGain });
        });

        this.isAmbientPlaying = true;
      } else {
        const now = this.ctx.currentTime;
        if (this.ambientGain) {
          this.ambientGain.gain.setValueAtTime(this.ambientGain.gain.value, now);
          this.ambientGain.gain.linearRampToValueAtTime(0, now + 1.2); // Smooth 1.2s fade-out
          
          setTimeout(() => {
            this.ambientOscs.forEach((item) => {
              try {
                item.osc.stop();
              } catch (err) {}
            });
            this.ambientOscs = [];
            this.isAmbientPlaying = false;
          }, 1300);
        }
      }
    } catch (e) {
      console.warn('Ambient synthesis failed:', e);
    }
  }

  isAmbientActive(): boolean {
    return this.isAmbientPlaying;
  }
}

export const soundManager = new CinematicAcoustics();
