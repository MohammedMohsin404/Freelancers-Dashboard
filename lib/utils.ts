// /lib/utils.ts
/**
 * Tiny className joiner (like clsx/twMerge-lite)
 * Usage: cn("a", cond && "b", isActive ? "c" : undefined)
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
