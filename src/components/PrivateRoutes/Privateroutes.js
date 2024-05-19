import React from 'react';
import { Route, Navigate } from 'react-router-dom';


const PrivateRoute = ({ path, element }) => {
  const { isLoggedIn } = useFirebase();

  return isLoggedIn ? (
    <Route path={path} element={element} />
  ) : (
    <Navigate to='/' replace/>
  );
};

export default PrivateRoute;
