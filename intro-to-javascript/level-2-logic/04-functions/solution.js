// =============================================================
// Level 2 · Task 1 — Functions  (SOLUTION)
// =============================================================

function double(n) {
  return n * 2;
}
console.log("double(4) =", double(4));

// TODO 1
function square(n) {
  return n * n;
}

// TODO 2: * and / run left to right, then + 32.
function celsiusToFahrenheit(c) {
  return c * 9 / 5 + 32;
}

// TODO 3: the default is only used when the argument is missing (undefined).
function greet(name = "friend") {
  return `Hello, ${name}!`;
}

// TODO 4: an arrow function with no { } returns the expression automatically.
// The long version would be:
//   const add = (a, b) => { return a + b; };
const add = (a, b) => a + b;

// TODO 5: defaults work with more than one parameter.
function priceWithTax(price, taxRate = 0.15) {
  return price + price * taxRate;
}

console.log(square(5), celsiusToFahrenheit(100), greet(), greet("mohammed"), add(2, 3));

// TODO 6
function logDouble(n) {
  console.log(n * 2);
}
const result = logDouble(5);
console.log("result is", result);
// Answer: logDouble PRINTS 10 but never RETURNS anything. A function with
// no return gives back undefined, so result is undefined.

// BONUS: n % 2 === 0 is already true or false. No if needed.
const isEven = (n) => n % 2 === 0;
