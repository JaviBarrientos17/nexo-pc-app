import { execFile as execFileCallback } from "node:child_process";
import { lstat, readdir, rm, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type {
  CleanupCategoryId,
  CleanupFileEntry,
  CleanupItem,
  CleanupResult,
  CleanupRunOptions,
} from "../shared/types";

const execFile = promisify(execFileCallback);
export const TEMP_FILE_AGE_MS = 24 * 60 * 60 * 1000;

interface DetailedTempScan {
  sizeBytes: number;
  fileCount: number;
  files: CleanupFileEntry[];
}

export async function scanTempFilesDetailed(
  root: string,
  cutoff: number,
  maxEntries = 3000,
): Promise<DetailedTempScan> {
  const result: DetailedTempScan = { sizeBytes: 0, fileCount: 0, files: [] };
  const directories = [root];

  while (directories.length > 0) {
    const directory = directories.pop();
    if (!directory) continue;

    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        (error.code === "EACCES" || error.code === "EPERM" || error.code === "ENOENT")
      ) {
        continue;
      }
      continue;
    }

    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        directories.push(entryPath);
        continue;
      }
      if (!entry.isFile()) continue;

      try {
        const stats = await lstat(entryPath);
        result.fileCount += 1;
        result.sizeBytes += stats.size;

        if (result.files.length < maxEntries) {
          const ext = path.extname(entry.name).toUpperCase().replace(/^\./, "");
          result.files.push({
            id: entryPath,
            name: entry.name,
            path: entryPath,
            category: "user-temp",
            sizeBytes: stats.size,
            modifiedAt: stats.mtime.toISOString(),
            isOlderThan24h: stats.mtimeMs <= cutoff,
            itemType: ext || "TMP",
            isDirectory: false,
          });
        }
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          (error.code === "ENOENT" || error.code === "EACCES" || error.code === "EPERM")
        ) {
          continue;
        }
      }
    }
  }

  // Sort collected files by size descending by default
  result.files.sort((a, b) => b.sizeBytes - a.sizeBytes);

  return result;
}

interface RawRecycleItem {
  name: string;
  path: string;
  sizeBytes: number;
  originalPath?: string;
  deletedAt?: string;
  itemType?: string;
}

export async function getRecycleBinDetails(): Promise<DetailedTempScan> {
  const script = [
    "$ErrorActionPreference = 'SilentlyContinue'",
    "$shell = New-Object -ComObject Shell.Application",
    "$bin = $shell.Namespace(10)",
    "if ($null -eq $bin) { '[]'; exit 0 }",
    "$items = @()",
    "foreach ($item in $bin.Items()) {",
    "  $items += [pscustomobject]@{",
    "    name = $item.Name",
    "    path = $item.Path",
    "    sizeBytes = [long]$item.Size",
    "    originalPath = $bin.GetDetailsOf($item, 1)",
    "    deletedAt = $bin.GetDetailsOf($item, 2)",
    "    itemType = $bin.GetDetailsOf($item, 4)",
    "  }",
    "}",
    "if ($items.Count -eq 0) { '[]' } else { @($items) | ConvertTo-Json -Compress }",
  ].join("\n");

  try {
    const { stdout } = await execFile(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-STA", "-Command", script],
      { windowsHide: true, timeout: 15_000, maxBuffer: 4 * 1024 * 1024 },
    );

    const trimmed = stdout.trim();
    if (!trimmed) {
      return { sizeBytes: 0, fileCount: 0, files: [] };
    }

    const parsed: unknown = JSON.parse(trimmed);
    const rawList: RawRecycleItem[] = Array.isArray(parsed)
      ? (parsed as RawRecycleItem[])
      : parsed && typeof parsed === "object"
        ? [parsed as RawRecycleItem]
        : [];

    let totalBytes = 0;
    const files: CleanupFileEntry[] = rawList.map((item) => {
      const bytes = Number(item.sizeBytes) || 0;
      totalBytes += bytes;
      const cleanDeletedAt = item.deletedAt ? item.deletedAt.replace(/[\u200e\u200f?]/g, "").trim() : undefined;
      const ext = path.extname(item.name || "").toUpperCase().replace(/^\./, "") || (item.itemType || "BIN");

      return {
        id: item.path,
        name: item.name || path.basename(item.path),
        path: item.path,
        originalPath: item.originalPath || undefined,
        category: "recycle-bin" as CleanupCategoryId,
        sizeBytes: bytes,
        deletedAt: cleanDeletedAt,
        isOlderThan24h: true,
        itemType: ext,
        isDirectory: false,
      };
    });

    files.sort((a, b) => b.sizeBytes - a.sizeBytes);

    return {
      sizeBytes: totalBytes,
      fileCount: files.length,
      files,
    };
  } catch (error) {
    console.warn("Could not query detailed recycle bin items:", error);
    return { sizeBytes: 0, fileCount: 0, files: [] };
  }
}

