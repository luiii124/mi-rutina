import { Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div className="mx-auto flex min-h-svh max-w-app flex-col bg-bg text-text">
      <Outlet />
    </div>
  )
}
