import { Outlet } from "react-router-dom";
import { Header } from "@/components/shared/header";
import { Footer } from "@/components/shared/footer";

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex flex-grow items-center justify-center">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
