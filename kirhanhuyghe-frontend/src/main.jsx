import { StrictMode } from 'react';
import ThemeProvider from './contexts/Theme.context';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import CategoriesPage from './pages/CategoriesPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import About from './pages/about/About.jsx';
import NotFound from './pages/NotFound.jsx';
import UsersPage from './pages/UsersPage.jsx';
import AddUser from './pages/AddUser.jsx';
import Login from './pages/Login.jsx';
import ProfilePage from './pages/ProfilePage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, Component: HomePage },
      { path: 'categories', Component: CategoriesPage },
      { path: 'transactions', Component: TransactionsPage },
      { path: 'about', Component: About },
      { path: 'users', Component:UsersPage  },
      { path: 'adduser', Component:AddUser  },
      { path: 'login', Component:Login  },
      { path: 'profile', Component:ProfilePage  },
      { path: '*', Component:NotFound  },
    ],
  },
]);

// OUDE VERSIE
// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <RouterProvider router={router} />
//   </StrictMode>,
// )

// DARMODE implementatie
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 👇 */}
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
    {/* 👆 */}
  </StrictMode>,
);



