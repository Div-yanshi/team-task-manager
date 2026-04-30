const Task = require("../models/Task");
const Project = require("../models/Project");

exports.getDashboard = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId).populate("members.user", "name email");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const member = project.members.find(
      (m) => m.user._id.toString() === req.user.id
    );

    if (!member) {
      return res.status(403).json({ message: "Access denied" });
    }

    let taskFilter = { project: projectId };

    if (member.role === "Member") {
      taskFilter.assignedTo = req.user.id;
    }

    const tasks = await Task.find(taskFilter).populate("assignedTo", "name email");

    const totalTasks = tasks.length;

    const tasksByStatus = {
      "To Do": tasks.filter((t) => t.status === "To Do").length,
      "In Progress": tasks.filter((t) => t.status === "In Progress").length,
      "Done": tasks.filter((t) => t.status === "Done").length
    };

    const tasksPerUser = {};
    tasks.forEach((task) => {
      const userName = task.assignedTo?.name || "Unknown";
      tasksPerUser[userName] = (tasksPerUser[userName] || 0) + 1;
    });

    const now = new Date();
    const overdueTasks = tasks.filter(
      (task) => new Date(task.dueDate) < now && task.status !== "Done"
    );

    res.json({
      totalTasks,
      tasksByStatus,
      tasksPerUser,
      overdueTasks
    });
  } catch (error) {
    console.log("DASHBOARD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};