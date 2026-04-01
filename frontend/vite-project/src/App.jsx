import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Scores from './pages/Scores'
import Charities from './pages/Charities'
import AdminDashboard from './pages/admin/AdminDashboard'
import Pricing from "./pages/Pricing"

function App() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scores" element={<Scores />} />
        <Route path="/charities" element={<Charities />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App