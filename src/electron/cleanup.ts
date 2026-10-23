import { execFile as execFileCallback } from "node:child_process";
import { lstat, readdir, unlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import type { CleanupItem, CleanupResult } from "../shared/types";

const execFile = promisify(execFileCallback);
const TEMP_FILE_AGE_MS = 24 * 60 * 60 * 1000;

interface TempScan {
  sizeBytes: number;
  fileCount: number;
}

async function scanTempFiles(root: string, cutoff: number): Promise<TempScan> {
  const result: TempScan = { sizeBytes: 0, fileCount: 0 };
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
        if (stats.mtimeMs <= cutoff) {
          result.fileCount += 1;
          result.sizeBytes += stats.size;
        }
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          (error.code === "ENOENT" || error.code === "EACCES" || error.code === "EPERM")
        ) {
          continue;
        }
        throw error;
      }
    }
  }

  return result;
}

async function getRecycleBinSize(): Promise<TempScan> {
  const script = [
    "$ErrorActionPreference = 'Stop'",
    "$shell = New-Object -ComObject Shell.Application",
    "$bin = $shell.Namespace(10)",
    "if ($null -eq $bin) { throw 'No se pudo consultar la Papelera de reciclaje.' }",
    "$items = $bin.Items()",
    "$bytes = [long]0",
    "foreach ($item in $items) { $bytes += [long]$item.Size }",
    "[pscustomobject]@{ fileCount = $items.Count; sizeBytes = $bytes } | ConvertTo-Json -Compress",
  ].join("; ");
  const { stdout } = await execFile(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-STA", "-Command", script],
    { windowsHide: true, timeout: 15_000, maxBuffer: 1024 * 1024 },
  );
  const parsed: unknown = JSON.parse(stdout.trim());
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("fileCount" in parsed) ||
    !("sizeBytes" in parsed) ||
    typeof parsed.fileCount !== "number" ||
    typeof parsed.sizeBytes !== "number"
  ) {
    throw new Error("La respuesta de la Papelera de reciclaje no es válida.");
  }
  return { fileCount: parsed.fileCount, sizeBytes: parsed.sizeBytes };
}

export async function getCleanupPreview(): Promise<CleanupItem[]> {
  const cutoff = Date.now() - TEMP_FILE_AGE_MS;
  const [temp, recycleBin] = await Promise.all([
    scanTempFiles(os.tmpdir(), cutoff),
    getRecycleBinSize(),
  ]);

  return [
    {
      id: "user-temp",
      label: "Archivos temporales de usuario (más de 24 h)",
      path: os.tmpdir(),
      ...temp,
      selected: true,
    },
    {
      id: "recycle-bin",
      label: "Papelera de reciclaje",
      path: "Papelera de reciclaje",
      ...recycleBin,
      selected: false,
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

async function emptyRecycleBin(): Promise<CleanupResult> {
  const before = await getRecycleBinSize();
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
    "Clear-RecycleBin -Force -ErrorAction Stop",
    "[pscustomobject]@{ success = $true } | ConvertTo-Json -Compress",
  ].join("; ");
  await execFile(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-STA", "-Command", script],
    { windowsHide: true, timeout: 60_000, maxBuffer: 1024 * 1024 },
  );
  return {
    id: "recycle-bin",
    deletedBytes: before.sizeBytes,
    deletedFiles: before.fileCount,
    failedFiles: 0,
  };
}

export async function cleanSelectedItems(
  ids: CleanupItem["id"][],
): Promise<CleanupResult[]> {
  const selectedIds = [...new Set(ids)];
  if (selectedIds.length === 0) {
    throw new Error("Selecciona al menos una ubicación para limpiar.");
  }
  if (selectedIds.some((id) => id !== "user-temp" && id !== "recycle-bin")) {
    throw new Error("La solicitud de limpieza contiene una ubicación no válida.");
  }

  const results: CleanupResult[] = [];
  for (const id of selectedIds) {
    try {
      if (id === "user-temp") {
        results.push(
          await cleanTempFiles(os.tmpdir(), Date.now() - TEMP_FILE_AGE_MS),
        );
      } else {
        results.push(await emptyRecycleBin());
      }
    } catch (error) {
      results.push({
        id,
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
