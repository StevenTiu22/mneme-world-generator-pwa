import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom"
import { MainLayout } from "@/components/layout/main-layout"
// import { GenerationControls } from "@/components/generation-controls"

// Placeholder components for our pages
function ProjectsPage() { return <h2>Saved Projects</h2> }
function SettingsPage() { return <h2>Settings</h2> }
function GeneratorPage() {
  // This would be your main page with the generator controls and table
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Star System Generator</h1>
      {/* <GenerationControls onGenerate={() => {}} onSave={() => {}} onBinaryToggle={() => {}} /> */}
      {/* Your StarSystemTable would go here */}
    </div>
  )
}


function App() {
  return (
    <Router>
      <Routes>
        {/* All routes inside here will use the MainLayout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<GeneratorPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* You can add a 404 page here later */}
          <Route path="*" element={<h2>404 Not Found</h2>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App