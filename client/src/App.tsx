import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Board from './components/Board';

import { Toaster } from 'react-hot-toast';

import Home from './components/Home';
import GlobalLoader from './components/GlobalLoader';

function App() {
  return (
    <Router>
      <GlobalLoader>
        <Toaster position="top-right" />
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/board/:id" element={<Board />} />
        <Route path="/board" element={<Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </GlobalLoader>
    </Router>
  );
}

export default App;
