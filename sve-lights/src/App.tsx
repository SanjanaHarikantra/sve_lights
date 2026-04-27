import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import AppShell from './components/AppShell/AppShell';
import AdminLayout from './components/AdminLayout/AdminLayout';
import ProtectedRoute from './components/RouteGuards/ProtectedRoute';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import ProductsPage from './pages/ProductsPage';
import ReviewsRoutePage from './pages/ReviewsRoutePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/customer-reviews" element={<ReviewsRoutePage />} />
      <Route element={<AppShell />}>
        <Route path="/auth" element={<AuthPage />} />  
        <Route path="/shop" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailsPage />} />
      </Route>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
