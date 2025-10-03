import Link from "next/link";
import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <Film className="h-24 w-24 mx-auto text-muted-foreground" />
        <h1 className="text-4xl font-bold">Movie Not Found</h1>
        <p className="text-lg text-muted-foreground">
          {"Uh-oh looks like we can't find this movie."}
        </p>
        <Button asChild size="lg">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
