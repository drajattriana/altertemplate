import { Outlet } from 'react-router-dom';
import PublicFooter from '../components/public/PublicFooter';
import PublicHeader from '../components/public/PublicHeader';

const PublicLayout = () => {
  return (
    <div className="min-h-screen">
      <PublicHeader />
      <main>
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
};

export default PublicLayout;
