import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home, Draw } from './pages';
import { ClassManager } from './components/ClassManager';
import { StudentManager } from './components/StudentManager';
import { RangeSettings } from './components/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="classes" element={<ClassManager />} />
          <Route path="students" element={<StudentManager />} />
          <Route path="settings" element={<RangeSettings />} />
          <Route path="draw" element={<Draw />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
