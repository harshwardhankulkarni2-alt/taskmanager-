import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard({ setLoggedIn }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");

    // =========================
    // WEBSOCKET
    // =========================

    useEffect(() => {
        const socket = new WebSocket(
            "wss://taskmanager-1-lmfp.onrender.com/ws"
        );

        socket.onopen = () => {
            console.log("WebSocket connected");
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                console.log("WebSocket message:", message);

                // CREATE
                if (message.type === "task_created") {
                    setTasks((previousTasks) => {
                        const exists = previousTasks.some(
                            (task) => task.id === message.task.id
                        );

                        if (exists) {
                            return previousTasks;
                        }

                        return [
                            message.task,
                            ...previousTasks,
                        ];
                    });
                }

                // UPDATE / COMPLETE
                if (message.type === "task_updated") {
                    setTasks((previousTasks) =>
                        previousTasks.map((task) =>
                            task.id === message.task.id
                                ? message.task
                                : task
                        )
                    );
                }

                // DELETE
                if (message.type === "task_deleted") {
                    setTasks((previousTasks) =>
                        previousTasks.filter(
                            (task) =>
                                task.id !== message.task_id
                        )
                    );
                }

            } catch (error) {
                console.error(
                    "Failed to process WebSocket message:",
                    error
                );
            }
        };

        socket.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        socket.onclose = () => {
            console.log("WebSocket disconnected");
        };

        return () => {
            socket.close();
        };
    }, []);

    // =========================
    // FETCH TASKS
    // =========================

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await api.get("/tasks/");

            console.log("TASK RESPONSE:", response.data);

            if (Array.isArray(response.data)) {
                setTasks(response.data);
            } else {
                console.error(
                    "Expected an array of tasks:",
                    response.data
                );

                setTasks([]);
            }

        } catch (error) {
            console.error("FETCH TASKS ERROR:", error);

            if (error.response) {
                console.error(
                    "STATUS:",
                    error.response.status
                );

                console.error(
                    "DATA:",
                    error.response.data
                );
            }

            setTasks([]);

        } finally {
            setLoading(false);
        }
    };

    // =========================
    // CREATE TASK
    // =========================

    const createTask = async (event) => {
        event.preventDefault();

        if (!title.trim()) {
            return;
        }

        try {
            await api.post("/tasks/", {
                title: title,
                description: description,
            });

            /*
             * Do NOT manually add the task here.
             * WebSocket will add it.
             */

            setTitle("");
            setDescription("");

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.detail ||
                "Failed to create task"
            );
        }
    };

    // =========================
    // COMPLETE TASK
    // =========================

    const completeTask = async (taskId) => {
        try {
            await api.patch(
                `/tasks/${taskId}/complete`,
                {}
            );

            /*
             * WebSocket handles the UI update.
             */

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.detail ||
                "Failed to complete task"
            );
        }
    };

    // =========================
    // EDIT TASK
    // =========================

    const startEditing = (task) => {
        setEditingTaskId(task.id);
        setEditTitle(task.title);
        setEditDescription(task.description || "");
    };

    const cancelEditing = () => {
        setEditingTaskId(null);
        setEditTitle("");
        setEditDescription("");
    };

    const updateTask = async (taskId) => {
        if (!editTitle.trim()) {
            return;
        }

        try {
            await api.put(
                `/tasks/${taskId}`,
                {
                    title: editTitle,
                    description: editDescription,
                }
            );

            /*
             * WebSocket handles the UI update.
             */

            cancelEditing();

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.detail ||
                "Failed to update task"
            );
        }
    };

    // =========================
    // DELETE TASK
    // =========================

    const deleteTask = async (taskId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/tasks/${taskId}`);

            /*
             * WebSocket handles the UI update.
             */

        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.detail ||
                "Failed to delete task"
            );
        }
    };

    // =========================
    // LOGOUT
    // =========================

    const logout = () => {
        localStorage.removeItem("access_token");
        setLoggedIn(false);
    };

    // =========================
    // FILTER TASKS
    // =========================

    const completedTasks = tasks.filter(
        (task) => task.completed
    );

    const pendingTasks = tasks.filter(
        (task) => !task.completed
    );

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="loading">
                    Loading your tasks...
                </div>
            </div>
        );
    }

    // =========================
    // DASHBOARD
    // =========================

    return (
        <div className="dashboard-page">

            {/* SIDEBAR */}

            <aside className="sidebar">

                <div className="logo">
                    TaskFlow
                </div>

                <nav>
                    <button className="nav-item active">
                        <span>📋</span>
                        Tasks
                    </button>
                </nav>

                <button
                    className="logout-button"
                    onClick={logout}
                >
                    Logout
                </button>

            </aside>


            {/* MAIN */}

            <main className="main-content">

                {/* HEADER */}

                <header className="dashboard-header">

                    <div>

                        <h1>
                            My Tasks
                        </h1>

                        <p>
                            Organize your work and stay productive.
                        </p>

                    </div>

                    <div className="task-stats">

                        <div className="stat">

                            <strong>
                                {pendingTasks.length}
                            </strong>

                            <span>
                                Pending
                            </span>

                        </div>

                        <div className="stat">

                            <strong>
                                {completedTasks.length}
                            </strong>

                            <span>
                                Completed
                            </span>

                        </div>

                    </div>

                </header>


                {/* CREATE TASK */}

                <section className="create-task-card">

                    <h2>
                        Create a new task
                    </h2>

                    <form onSubmit={createTask}>

                        <input
                            type="text"
                            placeholder="What needs to be done?"
                            value={title}
                            onChange={(event) =>
                                setTitle(event.target.value)
                            }
                            required
                        />

                        <textarea
                            placeholder="Add a description (optional)"
                            value={description}
                            onChange={(event) =>
                                setDescription(
                                    event.target.value
                                )
                            }
                        />

                        <button type="submit">
                            + Add Task
                        </button>

                    </form>

                </section>


                {/* PENDING */}

                <section className="tasks-section">

                    <div className="section-heading">

                        <h2>
                            Pending
                        </h2>

                        <span>
                            {pendingTasks.length}
                        </span>

                    </div>

                    {pendingTasks.length === 0 ? (

                        <div className="empty-state">

                            <div className="empty-icon">
                                ✓
                            </div>

                            <h3>
                                All caught up!
                            </h3>

                            <p>
                                You don't have any pending tasks.
                            </p>

                        </div>

                    ) : (

                        <div className="task-list">

                            {pendingTasks.map((task) => (

                                <div
                                    className="task-card"
                                    key={task.id}
                                >

                                    {editingTaskId === task.id ? (

                                        <div className="edit-form">

                                            <input
                                                type="text"
                                                value={editTitle}
                                                onChange={(event) =>
                                                    setEditTitle(
                                                        event.target.value
                                                    )
                                                }
                                            />

                                            <textarea
                                                value={editDescription}
                                                onChange={(event) =>
                                                    setEditDescription(
                                                        event.target.value
                                                    )
                                                }
                                            />

                                            <div className="edit-actions">

                                                <button
                                                    className="save-button"
                                                    onClick={() =>
                                                        updateTask(
                                                            task.id
                                                        )
                                                    }
                                                >
                                                    Save
                                                </button>

                                                <button
                                                    className="cancel-button"
                                                    onClick={
                                                        cancelEditing
                                                    }
                                                >
                                                    Cancel
                                                </button>

                                            </div>

                                        </div>

                                    ) : (

                                        <>

                                            <div className="task-info">

                                                <h3>
                                                    {task.title}
                                                </h3>

                                                <p>
                                                    {task.description ||
                                                        "No description"}
                                                </p>

                                            </div>

                                            <div className="task-actions">

                                                <button
                                                    className="complete-button"
                                                    onClick={() =>
                                                        completeTask(
                                                            task.id
                                                        )
                                                    }
                                                >
                                                    ✓ Complete
                                                </button>

                                                <button
                                                    className="edit-button"
                                                    onClick={() =>
                                                        startEditing(
                                                            task
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        deleteTask(
                                                            task.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </>

                                    )}

                                </div>

                            ))}

                        </div>

                    )}

                </section>


                {/* COMPLETED */}

                {completedTasks.length > 0 && (

                    <section className="tasks-section completed-section">

                        <div className="section-heading">

                            <h2>
                                Completed
                            </h2>

                            <span>
                                {completedTasks.length}
                            </span>

                        </div>

                        <div className="task-list">

                            {completedTasks.map((task) => (

                                <div
                                    className="task-card completed-card"
                                    key={task.id}
                                >

                                    <div className="task-info">

                                        <h3>
                                            ✓ {task.title}
                                        </h3>

                                        <p>
                                            {task.description ||
                                                "No description"}
                                        </p>

                                    </div>

                                    <div className="task-actions">

                                        <button
                                            className="edit-button"
                                            onClick={() =>
                                                startEditing(task)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="delete-button"
                                            onClick={() =>
                                                deleteTask(task.id)
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            ))}

                        </div>

                    </section>

                )}

            </main>

        </div>
    );
}

export default Dashboard;