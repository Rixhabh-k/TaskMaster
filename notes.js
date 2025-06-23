// Selectors
const addNoteBtn = document.getElementById('addNoteBtn');
const modal = document.getElementById('addNoteModal');
const saveNoteBtn = document.getElementById('saveNoteBtn');
const cancelNoteBtn = document.getElementById('cancelNoteBtn');
const notesGrid = document.querySelector('.notes-grid');
const toast = document.getElementById('undoToast');
const undoBtn = document.getElementById('undoDeleteBtn');
const noteSearchInput = document.getElementById('noteSearchInput');

// Edit modal selectors
const editNoteModal = document.getElementById('editNoteModal');
const editTitleInput = document.getElementById('editNoteTitleInput');
const editContentInput = document.getElementById('editNoteContentInput');
const updateNoteBtn = document.getElementById('updateNoteBtn');
const cancelEditNoteBtn = document.getElementById('cancelEditNoteBtn');

let currentEditIndex = null;
let recentlyDeletedNote = null;
let recentlyDeletedIndex = null;

// Load notes on page load
window.addEventListener('DOMContentLoaded', () => {
  const notes = getNotesFromStorage();
  renderNotes(notes);
});

// Add Note Modal
addNoteBtn.addEventListener('click', () => {
  modal.style.display = 'flex';
});

cancelNoteBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  clearModalInputs();
});

saveNoteBtn.addEventListener('click', () => {
  const title = document.getElementById('noteTitleInput').value.trim();
  const content = document.getElementById('noteContentInput').value.trim();

  if (title && content) {
    const now = new Date();
    const timestamp = now.toLocaleString();
    const note = { title, content, timestamp };

    const notes = getNotesFromStorage();
    notes.push(note);
    saveNotesToStorage(notes);
    renderNotes(notes);

    modal.style.display = 'none';
    clearModalInputs();
  } else {
    alert("Please enter both title and content.");
  }
});

function clearModalInputs() {
  document.getElementById('noteTitleInput').value = '';
  document.getElementById('noteContentInput').value = '';
}

// Utility: get/set localStorage
function getNotesFromStorage() {
  return JSON.parse(localStorage.getItem('notes')) || [];
}

function saveNotesToStorage(notes) {
  localStorage.setItem('notes', JSON.stringify(notes));
}

// Render Notes
function renderNotes(notesToRender) {
  notesGrid.innerHTML = '';
  notesToRender.forEach(note => addNoteToUI(note));
}

// Add Note to UI
function addNoteToUI(note) {
  const noteCard = document.createElement('div');
  noteCard.className = 'note-card';
  noteCard.style.animation = 'fadeIn 0.3s ease';
  noteCard.innerHTML = `
    <div class="note-title">${note.title}</div>
    <div class="note-footer">
      <span class="note-date">${note.timestamp}</span>
      <div class="note-actions">
        <i class="fas fa-edit edit-icon"></i>
        <i class="fas fa-trash delete-icon"></i>
      </div>
    </div>
  `;

  // Delete note
  const deleteIcon = noteCard.querySelector('.delete-icon');
  deleteIcon.addEventListener('click', () => {
    const index = Array.from(notesGrid.children).indexOf(noteCard);
    const notes = getNotesFromStorage();
    recentlyDeletedNote = notes[index];
    recentlyDeletedIndex = index;

    noteCard.style.animation = 'fadeOut 0.4s ease forwards';
    setTimeout(() => {
      notes.splice(index, 1);
      saveNotesToStorage(notes);
      renderNotes(notes);
      showUndoToast();
    }, 500);
  });

  notesGrid.appendChild(noteCard);
}

// Undo Delete
undoBtn.addEventListener('click', () => {
  if (recentlyDeletedNote !== null && recentlyDeletedIndex !== null) {
    const notes = getNotesFromStorage();
    notes.splice(recentlyDeletedIndex, 0, recentlyDeletedNote);
    saveNotesToStorage(notes);
    renderNotes(notes);
    hideUndoToast();
  }
});

function showUndoToast() {
  toast.classList.add('show');
  setTimeout(() => hideUndoToast(), 5000);
}

function hideUndoToast() {
  toast.classList.remove('show');
  recentlyDeletedNote = null;
  recentlyDeletedIndex = null;
}

// Edit Note
notesGrid.addEventListener('click', function (e) {
  if (e.target.classList.contains('edit-icon')) {
    const noteCard = e.target.closest('.note-card');
    const index = Array.from(notesGrid.children).indexOf(noteCard);
    const notes = getNotesFromStorage();

    editTitleInput.value = notes[index].title;
    editContentInput.value = notes[index].content;
    currentEditIndex = index;

    editNoteModal.style.display = 'flex';
  }
});

cancelEditNoteBtn.addEventListener('click', () => {
  editNoteModal.style.display = 'none';
  currentEditIndex = null;
});

updateNoteBtn.addEventListener('click', () => {
  const updatedTitle = editTitleInput.value.trim();
  const updatedContent = editContentInput.value.trim();

  if (updatedTitle && updatedContent && currentEditIndex !== null) {
    const notes = getNotesFromStorage();
    notes[currentEditIndex].title = updatedTitle;
    notes[currentEditIndex].content = updatedContent;

    saveNotesToStorage(notes);
    renderNotes(notes);

    editNoteModal.style.display = 'none';
    currentEditIndex = null;
  } else {
    alert("Please enter both title and content.");
  }
});

// View Note Modal
const viewNoteModal = document.getElementById('viewNoteModal');
const viewNoteTitle = document.getElementById('viewNoteTitle');
const viewNoteContent = document.getElementById('viewNoteContent');
const viewNoteTimestamp = document.getElementById('viewNoteTimestamp');
const closeViewNoteBtn = document.getElementById('closeViewNoteBtn');

notesGrid.addEventListener('click', function (e) {
  const noteCard = e.target.closest('.note-card');
  if (!noteCard || e.target.classList.contains('edit-icon') || e.target.classList.contains('delete-icon')) return;

  const index = Array.from(notesGrid.children).indexOf(noteCard);
  const notes = getNotesFromStorage();

  const note = notes[index];
  viewNoteTitle.textContent = note.title;
  viewNoteContent.textContent = note.content;
  viewNoteTimestamp.textContent = `Created on: ${note.timestamp}`;
  viewNoteModal.style.display = 'flex';
});

closeViewNoteBtn.addEventListener('click', () => {
  viewNoteModal.style.display = 'none';
});

// 🔍 Live Search by Title
noteSearchInput.addEventListener('input', function () {
  const query = this.value.toLowerCase();
  const notes = getNotesFromStorage();
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(query)
  );
  renderNotes(filteredNotes);
});
