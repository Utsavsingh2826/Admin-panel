import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RootState } from './store';
import { initializeAuth } from './store/auth/actions';

// Layout Components
import NonAuthLayout from './components/NonAuthLayout';
import VerticalLayout from './components/VerticalLayout';

// Auth Pages
import Login from './pages/Authentication/Login';

// Admin Pages
import Dashboard from './pages/Dashboard/Dashboard';
import Products from './pages/Admin/Products';
import Orders from './pages/Admin/Orders';
import Customers from './pages/Admin/Customers';
import Inventory from './pages/Admin/Inventory';
import MetalPrices from './pages/Admin/MetalPrices';
import Analytics from './pages/Admin/Analytics';
import Blogs from './pages/Admin/Blogs';
import Communication from './pages/Admin/Communication';
import Users from './pages/Admin/Users';
import PromoCodes from './pages/Admin/PromoCodes';

// Private Route Component
interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route Component
interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <Navigate to="/dashboard" /> : <>{children}</>;
};

const App: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize authentication state
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <NonAuthLayout>
                <Login />
              </NonAuthLayout>
            </PublicRoute>
          }
        />

        {/* Private Routes with VerticalLayout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <VerticalLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="metal-prices" element={<MetalPrices />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="blogs" element={<Blogs />} />
          <Route path="communication" element={<Communication />} />
          <Route path="users" element={<Users />} />
          <Route path="promocodes" element={<PromoCodes />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default App;

