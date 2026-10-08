// =============================================================
// Level 4 · Task 1 — The DOM: select & change  (SOLUTION)
// =============================================================

// TODO 1: querySelector takes the same selectors you write in CSS.
const title = document.querySelector("#title");
title.textContent = "mohammed Ali";

// TODO 2
const subtitle = document.querySelector(".subtitle");
subtitle.textContent = "Learning JavaScript";

// TODO 3: the styling lives in CSS (.profile.highlight). JS only switches it
// on. Keep CSS in charge of looks and JS in charge of behaviour.
const card = document.querySelector("#card");
card.classList.add("highlight");

// TODO 4: createElement makes an element in memory. It only shows up once
// you append it to something that's already on the page.
const skills = ["HTML", "CSS", "JavaScript"];
const list = document.querySelector("#skills");
for (const skill of skills) {
  const li = document.createElement("li");
  li.textContent = skill;
  list.append(li);
}

// TODO 5: querySelectorAll returns a NodeList. It isn't a real array, but it
// has forEach. The index starts at 0, so add 1 for human numbering.
const notes = document.querySelectorAll(".note");
notes.forEach((note, index) => {
  note.textContent = `${index + 1}. ${note.textContent}`;
});

console.log("Changed:", title, subtitle, card);

// BONUS: innerHTML reads the string as HTML, so tags become real elements.
// Never do this with text users typed: they could inject a <script> or
// <img onerror=…>. textContent is always safe.
// title.innerHTML = "<em>mohammed</em> Ali";
