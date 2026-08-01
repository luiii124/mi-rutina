import { Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div
      className="mx-auto flex min-h-svh max-w-app flex-col bg-bg text-text"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <Outlet />
    </div>
  )
}
