/**
 * Convenience wrapper for creating multiple elements, useful
 * when iterating on multiple skeletons
 */
export function LoopContent({
  count,
  children,
}: {
  count: number;
  children: (index: number) => React.ReactNode;
}) {
  return <>{Array.from({ length: count }).map((_, i) => children(i))}</>;
}
