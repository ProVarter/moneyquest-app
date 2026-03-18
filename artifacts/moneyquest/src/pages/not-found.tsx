import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { PageTransition } from "@/components/page-transition";

export default function NotFound() {
  return (
    <PageTransition className="flex items-center justify-center min-h-screen bg-background text-foreground p-6">
      <div className="w-full max-w-sm text-center">
        <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-12 h-12 text-destructive" />
        </div>
        <h1 className="text-4xl font-display font-black mb-2">404</h1>
        <p className="text-muted-foreground mb-8">This zone hasn't been mapped yet. Return to known territory.</p>
        <Link href="/">
          <Button className="w-full h-14 rounded-xl text-lg font-bold">
            Return to Base
          </Button>
        </Link>
      </div>
    </PageTransition>
  );
}
