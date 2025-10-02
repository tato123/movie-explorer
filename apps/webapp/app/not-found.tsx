import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="text-center space-y-8 max-w-lg">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Not Found</h1>
          <p className="text-lg text-muted-foreground">
            The page you are looking for does not exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/search">Search Movies</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
