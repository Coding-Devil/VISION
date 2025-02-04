export class GestureDetector {
  private lastTap: number = 0;
  private readonly doubleTapDelay: number = 300; // milliseconds

  constructor(element: HTMLElement, onDoubleTap: () => void) {
    element.addEventListener('touchend', (e) => this.handleTap(e, onDoubleTap));
    element.addEventListener('click', (e) => this.handleTap(e, onDoubleTap));
    
    // Prevent zoom on double tap for mobile devices
    element.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  private handleTap(e: MouseEvent | TouchEvent, callback: () => void): void {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - this.lastTap;

    if (tapLength < this.doubleTapDelay && tapLength > 0) {
      callback();
      e.preventDefault();
    }

    this.lastTap = currentTime;
  }
}