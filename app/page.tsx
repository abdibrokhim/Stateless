import { Playground } from "@/components/Playground";

export default function Home() {
  return (
    <div className="h-screen bg-background p-4 flex flex-col">
      <main className="flex-1 w-full mx-auto">
        <Playground />
      </main>
      
      <footer className="mt-4 text-center text-[10px] text-pink-200">
        <p>&copy; {new Date().getFullYear()} YAPS WORLD.</p>
      </footer>
    </div>
  );
}
