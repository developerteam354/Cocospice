import { getCategories, getMenuItems } from '../services/menuService';
import { AuthProvider } from '../contexts/AuthContext';
import ClientApp from '../components/ClientApp/ClientApp';

export default async function Page() {
  const categories = await getCategories();
  const menuItems = await getMenuItems();

  return (
    <main>
      <AuthProvider>
        <ClientApp categories={categories} menuItems={menuItems} />
      </AuthProvider>
    </main>
  );
}
