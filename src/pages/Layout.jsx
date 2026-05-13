import { Outlet, Navigate } from "react-router-dom";

const Layout = () => {
  const authToken = localStorage.getItem("authToken");
  
  // Redirect to login if no auth token
  if (!authToken) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <main className="grow flex flex-col">
      <Outlet />
    </main>
  );
};

export default Layout;