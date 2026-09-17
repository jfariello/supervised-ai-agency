import fs from "node:fs";
import path from "node:path";

export function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, "utf8").replace(/^\uFEFF/, "").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^"|"$/g, "");
  }
}

export function readAivenCa() {
  const caPath = path.join(process.cwd(), "certs", "aiven-ca.pem");
  return fs.existsSync(caPath) ? fs.readFileSync(caPath, "utf8") : undefined;
}
