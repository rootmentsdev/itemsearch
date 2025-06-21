// import Login from './pages/Login';
// import ItemSearch from './pages/ItemSearch';
// import React, { useState, useEffect } from 'react';
// import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
// import { getSession } from './utils/session';

// function App() {
//   const [session] = useState(getSession());
//   const navigate  = useNavigate();

//   /* one-time auto-redirect after the reload */
//   useEffect(() => {
//     const target = localStorage.getItem('postLogin');   // was set just before reload
//     if (target && session) {        // only if we’re actually logged-in
//       localStorage.removeItem('postLogin');             // self-clean
//       navigate(target, { replace: true });              // go to /item-search
//     }

//     // still keep your needsReload guard if you want the double-refresh pattern
//     if (localStorage.getItem('needsReload')) {
//       localStorage.removeItem('needsReload');
//       window.location.reload();
//     }
//   }, [session, navigate]);






//   return (
//     <Routes>
//       <Route path="/item" element={session ? <Navigate to="/item-search" /> : <Navigate to="/" />} />
//       <Route path="/" element={<Login />} />
//       <Route path="/item-search" element={session ? <ItemSearch /> : <Navigate to="/" />} />
//     </Routes>
//   );
// }

// export default App;



import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Login from "./pages/Login";
import ItemSearch from "./pages/ItemSearch";
import { getSession, clearSession } from "./utils/session";

function App() {
  /* ✅  Evaluate session *every* render */
  const session = getSession();
  const navigate = useNavigate();

  /* optional global logout handler */
  const handleLogout = () => {
    clearSession();
    navigate("/", { replace: true });
  };

  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<Login />} />

      {/* Protected route */}
      <Route
        path="/item-search"
        element={
          session ? (
            <ItemSearch session={session} onLogout={handleLogout} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      {/* Legacy shortcut → /item-search */}
      <Route path="/item" element={<Navigate to="/item-search" replace />} />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;



