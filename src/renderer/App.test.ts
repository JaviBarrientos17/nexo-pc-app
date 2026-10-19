import { describe, expect, it } from "vitest";
import { getInitialLanguage, translateText } from "./localization";
import { normalizeCpuUsage, normalizePowerShellArray } from "../electron/system";

describe("Nexo PC", () => {
  it("preserves zero CPU readings and bounds invalid readings", () => {
    expect(normalizeCpuUsage(0, 12)).toBe(0);
    expect(normalizeCpuUsage("0", 12)).toBe(0);
    expect(normalizeCpuUsage(125, 12)).toBe(100);
    expect(normalizeCpuUsage(-4, 12)).toBe(0);
    expect(normalizeCpuUsage(undefined, 12)).toBe(12);
    expect(normalizeCpuUsage(undefined)).toBeUndefined();
  });

  it("normalizes PowerShell singleton and empty array results", () => {
    expect(normalizePowerShellArray({ slot: "A1" })).toEqual([{ slot: "A1" }]);
    expect(normalizePowerShellArray([{ slot: "A1" }, { slot: "B1" }])).toHaveLength(2);
    expect(normalizePowerShellArray(null)).toEqual([]);
  });

  it("uses an explicit language preference before the device language", () => {
    expect(getInitialLanguage("en", ["es-ES"])).toBe("en");
    expect(getInitialLanguage("es", ["en-US"])).toBe("es");
  });

  it("detects supported device languages and falls back to Spanish", () => {
    expect(getInitialLanguage(null, ["fr-FR", "en-GB"])).toBe("en");
    expect(getInitialLanguage(null, ["es-MX"])).toBe("es");
    expect(getInitialLanguage(null, ["fr-FR", "de-DE"])).toBe("es");
  });

  it("keeps usage percentages within bounds", () => {
    const bounded = (value: number) => Math.max(0, Math.min(100, value));
    expect(bounded(145)).toBe(100);
    expect(bounded(-4)).toBe(0);
    expect(bounded(75)).toBe(75);
  });

  it("accurately updates min and max hardware sensor values", () => {
    const history: Record<string, { min: number; max: number }> = {};
    const track = (key: string, val: number) => {
      const cur = history[key];
      if (!cur) {
        history[key] = { min: val, max: val };
      } else {
        history[key] = {
          min: Math.min(cur.min, val),
          max: Math.max(cur.max, val)
        };
      }
    };

    track("cpu_temp", 45);
    expect(history["cpu_temp"]).toEqual({ min: 45, max: 45 });

    track("cpu_temp", 38);
    expect(history["cpu_temp"]).toEqual({ min: 38, max: 45 });

    track("cpu_temp", 62);
    expect(history["cpu_temp"]).toEqual({ min: 38, max: 62 });
  });

  it("calculates disk and RAM conversion to GB correctly", () => {
    const toGb = (bytes: number) => Math.round((bytes / 1024 ** 3) * 10) / 10;
    const testBytes = 16 * 1024 * 1024 * 1024; // 16 GB
    expect(toGb(testBytes)).toBe(16);
  });

  it("translates static and dynamic interface text while preserving Spanish", () => {
    expect(translateText("Ajustes", "en")).toBe("Settings");
    expect(translateText("Ahora no", "en")).toBe("Not now");
    expect(translateText("ACTUALIZACIONES", "en")).toBe("UPDATES");
    expect(translateText("3 de 4 comprobaciones disponibles", "en")).toBe(
      "3 of 4 checks available",
    );
    expect(translateText("Descargar y actualizar", "en")).toBe("Download and update");
    expect(translateText("Ajustes", "es")).toBe("Ajustes");
  });
});
