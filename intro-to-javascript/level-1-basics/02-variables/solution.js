// =============================================================
// Level 1 · Task 2 — Variables  (SOLUTION)
// =============================================================

// TODO 1 + 2: a name won't change while the program runs, so use const.
const firstName = "mohammed";
const lastName = "Ali";

// TODO 3: age WILL change (TODO 5), so it has to be let.
let age = 20;

// TODO 4: backticks + ${ } put values into the text.
// Before template literals we wrote: firstName + " " + lastName
const fullName = `${firstName} ${lastName}`;

// TODO 5: age++ is short for age = age + 1
age++;

// TODO 6: ${ } can hold any expression, not only a variable name.
const intro = `Hi, I'm ${fullName} and I'm ${age} years old.`;
console.log(intro);

// TODO 7: this line would throw:
//   TypeError: Assignment to constant variable.
// That's const keeping its promise.
// firstName = "Someone else";

// BONUS: each log prints the value at that moment.
let favoriteColor = "blue";
console.log(favoriteColor); // blue
favoriteColor = "green";
console.log(favoriteColor); // green
