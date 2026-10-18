// 2-custom-plugin.js — use our own plugin with @babel/core.
// Run:  npm run plugin

import { transformSync } from "@babel/core";
import removeConsole from "./plugins/remove-console.js";

const code = `
function login(user) {
  console.log("logging in", user);
  const banner = "App v" + __VERSION__;
  console.warn("deprecated API");
  return { user, banner };
}
`;

const result = transformSync(code, {
  configFile: false,                                // ignore babel.config.json for this demo
  plugins: [[removeConsole, { version: "2.4.0" }]], // [plugin, options] → options arrive in state.opts
});

console.log("---------- INPUT ----------");
console.log(code.trim());
console.log("\n---------- OUTPUT (remove-console plugin) ----------");
console.log(result.code);
