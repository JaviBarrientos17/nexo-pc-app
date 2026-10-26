import { mkdir, mkdtemp, readFile, rm, utimes, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { cleanTempFiles } from "../src/electron/cleanup";

describe("temporary-file cleanup", () => {
  it("removes only old files and preserves recent files", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "nexo-cleanup-test-"));
    const nested = path.join(root, "nested");
    const oldFile = path.join(nested, "old.tmp");
    const recentFile = path.join(root, "recent.tmp");
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;

    try {
      await mkdir(nested);
      await writeFile(oldFile, "old");
      await writeFile(recentFile, "recent");
      const oldDate = new Date(cutoff - 60_000);
      await utimes(oldFile, oldDate, oldDate);

      const result = await cleanTempFiles(root, cutoff);

      expect(result).toMatchObject({
        id: "user-temp",
        deletedBytes: 3,
        deletedFiles: 1,
        failedFiles: 0,
      });
      await expect(readFile(oldFile)).rejects.toMatchObject({ code: "ENOENT" });
      await expect(readFile(recentFile, "utf8")).resolves.toBe("recent");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
