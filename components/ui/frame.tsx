"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type FrameContextType = {
  variant: "default" | "ghost";
  spacing: "sm" | "default" | "lg";
  stacked: boolean;
  dense: boolean;
};

const FrameContext = React.createContext<FrameContextType>({
  variant: "default",
  spacing: "default",
  stacked: false,
  dense: false,
});

export interface FrameProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "ghost";
  spacing?: "sm" | "default" | "lg";
  stacked?: boolean;
  dense?: boolean;
}

export function Frame({
  variant = "default",
  spacing = "default",
  stacked = false,
  dense = false,
  className,
  children,
  ...props
}: FrameProps) {
  return (
    <FrameContext.Provider value={{ variant, spacing, stacked, dense }}>
      <div
        className={cn(
          "flex flex-col [--frame-radius:var(--radius-xl)] w-full",
          // Outer container styles for non-ghost frame
          variant === "default" && [
            "rounded-(--frame-radius) border border-border bg-card text-card-foreground shadow-xs",
            stacked ? "overflow-hidden" : "",
          ],
          // If not stacked, add gaps between panels
          !stacked && {
            "gap-2": spacing === "sm",
            "gap-4": spacing === "default",
            "gap-6": spacing === "lg",
          },
          // Padding inside the frame container (only if variant is default and not stacked)
          variant === "default" &&
            !stacked && {
              "p-0.75": spacing === "sm",
              "p-1.25": spacing === "default",
              "p-2": spacing === "lg",
            },
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </FrameContext.Provider>
  );
}

export interface FramePanelProps extends React.HTMLAttributes<HTMLDivElement> {
  dense?: boolean;
}

export function FramePanel({
  className,
  children,
  dense: localDense,
  ...props
}: FramePanelProps) {
  const {
    variant,
    spacing,
    stacked,
    dense: contextDense,
  } = React.useContext(FrameContext);
  const dense = localDense ?? contextDense;

  return (
    <div
      className={cn(
        "flex flex-col relative w-full flex-1",
        // Stacked styling: panels share borders and touch
        stacked
          ? "border-b last:border-b-0 border-border bg-card first:rounded-t-[calc(var(--frame-radius)-1px)] last:rounded-b-[calc(var(--frame-radius)-1px)]"
          : // Non-stacked ghost frame: panels themselves are cards
            variant === "ghost"
            ? "border border-border bg-card text-card-foreground shadow-xs rounded-(--frame-radius)"
            : // Non-stacked default frame: panels are nested elements
              "border border-border/40 bg-card text-card-foreground rounded-[calc(var(--frame-radius)-4px)]",
        // Padding for the panel itself unless dense is true
        !dense
          ? {
              "p-3": spacing === "sm",
              "p-5": spacing === "default",
              "p-7": spacing === "lg",
            }
          : "p-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type FrameHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function FrameHeader({
  className,
  children,
  ...props
}: FrameHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      {children}
    </div>
  );
}

export type FrameTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export function FrameTitle({ className, children, ...props }: FrameTitleProps) {
  return (
    <h3
      className={cn(
        "text-lg font-semibold leading-none tracking-tight text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export type FrameDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export function FrameDescription({
  className,
  children,
  ...props
}: FrameDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export type FrameFooterProps = React.HTMLAttributes<HTMLDivElement>;

export function FrameFooter({
  className,
  children,
  ...props
}: FrameFooterProps) {
  return (
    <div className={cn("flex items-center mt-auto", className)} {...props}>
      {children}
    </div>
  );
}
