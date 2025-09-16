import { Outlet } from "react-router-dom"
import { Header } from "@/components/header"

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text">
      <Header />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {/* The Outlet component renders the matched child route's component */}
        <Outlet />
      </main>
    </div>
  )
}