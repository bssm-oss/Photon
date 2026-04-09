import { World } from "../../ecs/World";
import { IFileSystem } from "../../filesystem/IFileSystem";
import { parsePui } from "./PuiParser";
import { loadPui, PuiLoadResult } from "./PuiLoader";

export async function loadPuiFile(
  fs: IFileSystem,
  world: World,
  path: string,
): Promise<PuiLoadResult> {
  const source = await fs.readText(path);
  const doc = parsePui(source);
  return loadPui(world, doc);
}
