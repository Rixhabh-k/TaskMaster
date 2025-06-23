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


