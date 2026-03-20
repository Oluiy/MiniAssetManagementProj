import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import PropertyForm from './pages/PropertyForm';
import Assets from './pages/Assets';
import AssetDetail from './pages/AssetDetail';
import AssetForm from './pages/AssetForm';
import Tasks from './pages/Tasks';
import TaskForm from './pages/TaskForm';
import Login from './pages/Login';
import Signup from './pages/Signup';

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <Layout /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/new" element={<PropertyForm />} />
          <Route path="/properties/:id/edit" element={<PropertyForm />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/assets/new" element={<AssetForm />} />
          <Route path="/assets/:id/edit" element={<AssetForm />} />
          <Route path="/assets/:id" element={<AssetDetail />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/tasks/new" element={<TaskForm />} />
          <Route path="/tasks/:id/edit" element={<TaskForm />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;