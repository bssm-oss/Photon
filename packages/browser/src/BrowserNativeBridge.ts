import { INativeBridge } from "photon-engine";
import { OPFSFileSystem } from "./OPFSFileSystem";

export class BrowserNativeBridge implements INativeBridge {
  readonly fs: OPFSFileSystem;

  constructor() {
    this.fs = new OPFSFileSystem();
  }

  async invoke(command: string, args?: Record<string, unknown>): Promise<unknown> {
    switch (command) {
      case "notify": {
        if (!("Notification" in window)) throw new Error("[Photon] Notifications not supported");
        const permission = await Notification.requestPermission();
        if (permission !== "granted") throw new Error("[Photon] Notification permission denied");
        return new Notification(String(args?.title ?? ""), {
          body: args?.body as string | undefined,
          icon: args?.icon as string | undefined,
        });
      }
      case "vibrate": {
        if (!navigator.vibrate) throw new Error("[Photon] Vibration API not supported");
        return navigator.vibrate((args?.pattern as number | number[]) ?? 200);
      }
      case "share": {
        if (!navigator.share) throw new Error("[Photon] Web Share API not supported");
        return navigator.share(args as ShareData);
      }
      case "clipboard:write":
        await navigator.clipboard.writeText(String(args?.text ?? ""));
        return;
      case "clipboard:read":
        return navigator.clipboard.readText();
      case "fullscreen:enter":
        return document.documentElement.requestFullscreen();
      case "fullscreen:exit":
        return document.exitFullscreen();
      default:
        throw new Error(`[Photon] Unknown browser command: "${command}"`);
    }
  }
}
