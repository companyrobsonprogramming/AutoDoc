import React from 'react';
import { Layout } from './components/layout/Layout';
import { AppRouter } from './routes/Router';

const App: React.FC = () => {
  return (
    <Layout>
      <AppRouter />
    </Layout>
  );
};

export default App;
