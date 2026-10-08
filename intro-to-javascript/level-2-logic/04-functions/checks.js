checks(function () {
  check("TODO 1: square(5) → 25", () => square(5), 25);
  check("TODO 1: square(-3) → 9", () => square(-3), 9);
  check("TODO 2: celsiusToFahrenheit(0) → 32", () => celsiusToFahrenheit(0), 32);
  check("TODO 2: celsiusToFahrenheit(100) → 212", () => celsiusToFahrenheit(100), 212);
  check('TODO 3: greet("mohammed") → "Hello, mohammed!"', () => greet("mohammed"), "Hello, mohammed!");
  check('TODO 3: greet() → "Hello, friend!"', () => greet(), "Hello, friend!");
  check("TODO 4: add is a function", () => typeof add, "function");
  check("TODO 4: add(2, 3) → 5", () => add(2, 3), 5);
  check("TODO 5: priceWithTax(100) → 115", () => priceWithTax(100), 115);
  check("TODO 5: priceWithTax(100, 0) → 100", () => priceWithTax(100, 0), 100);
  check("Bonus: isEven(4) → true and isEven(7) → false", () => isEven(4) === true && isEven(7) === false);
});
