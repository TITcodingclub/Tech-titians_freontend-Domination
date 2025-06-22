// Application State
const appState = {
    theme: localStorage.getItem('theme') || 'light',
    colorVariant: localStorage.getItem('colorVariant') || 'blue',
    goals: [
        {
            id: 1,
            title: "Read 24 books this year",
            current: 12,
            target: 24,
            color: "blue"
        },
        {
            id: 2,
            title: "Exercise 150 times",
            current: 89,
            target: 150,
            color: "emerald"
        },
        {
            id: 3,
            title: "Learn Spanish",
            current: 32,
            target: 100,
            color: "violet"
        }
    ],
    tasks: [
        { id: 1, title: "Morning workout", completed: true },
        { id: 2, title: "Review Spanish flashcards", completed: true },
        { id: 3, title: "Read 25 pages", completed: true },
        { id: 4, title: "Prepare presentation", completed: false },
        { id: 5, title: "Call mom", completed: false },
        { id: 6, title: "Plan weekend trip", completed: false },
        { id: 7, title: "Write journal entry", completed: false }
    ],
    currentMood: 'happy',
    editingGoal: null
};

// Color variants mapping
const colorVariants = {
    blue: '#3b82f6',
    violet: '#8b5cf6',
    emerald: '#10b981',
    rose: '#f43f5e'
};

// Initialize application
document.addEventListener('DOMContentLoaded', function () {
    initializeTheme();
    initializeColorVariant();
    renderGoals();
    renderTasks();
    updateTaskCounter();
    bindEventListeners();
    // Add fade-in animation to widgets
    const widgets = document.querySelectorAll('.widget');
    widgets.forEach((widget, index) => {
        setTimeout(() => {
            widget.classList.add('fade-in');
        }, index * 100);
    });
});

// Theme Management
function initializeTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    if (appState.theme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeToggle.classList.add('active');
    }
}

function toggleTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    appState.theme = appState.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', appState.theme);

    if (appState.theme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeToggle.classList.add('active');
    } else {
        body.removeAttribute('data-theme');
        themeToggle.classList.remove('active');
    }

    showToast('Theme updated successfully!');
}
// Color Variant Management
function initializeColorVariant() {
    updateColorVariant(appState.colorVariant);

    // Set active color button
    const colorBtns = document.querySelectorAll('.color-btn');
    colorBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.color === appState.colorVariant) {
            btn.classList.add('active');
        }
    });
}

function updateColorVariant(variant) {
    appState.colorVariant = variant;
    localStorage.setItem('colorVariant', variant);

    const root = document.documentElement;
    root.style.setProperty('--accent-current', colorVariants[variant]);

    showToast('Color theme updated!');
};

document.getElementById('goalForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const title = document.getElementById('goalTitle').value.trim();
    const target = parseInt(document.getElementById('goalTarget').value, 10);
    const color = document.getElementById('goalColor').value;

    if (title && !isNaN(target) && color) {
        const newGoal = {
            id: Date.now(),
            title,
            current: 0,
            target,
            color
        };

        appState.goals.push(newGoal);
        console.log('Goal added:', newGoal);
        renderGoals();


        // Optionally update UI here
        // Hide modal
        const modalElement = document.getElementById('addGoalModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();

        // Reset form
        this.reset();
    }
});
document.getElementById('taskForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const taskTitle = document.getElementById('taskTitle').value.trim();
    if (taskTitle) {
        const newTask = {
            id: Date.now(),
            title: taskTitle,
            completed: false
        };

        appState.tasks.push(newTask);
        renderTasks();

        // Close modal
        const taskModalEl = document.getElementById('addTaskModal');
        const taskModal = bootstrap.Modal.getInstance(taskModalEl);
        taskModal.hide();

        // Reset form
        this.reset();
    }
});

function renderGoals() {
    const goalsList = document.getElementById('goalList');
    goalsList.innerHTML = '';

    appState.goals.forEach(goal => {
        const progress = Math.round((goal.current / goal.target) * 100);
        const goalElement = createGoalElement(goal, progress);
        goalsList.appendChild(goalElement);
    });
}





function createGoalElement(goal, progress) {
    const goalDiv = document.createElement('div');
    goalDiv.className = 'goal-item';
    goalDiv.innerHTML = `
        <div class="goal-header">
            <span class="goal-title" data-goal-id="${goal.id}" data-field="title">${goal.title}</span>
            <span class="goal-progress-text">
                <span data-goal-id="${goal.id}" data-field="current">${goal.current}</span>
                /
                <span data-goal-id="${goal.id}" data-field="target">${goal.target}</span>
            </span>
        </div>
        <div class="goal-progress-bar">
            <div class="goal-progress-fill" style="width: ${progress}%"></div>
        </div>
    `;

    return goalDiv;
}

