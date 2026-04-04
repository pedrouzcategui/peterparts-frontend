import AdminStorefrontSettingsClient from "@/components/admin/AdminStorefrontSettingsClient";
import { getStorefrontSettings } from "@/lib/storefront-settings-store";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getStorefrontSettings();

  return <AdminStorefrontSettingsClient initialSettings={settings} />;
}
