/**
 * Config Store
 * Reads/writes ~/.zynocode/config.json
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

export interface ZynocodeConfig {
  apiKey?: string;
  apiUrl: string;
  defaultWorkspace?: string;
}

const CONFIG_DIR = join(homedir(), ".zynocode");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export function loadConfig(): ZynocodeConfig {
  let fileConfig: Partial<ZynocodeConfig> = {};
  try {
    if (existsSync(CONFIG_FILE)) {
      const raw = readFileSync(CONFIG_FILE, "utf-8");
      fileConfig = JSON.parse(raw);
    }
  } catch {
    fileConfig = {};
  }

  return {
    apiUrl: process.env.ZYNOCODE_API_URL || fileConfig.apiUrl || "https://labs.zynocode.com",
    apiKey: process.env.ZYNOCODE_API_KEY || fileConfig.apiKey,
    defaultWorkspace: fileConfig.defaultWorkspace,
  };
}

export function saveConfig(config: Partial<ZynocodeConfig>): void {
  const existing = loadConfig();
  const merged = { ...existing, ...config };

  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }

  writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), "utf-8");
}

export function getConfigValue(key: keyof ZynocodeConfig): string | undefined {
  const config = loadConfig();
  return config[key] as string | undefined;
}

export function setConfigValue(key: keyof ZynocodeConfig, value: string): void {
  saveConfig({ [key]: value });
}

export function clearConfig(): void {
  saveConfig({ apiKey: undefined, defaultWorkspace: undefined });
}
