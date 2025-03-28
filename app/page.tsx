import { Writing } from "@/components/writing";

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-6 flex flex-col">
      <main className="flex-1 container max-w-4xl mx-auto pt-8">
        <Writing />
      </main>
      
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>Stateless &copy; {new Date().getFullYear()} - Flow state writing app</p>
      </footer>
    </div>
  );
}
