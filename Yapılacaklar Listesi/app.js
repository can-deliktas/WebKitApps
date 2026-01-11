// ========================================
// To-Do List Application
// ========================================

class TodoApp {
    constructor() {
        // DOM Elements
        this.form = document.getElementById('addTaskForm');
        this.taskInput = document.getElementById('taskInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.tasksList = document.getElementById('tasksList');
        this.emptyState = document.getElementById('emptyState');
        this.themeToggle = document.getElementById('themeToggle');
        this.sortSelect = document.getElementById('sortSelect');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        
        // Stats elements
        this.totalTasksEl = document.getElementById('totalTasks');
        this.activeTasksEl = document.getElementById('activeTasks');
        this.completedTasksEl = document.getElementById('completedTasks');
        
        // Filter buttons
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.priorityFilterBtns = document.querySelectorAll('.priority-filter-btn');
        
        // State
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentPriorityFilter = 'all';
        this.currentSort = 'date-desc';
        
        // Priority values for sorting
        this.priorityValues = {
            high: 3,
            medium: 2,
            low: 1
        };
        
        // Priority labels (Turkish)
        this.priorityLabels = {
            high: 'Yüksek',
            medium: 'Orta',
            low: 'Düşük'
        };
        
        // Initialize
        this.init();
    }
    
    init() {
        this.loadTheme();
        this.loadTasks();
        this.bindEvents();
        this.render();
    }
    
    // ========================================
    // Theme Management
    // ========================================
    
    loadTheme() {
        const savedTheme = localStorage.getItem('todo-theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('todo-theme', newTheme);
    }
    
    // ========================================
    // Local Storage
    // ========================================
    
    loadTasks() {
        const saved = localStorage.getItem('todo-tasks');
        if (saved) {
            this.tasks = JSON.parse(saved);
        }
    }
    
    saveTasks() {
        localStorage.setItem('todo-tasks', JSON.stringify(this.tasks));
    }
    
    // ========================================
    // Event Binding
    // ========================================
    
    bindEvents() {
        // Form submit
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });
        
        // Theme toggle
        this.themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Sort change
        this.sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.render();
        });
        
        // Clear completed
        this.clearCompletedBtn.addEventListener('click', () => {
            this.clearCompleted();
        });
        
        // Status filter buttons
        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = btn.dataset.filter;
                this.render();
            });
        });
        
        // Priority filter buttons
        this.priorityFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.priorityFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentPriorityFilter = btn.dataset.priority;
                this.render();
            });
        });
        
        // Task list delegation
        this.tasksList.addEventListener('click', (e) => {
            const taskItem = e.target.closest('.task-item');
            if (!taskItem) return;
            
            const taskId = taskItem.dataset.id;
            
            if (e.target.classList.contains('task-checkbox')) {
                this.toggleTask(taskId);
            } else if (e.target.classList.contains('task-delete')) {
                this.deleteTask(taskId);
            }
        });
        
        // Keyboard shortcut (Enter to add)
        this.taskInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.addTask();
            }
        });
    }
    
    // ========================================
    // Task Operations
    // ========================================
    
    addTask() {
        const text = this.taskInput.value.trim();
        if (!text) return;
        
        const task = {
            id: this.generateId(),
            text: text,
            priority: this.prioritySelect.value,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.unshift(task);
        this.saveTasks();
        this.render();
        
        // Clear input
        this.taskInput.value = '';
        this.taskInput.focus();
    }
    
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.render();
        }
    }
    
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
    }
    
    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) return;
        
        if (confirm(`${completedCount} tamamlanan görev silinecek. Emin misiniz?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
        }
    }
    
    // ========================================
    // Filtering & Sorting
    // ========================================
    
    getFilteredTasks() {
        let filtered = [...this.tasks];
        
        // Status filter
        if (this.currentFilter === 'active') {
            filtered = filtered.filter(t => !t.completed);
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(t => t.completed);
        }
        
        // Priority filter
        if (this.currentPriorityFilter !== 'all') {
            filtered = filtered.filter(t => t.priority === this.currentPriorityFilter);
        }
        
        // Sorting
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'date-desc':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'date-asc':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'priority-desc':
                    return this.priorityValues[b.priority] - this.priorityValues[a.priority];
                case 'priority-asc':
                    return this.priorityValues[a.priority] - this.priorityValues[b.priority];
                default:
                    return 0;
            }
        });
        
        return filtered;
    }
    
    // ========================================
    // Rendering
    // ========================================
    
    render() {
        const filteredTasks = this.getFilteredTasks();
        
        // Update stats
        this.updateStats();
        
        // Clear list
        this.tasksList.innerHTML = '';
        
        // Show empty state or tasks
        if (filteredTasks.length === 0) {
            this.emptyState.classList.add('visible');
            this.tasksList.style.display = 'none';
        } else {
            this.emptyState.classList.remove('visible');
            this.tasksList.style.display = 'flex';
            
            filteredTasks.forEach(task => {
                const taskEl = this.createTaskElement(task);
                this.tasksList.appendChild(taskEl);
            });
        }
    }
    
    createTaskElement(task) {
        const div = document.createElement('div');
        div.className = `task-item priority-${task.priority}${task.completed ? ' completed' : ''}`;
        div.dataset.id = task.id;
        
        const formattedDate = this.formatDate(task.createdAt);
        
        div.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <div class="task-meta">
                    <span class="task-priority ${task.priority}">${this.priorityLabels[task.priority]}</span>
                    <span class="task-date">📅 ${formattedDate}</span>
                </div>
            </div>
            <button class="task-delete" title="Görevi sil">🗑️</button>
        `;
        
        return div;
    }
    
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const active = total - completed;
        
        this.totalTasksEl.textContent = total;
        this.activeTasksEl.textContent = active;
        this.completedTasksEl.textContent = completed;
    }
    
    // ========================================
    // Utilities
    // ========================================
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    formatDate(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Az önce';
        if (diffMins < 60) return `${diffMins} dk önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;
        
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ========================================
// Initialize App
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});
