import { INativeBridge } from "photon-engine";
import { ElectronFileSystem } from "./ElectronFileSystem";

export class ElectronNativeBridge implements INativeBridge {
  readonly fs: ElectronFileSystem;

  constructor() {
    this.fs = new ElectronFileSystem();
  }

  async invoke(channel: string, args?: Record<string, unknown>): Promise<unknown> {
    const { ipcRenderer } = await import("electron");
    return ipcRenderer.invoke(channel, args);
  }
}
