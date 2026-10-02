let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

function searchNotes(word) {
  return notes.filter((note) =>
    note.text.toLowerCase().includes(word.toLowerCase())
  );
}

function longestNote() {
  if (notes.length === 0) {
    return null;
  }
  let longest = notes[0];
  for (const note of notes) {
    if (note.text.length > longest.text.length) {
      longest = note;
    }
  }
  return longest;
}

function countByCategory() {
  const counts = { personal: 0, work: 0, study: 0 };
  for (const note of notes) {
    counts[note.category]++;
  }
  return counts;
}

function getSummary() {
  const counts = countByCategory();
  const word = notes.length === 1 ? "note" : "notes";
  return `${notes.length} ${word}: ${counts.personal} personal, ${counts.work} work, ${counts.study} study.`;
}

function isDuplicate(text) {
  const cleaned = text.trim().toLowerCase();
  return notes.some((note) => note.text.trim().toLowerCase() === cleaned);
}

function addNote(text, category) {
  const cleaned = text.trim();
  if (cleaned.length < 1 || cleaned.length > 200) {
    console.log("Rejected: text must be 1-200 characters.");
    return false;
  }
  if (isDuplicate(cleaned)) {
    console.log("Rejected: duplicate note.");
    return false;
  }
  if (category !== "personal" && category !== "work" && category !== "study") {
    console.log("Rejected: category must be personal, work or study.");
    return false;
  }
  notes.push({ id: notes.length + 1, text: cleaned, category: category });
  console.log("Added: " + cleaned);
  return true;
}

const originalNotes = notes;

console.log(searchNotes("MILK")); // [{ id: 1, text: "Buy milk and bread", category: "personal" }]
console.log(searchNotes("zebra")); // []

console.log(longestNote()); // { id: 3, text: "Email the project report to Grace", category: "work" }
notes = [];
console.log(longestNote()); // null
notes = originalNotes;

console.log(countByCategory()); // { personal: 2, work: 1, study: 2 }
notes = [];
console.log(countByCategory()); // { personal: 0, work: 0, study: 0 }
notes = originalNotes;

console.log(getSummary()); // "5 notes: 2 personal, 1 work, 2 study."
notes = [{ id: 1, text: "Only note", category: "work" }];
console.log(getSummary()); // "1 note: 0 personal, 1 work, 0 study."
notes = originalNotes;

console.log(isDuplicate("  call MUM  ")); // true
console.log(isDuplicate("Walk the dog")); // false

console.log(addNote("Walk the dog", "personal")); // Added: Walk the dog, then true
console.log(addNote("walk the dog", "personal")); // Rejected: duplicate note., then false
console.log(addNote("   ", "work")); // Rejected: text must be 1-200 characters., then false
console.log(addNote("Plan trip", "travel")); // Rejected: category must be personal, work or study., then false