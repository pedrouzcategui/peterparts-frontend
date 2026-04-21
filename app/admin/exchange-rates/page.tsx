import AdminExchangeRatesClient from "@/components/admin/AdminExchangeRatesClient";
import { getAdminExchangeRateHistory } from "@/lib/admin-exchange-rates";

export const dynamic = "force-dynamic";

export default async function AdminExchangeRatesPage() {
  const exchangeRates = await getAdminExchangeRateHistory();

  return <AdminExchangeRatesClient initialExchangeRates={exchangeRates} />;
}