export async function getCleanupPreview(): Promise<CleanupItem[]> {
  const cutoff = Date.now() - TEMP_FILE_AGE_MS;
  const [temp, recycleBin] = await Promise.all([
    scanTempFilesDetailed(os.tmpdir(), cutoff),
    getRecycleBinDetails(),
  ]);

  return [
    {
      id: "user-temp",
      label: "Archivos temporales de usuario",
      path: os.tmpdir(),
      sizeBytes: temp.sizeBytes,
      fileCount: temp.fileCount,
      selected: true,
      files: temp.files,
    },
    {
      id: "recycle-bin",
      label: "Papelera de reciclaje",
      path: "Papelera de reciclaje",
      sizeBytes: recycleBin.sizeBytes,
      fileCount: recycleBin.fileCount,
      selected: true,
      files: recycleBin.files,
    },
  ];
}

export async function cleanTempFiles(
  root: string,
  cutoff: number,
): Promise<CleanupResult> {
  const result: CleanupResult = {
    id: "user-temp",
    deletedBytes: 0,
    deletedFiles: 0,
    failedFiles: 0,
  };
  const directories = [root];

  while (directories.length > 0) {
    const directory = directories.pop();
    if (!directory) continue;
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        continue;
      }
      if (
        error instanceof Error &&
        "code" in error &&
        (error.code === "EACCES" || error.code === "EPERM")
      ) {
        result.failedFiles += 1;
        continue;
      }
      throw error;
    }

    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        directories.push(entryPath);
        continue;
      }
      if (!entry.isFile()) continue;

      try {
        const stats = await lstat(entryPath);
        if (stats.mtimeMs > cutoff) continue;
        await unlink(entryPath);
        result.deletedFiles += 1;
        result.deletedBytes += stats.size;
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === "ENOENT"
        ) {
          continue;
        }
        result.failedFiles += 1;
      }
    }
  }
  return result;
}

export async function emptyRecycleBin(): Promise<CleanupResult> {
  const before = await getRecycleBinDetails();
  if (before.fileCount === 0) {
    return {
      id: "recycle-bin",
      deletedBytes: 0,
      deletedFiles: 0,
      failedFiles: 0,
    };
  }
  const script = [
    "$ErrorActionPreference = 'Stop'",
    "Clear-RecycleBin -Force -ErrorAction SilentlyContinue",
    "[pscustomobject]@{ success = $true } | ConvertTo-Json -Compress",
  ].join("; ");
  try {
    await execFile(
      "powershell.exe",
      ["-NoProfile", "-NonInteractive", "-STA", "-Command", script],
      { windowsHide: true, timeout: 60_000, maxBuffer: 1024 * 1024 },
    );
  } catch (error) {
    console.warn("Clear-RecycleBin warning:", error);
  }

  return {
    id: "recycle-bin",
    deletedBytes: before.sizeBytes,
    deletedFiles: before.fileCount,
    failedFiles: 0,
  };
}

