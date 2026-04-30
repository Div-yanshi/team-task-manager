const Task = require("../models/Task");
const Project = require("../models/Project");

exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, projectId, assignedTo } = req.body;

    if (!title || !dueDate || !projectId || !assignedTo) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const adminMember = project.members.find(
      (m) => m.user.toString() === req.user.id && m.role === "Admin"
    );

    if (!adminMember) {
      return res.status(403).json({ message: "Only Admin can create tasks" });
    }

    const assignedUserInProject = project.members.find(
      (m) => m.user.toString() === assignedTo
    );

    if (!assignedUserInProject) {
      return res.status(400).json({ message: "Assigned user is not in this project" });
    }

    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      project: projectId,
      assignedTo,
      createdBy: req.user.id
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("project", "name");

    res.status(201).json(populatedTask);
  } catch (error) {
    console.log("CREATE TASK ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getTasksByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const member = project.members.find(
      (m) => m.user.toString() === req.user.id
    );

    if (!member) {
      return res.status(403).json({ message: "Access denied" });
    }

    let tasks;

    if (member.role === "Admin") {
      tasks = await Task.find({ project: req.params.projectId })
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");
    } else {
      tasks = await Task.find({
        project: req.params.projectId,
        assignedTo: req.user.id
      })
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email");
    }

    res.json(tasks);
  } catch (error) {
    console.log("GET TASKS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, assignedTo, status } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    const member = project.members.find(
      (m) => m.user.toString() === req.user.id
    );

    if (!member || member.role !== "Admin") {
      return res.status(403).json({ message: "Only Admin can edit tasks" });
    }

    if (assignedTo) {
      const assignedUserInProject = project.members.find(
        (m) => m.user.toString() === assignedTo
      );
      if (!assignedUserInProject) {
        return res.status(400).json({ message: "Assigned user is not in project" });
      }
      task.assignedTo = assignedTo;
    }

    task.title = title || task.title;
    task.description = description ?? task.description;
    task.dueDate = dueDate || task.dueDate;
    task.priority = priority || task.priority;
    task.status = status || task.status;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.json(updatedTask);
  } catch (error) {
    console.log("UPDATE TASK ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    const member = project.members.find(
      (m) => m.user.toString() === req.user.id
    );

    if (!member) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (member.role === "Member" && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can update only your own task" });
    }

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.json(updatedTask);
  } catch (error) {
    console.log("UPDATE TASK STATUS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const project = await Project.findById(task.project);
    const member = project.members.find(
      (m) => m.user.toString() === req.user.id
    );

    if (!member || member.role !== "Admin") {
      return res.status(403).json({ message: "Only Admin can delete tasks" });
    }

    await task.deleteOne();

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log("DELETE TASK ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};