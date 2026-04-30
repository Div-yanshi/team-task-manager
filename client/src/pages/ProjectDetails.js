import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [dashboard, setDashboard] = useState(null);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
    assignedTo: ""
  });

  const [memberForm, setMemberForm] = useState({
    email: "",
    role: "Member"
  });

  const currentUser = JSON.parse(localStorage.getItem("user"));

  const loadData = useCallback(async () => {
    try {
      const projectRes = await api.get(`/projects/${id}`);
      setProject(projectRes.data);

      const tasksRes = await api.get(`/tasks/project/${id}`);
      setTasks(tasksRes.data);

      const dashboardRes = await api.get(`/dashboard/${id}`);
      setDashboard(dashboardRes.data);
    } catch (error) {
      alert("Failed to load project details");
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentMember = project?.members?.find(
    (member) => member.user._id === currentUser.id || member.user._id === currentUser._id
  );

  const isAdmin = currentMember?.role === "Admin";

  const createTask = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tasks", {
        ...taskForm,
        projectId: id
      });

      setTaskForm({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        assignedTo: ""
      });

      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create task");
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update task status");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete task");
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, memberForm);
      setMemberForm({
        email: "",
        role: "Member"
      });
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add member");
    }
  };

  const removeMember = async (userId) => {
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to remove member");
    }
  };

  if (!project) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <button onClick={() => navigate("/")}>Back</button>

      <h2>{project.name}</h2>
      <p>{project.description}</p>

      <h3>Members</h3>
      {project.members.map((member) => (
        <div key={member.user._id} className="card">
          {member.user.name} ({member.user.email}) - {member.role}
          {isAdmin &&
            member.user._id !== currentUser.id &&
            member.user._id !== currentUser._id && (
              <button
                onClick={() => removeMember(member.user._id)}
                style={{ marginLeft: 10 }}
              >
                Remove
              </button>
            )}
        </div>
      ))}

      {isAdmin && (
        <>
          <h3>Add Member</h3>
          <form onSubmit={addMember}>
            <input
              placeholder="Member Email"
              value={memberForm.email}
              onChange={(e) =>
                setMemberForm({ ...memberForm, email: e.target.value })
              }
            />
            <br /><br />

            <select
              value={memberForm.role}
              onChange={(e) =>
                setMemberForm({ ...memberForm, role: e.target.value })
              }
            >
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
            <br /><br />

            <button type="submit">Add Member</button>
          </form>
        </>
      )}

      <h3>Dashboard Summary</h3>
      {dashboard && (
        <div className="card">
          <p>Total Tasks: {dashboard.totalTasks}</p>
          <p>To Do: {dashboard.tasksByStatus["To Do"]}</p>
          <p>In Progress: {dashboard.tasksByStatus["In Progress"]}</p>
          <p>Done: {dashboard.tasksByStatus["Done"]}</p>
          <p>Overdue Tasks: {dashboard.overdueTasks.length}</p>
        </div>
      )}

      {isAdmin && (
        <>
          <h3>Create Task</h3>
          <form onSubmit={createTask}>
            <input
              placeholder="Title"
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm({ ...taskForm, title: e.target.value })
              }
            />
            <br /><br />

            <input
              placeholder="Description"
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
            />
            <br /><br />

            <input
              type="date"
              value={taskForm.dueDate}
              onChange={(e) =>
                setTaskForm({ ...taskForm, dueDate: e.target.value })
              }
            />
            <br /><br />

            <select
              value={taskForm.priority}
              onChange={(e) =>
                setTaskForm({ ...taskForm, priority: e.target.value })
              }
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <br /><br />

            <select
              value={taskForm.assignedTo}
              onChange={(e) =>
                setTaskForm({ ...taskForm, assignedTo: e.target.value })
              }
            >
              <option value="">Select Member</option>
              {project.members.map((member) => (
                <option key={member.user._id} value={member.user._id}>
                  {member.user.name}
                </option>
              ))}
            </select>
            <br /><br />

            <button type="submit">Create Task</button>
          </form>
        </>
      )}

      <h3 style={{ marginTop: 20 }}>Tasks</h3>
      {tasks.length === 0 ? (
        <p>No tasks found</p>
      ) : (
        tasks.map((task) => (
          <div key={task._id} className="card">
            <h4>{task.title}</h4>
            <p>{task.description}</p>
            <p>Status: {task.status}</p>
            <p>Priority: {task.priority}</p>
            <p>Assigned To: {task.assignedTo?.name}</p>
            <p>Due Date: {new Date(task.dueDate).toLocaleDateString()}</p>

            <select
              value={task.status}
              onChange={(e) => updateTaskStatus(task._id, e.target.value)}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

            {isAdmin && (
              <button
                onClick={() => deleteTask(task._id)}
                style={{ marginLeft: 10 }}
              >
                Delete Task
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}