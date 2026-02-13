import Sidebar from "./Sidebar";

const Layout = ({ children, onLogout }: { children: React.ReactNode; onLogout?: () => void }) => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar onLogout={onLogout} />
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
