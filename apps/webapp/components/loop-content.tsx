interface LoopContentProps {
  count: number;
  children: (index: number) => React.ReactNode;
}

export function LoopContent({ count, children }: LoopContentProps) {
  return <>{Array.from({ length: count }).map((_, i) => children(i))}</>;
}
