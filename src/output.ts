import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function writeOutput(kind: string, value: unknown): Promise<string> {
  const directory = path.resolve("temp/output");
  await mkdir(directory, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = path.join(directory, `${kind}-${timestamp}.json`);
  await writeFile(file, JSON.stringify(value, null, 2) + "\n");
  return file;
}
