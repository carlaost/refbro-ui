import './App.css'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Search from './components/pages/Search'
import Results from './components/pages/Results'
function App() {

  return (
    <Router>
      <nav className="flex flex-row w-screen py-2 px-6 justify-start items-center">
        <Link to="/" className="text-black hover:text-gray-500 ">refBro</Link>

      </nav>

      <Routes>
        <Route path="/" element={<Search />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  )
}


export default App