function makeGoalEditable(element, goalId, field) {
    const currentValue = element.textContent;
    const input = document.createElement('input');
    input.className = 'editable-input';
    input.value = currentValue;
    input.dataset.goalId = goalId;
    input.dataset.field = field;

    // Replace element with input
    element.replaceWith(input);
    input.focus();
    input.select();

    // Handle save on blur or enter
    const saveEdit = () => {
        const newValue = field === 'title' ? input.value : parseInt(input.value);
        updateGoal(goalId, field, newValue);

        // Replace input back with span
        const span = document.createElement('span');
        span.className = element.className;
        span.dataset.goalId = goalId;
        span.dataset.field = field;
        span.textContent = newValue;
        input.replaceWith(span);

        renderGoals(); // Re-render to update progress bars
    };

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveEdit();
        } else if (e.key === 'Escape') {
            input.replaceWith(element);
        }
    });
}

function updateGoal(goalId, field, value) {
    const goal = appState.goals.find(g => g.id === goalId);
    if (goal) {
        goal[field] = value;
        showToast('Goal updated successfully!');
    }
}

// Tasks Management
function renderTasks() {
    const tasksList = document.getElementById('tasksList');
    tasksList.innerHTML = '';

    appState.tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        tasksList.appendChild(taskElement);
    });
}

function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.className = 'task-item';
    taskDiv.innerHTML = `
        <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}">
            ${task.completed ? '✓' : ''}
        </div>
        <span class="task-text ${task.completed ? 'completed' : ''}">${task.title}</span>
    `;

    return taskDiv;
}

function toggleTask(taskId) {
    const task = appState.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        renderTasks();
        updateTaskCounter();
        showToast('Task updated!');
    }
}

function updateTaskCounter() {
    const completedCount = appState.tasks.filter(task => task.completed).length;
    const totalCount = appState.tasks.length;
    const counter = document.getElementById('taskCounter');
    counter.textContent = `${completedCount}/${totalCount}`;
}

// Mood Management
function updateMood(mood) {
    appState.currentMood = mood;
    const currentMoodElement = document.getElementById('currentMood');
    const moodEmojis = {
        amazing: '🤩',
        happy: '😊',
        neutral: '😐',
        sad: '😔',
        stressed: '😰'
    };

    currentMoodElement.textContent = moodEmojis[mood];

    // Update active mood button
    const moodBtns = document.querySelectorAll('.mood-btn');
    moodBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mood === mood) {
            btn.classList.add('active');
        }
    });

    showToast('Mood logged successfully!');
}

// Action Handlers
function handleQuickAction(action) {
    const actionNames = {
        reading: 'Log Reading',
        workout: 'Log Workout',
        spanish: 'Practice Spanish'
    };

    showToast(`${actionNames[action]} logged!`);
}

function handleCoachMessage() {
    showToast('Message sent to coach!');
}

// Toast Notifications
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    toastMessage.textContent = message;
    toast.classList.remove('hidden');
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 300);
    }, 2000);
}

// Event Listeners
function bindEventListeners() {
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);

    // Color variant buttons
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateColorVariant(btn.dataset.color);
        });
    });

    // Goal editing - use event delegation
    document.addEventListener('click', (e) => {
        if (e.target.hasAttribute('data-goal-id') && e.target.hasAttribute('data-field')) {
            const goalId = parseInt(e.target.dataset.goalId);
            const field = e.target.dataset.field;
            makeGoalEditable(e.target, goalId, field);
        }
    });

    // Task checkboxes
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('task-checkbox')) {
            const taskId = parseInt(e.target.dataset.taskId);
            toggleTask(taskId);
        }
    });

    // Mood buttons
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            updateMood(btn.dataset.mood);
        });
    });

    // Quick action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            handleQuickAction(btn.dataset.action);
        });
    });

    // Coach message button
    document.querySelector('.message-coach-btn').addEventListener('click', handleCoachMessage);
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Animation helpers
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.goal-progress-fill');
    progressBars.forEach((bar, index) => {
        setTimeout(() => {
            bar.style.width = bar.style.width; // Trigger reflow
        }, index * 200);
    });
}

// Initialize progress bar animations after DOM load
window.addEventListener('load', () => {
    setTimeout(animateProgressBars, 500);
});

// Handle window resize for responsive layout
window.addEventListener('resize', debounce(() => {
    // Responsive adjustments if needed
}, 250));

