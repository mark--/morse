export class MouseKeying {
  constructor(element) {
    this.element = element;
    this.active = false;
    this.startTime = 0;
    this.presses = [];
    this.onUpdate = null;

    this.pointerDown = this.pointerDown.bind(this);
    this.pointerUp = this.pointerUp.bind(this);
  }

  attach() {
    this.element.addEventListener("pointerdown", this.pointerDown);
    this.element.addEventListener("pointerup", this.pointerUp);
    this.element.addEventListener("pointercancel", this.pointerUp);
    this.element.addEventListener("pointerleave", this.pointerUp);
  }

  detach() {
    this.element.removeEventListener("pointerdown", this.pointerDown);
    this.element.removeEventListener("pointerup", this.pointerUp);
    this.element.removeEventListener("pointercancel", this.pointerUp);
    this.element.removeEventListener("pointerleave", this.pointerUp);
  }

  clear() {
    this.presses = [];
    this.emit();
  }

  pointerDown(event) {
    event.preventDefault();
    this.active = true;
    this.startTime = performance.now();
    this.element.setPointerCapture(event.pointerId);
  }

  pointerUp(event) {
    if (!this.active) {
      return;
    }
    event.preventDefault();
    this.active = false;
    const duration = performance.now() - this.startTime;
    this.presses.push(Math.max(20, duration));
    this.emit();
    if (this.element.hasPointerCapture(event.pointerId)) {
      this.element.releasePointerCapture(event.pointerId);
    }
  }

  emit() {
    if (typeof this.onUpdate === "function") {
      this.onUpdate([...this.presses]);
    }
  }
}
