const Project = require("../models/Project");
const User = require("../models/User");

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required" });
    }

    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id,
      members: [
        {
          user: req.user.id,
          role: "Admin"
        }
      ]
    });

    res.status(201).json(project);
  } catch (error) {
    console.log("CREATE PROJECT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      "members.user": req.user.id
    }).populate("members.user", "name email");

    res.json(projects);
  } catch (error) {
    console.log("GET PROJECTS ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "members.user",
      "name email"
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const isMember = project.members.some(
      (m) => m.user._id.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(project);
  } catch (error) {
    console.log("GET PROJECT BY ID ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { email, role } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const currentUser = project.members.find(
      (m) => m.user.toString() === req.user.id
    );

    if (!currentUser || currentUser.role !== "Admin") {
      return res.status(403).json({ message: "Only Admin can add members" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyMember = project.members.find(
      (m) => m.user.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ message: "User already in project" });
    }

    project.members.push({
      user: user._id,
      role: role || "Member"
    });

    await project.save();

    const updatedProject = await Project.findById(project._id).populate(
      "members.user",
      "name email"
    );

    res.json(updatedProject);
  } catch (error) {
    console.log("ADD MEMBER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const currentUser = project.members.find(
      (m) => m.user.toString() === req.user.id
    );

    if (!currentUser || currentUser.role !== "Admin") {
      return res.status(403).json({ message: "Only Admin can remove members" });
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );

    await project.save();

    const updatedProject = await Project.findById(project._id).populate(
      "members.user",
      "name email"
    );

    res.json(updatedProject);
  } catch (error) {
    console.log("REMOVE MEMBER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};