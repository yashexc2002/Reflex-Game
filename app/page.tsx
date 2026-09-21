import Game from "@/components/Game";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-8">
        Reflex Challenge
      </h1>
      
      {/* Humara banaya hua naya component */}
      <Game />
      
      <p className="text-slate-400 mt-6 text-sm">Tap anywhere inside the box when the ball is in the center!</p>
    </main>
  );
}