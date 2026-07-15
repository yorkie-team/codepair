#!/usr/bin/env node

import { runCli } from "./main.js";

process.exitCode = await runCli(process.argv.slice(2));
