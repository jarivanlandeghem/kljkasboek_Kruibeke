// src/main.jsx
import { StrictMode } from 'react';
import ThemeProvider from './contexts/Theme.context';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import About from './pages/about/About.jsx';
import NotFound from './pages/NotFound.jsx';
import UsersPage from './pages/UsersPage.jsx';
import AddUser from './pages/AddUser.jsx';
import Login from './pages/Login.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import { AuthProvider } from './contexts/Auth.context';
import PrivateRoute from './components/PrivateRoute';
import Logout from './pages/Logout.jsx';
import RegisterPage from './pages/RegisterPage.jsx';


const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Redirect root naar /home
      { index: true, element: <Navigate to="/home" replace /> },
      // HomePage beveiligd met PrivateRoute
      { 
        path: 'home', 
        element: <PrivateRoute />,
        children: [
          { index: true, element: <HomePage /> }
        ]
      },
      { 
        path: 'categories', 
        element: <PrivateRoute />,
        children: [
          { index: true, element: <CategoriesPage /> }
        ]
      },
      { 
        path: 'transactions', 
        element: <PrivateRoute />,
        children: [
          { index: true, element: <TransactionsPage /> }
        ]
      },
      { path: 'about', element: <About /> },
      { 
        path: 'users', 
        element: <PrivateRoute />,
        children: [
          { index: true, element: <UsersPage /> }
        ]
      },
      { 
        path: 'adduser', 
        element: <PrivateRoute />,
        children: [
          { index: true, element: <AddUser /> }
        ]
      },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <RegisterPage /> }, // Register route toegevoegd
      { 
        path: 'profile', 
        element: <PrivateRoute />,
        children: [
          { index: true, element: <ProfilePage /> }
        ]
      },
      { path: 'logout', element: <Logout /> },
     
      { path: '*', element: <NotFound /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
);