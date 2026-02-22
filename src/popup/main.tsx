import { render } from "solid-js/web";
import { AuthProvider } from "./contexts";
import App from "./index";
import "./index.css";

const root = document.getElementById("root");

if (root) {
  render(
    () => (
      <AuthProvider>
        <App />
      </AuthProvider>
    ),
    root,
  );
}
