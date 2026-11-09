import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Episodes from './pages/Episodes';
import News from './pages/News';
import Guest from './pages/Guest';
import Support from './pages/Support';
import Sponsorship from './pages/Sponsorship';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="episodes" element={<Episodes />} />
          <Route path="news" element={<News />} />
          <Route path="guest" element={<Guest />} />
          <Route path="support" element={<Support />} />
          <Route path="sponsorship" element={<Sponsorship />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<Home />} />
        </Route>
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