export async function cleanSpecificFiles(
  filePaths: string[],
): Promise<CleanupResult> {
  const result: CleanupResult = {
    id: "custom-selection",
    deletedBytes: 0,
    deletedFiles: 0,
    failedFiles: 0,
  };

  const recycleBinPaths: string[] = [];
  const normalPaths: string[] = [];

  for (const p of filePaths) {
    if (p.includes("$Recycle.Bin") || p.includes("$RECYCLE.BIN")) {
      recycleBinPaths.push(p);
    } else {
      normalPaths.push(p);
    }
  }

  // 1. Delete regular files (temporary files)
  for (const filePath of normalPaths) {
    try {
      const stats = await lstat(filePath);
      await rm(filePath, { recursive: true, force: true });
      result.deletedFiles += 1;
      result.deletedBytes += stats.size;
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        // File was already gone, consider cleaned
        continue;
      }
      result.failedFiles += 1;
    }
  }

  // 2. Delete specific recycle bin items via PowerShell
  if (recycleBinPaths.length > 0) {
    const tempFile = path.join(
      os.tmpdir(),
      `nexo-recycle-delete-${Date.now()}-${Math.random().toString(36).substring(2)}.json`,
    );

    try {
      await writeFile(tempFile, JSON.stringify(recycleBinPaths), "utf8");
      const script = [
        "$ErrorActionPreference = 'SilentlyContinue'",
        `$paths = Get-Content -LiteralPath '${tempFile.replace(/'/g, "''")}' -Raw | ConvertFrom-Json`,
        "$deletedCount = 0",
        "foreach ($p in $paths) {",
        "  if (Test-Path -LiteralPath $p) {",
        "    try {",
        "      Remove-Item -LiteralPath $p -Recurse -Force -ErrorAction Stop",
        "      $deletedCount++",
        "    } catch {}",
        "  }",
        "}",
        "[pscustomobject]@{ deleted = $deletedCount } | ConvertTo-Json -Compress",
      ].join("\n");

      const { stdout } = await execFile(
        "powershell.exe",
        ["-NoProfile", "-NonInteractive", "-STA", "-Command", script],
        { windowsHide: true, timeout: 30_000 },
      );

      const parsed = JSON.parse(stdout.trim() || '{"deleted": 0}');
      const deletedCount = Number(parsed.deleted) || recycleBinPaths.length;
      result.deletedFiles += deletedCount;
    } catch (error) {
      console.warn("Failed deleting some recycle bin items:", error);
      result.failedFiles += recycleBinPaths.length;
    } finally {
      await unlink(tempFile).catch(() => {});
    }
  }

  return result;
}

export async function cleanSelectedItems(
  target: (CleanupCategoryId | string)[] | CleanupRunOptions,
): Promise<CleanupResult[]> {
  let categoryIds: CleanupCategoryId[] = [];
  let fileIds: string[] = [];

  if (Array.isArray(target)) {
    for (const item of target) {
      if (item === "user-temp" || item === "recycle-bin" || item === "system-temp") {
        categoryIds.push(item);
      } else if (typeof item === "string" && item.length > 0) {
        fileIds.push(item);
      }
    }
  } else if (target && typeof target === "object") {
    categoryIds = target.categoryIds ?? [];
    fileIds = target.fileIds ?? [];
  }

  if (categoryIds.length === 0 && fileIds.length === 0) {
    throw new Error("Selecciona al menos una ubicación o archivo para limpiar.");
  }

  const results: CleanupResult[] = [];

  // If specific files were selected, execute granular cleanup
  if (fileIds.length > 0) {
    results.push(await cleanSpecificFiles(fileIds));
  }

  // If entire categories were chosen (and no specific file IDs given for that category)
  for (const cat of categoryIds) {
    try {
      if (cat === "user-temp") {
        results.push(
          await cleanTempFiles(os.tmpdir(), Date.now() - TEMP_FILE_AGE_MS),
        );
      } else if (cat === "recycle-bin") {
        results.push(await emptyRecycleBin());
      }
    } catch (error) {
      results.push({
        id: cat,
        deletedBytes: 0,
        deletedFiles: 0,
        failedFiles: 0,
        error:
          error instanceof Error
            ? error.message
            : "No se pudo limpiar esta ubicación.",
      });
    }
  }

  return results;
}
