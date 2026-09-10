import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "O nas",
  description: "Poznaj KZ Style — polską markę premium streetwear zbudowaną wokół betonu i sygnału.",
};

export default function AboutPage() {
  return (
    <article>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">O nas</p>
      <h1 className="mt-2 font-display text-4xl font-black uppercase text-stone-100">
        Beton i sygnał
      </h1>

      <div className="mt-8 flex flex-col gap-5 text-stone-300">
        <p>
          KZ Style powstało z jednego przekonania: polski streetwear nie musi kopiować
          zachodnich wzorców. Nasz punkt wyjścia to surowa estetyka polskich blokowisk —
          beton, stal, sygnalizacja ostrzegawcza — przełożona na krój, materiał i detal,
          nie na hasła.
        </p>
        <p>
          Projektujemy w Polsce, konsultujemy kroje z lokalnymi szwalniami i testujemy każdy
          materiał pod kątem tego, jak znosi codzienne noszenie — nie tylko sesję zdjęciową.
          Sygnałowy pomarańcz w naszym logo to nie przypadek: to kolor, który w mieście
          oznacza &bdquo;uwaga, coś się dzieje&rdquo;.
        </p>
        <p>
          Ograniczone dropy (Limited Drop) to świadoma decyzja, nie sztuczka marketingowa —
          wolimy zrobić mniej sztuk porządnie, niż zalewać rynek.
        </p>
      </div>

      <div className="mt-10 border border-stone-800 bg-stone-900/40 p-5 font-mono text-xs text-stone-400">
        KZ Style to fikcyjna marka stworzona jako projekt edukacyjny/portfolio — cała treść
        na tej stronie (historia, zdjęcia produktowe, dane kontaktowe) jest demonstracyjna.
      </div>
    </article>
  );
}
