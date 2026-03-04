import { DollarSign, ShoppingCart, Users, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  dashboardStats,
  topCategories,
  trafficSources,
  activeUsersByCountry,
  conversionFunnel,
} from "@/lib/admin-data";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const isPositive = change >= 0;
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <div className="flex items-center gap-1 mt-1">
              {isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              <span
                className={`text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}
              >
                {isPositive ? "+" : ""}
                {change.toFixed(2)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last week</span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Icon className="h-5 w-5 text-red-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TopCategoriesCard() {
  const total = topCategories.reduce((sum, cat) => sum + cat.amount, 0);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Top Categories</CardTitle>
          <button className="text-sm text-red-500 hover:underline">
            See All
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Donut chart placeholder */}
        <div className="relative mx-auto mb-4 h-32 w-32">
          <div className="absolute inset-0 rounded-full border-8 border-red-500" />
          <div className="absolute inset-4 rounded-full bg-background flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground">Total Sales</p>
            <p className="text-lg font-bold">{formatCurrency(total)}</p>
          </div>
        </div>
        {/* Legend */}
        <div className="space-y-2">
          {topCategories.map((category) => (
            <div key={category.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span>{category.name}</span>
              </div>
              <span className="font-medium">{formatCurrency(category.amount)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MonthlyTargetCard() {
  const progress = 85;
  const target = 600000;
  const revenue = 510000;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Monthly Target</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress ring placeholder */}
        <div className="relative mx-auto mb-4 h-32 w-32">
          <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-muted"
            />
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={`${progress * 3.14} 314`}
              className="text-red-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold">{progress}%</p>
            <p className="text-xs text-green-500">+8.02% from last month</p>
          </div>
        </div>
        <div className="text-center mb-4">
          <p className="font-medium">Great Progress! 🎉</p>
          <p className="text-sm text-muted-foreground">
            Our achievement increased by{" "}
            <span className="text-red-500">$200,000</span>, let&apos;s reach 100%
            next month.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Target</p>
            <p className="font-semibold">{formatCurrency(target)}</p>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="font-semibold">{formatCurrency(revenue)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActiveUsersCard() {
  const totalUsers = 2758;
  const change = 8.02;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Active User</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold">{formatNumber(totalUsers)}</span>
          <span className="text-green-500 text-sm">+{change}%</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Users from last month</p>
        <div className="space-y-3">
          {activeUsersByCountry.map((item) => (
            <div key={item.country}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>{item.country}</span>
                <span className="font-medium">{item.percentage}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-red-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ConversionRateCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Conversion Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-4 text-center">
          {Object.entries(conversionFunnel).map(([key, data]) => {
            const label = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase());
            const isPositive = data.change >= 0;
            return (
              <div key={key}>
                <p className="text-xs text-muted-foreground truncate">{label}</p>
                <p className="text-lg font-bold mt-1">
                  {formatNumber(data.value)}
                </p>
                <p
                  className={`text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}
                >
                  {isPositive ? "+" : ""}
                  {data.change}%
                </p>
              </div>
            );
          })}
        </div>
        {/* Funnel chart placeholder */}
        <div className="mt-4 flex items-end justify-center gap-2 h-24">
          {[100, 75, 55, 40, 25].map((height, i) => (
            <div
              key={i}
              className="w-12 rounded-t bg-red-500/80"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TrafficSourcesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Traffic Sources</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Bar chart placeholder */}
        <div className="mb-4 flex items-end justify-center gap-3 h-20">
          {[40, 30, 15, 10, 5].map((height, i) => (
            <div
              key={i}
              className="w-10 rounded-t bg-red-400"
              style={{ height: `${height * 2}%`, opacity: 1 - i * 0.15 }}
            />
          ))}
        </div>
        <div className="space-y-2">
          {trafficSources.map((source) => (
            <div
              key={source.name}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span>{source.name}</span>
              </div>
              <span className="font-medium">{source.percentage}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RevenueAnalyticsCard() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Revenue Analytics</CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-4 rounded-full bg-red-500" />
              <span>Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-4 rounded-full border-2 border-dashed border-muted-foreground" />
              <span>Order</span>
            </div>
            <button className="rounded-full bg-red-500 px-3 py-1 text-white text-xs">
              Last 8 Days
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Chart placeholder */}
        <div className="relative h-48">
          <div className="absolute left-0 top-0 flex h-full flex-col justify-between text-xs text-muted-foreground">
            <span>16K</span>
            <span>12K</span>
            <span>8K</span>
            <span>4K</span>
            <span>0</span>
          </div>
          <div className="ml-8 flex h-full items-end justify-between gap-2">
            {[4, 6, 8, 10, 12, 14, 10, 8].map((height, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-red-200 dark:bg-red-900/50"
                  style={{ height: `${height * 8}%` }}
                />
                <span className="text-xs text-muted-foreground">
                  {12 + i} Aug
                </span>
              </div>
            ))}
          </div>
          {/* Revenue tooltip */}
          <div className="absolute right-24 top-8 rounded-lg bg-background border px-3 py-2 shadow-lg">
            <p className="text-xs text-muted-foreground">Revenue</p>
            <p className="font-semibold">$14,521</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stats row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={formatCurrency(dashboardStats.totalSales)}
          change={dashboardStats.salesChange}
          icon={DollarSign}
        />
        <StatCard
          title="Total Orders"
          value={formatNumber(dashboardStats.totalOrders)}
          change={dashboardStats.ordersChange}
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Visitors"
          value={formatNumber(dashboardStats.totalVisitors)}
          change={dashboardStats.visitorsChange}
          icon={Users}
        />
        <TopCategoriesCard />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <RevenueAnalyticsCard />
        <MonthlyTargetCard />
      </div>

      {/* Bottom row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ActiveUsersCard />
        <ConversionRateCard />
        <TrafficSourcesCard />
      </div>
    </div>
  );
}
