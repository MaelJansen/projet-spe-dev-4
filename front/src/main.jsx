import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Login from './Components/Login';
import Layout from './Components/Layout';
import AdminRoute from './Components/AdminRoute';
import CreateAccount from './Components/CreateAccount';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login></Login>} />
        <Route path="/files" element={<Layout></Layout>} />
        <Route element={<AdminRoute />}>
          <Route path="/create-account" element={<CreateAccount />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
