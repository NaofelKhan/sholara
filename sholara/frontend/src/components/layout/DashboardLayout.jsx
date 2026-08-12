import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

export function DashboardLayout({ children, profile }) {
  return (
    <div className="min-h-screen bg-[#faf8ff]">
      <Sidebar profile={profile} />
      <main className="ml-64 min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
