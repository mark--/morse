export class KeyboardKeying {
  constructor(target = window) {
    this.target = target;
    this.active = false;
    this.startTime = 0;
    this.presses = [];
    this.onUpdate = null;
    this.key = " ";

    this.handleDown = this.handleDown.bind(this);
    this.handleUp = this.handleUp.bind(this);
  }

  attach(key = " ") {
    this.key = key;
    this.target.addEventListener("keydown", this.handleDown);
    this.target.addEventListener("keyup", this.handleUp);
  }

  detach() {
    this.target.removeEventListener("keydown", this.handleDown);
    this.target.removeEventListener("keyup", this.handleUp);
  }

  clear() {
    this.presses = [];
    this.emit();
  }

  handleDown(event) {
    if (event.key !== this.key || this.active) {
      return;
    }
    event.preventDefault();
    this.active = true;
    this.startTime = performance.now();
  }

  handleUp(event) {
    if (event.key !== this.key || !this.active) {
      return;
    }
    event.preventDefault();
    this.active = false;
    const duration = performance.now() - this.startTime;
    this.presses.push(Math.max(20, duration));
    this.emit();
  }

  emit() {
    if (typeof this.onUpdate === "function") {
      this.onUpdate([...this.presses]);
    }
  }
}
