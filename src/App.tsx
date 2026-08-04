import { Route, Routes } from 'react-router'
import AIRecomendationPage from './Pages/AIRecomendationPage'
import Home from './Pages/Home'
import AboutPage from './Pages/AboutPage'
import RTReporting from './Pages/RT_Reporting'
import NavBar from './Components/NavBar'
function App() {
 

  return (
    <>
<NavBar />
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/about" element={<AboutPage />} />
  <Route path="/RT_Reporting" element={<RTReporting />} />
  <Route path="/ai-recommendation" element={<AIRecomendationPage />} />
</Routes>
    </>
  )
}

export default App
