"use client";

import { useState } from "react";
import { Search, Users } from "lucide-react";

import { AdminUserRow } from "@/components/admin/admin-user-row";
import { EmptyState } from "@/components/layout/empty-state";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminMutations, useAdminUsers } from "@/hooks/use-admin";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useAdminUsers(query, page);
  const { banUser } = useAdminMutations();

  const users = data?.users ?? [];
  const total = data?.total ?? 0;
  const hasMore = page * 20 < total;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setQuery(search.trim());
  }

  async function handleBan(userId: string, banned: boolean) {
    const action = banned ? "ban" : "unban";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;
    await banUser.mutateAsync({ userId, banned });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Users"
        subtitle={total > 0 ? `${total} registered users` : "All platform users"}
      />

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, username, Telegram ID…"
            className="h-11 rounded-xl bg-card/50 pl-9"
          />
        </div>
        <Button type="submit" className="h-11 rounded-xl px-4">
          Go
        </Button>
      </form>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon={Users}
          title="Could not load users"
          description="Check your connection and try again."
        />
      )}

      {!isLoading && !isError && users.length === 0 && (
        <EmptyState
          icon={Users}
          title="No users found"
          description={query ? "Try a different search term." : "No users registered yet."}
        />
      )}

      {!isLoading && users.length > 0 && (
        <div className="space-y-3">
          {users.map((user) => (
            <AdminUserRow
              key={user.id}
              user={user}
              onBan={handleBan}
              isBanning={banUser.isPending}
            />
          ))}
        </div>
      )}

      {(page > 1 || hasMore) && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="h-10 rounded-xl"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            className="h-10 rounded-xl"
            disabled={!hasMore}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
