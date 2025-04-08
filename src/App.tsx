
import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import AddForm from './components/AddForm'
import Header from './components/Header'
import Homepage from './pages/Homepage'


function App() {

  return (
    <>
    <Toaster/>
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path='/' element={<Homepage/>}/>
        <Route path='/add' element={<AddForm/>}/>
      </Routes>
   
    </BrowserRouter>
   
    </>
  )
}

export default App
