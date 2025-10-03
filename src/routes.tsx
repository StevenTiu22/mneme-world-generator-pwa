import { Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/main-layout";
import { CenteredLayout } from "./components/layout/centered-layout";
import { Home } from "./pages/Home";
import { CreateNewPage } from "./pages/CreateNew";
import { CreatePrimaryStar } from "./pages/CreatePrimaryStar";
import { CreateWorldContext } from "./pages/CreateWorldContext";
import { CreateCompanionStar } from "./pages/CreateCompanionStar";
import { CreateMainWorld } from "./pages/CreateMainWorld";
import { CreateHabitability } from "./pages/CreateHabitability";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route
          path="/my-worlds"
          element={<div>My Worlds Page (Coming Soon)</div>}
        />
      </Route>
      <Route path="/create-new" element={<CenteredLayout />}>
        <Route index element={<CreateNewPage />} />
        <Route path="primary-star" element={<CreatePrimaryStar />} />
        <Route path="world-context" element={<CreateWorldContext />} />
        <Route path="companion-star" element={<CreateCompanionStar />} />
        <Route path="main-world" element={<CreateMainWorld />} />
        <Route path="habitability" element={<CreateHabitability />} />
      </Route>
    </Routes>
  );
}
