import { Heart } from "lucide-react";
import Link from "next/link";
import { AuthArt } from "@/components/auth-art";
import { AuthForms } from "@/components/auth-forms";

export default function AuthPage() {
  return (
    <main className="grid flex-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <AuthArt />

      <section className="relative flex items-center justify-center px-6 py-16 sm:px-12">
        <AuthForms />
        <Link
          aria-label="Apoie o Printly"
          className="absolute right-4 bottom-4 flex size-10 cursor-pointer flex-col items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-rose-500"
          href="/doar"
          title="Apoie o Printly"
        >
          <Heart className="size-5 animate-pulse" />
        </Link>
      </section>
    </main>
  );
}
