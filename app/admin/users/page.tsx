"use client";

import { useState } from "react";
import { Search, MoreHorizontal, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fakeUsers, type AdminUser } from "@/lib/admin-data";

function getStatusBadge(status: AdminUser["status"]) {
  const variants: Record<AdminUser["status"], "default" | "secondary" | "destructive"> = {
    active: "default",
    inactive: "secondary",
    suspended: "destructive",
  };
  return (
    <Badge variant={variants[status]} className="capitalize">
      {status}
    </Badge>
  );
}

function getRoleBadge(role: AdminUser["role"]) {
  const colors: Record<AdminUser["role"], string> = {
    admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    moderator: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    user: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium capitalize ${colors[role]}`}>
      {role}
    </span>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminUser["status"] | "all">("all");
  const [roleFilter, setRoleFilter] = useState<AdminUser["role"] | "all">("all");

  const filteredUsers = fakeUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const stats = {
    total: fakeUsers.length,
    active: fakeUsers.filter((u) => u.status === "active").length,
    inactive: fakeUsers.filter((u) => u.status === "inactive").length,
    suspended: fakeUsers.filter((u) => u.status === "suspended").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Customers</h1>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Users</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Inactive</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.inactive}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Suspended</p>
            <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as AdminUser["status"] | "all")
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as AdminUser["role"] | "all")
                }
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-red-600">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.lastLogin)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Send email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label="More options"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredUsers.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No users found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
