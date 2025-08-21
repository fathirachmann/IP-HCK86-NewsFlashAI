import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router'
import LoginPage from './pages/LoginPage'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
 
function AuthLayout () {
  const access_token = localStorage.getItem('access_token')

  if (!access_token) {
    return (
      <Navigate to="/login" />
    )
  }

  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  )
}

function MainLayout () {
  const access_token = localStorage.getItem('access_token')
  if (access_token) {
    return (
      <Navigate to="/" />
    )
  }
  
    return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  )
}


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<MainLayout />}>
          <Route index element={<LoginPage />} />
        </Route>
        <Route path='/' element={<AuthLayout />}>
          <Route index element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
