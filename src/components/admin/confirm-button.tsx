"use client";

import type { ReactNode } from "react";

/**
 * A submit button that asks first. Used inside the plain server-action forms so
 * destructive operations (delete title/season/episode/row) cannot happen with a
 * single mis-click.
 */
export function ConfirmButton({ message, children, className }: { message: string; children: ReactNode; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
