"use client"

import type React from "react"
import { ArrowRight, Flame, Zap, Share2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface HomePageProps {
  theme: 'light' | 'dark'
}

const HomePage: React.FC<HomePageProps> = ({ theme }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/projects');
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background texture overlay */}
      <div
        className="absolute inset-0 opacity-20 z-0"
        style={{
          backgroundImage: `url('/placeholder.svg?height=1080&width=1920')`,
          backgroundSize: "cover",
          filter: "contrast(1.2) brightness(0.4)",
        }}
      />

      {/* Diagonal slash decoration */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-red-700 rotate-12 opacity-30 blur-xl z-0"></div>
      <div className="absolute top-1/3 -left-20 w-96 h-96 bg-purple-900 -rotate-12 opacity-20 blur-xl z-0"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 tracking-tighter">
            <span className="text-red-600">DRAG</span>
            <span className="text-white">N</span>
            <span className="text-red-600">DROP</span>
            <span className="block mt-2 text-white">LABS</span>
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-medium">
            Create <span className="text-red-500">bold</span>, <span className="text-red-500">powerful</span> designs
            with our no-code editor that <span className="line-through decoration-red-600">rocks</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleGetStarted}
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-red-700 text-white rounded-none hover:bg-red-600 transition-all duration-300 text-lg font-bold border-2 border-red-700 hover:border-red-500 transform hover:-translate-y-1 shadow-lg"
            >
              GET STARTED
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-none shadow-xl transform transition-transform hover:-translate-y-2 hover:shadow-red-900/20 hover:shadow-2xl">
            <div className="mb-4 text-red-600">
              <Flame className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-wider">Drag & Drop</h3>
            <p className="text-gray-400">
              Unleash your creativity with our intuitive drag-and-drop interface. No rules, no limits.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-none shadow-xl transform transition-transform hover:-translate-y-2 hover:shadow-red-900/20 hover:shadow-2xl">
            <div className="mb-4 text-red-600">
              <Zap className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-wider">Real-time Preview</h3>
            <p className="text-gray-400">
              See your vision come alive instantly with our lightning-fast preview engine.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-none shadow-xl transform transition-transform hover:-translate-y-2 hover:shadow-red-900/20 hover:shadow-2xl">
            <div className="mb-4 text-red-600">
              <Share2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 uppercase tracking-wider">Save & Share</h3>
            <p className="text-gray-400">Amplify your work. Save your projects and share them with the world.</p>
          </div>
        </div>

        {/* Rock-themed footer element */}
        <div className="mt-20 border-t border-zinc-800 pt-8 text-center">
          <p className="text-zinc-500 text-sm">DESIGN WITHOUT COMPROMISE</p>
          <p className="text-zinc-500 text-sm">Made with ❤️ by <a href="https://github.com/Badri2513/DragNdrop-Labs" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-600">Team Mustang</a></p>
          <p className="text-zinc-500 text-sm">
            <ul>
              <li>Saif M.S.</li>
              <li>Badrinath.M</li>
              <li>Lakshwin</li>
              <li>HarrisRaj.B</li>
            </ul>
          </p>
        </div>
      </div>
    </div>
  )
}

export default HomePage

