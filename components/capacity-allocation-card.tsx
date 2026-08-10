"use client";

import React from "react";
import { AnimatedNumberFlow as NumberFlow } from "@/components/animated-number-flow";
import { Info } from "lucide-react";
import {
  Frame,
  FramePanel,
  FrameHeader,
  FrameTitle,
  FrameFooter,
} from "@/components/ui/frame";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";

const PLACEHOLDER_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&fit=crop&auto=format",
];

function getAvatarUrl(name: string, index: number) {
  return PLACEHOLDER_AVATARS[index % PLACEHOLDER_AVATARS.length];
}

export interface CapacityAllocationCardProps {
  title: string;
  percentage: number;
  trend?: string;
  subtext: string;
  footerLabel: string;
  footerValue: string;
  loading?: boolean;
  members?: { id: string; full_name: string; avatar_url?: string | null }[];
  period?: "week" | "month" | "year";
  onPeriodChange?: (period: "week" | "month" | "year") => void;
  hideMembers?: boolean;
  memberLabel?: string;
  barColorClass?: string;
  isSelected?: boolean;
  activeColorClass?: string;
}

export function CapacityAllocationCard({
  title,
  percentage,
  trend,
  subtext,
  footerLabel,
  footerValue,
  loading = false,
  members,
  period = "month",
  onPeriodChange,
  hideMembers = false,
  memberLabel = "Members",
  barColorClass = "bg-emerald-500",
  isSelected = false,
  activeColorClass = "border-primary ring-2 ring-primary/30",
}: CapacityAllocationCardProps) {
  const isLoading = loading;
  const totalSegments = 56;
  const activeSegments = Math.round((percentage / 100) * totalSegments);

  // Directional animation tracking (matching NumberFlow trend)
  const prevSegmentsRef = React.useRef(activeSegments);
  const isIncreasing = activeSegments >= prevSegmentsRef.current;

  React.useEffect(() => {
    prevSegmentsRef.current = activeSegments;
  }, [activeSegments]);

  if (isLoading) {
    return (
      <Frame className="flex flex-col justify-between @container/card bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card h-full">
        <FramePanel className="h-full flex flex-col justify-between">
          <FrameHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-28" />
            </div>
          </FrameHeader>
          <div className="pb-6 flex flex-col flex-1 gap-4">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-7 w-full mt-auto" />
          </div>
          <FrameFooter className="flex-col items-start gap-1.5 text-sm bg-muted/50 border-t pt-4 mt-auto -mx-5 -mb-5 px-5 pb-5 rounded-b-[var(--frame-radius)]">
            <div className="flex w-full items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
          </FrameFooter>
        </FramePanel>
      </Frame>
    );
  }

  return (
    <Frame
      className={`flex flex-col justify-between @container/card bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card h-full transition-all rounded-(--frame-radius) ${
        isSelected ? `ring-2 ${activeColorClass} scale-[1.01]` : "hover:border-border/80"
      }`}
    >
      <FramePanel className="h-full flex flex-col justify-between">
        <FrameHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground">
              <FrameTitle className="font-medium text-sm">{title}</FrameTitle>
              <Info className="h-4 w-4 text-muted-foreground" />
            </div>
            {onPeriodChange && (
              <div className="flex items-center rounded-md bg-muted p-0.5 text-xs text-muted-foreground">
                {(["week", "month", "year"] as const).map((p) => {
                  const isActive = period === p;
                  return (
                    <button
                      key={p}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPeriodChange?.(p);
                      }}
                      className={`rounded-sm px-2 py-0.5 capitalize transition-colors ${
                        isActive
                          ? "bg-background text-foreground shadow-xs font-medium"
                          : "hover:text-foreground"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </FrameHeader>

        <div className="pb-6 flex flex-col flex-1">
          <div className="mb-6 flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-foreground tabular-nums @[250px]/card:text-3xl flex items-center">
                <NumberFlow value={percentage} />%
              </span>
            </div>
            <div className="flex items-center gap-2">
              {trend && (
                <span className="text-emerald-500 font-medium text-xs">
                  {trend}
                </span>
              )}
              <span className="text-muted-foreground text-xs">{subtext}</span>
            </div>
          </div>

          <div
            className="flex h-7 w-full items-stretch justify-between mt-auto"
            role="img"
            aria-label={`${title} is ${percentage}%`}
          >
            {Array.from({ length: totalSegments }).map((_, i) => {
              const isActive = i < activeSegments;
              const delayMs = isIncreasing ? i * 6 : (totalSegments - 1 - i) * 6;

              return (
                <span
                  key={i}
                  aria-hidden="true"
                  style={{ transitionDelay: `${delayMs}ms` }}
                  className={`h-full w-1 shrink-0 rounded-full transition-all duration-300 ease-out ${
                    isActive
                      ? `${barColorClass} opacity-100 scale-y-100 shadow-xs`
                      : "bg-muted/80 dark:bg-muted/40 opacity-40 scale-y-75"
                  }`}
                />
              );
            })}
          </div>
        </div>

        <FrameFooter className="flex-col items-start gap-1.5 text-sm bg-muted/50 border-t pt-3.5 mt-auto -mx-5 -mb-5 px-5 pb-4 rounded-b-[var(--frame-radius)]">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground text-xs font-medium">
                {footerLabel}:
              </span>
              <span className="text-foreground font-bold text-xs tabular-nums flex items-center">
                {footerValue}
              </span>
            </div>
            {!hideMembers ? (
              <div className="flex items-center gap-2">
                {members && members.length > 0 ? (
                  <>
                    <AvatarGroup>
                      {members.slice(0, 3).map((m, idx) => {
                        const initials = m.full_name
                          ? m.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()
                          : "?";
                        const avatarUrl =
                          m.avatar_url || getAvatarUrl(m.full_name, idx);
                        return (
                          <Avatar key={m.id} size="sm">
                            <AvatarImage src={avatarUrl} alt={m.full_name} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                        );
                      })}
                      {members.length > 3 && (
                        <AvatarGroupCount className="size-6 text-[10px]">
                          +{members.length - 3}
                        </AvatarGroupCount>
                      )}
                    </AvatarGroup>
                    <span className="text-xs text-muted-foreground font-medium pl-1 flex items-center gap-1">
                      <NumberFlow value={members.length} /> {memberLabel}
                    </span>
                  </>
                ) : (
                  <>
                    <AvatarGroup>
                      <Avatar size="sm">
                        <AvatarImage
                          src={PLACEHOLDER_AVATARS[0]}
                          alt="Member 1"
                        />
                        <AvatarFallback>M1</AvatarFallback>
                      </Avatar>
                      <Avatar size="sm">
                        <AvatarImage
                          src={PLACEHOLDER_AVATARS[1]}
                          alt="Member 2"
                        />
                        <AvatarFallback>M2</AvatarFallback>
                      </Avatar>
                      <AvatarGroupCount className="size-6 text-[10px]">
                        +4
                      </AvatarGroupCount>
                    </AvatarGroup>
                    <span className="text-xs text-muted-foreground font-medium pl-1 flex items-center gap-1">
                      <NumberFlow value={6} /> {memberLabel}
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-background/60 px-2 py-0.5 rounded-full border border-border/40">
                <span className={`w-1.5 h-1.5 rounded-full ${barColorClass}`} />
                <span>{percentage}% Rate</span>
              </div>
            )}
          </div>
        </FrameFooter>
      </FramePanel>
    </Frame>
  );
}
