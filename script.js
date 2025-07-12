      // Task data structure
        let tasks = [];
        let currentCategory = 'all';
        let currentFilter = 'all';
        let notificationCounter = 0;
        let currentTaskId = null;
        let currentAlarmSound = 'bell';
        
        // Timer variables
        let timerInterval = null;
        let timerRunning = false;
        let timerValue = 0;


        // Initialize the app
        document.addEventListener('DOMContentLoaded', function() {
            // Set copyright year
            document.getElementById('copyright-year').textContent = new Date().getFullYear();
            
            // Start clock
            updateClock();
            setInterval(updateClock, 1000);
            
            // Load tasks from localStorage
            loadTasks();
            
            // Set up event listeners
            setupEventListeners();
            
            // Render initial tasks
            renderTasks();
            
            // Update statistics
            updateStats();
            
            // Start notification timer
            startNotificationTimer();
            
            // Check for saved theme preference
            checkSavedTheme();
            
            // Set up offline detection
            setupOfflineDetection();
            
            // Initialize timer display
            updateTimerDisplay();
        });

        // Load tasks from localStorage
        function loadTasks() {
            const savedTasks = localStorage.getItem('tasks');
            if (savedTasks) {
                tasks = JSON.parse(savedTasks);
            } else {
                // Load sample tasks if none saved
                tasks = [
                    { id: 1, text: "Complete project proposal", category: "work", priority: "high", completed: true, alarm: "09:00", alarmSound: "bell" },
                    { id: 2, text: "Buy groceries for the week", category: "shopping", priority: "medium", completed: false, alarm: "18:30", alarmSound: "chime" },
                    { id: 3, text: "Morning jogging routine", category: "health", priority: "low", completed: true, alarm: "07:00", alarmSound: "notification" },
                    { id: 4, text: "Prepare presentation for meeting", category: "work", priority: "high", completed: false, alarm: "14:00", alarmSound: "beep" },
                    { id: 5, text: "Read new book chapter", category: "personal", priority: "low", completed: false, alarm: "20:00", alarmSound: "bell" },
                    { id: 6, text: "Dentist appointment", category: "health", priority: "medium", completed: false, alarm: "11:00", alarmSound: "chime" }
                ];
                saveTasks();
            }
        }

        // Save tasks to localStorage
        function saveTasks() {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        // Update the clock
        function updateClock() {
            const now = new Date();
            const time = now.toLocaleTimeString();
            const date = now.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            document.getElementById('clock-time').textContent = time;
            document.getElementById('clock-date').textContent = date;
        }

        // Set up all event listeners
        function setupEventListeners() {
            // Timer controls
            document.getElementById('timer-start').addEventListener('click', startTimer);
            document.getElementById('timer-pause').addEventListener('click', pauseTimer);
            document.getElementById('timer-reset').addEventListener('click', resetTimer);
            
            // Add new task
            document.getElementById('add-task-btn').addEventListener('click', addTask);
            document.getElementById('new-task-input').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addTask();
                }
            });
            
            // Category selection
            document.querySelectorAll('.category-item').forEach(item => {
                item.addEventListener('click', function() {
                    currentCategory = this.dataset.category;
                    document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
                    this.classList.add('active');
                    renderTasks();
                });
            });
            
            // Filter buttons
            document.getElementById('filter-all').addEventListener('click', () => setFilter('all'));
            document.getElementById('filter-pending').addEventListener('click', () => setFilter('pending'));
            document.getElementById('filter-completed').addEventListener('click', () => setFilter('completed'));
            document.getElementById('filter-high').addEventListener('click', () => setFilter('high'));
            
            // Theme toggle
            document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
            
            // Add category button
            document.getElementById('add-category-btn').addEventListener('click', function() {
                showNotification("Feature Coming Soon", "Custom categories will be available in the next update!");
            });
            
            // Modal close buttons
            document.getElementById('close-edit-modal').addEventListener('click', closeEditModal);
            document.getElementById('close-alarm-modal').addEventListener('click', closeAlarmModal);
            document.getElementById('cancel-edit').addEventListener('click', closeEditModal);
            document.getElementById('cancel-alarm').addEventListener('click', closeAlarmModal);
            
            // Modal save buttons
            document.getElementById('save-task').addEventListener('click', saveTaskChanges);
            document.getElementById('set-alarm').addEventListener('click', setAlarmForTask);
            
            // Time options
            document.querySelectorAll('.time-option').forEach(option => {
                option.addEventListener('click', function() {
                    document.querySelectorAll('.time-option').forEach(o => o.classList.remove('active'));
                    this.classList.add('active');
                    const time = this.dataset.time;
                    document.getElementById('alarm-time-input').value = time;
                });
            });
            
            // Sound options
            document.querySelectorAll('.sound-option').forEach(option => {
                option.addEventListener('click', function() {
                    document.querySelectorAll('.sound-option').forEach(o => o.classList.remove('active'));
                    this.classList.add('active');
                    currentAlarmSound = this.dataset.sound;
                });
            });
        }

        // Timer functions
        function startTimer() {
            if (!timerRunning) {
                timerInterval = setInterval(() => {
                    timerValue++;
                    updateTimerDisplay();
                }, 1000);
                timerRunning = true;
                
                // Update button states
                document.getElementById('timer-start').disabled = true;
                document.getElementById('timer-pause').disabled = false;
                document.getElementById('timer-reset').disabled = false;
                
                // Change button styles
                document.getElementById('timer-start').classList.remove('btn-teal');
                document.getElementById('timer-start').classList.add('btn', 'disabled');
                document.getElementById('timer-pause').classList.add('btn-warning');
            }
        }

        function pauseTimer() {
            if (timerRunning) {
                clearInterval(timerInterval);
                timerRunning = false;
                
                // Update button states
                document.getElementById('timer-start').disabled = false;
                
                // Change button styles
                document.getElementById('timer-start').classList.remove('btn', 'disabled');
                document.getElementById('timer-start').classList.add('btn-teal');
            }
        }

        function resetTimer() {
            clearInterval(timerInterval);
            timerRunning = false;
            timerValue = 0;
            updateTimerDisplay();
            
            // Update button states
            document.getElementById('timer-start').disabled = false;
            document.getElementById('timer-pause').disabled = true;
            document.getElementById('timer-reset').disabled = true;
            
            // Change button styles
            document.getElementById('timer-start').classList.remove('btn', 'disabled');
            document.getElementById('timer-start').classList.add('btn-teal');
            document.getElementById('timer-pause').classList.remove('btn-warning');
        }

        function updateTimerDisplay() {
            const hours = Math.floor(timerValue / 3600);
            const minutes = Math.floor((timerValue % 3600) / 60);
            const seconds = timerValue % 60;
            
            const formattedTime = 
                String(hours).padStart(2, '0') + ':' +
                String(minutes).padStart(2, '0') + ':' +
                String(seconds).padStart(2, '0');
                
            document.getElementById('timer-value').textContent = formattedTime;
        }

        // Set up offline detection
        function setupOfflineDetection() {
            window.addEventListener('online', function() {
                document.getElementById('offline-indicator').classList.remove('show');
            });
            
            window.addEventListener('offline', function() {
                document.getElementById('offline-indicator').classList.add('show');
            });
            
            // Initial check
            if (!navigator.onLine) {
                document.getElementById('offline-indicator').classList.add('show');
            }
        }

        // Toggle dark/light theme
        function toggleTheme() {
            document.body.classList.toggle('dark-theme');
            // Save theme preference
            const isDarkMode = document.body.classList.contains('dark-theme');
            localStorage.setItem('darkMode', isDarkMode);
        }

        // Check for saved theme preference
        function checkSavedTheme() {
            const darkMode = localStorage.getItem('darkMode') === 'true';
            if (darkMode) {
                document.body.classList.add('dark-theme');
            }
        }

        // Add a new task
        function addTask() {
            const input = document.getElementById('new-task-input');
            const text = input.value.trim();
            
            if (text) {
                const category = document.getElementById('task-category-select').value;
                const priority = document.getElementById('task-priority-select').value;
                const alarm = document.getElementById('task-alarm-input').value;
                
                const newTask = {
                    id: Date.now(),
                    text: text,
                    category: category,
                    priority: priority,
                    completed: false,
                    alarm: alarm,
                    alarmSound: currentAlarmSound
                };
                
                tasks.unshift(newTask);
                input.value = '';
                document.getElementById('task-alarm-input').value = '';
                saveTasks();
                renderTasks();
                updateStats();
                
                // Show notification
                showNotification("Task Added", `"${text}" has been added to your tasks`);
                
                // Auto-select "All Tasks" category if another was selected
                if (currentCategory !== 'all') {
                    document.querySelector('.category-item[data-category="all"]').click();
                }
            }
        }

        // Set the current filter
        function setFilter(filter) {
            currentFilter = filter;
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById(`filter-${filter}`).classList.add('active');
            renderTasks();
        }

        // Render tasks based on current filters
        function renderTasks() {
            const taskList = document.getElementById('task-list');
            taskList.innerHTML = '';
            
            // Filter tasks
            let filteredTasks = tasks.filter(task => {
                // Category filter
                if (currentCategory !== 'all' && task.category !== currentCategory) {
                    return false;
                }
                
                // Status filter
                if (currentFilter === 'pending' && task.completed) {
                    return false;
                }
                
                if (currentFilter === 'completed' && !task.completed) {
                    return false;
                }
                
                // Priority filter
                if (currentFilter === 'high' && task.priority !== 'high') {
                    return false;
                }
                
                return true;
            });
            
            if (filteredTasks.length === 0) {
                let message = '';
                switch (currentFilter) {
                    case 'pending':
                        message = 'No pending tasks';
                        break;
                    case 'completed':
                        message = 'No completed tasks';
                        break;
                    case 'high':
                        message = 'No high priority tasks';
                        break;
                    default:
                        message = 'No tasks found';
                }
                
                taskList.innerHTML = `
                    <div class="no-tasks">
                        <i class="fas fa-clipboard-list"></i>
                        <p>${message}</p>
                        <p>Try changing filters or adding new tasks</p>
                    </div>
                `;
                return;
            }
            
            // Render tasks
            filteredTasks.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;
                taskItem.dataset.id = task.id;
                
                // Format alarm time
                let alarmDisplay = '';
                if (task.alarm) {
                    const [hours, minutes] = task.alarm.split(':');
                    const hour = parseInt(hours);
                    const period = hour >= 12 ? 'PM' : 'AM';
                    const displayHour = hour % 12 || 12;
                    alarmDisplay = `<div class="alarm-badge"><i class="fas fa-bell"></i> ${displayHour}:${minutes} ${period}</div>`;
                }
                
                taskItem.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <div class="priority-indicator priority-${task.priority}"></div>
                    <div class="task-text">${task.text}</div>
                    <div class="task-category task-${task.category}">${capitalizeFirstLetter(task.category)}</div>
                    ${alarmDisplay}
                    <div class="task-actions">
                        <button class="task-btn alarm" title="Set Alarm"><i class="fas fa-bell"></i></button>
                        <button class="task-btn edit" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="task-btn delete" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                taskList.appendChild(taskItem);
                
                // Add event listeners
                const checkbox = taskItem.querySelector('.task-checkbox');
                const deleteBtn = taskItem.querySelector('.task-btn.delete');
                const editBtn = taskItem.querySelector('.task-btn.edit');
                const alarmBtn = taskItem.querySelector('.task-btn.alarm');
                
                checkbox.addEventListener('change', function() {
                    const taskId = parseInt(taskItem.dataset.id);
                    const task = tasks.find(t => t.id === taskId);
                    if (task) {
                        task.completed = this.checked;
                        taskItem.classList.toggle('completed', this.checked);
                        saveTasks();
                        updateStats();
                        
                        // If we're in completed filter and task is unchecked, remove it
                        if (currentFilter === 'completed' && !this.checked) {
                            taskItem.style.opacity = '0';
                            setTimeout(() => {
                                taskItem.remove();
                                if (document.querySelectorAll('.task-item').length === 0) {
                                    renderTasks();
                                }
                            }, 300);
                        }
                    }
                });
                
                deleteBtn.addEventListener('click', function() {
                    const taskId = parseInt(taskItem.dataset.id);
                    const taskIndex = tasks.findIndex(t => t.id === taskId);
                    if (taskIndex !== -1) {
                        tasks.splice(taskIndex, 1);
                        taskItem.style.opacity = '0';
                        setTimeout(() => {
                            taskItem.remove();
                            saveTasks();
                            renderTasks();
                            updateStats();
                        }, 300);
                    }
                });
                
                editBtn.addEventListener('click', function() {
                    const taskId = parseInt(taskItem.dataset.id);
                    const task = tasks.find(t => t.id === taskId);
                    if (task) {
                        currentTaskId = taskId;
                        document.getElementById('edit-task-text').value = task.text;
                        document.getElementById('edit-task-category').value = task.category;
                        document.getElementById('edit-task-priority').value = task.priority;
                        openEditModal();
                    }
                });
                
                alarmBtn.addEventListener('click', function() {
                    const taskId = parseInt(taskItem.dataset.id);
                    const task = tasks.find(t => t.id === taskId);
                    if (task) {
                        currentTaskId = taskId;
                        if (task.alarm) {
                            document.getElementById('alarm-time-input').value = task.alarm;
                        }
                        
                        // Set current sound selection
                        document.querySelectorAll('.sound-option').forEach(o => o.classList.remove('active'));
                        document.querySelector(`.sound-option[data-sound="${task.alarmSound || 'bell'}"]`).classList.add('active');
                        currentAlarmSound = task.alarmSound || 'bell';
                        
                        openAlarmModal();
                    }
                });
            });
        }

        // Open edit modal
        function openEditModal() {
            document.getElementById('edit-modal-overlay').classList.add('active');
        }

        // Close edit modal
        function closeEditModal() {
            document.getElementById('edit-modal-overlay').classList.remove('active');
        }

        // Open alarm modal
        function openAlarmModal() {
            document.getElementById('alarm-modal-overlay').classList.add('active');
        }

        // Close alarm modal
        function closeAlarmModal() {
            document.getElementById('alarm-modal-overlay').classList.remove('active');
        }

        // Save task changes from modal
        function saveTaskChanges() {
            const text = document.getElementById('edit-task-text').value.trim();
            const category = document.getElementById('edit-task-category').value;
            const priority = document.getElementById('edit-task-priority').value;
            
            if (text) {
                const task = tasks.find(t => t.id === currentTaskId);
                if (task) {
                    task.text = text;
                    task.category = category;
                    task.priority = priority;
                    
                    saveTasks();
                    renderTasks();
                    showNotification("Task Updated", "Your task has been successfully updated");
                    closeEditModal();
                }
            } else {
                showNotification("Error", "Task description cannot be empty");
            }
        }

        // Set alarm from modal
        function setAlarmForTask() {
            const time = document.getElementById('alarm-time-input').value;
            
            if (validateTime(time)) {
                const task = tasks.find(t => t.id === currentTaskId);
                if (task) {
                    task.alarm = time;
                    task.alarmSound = currentAlarmSound;
                    saveTasks();
                    renderTasks();
                    showNotification("Alarm Set", `Alarm for "${task.text}" set to ${formatTimeForDisplay(time)}`);
                    closeAlarmModal();
                }
            } else {
                showNotification("Invalid Time", "Please enter a valid time in HH:MM format");
            }
        }

        // Play alarm sound
        function playAlarmSound(soundType) {
            const sound = document.getElementById(`alarm-sound-${soundType}`);
            if (sound) {
                sound.currentTime = 0;
                sound.play().catch(e => console.log("Audio play failed:", e));
            }
        }

        // Update statistics
        function updateStats() {
            const totalTasks = tasks.length;
            const completedTasks = tasks.filter(task => task.completed).length;
            const pendingTasks = totalTasks - completedTasks;
            
            document.getElementById('total-tasks').textContent = totalTasks;
            document.getElementById('completed-tasks').textContent = completedTasks;
            document.getElementById('pending-tasks').textContent = pendingTasks;
        }

        // Helper function to capitalize first letter
        function capitalizeFirstLetter(string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
        
        // Format time for display (convert 24h to 12h format)
        function formatTimeForDisplay(time) {
            if (!time) return '';
            
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const period = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            
            return `${displayHour}:${minutes} ${period}`;
        }
        
        // Validate time input
        function validateTime(time) {
            if (!time) return true; // Allow empty (no alarm)
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
            return timeRegex.test(time);
        }
        
        // Show notification
        function showNotification(title, message) {
            const container = document.getElementById('notification-container');
            notificationCounter++;
            
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.innerHTML = `
                <div class="notification-icon">
                    <i class="fas fa-bell"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${title}</div>
                    <div class="notification-message">${message}</div>
                </div>
                <button class="notification-close">&times;</button>
            `;
            
            container.appendChild(notification);
            
            // Show notification
            setTimeout(() => {
                notification.classList.add('show');
            }, 10);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 5000);
            
            // Close button
            notification.querySelector('.notification-close').addEventListener('click', function() {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            });
        }
        
        // Start notification timer (check every minute)
        function startNotificationTimer() {
            setInterval(() => {
                checkForAlarms();
            }, 60000); // 60,000ms = 1 minute
        }
        
        // Check for alarms that need to be triggered
        function checkForAlarms() {
            const now = new Date();
            const currentHours = String(now.getHours()).padStart(2, '0');
            const currentMinutes = String(now.getMinutes()).padStart(2, '0');
            const currentTime = `${currentHours}:${currentMinutes}`;
            
            // Find tasks with alarms matching the current time
            const alarmTasks = tasks.filter(task => 
                task.alarm === currentTime && 
                !task.completed
            );
            
            // Show notifications and play sounds for each task
            alarmTasks.forEach(task => {
                showNotification("Task Reminder", `"${task.text}" is scheduled for now!`);
                playAlarmSound(task.alarmSound || 'bell');
            });
        }
