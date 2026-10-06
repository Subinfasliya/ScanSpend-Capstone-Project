import { RouterProvider } from "react-router";
import "./App.css";
import { router } from "./router/router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
     <RouterProvider router={router} />
      <ToastContainer />
    </>
  );
}

export default App;
