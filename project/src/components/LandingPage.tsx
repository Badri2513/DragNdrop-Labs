"use client"

import type React from "react"
import { Plus, Music, Trash2, Disc, Guitar, Mic, Edit2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

// Define the Project interface
interface Project {
  id: string
  name: string
  lastModified: string
  thumbnail?: string
}

// Define the component props interface
interface LandingPageProps {
  onNewProject: () => void
  onOpenProject: (id: string) => void
  onDeleteProject: (id: string) => void
  onEditProject: (id: string, newName: string) => void
  projects: Project[]
}

// Main component implementation
const LandingPage: React.FC<LandingPageProps> = ({
  projects,
  onNewProject,
  onOpenProject,
  onDeleteProject,
  onEditProject
}) => {
  const navigate = useNavigate();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState("");

  const handleNewProject = () => {
    onNewProject();
    navigate('/editor');
  };

  const handleOpenProject = (id: string) => {
    onOpenProject(id);
    navigate('/editor');
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setNewProjectName(project.name);
  };

  const handleSaveEdit = () => {
    if (editingProject && newProjectName.trim()) {
      onEditProject(editingProject.id, newProjectName.trim());
      setEditingProject(null);
      setNewProjectName("");
    }
  };

  // Random rock-themed icon for each project
  const getRandomIcon = () => {
    const icons = [
      <Music key="music" className="w-6 h-6" />,
      <Disc key="disc" className="w-6 h-6" />,
      <Guitar key="guitar" className="w-6 h-6" />,
      <Mic key="mic" className="w-6 h-6" />,
    ]
    return icons[Math.floor(Math.random() * icons.length)]
  }

  return (
    <div className="min-h-screen bg-zinc-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-black p-8">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 bg-[url('/placeholder.svg?height=200&width=200')] opacity-[0.03] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-white tracking-tighter">
            <span className="text-red-500">MY</span> PROJECTS
          </h1>
          <button
            onClick={handleNewProject}
            className="flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-none hover:bg-red-700 transition-colors transform hover:translate-y-[-2px] shadow-[5px_5px_0px_0px_rgba(0,0,0,0.5)]"
          >
            <Plus className="w-5 h-5" />
            NEW PROJECT
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-zinc-800 border border-zinc-700 rounded-none overflow-hidden hover:shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all duration-300 group"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-red-500 transition-transform duration-300 group-hover:rotate-12">
                      {getRandomIcon()}
                    </div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-wide">{project.name}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="p-2 text-zinc-400 hover:text-blue-500 transition-colors"
                      aria-label="Edit project name"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDeleteProject(project.id)}
                      className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                      aria-label="Delete project"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 mb-6 font-mono">Last modified: {project.lastModified}</p>
                <button
                  onClick={() => handleOpenProject(project.id)}
                  className="w-full py-3 bg-zinc-700 text-white uppercase font-bold tracking-wider hover:bg-red-600 transition-colors border-t border-zinc-600"
                >
                  OPEN PROJECT
                </button>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-20 border border-dashed border-zinc-700 bg-zinc-800/50 backdrop-blur-sm">
            <Guitar className="w-20 h-20 mx-auto text-red-500 mb-6 animate-pulse" />
            <h3 className="text-2xl font-bold text-white uppercase tracking-widest mb-4">No projects yet</h3>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">Create your first project to start your rock journey</p>
            <button
              onClick={handleNewProject}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-none hover:bg-red-700 transition-colors mx-auto uppercase tracking-wider font-bold shadow-[5px_5px_0px_0px_rgba(0,0,0,0.5)]"
            >
              <Plus className="w-5 h-5" />
              Create New Project
            </button>
          </div>
        )}
      </div>

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold text-white mb-4">Edit Project Name</h2>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-700 text-white rounded-none mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Enter new project name"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setEditingProject(null);
                  setNewProjectName("");
                }}
                className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-red-600 text-white rounded-none hover:bg-red-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LandingPage

