// =============================================================
// Level 3 · Task 2 — Objects  (SOLUTION)
// =============================================================

const student = {
  name: "mohammed",
  age: 20,
  courses: ["HTML", "CSS"],
};
console.log("student:", student);

// TODO 1
const studentName = student.name;

// TODO 2: brackets read the property whose name is INSIDE the variable.
// student.key would look for a property literally named "key" → undefined.
const key = "age";
const studentAge = student[key];

// TODO 3: setting a property that doesn't exist yet creates it.
student.email = "mohammed@example.com";

// TODO 4: student.courses IS an array, so it has every array method.
student.courses.push("JavaScript");

// TODO 5: a function that takes an object can be reused for any student.
function describe(person) {
  return `${person.name} is ${person.age} and takes ${person.courses.length} courses.`;
}

// TODO 6: values can be any type: strings, numbers, booleans, arrays, other objects.
const book = {
  title: "Eloquent JavaScript",
  author: "Marijn Haverbeke",
  pages: 472,
  isRead: false,
};

// TODO 7: Object.keys gives back an array, and arrays have .length.
function countKeys(obj) {
  return Object.keys(obj).length;
}

console.log(describe(student));

// BONUS: Object.entries gives [key, value] pairs.
for (const [k, value] of Object.entries(student)) {
  console.log(k, "→", value);
}
