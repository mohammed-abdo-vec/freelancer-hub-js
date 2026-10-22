# CHAT-4 · Render Markdown and code in answers: implementation spec

> **Story card:** [stories/CHAT-4-rich-rendering.md](../../stories/CHAT-4-rich-rendering.md) · **Depends on:** CHAT-14 · **Read first:** [CONVENTIONS.md](../CONVENTIONS.md)

## Files
| Action | Path | What |
|---|---|---|
| create | `src/shared/components/Markdown.tsx` | `{ children: string }`, `React.memo` (shared, because compare uses it too) |
| create | `src/shared/components/CodeBlock.tsx` | `{ language?: string; code: string; children: ReactNode }` |
| modify | `src/main.tsx` | import one highlight.js theme CSS (for example `highlight.js/styles/github-dark.css`). This is the only global CSS allowed |
| modify | `src/features/chat/components/MessageBubble.tsx` | assistant content → `<Markdown>` |

## Steps
1. `Markdown` = `react-markdown` with `remarkPlugins={[remarkGfm]}` and `rehypePlugins={[rehypeHighlight]}` (`detect: false`, `ignoreMissing: true`). **Never** add `rehype-raw`.
2. The `components` map:
   - `a` → MUI `Link` with `target="_blank" rel="noreferrer"`.
   - `table` → a `Box sx={{ overflowX: 'auto' }}` around a MUI `Table size="small"`; also map `thead`, `tbody`, `tr`, `th` and `td` to MUI parts.
   - `pre` → return its children unwrapped (CodeBlock owns the `<pre>`).
   - `code` → if its `className` matches `language-(\w+)` **or** the parent is a `pre` (block code), render `CodeBlock` with the language and the raw text (`String(children).replace(/\n$/, '')`, getting the text from the node's children); otherwise render inline `Box component="code"` in the theme's `monoFontFamily` with an `action.hover` background and 0.9 em font size.
   - `p`, `ul`, `ol`, `li`, `h1`–`h4`, `blockquote` → MUI `Typography` variants with sensible spacing.
3. `CodeBlock`: a dark container in both themes (use `grey[900]` from the palette, and theme tokens for its text color), with a header bar showing the language (caption, uppercase) and a `CopyButton` (FND-5). Then `<pre>` with `overflowX: auto`, the mono font, 13 px, padding 2.
4. `React.memo(Markdown)` so finished messages don't re-render while a new one streams.

## Acceptance criteria
- [ ] A Mock AI reply (any prompt, once CHAT-2 exists; until then use the seeded messages) shows a table, list, link (new tab) and highlighted code block with a working Copy.
- [ ] A message with `<script>alert(1)</script>` and `<b>x</b>` shows the literal text.
- [ ] Code blocks and tables scroll horizontally at 360 px without widening the page.
- [ ] The code block looks right in both light and dark themes.

## Verify
Seeded conversation, then (after CHAT-2) any mock prompt. For the XSS check, don't edit server data: render `<Markdown>` with an XSS string on a temporary dev-only page, check it, then remove the page.

## Out of scope
- The message footer (CHAT-5).
