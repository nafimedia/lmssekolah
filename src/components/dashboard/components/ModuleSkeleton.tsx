import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CardStatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border shadow-2xs">
          <CardContent className="p-3.5 sm:p-4 flex items-center justify-between">
            <div className="space-y-2 flex-1 pr-2">
              <Skeleton className="h-3 w-20 bg-muted" />
              <Skeleton className="h-6 w-14 bg-muted" />
              <Skeleton className="h-2.5 w-24 bg-muted" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl bg-muted shrink-0" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TableRowsSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-3 p-4">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <Skeleton className="h-5 w-40 bg-muted" />
        <Skeleton className="h-8 w-28 rounded-lg bg-muted" />
      </div>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="flex items-center gap-4 py-2 border-b border-border/50">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <Skeleton key={cIdx} className={`h-4 bg-muted ${cIdx === 0 ? "w-1/3" : "flex-1"}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function GridCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border shadow-2xs">
          <CardHeader className="p-4 pb-2 space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-8 rounded-xl bg-muted" />
              <Skeleton className="h-4 w-16 rounded-full bg-muted" />
            </div>
            <Skeleton className="h-5 w-3/4 bg-muted" />
            <Skeleton className="h-3 w-full bg-muted" />
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <Skeleton className="h-9 w-full rounded-lg bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
