import { Outlet } from 'react-router-dom';
import { ThemeProvider } from '@/lib/ThemeContext';
import { SiteTextProvider } from '@/lib/SiteTextContext';
import { useAuth } from '@/lib/AuthContext';
import GrainOverlay from './GrainOverlay';
import CustomCursor from './CustomCursor';
import ThemePanel from './ThemePanel';
import AmbientAudio from './AmbientAudio';
import EditModeToggle from './EditModeToggle';

export default function Layout() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  return (
    <ThemeProvider>
      <SiteTextProvider>
        <GrainOverlay />
        <CustomCursor />
        {isAdmin && <ThemePanel />}
        <AmbientAudio />
        {isAdmin && <EditModeToggle />}
        <Outlet />
      </SiteTextProvider>
    </ThemeProvider>
  );
}