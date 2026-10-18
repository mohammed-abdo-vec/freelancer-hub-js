// src/Button.jsx — JSX is not JavaScript at all.
// No browser understands it; @babel/preset-react turns it into function calls.

export function Button(_ref) {
  var label = _ref.label,
    onClick = _ref.onClick;
  return /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: onClick
  }, label, " ", /*#__PURE__*/React.createElement("span", null, "\u2192"));
}