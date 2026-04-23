import { Scheduler } from "./scheduler.js";

export class VisualOutput {
  constructor(ledElement, flashElement) {
    this.led = ledElement;
    this.flash = flashElement;
    this.scheduler = new Scheduler();
  }

  play(events, style = "led") {
    this.stop();
    let offset = 0;
    for (const event of events) {
      if (event.type === "on") {
        this.scheduler.wait(offset, () => this.setActive(true, style));
        this.scheduler.wait(offset + event.durationMs, () => this.setActive(false, style));
      }
      offset += event.durationMs;
    }
    return offset;
  }

  setActive(active, style) {
    if (style === "led") {
      this.led.classList.toggle("on", active);
      return;
    }

    this.flash.classList.toggle("on", active);
    this.led.classList.toggle("on", active);
  }

  stop() {
    this.scheduler.clear();
    this.led.classList.remove("on");
    this.flash.classList.remove("on");
  }
}
