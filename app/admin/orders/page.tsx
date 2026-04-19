import AdminOrdersClient from "@/components/admin/AdminOrdersClient";
import { getAdminOrdersOverview } from "@/lib/order-data";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const { orders, stats } = await getAdminOrdersOverview();

  return <AdminOrdersClient initialOrders={orders} initialStats={stats} />;
}
