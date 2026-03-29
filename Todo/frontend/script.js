let chart;
const user = localStorage.getItem("user");

if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

async function loadTasks() {
    const res = await fetch(`/tasks/${user}`);
    const tasks = await res.json();

    const list = document.getElementById("taskList");
    list.innerHTML = "";

    let completed = 0;
    let pending = 0;

    tasks.forEach(task => {

        if (task.status === "Completed") {
            completed++;
        } else {
            pending++;
        }

        const li = document.createElement("li");

        let color = "";
        let warning = "";

        if (task.priority === "High") {
            color = "red";
        } else if (task.priority === "Medium") {
            color = "orange";
        } else {
            color = "green";
        }

        const due = new Date(task.due_date);

        const dueCheck = new Date(task.due_date);
        dueCheck.setHours(0,0,0,0);

        const today = new Date();
        today.setHours(0,0,0,0);

        const diff = Math.ceil((dueCheck - today) / (1000 * 60 * 60 * 24));

        if (diff < 0 && task.status !== "Completed") {
            warning = "<span style='color:red;font-weight:bold;'> ⚠ Overdue</span>";
        }

        if (diff <= 1 && diff >= 0 && task.status !== "Completed") {
            alert("⚠ Today is your task deadline!");

            if (Notification.permission === "granted") {
                new Notification("⚠ Today is your task deadline!");
            }
        }

        li.style.borderLeft = `8px solid ${color}`;
        li.style.backgroundColor =
            color === "red" ? "#ffe5e5" :
            color === "orange" ? "#fff4e5" :
            "#e8ffe8";

        li.style.color = "#2c3e50";
        li.style.fontWeight = "bold";

        li.innerHTML = `
            <div>
                <strong>${task.task}</strong><br>
                Priority: <span style="color:${color};">${task.priority}</span><br>
                Due: ${due.toLocaleDateString()} / ${due.toLocaleTimeString()}<br>
                Status: ${task.status}
                ${warning}
            </div>

            <div>
                <button onclick="completeTask(${task.id})">Complete</button>
                <button onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;

        list.appendChild(li);
    });

    updateChart(completed, pending);
}

async function addTask() {
    const task = document.getElementById("taskInput").value;
    const priority = document.getElementById("priority").value;
    const due_date = document.getElementById("dueDate").value;

    if (task === "") {
        alert("Enter task");
        return;
    }

    await fetch("/tasks", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            user,
            task,
            priority,
            due_date
        })
    });

    document.getElementById("taskInput").value = "";
    document.getElementById("dueDate").value = "";

    loadTasks();
}

async function completeTask(id) {
    await fetch(`/tasks/${id}`, {
        method: "PUT"
    });

    loadTasks();
}

async function deleteTask(id) {
    await fetch(`/tasks/${id}`, {
        method: "DELETE"
    });

    loadTasks();
}

function updateChart(completed, pending) {
    const ctx = document.getElementById("taskChart");

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Completed", "Pending"],
            datasets: [{
                data: [completed, pending]
            }]
        }
    });
}

loadTasks();