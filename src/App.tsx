import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Search from './components/pages/Search'
import Results from './components/pages/Results'
import { Button } from './components/ui/button'
function App() {

  return (
    <Router>
      <nav className="flex flex-row w-screen py-2 px-6 justify-between items-center">
        <Link to="/" className="text-black hover:text-gray-500 ">Oshima</Link>
        <a href="https://docs.google.com/forms/d/e/1FAIpQLScFQH7VteSZsI0l36M7FSqZJ8SmOScVcWWNYhnrccMDX0K8pQ/viewform?usp=sharing" target="_blank" rel="noopener noreferrer" className="text-black hover:text-gray-500">
          <Button>Beta Access</Button>
        </a>

      </nav>

      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  )
}


export default App
