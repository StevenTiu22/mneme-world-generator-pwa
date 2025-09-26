import { Outlet } from "react-router-dom";
import { Header } from "@/components/shared/header";

export function MainLayout() {
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </>
  );
}
