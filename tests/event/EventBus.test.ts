import { describe, it, expect } from "vitest";
import { EventBus } from "@engine/event/EventBus";

describe("EventBus", () => {
  it("calls listener on emit", () => {
    const bus = new EventBus();
    let received = 0;
    bus.on<number>("test", (data) => { received = data; });
    bus.emit("test", 42);
    expect(received).toBe(42);
  });

  it("supports multiple listeners", () => {
    const bus = new EventBus();
    let sum = 0;
    bus.on<number>("test", (data) => { sum += data; });
    bus.on<number>("test", (data) => { sum += data * 10; });
    bus.emit("test", 5);
    expect(sum).toBe(55);
  });

  it("unsubscribes with returned function", () => {
    const bus = new EventBus();
    let count = 0;
    const unsub = bus.on("test", () => { count++; });
    bus.emit("test", null);
    expect(count).toBe(1);
    unsub();
    bus.emit("test", null);
    expect(count).toBe(1);
  });

  it("unsubscribes with off()", () => {
    const bus = new EventBus();
    let count = 0;
    const fn = () => { count++; };
    bus.on("test", fn);
    bus.emit("test", null);
    bus.off("test", fn);
    bus.emit("test", null);
    expect(count).toBe(1);
  });

  it("once auto-unsubscribes", () => {
    const bus = new EventBus();
    let count = 0;
    bus.once("test", () => { count++; });
    bus.emit("test", null);
    bus.emit("test", null);
    expect(count).toBe(1);
  });

  it("does nothing when emitting unknown event", () => {
    const bus = new EventBus();
    expect(() => bus.emit("unknown", null)).not.toThrow();
  });

  it("clears specific event", () => {
    const bus = new EventBus();
    let count = 0;
    bus.on("a", () => { count++; });
    bus.on("b", () => { count++; });
    bus.clear("a");
    bus.emit("a", null);
    bus.emit("b", null);
    expect(count).toBe(1);
  });

  it("clears all events", () => {
    const bus = new EventBus();
    let count = 0;
    bus.on("a", () => { count++; });
    bus.on("b", () => { count++; });
    bus.clear();
    bus.emit("a", null);
    bus.emit("b", null);
    expect(count).toBe(0);
  });

  it("counts listeners", () => {
    const bus = new EventBus();
    bus.on("test", () => {});
    bus.on("test", () => {});
    bus.on("other", () => {});
    expect(bus.listenerCount("test")).toBe(2);
    expect(bus.listenerCount("other")).toBe(1);
    expect(bus.listenerCount("none")).toBe(0);
  });

  it("catches listener errors without breaking others", () => {
    const bus = new EventBus();
    let reached = false;
    bus.on("test", () => { throw new Error("fail"); });
    bus.on("test", () => { reached = true; });
    bus.emit("test", null);
    expect(reached).toBe(true);
  });
});
