import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import CategoriesPage from './pages/CategoriesPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import About from './pages/about/About.jsx';
import NotFound from './pages/NotFound.jsx';
import UsersPage from './pages/UsersPage.jsx';
import AddTransaction from './pages/AddTransaction.jsx';
import AddUser from './pages/AddUser.jsx';
import Login from './pages/Login.jsx';
import ProfilePage from './pages/ProfilePage.jsx';


const router = createBrowserRouter([
  {path: '/',Component: App,},
  {path: 'categories', Component:CategoriesPage,},
  {path: 'transactions',Component:TransactionsPage,},
  {path: 'about',Component:About,},
  {path:'users',Component:UsersPage,},
  {path: 'addtransaction',Component:AddTransaction,},
  {path:'adduser',Component:AddUser,},
  {path:'login',Component:Login,},
  {path:'profile',Component:ProfilePage,},
  {path:'*',Component:NotFound,},
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
