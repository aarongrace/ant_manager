import React from 'react';
import { Navigate } from 'react-router-dom';
import { useProfileStore } from '../../contexts/profileStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const {name} = useProfileStore();
  const {role} = useProfileStore();
  if (!name || role == "banned") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
