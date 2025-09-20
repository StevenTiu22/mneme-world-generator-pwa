import { Outlet } from "react-router-dom";
import { Header } from "@/components/Header";

export function MainLayout() {
  return (
    <div className="min-h-screen px-12 py-6">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
