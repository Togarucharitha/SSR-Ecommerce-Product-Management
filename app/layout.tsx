import './globals.css'
import Header from '../components/Header'
import SidebarWrapper from '../components/SidebarWrapper'

export const metadata = {
  title: 'SSR E-Commerce Product Management',
  description: 'SSR E-Commerce Product Management Dashboard',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <div className="container app-shell">
          <SidebarWrapper />
          <main className="app-main">{children}</main>
        </div>
      </body>
    </html>
  )
}
