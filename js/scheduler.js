export class Scheduler {
  constructor() {
    this.timers = [];
  }

  wait(ms, fn) {
    const id = window.setTimeout(() => {
      this.timers = this.timers.filter((tid) => tid !== id);
      fn();
    }, ms);
    this.timers.push(id);
  }

  clear() {
    for (const id of this.timers) {
      window.clearTimeout(id);
    }
    this.timers = [];
  }
}
