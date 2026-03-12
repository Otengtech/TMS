import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Terminals from './pages/Terminals';
import Drivers from './pages/Drivers';
import Vehicles from './pages/Vehicles';
import Records from './pages/Records';
import Users from './pages/Users';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
      />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/terminals"
        element={
          <ProtectedRoute>
            <Layout>
              <Terminals />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/drivers"
        element={
          <ProtectedRoute>
            <Layout>
              <Drivers />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/vehicles"
        element={
          <ProtectedRoute>
            <Layout>
              <Vehicles />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/records"
        element={
          <ProtectedRoute>
            <Layout>
              <Records />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['superadmin']}>
            <Layout>
              <Users />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;