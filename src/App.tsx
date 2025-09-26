import AppRoutes from "./routes";
import { Header } from "./components/shared/header";

export default function App() {
  return (
    <div className="min-h-screen px-12 py-6">
      <Header />
      <AppRoutes />
    </div>
  );
}
