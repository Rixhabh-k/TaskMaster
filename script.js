const checkSound = new Audio("sounds/checked.mp3");

let activeTab = "Today";
let tasks = {
  Today: [],
  Tomorrow: [],
  Important: [],
  Priority: []
};

// Load from Local Storage
const storedTasks = localStorage.getItem("tasksData");
if (storedTasks) {
  tasks = JSON.parse(storedTasks);
}

// Save to Local Storage
function saveTasksToLocalStorage() {
  localStorage.setItem("tasksData", JSON.stringify(tasks));
}

// Switch Tab
function switchTab(el) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  el.classList.add('active');
  activeTab = el.innerText;
  renderTasks();
}

// Render Tasks
function renderTasks() {
  const taskList = document.getElementById("taskList");
  taskList.innerHTML = '';

  tasks[activeTab].forEach((task, index) => {
    const taskDiv = document.createElement("div");
    taskDiv.className = "task";

    taskDiv.innerHTML = `
      <div class="task-left">
        <input type="checkbox" onchange="toggleComplete(this)">
        <span>${task}</span>
      </div>
      <div class="task-right">
        <i class="fas fa-pen-to-square" onclick="editTask(${index})"></i>
        <i class="fas fa-trash" onclick="deleteTask(${index})"></i>
      </div>
    `;
    taskList.appendChild(taskDiv);
  });

  updateStats();
}

// Add Task from Main Input
function addTask() {
  const input = document.getElementById("taskInput");
  const taskText = input.value.trim();
  if (taskText) {
    tasks[activeTab].push(taskText);
    input.value = '';
    saveTasksToLocalStorage();
    renderTasks();
  }
}

// Add Task from Modal
function saveModalTask() {
  const taskText = document.getElementById("modalTaskInput").value.trim();
  const category = document.getElementById("taskCategory").value;
  if (taskText) {
    tasks[category].push(taskText);
    closeModal();
    saveTasksToLocalStorage();
    renderTasks();
  }
}

// Toggle Complete with Sound
function toggleComplete(checkbox) {
  const span = checkbox.nextElementSibling;
  const isChecked = checkbox.checked;
  span.classList.toggle("completed", isChecked);
  if (isChecked) {
    checkSound.currentTime = 0;
    checkSound.play();
  }
  updateStats();
}

// Modal Controls
function openModal() {
  document.getElementById("modalOverlay").style.display = "flex";
}

function closeModal() {
  document.getElementById("modalTaskInput").value = '';
  document.getElementById("modalOverlay").style.display = "none";
}

let editIndex = null;
function editTask(index) {
  editIndex = index;
  document.getElementById("editTaskInput").value = tasks[activeTab][index];
  document.getElementById("editModalOverlay").style.display = "flex";
}

function updateTask() {
  const updatedText = document.getElementById("editTaskInput").value.trim();
  if (updatedText && editIndex !== null) {
    tasks[activeTab][editIndex] = updatedText;
    closeEditModal();
    saveTasksToLocalStorage();
    renderTasks();
  }
}

function closeEditModal() {
  document.getElementById("editModalOverlay").style.display = "none";
  document.getElementById("editTaskInput").value = '';
  editIndex = null;
}

// Undo Toast
let deletedTask = null, deletedIndex = null, deletedFromTab = null, undoTimeout = null;
function deleteTask(index) {
  deletedTask = tasks[activeTab][index];
  deletedIndex = index;
  deletedFromTab = activeTab;
  tasks[activeTab].splice(index, 1);
  saveTasksToLocalStorage();
  renderTasks();
  showUndoToast();
}

function showUndoToast() {
  const toast = document.getElementById("undoToast");
  toast.style.display = "flex";
  clearTimeout(undoTimeout);
  undoTimeout = setTimeout(() => {
    toast.style.display = "none";
    deletedTask = null;
    deletedIndex = null;
    deletedFromTab = null;
  }, 3000);
}

function undoDelete() {
  if (deletedTask !== null && deletedFromTab !== null) {
    tasks[deletedFromTab].splice(deletedIndex, 0, deletedTask);
    saveTasksToLocalStorage();
    renderTasks();
  }
  document.getElementById("undoToast").style.display = "none";
  deletedTask = null;
  deletedIndex = null;
  deletedFromTab = null;
  clearTimeout(undoTimeout);
}

// Stats Count
function updateStats() {
  const total = tasks[activeTab].length;
  let completed = 0;

  document.querySelectorAll('#taskList input[type="checkbox"]').forEach(cb => {
    if (cb.checked) completed++;
  });

  document.getElementById("totalCount").innerText = total;
  document.getElementById("completedCount").innerText = completed;
  document.getElementById("pendingCount").innerText = total - completed;
}

// On Page Load
window.onload = function () {
  renderTasks();
};


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
