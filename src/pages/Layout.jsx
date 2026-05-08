import { Outlet,  } from "react-router-dom";
// Ensure this path matches your project structure

const Layout = () => {

  return (


      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
  
  );
};

export default Layout;