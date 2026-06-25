import { useEffect, useState } from 'react';
import ControlPanel from './components/ControlPanel.js';
import GraphicsOutput from './components/GraphicsOutput.js';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  if (currentPath.includes('/output')) {
    return <GraphicsOutput />;
  }

  return <ControlPanel />;
}
