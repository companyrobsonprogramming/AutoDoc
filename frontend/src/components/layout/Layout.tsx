import React, { PropsWithChildren } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main
          style={{
            flex: 1,
            padding: '1.5rem',
            background: 'radial-gradient(circle at top left, #1d2538 0, #050816 40%, #050816 100%)'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
