import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Overview from './pages/Overview';
import Documents from './pages/Documents';
import Workspace from './pages/Workspace';
import BatchAnalytics from './pages/BatchAnalytics';
import { DocumentProvider } from './context/DocumentContext';

function App() {
  return (
    <DocumentProvider>
      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/batch" element={<BatchAnalytics />} />
          </Route>
        </Routes>
      </Router>
    </DocumentProvider>
  );
}

export default App;
