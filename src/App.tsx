// // src/App.tsx
// import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import Login from './pages/auth/Login';
// import Register from './pages/auth/Register';
// import { PasswordReset } from './pages/auth/PasswordReset';
// import { PasswordResetConfirm } from './pages/auth/PasswordResetConfirm';
//
// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Public Routes */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/password-reset" element={<PasswordReset />} />
//         <Route path="/password-reset-confirm/:uid/:token" element={<PasswordResetConfirm />} />
//
//         {/* Redirect root to login */}
//         <Route path="/" element={<Navigate to="/login" replace />} />
//
//         {/* 404 Route */}
//         <Route path="*" element={<Navigate to="/login" replace />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }
//
// export default App;

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { PasswordReset } from './pages/auth/PasswordReset';
import { PasswordResetConfirm } from './pages/auth/PasswordResetConfirm';
import Dashboard from './pages/dashboard/Dashboard';
import Profile from './pages/profile/Profile';
import PurchaseRequest from "./pages/purchase/PurchaseRequest";
import PurchaseRequestList from "./pages/purchase/PurchaseRequestList";
import PurchaseRequestUpdate from "./pages/purchase/PurchaseRequestUpdate";
import Logout from "./pages/auth/Logout";

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/purchase-request" element={<PurchaseRequest />} />
        <Route path="/purchase-request-list" element={<PurchaseRequestList />} />
        <Route path="/password-reset" element={<PasswordReset />} />
        {/* <Route path="/password-reset-confirm/:uid/:token" element={<PasswordResetConfirm />} /> */}

        <Route path="/reset-password/:uid/:token" element={<PasswordResetConfirm />} />

        <Route path="/purchase-requests/:id/edit" element={<PurchaseRequestUpdate />} />
        <Route path="/logout" element={<Logout />} />
        {/*<Route path="/purchase-requests-update/:id/edit" element={<PurchaseRequestUpdate />} />*/}
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirect root based on authentication */}
        <Route
          path="/"
          element={
            localStorage.getItem('token')
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;