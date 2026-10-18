// plugins/remove-console.js — a real Babel plugin in ~20 lines.
//
// A plugin is a function that returns { visitor }.
// Babel calls the visitor functions while it walks the AST (step ② TRANSFORM).

export default function removeConsolePlugin({ types: t }) {
  return {
    name: "remove-console",
    visitor: {
      // Runs for every function call: foo(), a.b(), console.log(), ...
      CallExpression(path) {
        const callee = path.get("callee");

        // Is it `console.<something>(...)`?
        if (callee.isMemberExpression() && t.isIdentifier(callee.node.object, { name: "console" })) {
          path.remove(); // delete the whole call from the tree
        }
      },

      // Bonus: replace the identifier __VERSION__ with a string, like a build tool's "define".
      Identifier(path, state) {
        if (path.node.name === "__VERSION__") {
          path.replaceWith(t.stringLiteral(state.opts.version ?? "dev"));
        }
      },
    },
  };
}
