import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useParams, useNavigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import GroupView from './pages/GroupView';
import { socket } from './lib/socket';

function RoomLayout() {
  const { roomId } = useParams<{ roomId: string }>();
  
  React.useEffect(() => {
    if (!roomId) return;
    
    const handleConnect = () => {
      socket.emit('joinRoom', roomId);
    };

    socket.emit('joinRoom', roomId);
    socket.on('connect', handleConnect);

    return () => {
      socket.off('connect', handleConnect);
    };
  }, [roomId]);

  return <Outlet />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        
        <Route path="/:roomId" element={<RoomLayout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="admin" element={<Admin />} />
          <Route path="group/:groupId" element={<GroupView />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
