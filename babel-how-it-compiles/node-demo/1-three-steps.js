// 1-three-steps.js — what Babel does INSIDE, one step at a time.
//
//   source code ──► ① PARSE ──► AST ──► ② TRANSFORM ──► new AST ──► ③ GENERATE ──► new code
//     (string)                 (tree)    (plugins edit)   (tree)                    (string)
//
// Babel never "understands" your program. It turns text into a tree,
// lets plugins edit the tree, then prints the tree back out as text.
//
// Run:  npm run steps

import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";

const code = `const double = (n) => n * 2;`;

console.log("\n========== INPUT ==========");
console.log(code);

// ─────────────────────────────────────────────────────────────
// ① PARSE: string → AST (Abstract Syntax Tree)
// ─────────────────────────────────────────────────────────────
// The parser reads characters, groups them into tokens
// (`const`, `double`, `=`, `(`, `n`, ...) and builds a tree
// where every node has a `type`.
const ast = parse(code);

console.log("\n========== ① PARSE → AST (simplified) ==========");
// Print the tree without location info (start/end/loc) so it stays readable.
const strip = (key, value) =>
  ["start", "end", "loc", "range", "extra", "comments", "errors"].includes(key) ? undefined : value;
console.log(JSON.stringify(ast.program.body[0], strip, 2));
//   VariableDeclaration (kind: "const")
//   └── VariableDeclarator
//       ├── id:   Identifier "double"
//       └── init: ArrowFunctionExpression
//                 ├── params: [Identifier "n"]
//                 └── body:   BinaryExpression  n * 2

// ─────────────────────────────────────────────────────────────
// ② TRANSFORM: walk the tree and change nodes
// ─────────────────────────────────────────────────────────────
// `traverse` visits every node. We give it a "visitor": an object whose keys
// are node types. When traverse reaches a node of that type, our function runs.
// This is EXACTLY what a Babel plugin is.
traverse(ast, {
  // Rule 1: `const` / `let` → `var`
  VariableDeclaration(path) {
    if (path.node.kind !== "var") {
      console.log(`\n  [transform] ${path.node.kind} → var`);
      path.node.kind = "var";
    }
  },

  // Rule 2: arrow function → normal function
  //   (n) => n * 2      becomes      function (n) { return n * 2; }
  ArrowFunctionExpression(path) {
    console.log("  [transform] arrow function → function expression");
    const { params, body } = path.node;

    // An arrow with an expression body has an implicit `return`; make it explicit.
    const block = t.isBlockStatement(body)
      ? body
      : t.blockStatement([t.returnStatement(body)]);

    // Build a brand-new node and swap it in place of the old one.
    path.replaceWith(t.functionExpression(null, params, block));
  },
});

// ─────────────────────────────────────────────────────────────
// ③ GENERATE: AST → string
// ─────────────────────────────────────────────────────────────
// The generator walks the (now changed) tree and prints code for each node.
const output = generate(ast).code;

console.log("\n========== ③ GENERATE → OUTPUT ==========");
console.log(output);

// ─────────────────────────────────────────────────────────────
// The SAME thing with the real Babel, in one call
// ─────────────────────────────────────────────────────────────
// @babel/core runs parse → transform → generate for you.
// preset-env is just a big bundle of plugins like the two rules above
// (arrow-functions, block-scoping, classes, optional-chaining, ...).
const { transformSync } = await import("@babel/core");
const real = transformSync(code, {
  configFile: false,
  presets: [["@babel/preset-env", { targets: "ie 11" }]],
});

console.log("\n========== SAME INPUT through @babel/core + preset-env ==========");
console.log(real.code);
console.log();
