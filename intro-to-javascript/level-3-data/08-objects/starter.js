// =============================================================
// Level 3 · Task 2 — Objects
// =============================================================

const student = {
  name: "mohammed",
  age: 20,
  courses: ["HTML", "CSS"], // a value can be an array…
};
console.log("student:", student);


// TODO 1: const studentName = read the name with DOT notation


// TODO 2: read the age with BRACKET notation, using this variable:
const key = "age";
//         const studentAge = student[ ... ]


// TODO 3: add a new property: student.email = "mohammed@example.com"


// TODO 4: add "JavaScript" to the student's courses array
//         (student.courses is an array, so which method adds to an array?)


// TODO 5: return "mohammed is 20 and takes 3 courses."
//         Use person.name, person.age and person.courses.length.
//         Use `person`, not `student`, so it works for ANY object passed in.
function describe(person) {

}


// TODO 6: const book = { title: ..., author: ..., pages: ..., isRead: ... }


// TODO 7: return the number of properties in obj
//         Object.keys(obj) gives you an ARRAY of the property names…
function countKeys(obj) {

}


console.log(describe(student));
