import { getCategories, getMenuItems } from '../services/menuService';
import ClientApp from '../components/ClientApp/ClientApp';

export default async function Page() {
  const categories = await getCategories();
  const menuItems = await getMenuItems();

  return (
    <main>
      <ClientApp categories={categories} menuItems={menuItems} />
    </main>
  );
}
