
  import { createRoot } from "react-dom/client";
  import { BrowserRouter } from "react-router";
  import { CartProvider } from "./app/context/CartContext";
  import { AuthProvider } from "./app/context/AuthContext";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>,
  );
  
