checks(function () {
  check('TODO 1: studentName → "mohammed"', () => studentName, "mohammed");
  check("TODO 2: studentAge → 20", () => studentAge, 20);
  check('TODO 3: student.email → "mohammed@example.com"', () => student.email, "mohammed@example.com");
  check('TODO 4: courses include "JavaScript"', () => student.courses.includes("JavaScript"));
  check("TODO 4: courses has 3 items", () => student.courses.length, 3);
  check('TODO 5: describe(student) → "mohammed is 20 and takes 3 courses."', () => describe(student), "mohammed is 20 and takes 3 courses.");
  check("TODO 5: describe works for a different person too", () =>
    describe({ name: "Omar", age: 31, courses: ["Python"] }), "Omar is 31 and takes 1 courses.");
  check("TODO 6: book has a title and author (strings)", () => typeof book.title === "string" && typeof book.author === "string");
  check("TODO 6: book.pages is a number", () => typeof book.pages, "number");
  check("TODO 6: book.isRead is a boolean", () => typeof book.isRead, "boolean");
  check("TODO 7: countKeys({ a: 1, b: 2, c: 3 }) → 3", () => countKeys({ a: 1, b: 2, c: 3 }), 3);
  check("TODO 7: countKeys({}) → 0", () => countKeys({}), 0);
});
