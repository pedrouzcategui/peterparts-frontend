"use client";

import { useState } from "react";
import { Mail, Search } from "lucide-react";
import { UserRole } from "@/lib/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getUserRolePresentation,
  USER_ROLE_OPTIONS,
} from "@/lib/user-roles";

interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  orderCount: number;
  deliveredOrderCount: number;
  createdAt: string;
}

interface AdminUsersStats {
  total: number;
  guests: number;
  customers: number;
  admins: number;
}

interface AdminUsersClientProps {
  initialUsers: AdminUserSummary[];
  initialStats: AdminUsersStats;
}

function RoleBadge({ role }: { role: UserRole }) {
  const presentation = getUserRolePresentation(role);

  return (
    <Badge
      variant={presentation.badgeVariant}
      className={presentation.badgeClassName}
    >
      {presentation.label}
    </Badge>
  );
}

function formatUserDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-VE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminUsersClient({
  initialUsers,
  initialStats,
}: AdminUsersClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredUsers = initialUsers.filter((user) => {
    const matchesSearch =
      normalizedQuery.length === 0 ||
      user.name.toLowerCase().includes(normalizedQuery) ||
      user.email.toLowerCase().includes(normalizedQuery);
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total users</p>
            <p className="text-2xl font-bold">{initialStats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Guests</p>
            <p className="text-2xl font-bold text-slate-600">{initialStats.guests}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Customers</p>
            <p className="text-2xl font-bold text-emerald-600">
              {initialStats.customers}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Admins</p>
            <p className="text-2xl font-bold text-red-600">{initialStats.admins}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative min-w-55 max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Role:</span>
              <select
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value as UserRole | "all")
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All</option>
                {USER_ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {getUserRolePresentation(role).label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Delivered</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
                        <span className="text-sm font-medium text-red-600">
                          {user.name
                            .split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleBadge role={user.role} />
                  </TableCell>
                  <TableCell className="font-medium">{user.orderCount}</TableCell>
                  <TableCell className="font-medium text-emerald-700 dark:text-emerald-300">
                    {user.deliveredOrderCount}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatUserDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon-sm">
                      <a href={`mailto:${user.email}`} aria-label={`Enviar correo a ${user.email}`}>
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No users found.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}