import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  if (typeof document !== "undefined") cleanup();
  if (typeof window !== "undefined") window.localStorage.clear();
});

if (typeof HTMLElement !== "undefined") {
  class ResizeObserverMock implements ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  Object.defineProperty(globalThis, "ResizeObserver", {
    writable: true,
    value: ResizeObserverMock,
  });

  Object.defineProperty(HTMLElement.prototype, "getBoundingClientRect", {
    configurable: true,
    value() {
      return {
        width: 900,
        height: 390,
        top: 0,
        right: 900,
        bottom: 390,
        left: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      };
    },
  });
}
