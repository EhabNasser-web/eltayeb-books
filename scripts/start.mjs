#!/usr/bin/env node
// تشغيل إنتاج متوافق مع ويندوز ولينكس: يسمع على PORT (Railway) أو 3000 محليًا.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");
const port = String(process.env.PORT ?? "3000");

const child = spawn(process.execPath, [nextBin, "start", "-p", port], { stdio: "inherit" });
child.on("exit", (code) => process.exit(code ?? 1));
