import { Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/main-layout";
import { CenteredLayout } from "./components/layout/centered-layout";
import { Home } from "./pages/Home";
import { CreateNewPage } from "./pages/CreateNew";
import { CreatePrimaryStar } from "./pages/CreatePrimaryStar";

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
      <Route>
        <Route element={<CenteredLayout />}>
          <Route path="/create-new" element={<CreateNewPage />} />
          <Route path="/create-new/custom" element={<CreatePrimaryStar />} />
        </Route>
      </Route>
      {/* <Route path="/about" element={<About />} /> */}
      {/* <Route path="/contact" element={<Contact />} /> */}
    </Routes>
  );
}
