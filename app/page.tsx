import { Playground } from "@/components/Playground";

export default function Home() {
  return (
    <div className="h-screen bg-background p-4 flex flex-col">
      <main className="flex-1 container max-w-4xl mx-auto pt-8">
        <Playground />
      </main>
      
      <footer className="mt-4 text-center text-[10px] text-pink-200">
        <p>Stateless &copy; {new Date().getFullYear()} - Flow state writing app</p>
      </footer>
    </div>
  );
}
