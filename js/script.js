'use strict';

class Task {
  constructor(description, id = null, checked = false) {
    this.description = description;
    this.id = id || `${Date.now().toString().slice(-10)}`;
    this.checked = checked;
  }
}

const body = document.querySelector('body');
const form = document.querySelector('.input-group');
const inputTask = document.querySelector('.input');
const clearTasksBtn = document.querySelector('.clear-btn');
const themeBtn = document.querySelector('[class^="theme-switcher"]');
const taskContainer = document.querySelector('.task-container');
const emptyListMessage = document.querySelector('.empty-list');

const state = {
  allTasks: [],
};

class App {
  constructor() {
    this.loadEventListeners();
    this.loadTasksFromLocalStorage();
    this.renderListFromLocalStorage();
    this.loadThemeFromLocalStorage();
  }

  loadEventListeners() {
    form.addEventListener('submit', this.addNewTask.bind(this));
    themeBtn.addEventListener('click', this.toggleTheme.bind(this));
    clearTasksBtn.addEventListener('click', this.clearAllTasks.bind(this));
  }

  updateList() {
    const tasks = Array.from(taskContainer.getElementsByClassName('task'));

    this.emptyListMessageAndClearBtnToggling(tasks);

    const nonCompletedTasks = tasks.filter(
      task => !task.querySelector('.inner-task').classList.contains('completed')
    );
    const completedTasks = tasks.filter(task =>
      task.querySelector('.inner-task').classList.contains('completed')
    );

    nonCompletedTasks.forEach(task => taskContainer.appendChild(task));
    completedTasks.forEach(task => taskContainer.appendChild(task));
  }

  renderListFromLocalStorage() {
    const tasks = Array.from(taskContainer.getElementsByClassName('task'));

    this.emptyListMessageAndClearBtnToggling(tasks);
  }

  emptyListMessageAndClearBtnToggling(tasks) {
    emptyListMessage.classList.toggle('hidden', tasks.length !== 0);
    clearTasksBtn.classList.toggle('hidden', tasks.length <= 5);
  }

  addNewTask(e) {
    e.preventDefault();
    const description = inputTask.value.trim();

    if (!description) return alert('Please add a description');

    const task = new Task(description);

    state.allTasks.unshift(task);

    this.renderTask(task);
    inputTask.value = '';
    this.updateList();
  }

  renderTask(task) {
    const html = `
        <div class="task">
          <div class="inner-task ${task.checked ? 'completed' : ''}" data-id="${
      task.id
    }">
            <input type="checkbox" id="checkBox" ${
              task.checked ? 'checked' : ''
            } />
            <span>${task.description}</span>
          </div>
          <button class="delete-btn">delete task</button>
        </div>
      `;

    taskContainer.insertAdjacentHTML('afterbegin', html);

    this.bindTaskEvents(taskContainer.querySelector('.task:first-child'));

    this.updateLocalStorage();
  }

  renderTaskFromLocalStorage(task) {
    const html = `
        <div class="task">
          <div class="inner-task ${task.checked ? 'completed' : ''}" data-id="${
      task.id
    }">
            <input type="checkbox"  ${task.checked ? 'checked' : ''} />
            <span>${task.description}</span>
          </div>
          <button class="delete-btn">delete task id</button>
        </div>
      `;

    taskContainer.insertAdjacentHTML('beforeend', html);

    this.bindTaskEvents(taskContainer.querySelector('.task:last-child'));

    this.updateLocalStorage();
  }

  bindTaskEvents(taskElement) {
    const checkbox = taskElement.querySelector('input[type="checkbox"]');
    const deleteButton = taskElement.querySelector('.delete-btn');

    checkbox.addEventListener('change', this.completeTask.bind(this));
    deleteButton.addEventListener('click', this.deleteTask.bind(this));
  }

  updateTask(id) {
    const task = state.allTasks.find(task => task.id === id);
    if (task) task.checked = !task.checked;
    this.updateLocalStorage();
  }

  updateArray(arr, id, newCheckedStatus, action = 'update') {
    // Find the index of the element to update
    let index = arr.findIndex(el => el.id === id);

    // Update the checked status of the element
    arr[index].checked = newCheckedStatus;

    // Remove the element from its current position
    let [element] = arr.splice(index, 1);

    if (action === 'delete') {
      this.updateLocalStorage();
      return;
    }

    if (newCheckedStatus) {
      // When checked changes to true
      // Find the first element with checked: true
      let firstCheckedIndex = arr.findIndex(el => el.checked);

      if (firstCheckedIndex === -1) {
        // If no elements are checked, push the element to the end
        arr.push(element);
      } else {
        // Insert the element before the first checked element
        arr.splice(firstCheckedIndex, 0, element);
      }
    } else {
      // When checked changes to false
      // Find the last element with checked: false
      let lastUncheckedIndex = arr.length - 1;
      while (lastUncheckedIndex >= 0 && arr[lastUncheckedIndex].checked) {
        lastUncheckedIndex--;
      }

      // Insert the element after the last unchecked element
      arr.splice(lastUncheckedIndex + 1, 0, element);
    }

    this.updateLocalStorage();
  }

  completeTask(e) {
    const taskElement = e.target.closest('.inner-task');
    taskElement.classList.toggle('completed');
    this.updateTask(taskElement.dataset.id);

    const element = state.allTasks.find(el => el.id === taskElement.dataset.id);
    this.updateArray(state.allTasks, taskElement.dataset.id, element.checked);

    this.updateList();
  }

  deleteTask(e) {
    e.preventDefault();
    const task = e.target.closest('.task');
    const taskId = task.querySelector('.inner-task').dataset.id;
    task.remove();

    this.updateArray(state.allTasks, taskId, true, 'delete');

    this.updateList();
  }

  clearAllTasks() {
    const allTasks = document.querySelectorAll('.task');
    allTasks.forEach(el => el.remove());

    state.allTasks = [];

    this.updateLocalStorage();
    this.updateList();
  }

  toggleTheme() {
    body.classList.toggle('body-dark');
    themeBtn.classList.toggle('theme-switcher-light');
    themeBtn.classList.toggle('theme-switcher-dark');
    const isDarkTheme = body.classList.contains('body-dark');
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
  }

  loadThemeFromLocalStorage() {
    const theme = localStorage.getItem('theme') || 'light';

    if (theme === 'dark') {
      body.classList.add('body-dark');
      themeBtn.classList.add('theme-switcher-dark');
      themeBtn.classList.remove('theme-switcher-light');
    } else {
      body.classList.remove('body-dark');
      themeBtn.classList.add('theme-switcher-light');
    }
  }

  updateLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(state.allTasks));
  }

  loadTasksFromLocalStorage() {
    console.log('hi');
    try {
      const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

      state.allTasks = tasks.map(
        task => new Task(task.description, task.id, task.checked)
      );
      state.allTasks.forEach(task => this.renderTaskFromLocalStorage(task));
    } catch (error) {
      console.error('Error loading tasks from local storage', error);
      state.allTasks = [];
    }
  }
}

const app = new App();
