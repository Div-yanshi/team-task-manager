import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: "", description: "" });
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (error) {
      alert("Failed to load projects");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/projects", form);
      setForm({ name: "", description: "" });
      fetchProjects();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create project");
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="container">
      <h2>Projects</h2>
      <button onClick={logout}>Logout</button>

      <h3>Create Project</h3>
      <form onSubmit={handleCreate}>
        <input
          placeholder="Project Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <br /><br />
        <input
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <br /><br />
        <button type="submit">Create</button>
      </form>

      <h3>Your Projects</h3>
      {projects.map((project) => (
        <div
  key={project._id}
  onClick={() => navigate(`/projects/${project._id}`)}
  className="card"
  style={{ cursor: "pointer" }}
>
          <h4>{project.name}</h4>
          <p>{project.description}</p>
        </div>
      ))}
    </div>
  );
}