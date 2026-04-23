import { Scheduler } from "./scheduler.js";

function getEnvelopeByStyle(style) {
  if (style === "soft-click") {
    return { attack: 0.002, release: 0.03, frequency: 700, gain: 0.12, wave: "triangle" };
  }
  if (style === "hard-click") {
    return { attack: 0.001, release: 0.02, frequency: 850, gain: 0.15, wave: "square" };
  }
  return { attack: 0.005, release: 0.025, frequency: 650, gain: 0.13, wave: "sine" };
}

export class AudioOutput {
  constructor() {
    this.context = null;
    this.scheduler = new Scheduler();
  }

  async ensureContext() {
    if (!this.context) {
      this.context = new window.AudioContext();
    }
    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  async play(events, style = "classic") {
    await this.ensureContext();
    this.stop();

    const env = getEnvelopeByStyle(style);
    let offset = 0;
    for (const event of events) {
      if (event.type === "on") {
        this.scheduler.wait(offset, () => {
          this.beep(event.durationMs, env);
        });
      }
      offset += event.durationMs;
    }

    return offset;
  }

  beep(durationMs, env) {
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.type = env.wave;
    osc.frequency.value = env.frequency;

    const start = this.context.currentTime;
    const stop = start + durationMs / 1000;

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(env.gain, start + env.attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, stop + env.release);

    osc.connect(gain);
    gain.connect(this.context.destination);
    osc.start(start);
    osc.stop(stop + env.release + 0.01);
  }

  stop() {
    this.scheduler.clear();
  }
}
