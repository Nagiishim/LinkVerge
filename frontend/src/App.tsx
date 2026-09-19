import { useCallback, useEffect, useMemo, useState } from "react";

type ProductType =
  | "COURSE"
  | "EBOOK"
  | "TEMPLATE"
  | "GUIDE"
  | "SOFTWARE"
  | "COMMUNITY";

type Product = {
  id: number;
  title: string;
  creator: string;
  type: ProductType;
  price: string;
  description: string;
  image: string;
  accent: string;
};

const products: Product[] = [
  {
    id: 1,
    title: "The Digital Creator Playbook",
    creator: "Creator Academy",
    type: "EBOOK",
    price: "₦7,500",
    description:
      "A practical system for building, launching and monetizing digital products.",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=900&q=85",
    accent: "from-violet-500/40 to-fuchsia-500/20",
  },
  {
    id: 2,
    title: "Master Digital Marketing",
    creator: "Growth Lab",
    type: "COURSE",
    price: "₦18,000",
    description:
      "Learn digital marketing from the fundamentals through real-world campaigns.",
    image:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=85",
    accent: "from-cyan-500/40 to-blue-500/20",
  },
  {
    id: 3,
    title: "Ultimate Content System",
    creator: "Notion Studio",
    type: "TEMPLATE",
    price: "₦5,000",
    description:
      "A complete content planning workspace for creators and growing businesses.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85",
    accent: "from-emerald-500/30 to-cyan-500/20",
  },
];

const categories = [
  "All",
  "Courses",
  "Ebooks",
  "Templates",
  "Guides",
  "Software",
  "Communities",
];

const searchExamples = [
  "a course to learn digital marketing from scratch",
  "an ebook about making money online",
  "Notion templates for running a business",
  "a beginner course on video editing",
];

const tickerItems = [
  "COURSES",
  "EBOOKS",
  "TEMPLATES",
  "GUIDES",
  "SOFTWARE",
  "COMMUNITIES",
  "DIGITAL PRODUCTS",
  "CREATOR TOOLS",
];

/* ─────────────────────────────────────────────
   CINEMATIC INTRO
───────────────────────────────────────────── */

function LinkVergeIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase(1), 220),
      window.setTimeout(() => setPhase(2), 700),
      window.setTimeout(() => setPhase(3), 1150),
      window.setTimeout(() => setPhase(4), 1850),
      window.setTimeout(() => onComplete(), 2350),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden bg-[#050507] text-white transition-opacity duration-600 ${
        phase >= 4 ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* ambient light */}
      <div className="absolute left-1/2 top-1/2 h-[55vw] w-[55vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[150px]" />
      <div className="absolute left-[20%] top-[20%] h-40 w-40 rounded-full bg-cyan-500/10 blur-[100px]" />
      <div className="absolute bottom-[10%] right-[15%] h-48 w-48 rounded-full bg-fuchsia-500/10 blur-[110px]" />

      {/* moving grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",
          backgroundSize: "55px 55px",
          animation: "gridMove 12s linear infinite",
        }}
      />

      {/* rings */}
      <div
        className={`absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/20 transition-all duration-1000 ${
          phase >= 1 ? "scale-[3] opacity-0" : "scale-50 opacity-100"
        }`}
      />

      <div
        className={`absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/20 transition-all duration-1000 delay-100 ${
          phase >= 1 ? "scale-[4] opacity-0" : "scale-50 opacity-100"
        }`}
      />

      {/* center logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={`relative transition-all duration-700 ${
            phase >= 1
              ? "scale-100 rotate-0 opacity-100 blur-0"
              : "scale-[0.65] rotate-[-12deg] opacity-0 blur-xl"
          }`}
        >
          <div className="absolute -inset-8 rounded-[2rem] bg-violet-500/20 blur-3xl" />

          <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-[26px] border border-white/15 bg-white shadow-[0_0_80px_rgba(124,58,237,.35)]">
            <img
              src="/logo.jpeg"
              alt="LinkVerge"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-y-0 -left-full w-1/2 rotate-12 bg-white/50 blur-xl transition-all duration-1000" />
          </div>
        </div>
      </div>

      {/* wordmark */}
      <div
        className={`absolute inset-x-0 top-[calc(50%+80px)] text-center transition-all duration-700 ${
          phase >= 2
            ? "translate-y-0 opacity-100"
            : "translate-y-5 opacity-0"
        }`}
      >
        <div className="text-[clamp(1.5rem,4vw,3rem)] font-semibold tracking-[0.38em]">
          LINKVERGE
        </div>

        <div
          className={`mx-auto mt-4 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent transition-all duration-700 ${
            phase >= 3 ? "w-52 opacity-100" : "w-0 opacity-0"
          }`}
        />

        <p
          className={`mt-4 text-[10px] uppercase tracking-[0.35em] text-white/40 transition-all duration-700 ${
            phase >= 3 ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          Find what actually fits.
        </p>
      </div>

      <div className="absolute left-6 top-6 text-[9px] tracking-[0.3em] text-white/30">
        LV / 001
      </div>

      <div className="absolute bottom-6 right-6 text-[9px] tracking-[0.3em] text-white/30">
        DIGITAL DISCOVERY ENGINE
      </div>

      <style>{`
        @keyframes gridMove {
          from {
            transform: translate3d(0,0,0);
          }
          to {
            transform: translate3d(55px,55px,0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   PRODUCT COVER
───────────────────────────────────────────── */

function ProductCover({ product }: { product: Product }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
      <img
        src={product.image}
        alt=""
        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
      />

      <div
        className={`absolute inset-0 bg-gradient-to-br ${product.accent} mix-blend-screen`}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[9px] font-medium tracking-[0.2em] text-white/80 backdrop-blur-xl">
        {product.type}
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="text-xs text-white/50">{product.creator}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */

export default function App() {
  const [introComplete, setIntroComplete] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searching, setSearching] = useState(false);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setExampleIndex((current) => (current + 1) % searchExamples.length);
    }, 2800);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouse = (event: MouseEvent) => {
      setMouse({
        x: (event.clientX / window.innerWidth) * 100,
        y: (event.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouse);

    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setSearching(true);

    await new Promise((resolve) => window.setTimeout(resolve, 900));

    setSearching(false);

    document
      .getElementById("discover")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;

    const map: Record<string, ProductType> = {
      Courses: "COURSE",
      Ebooks: "EBOOK",
      Templates: "TEMPLATE",
      Guides: "GUIDE",
      Software: "SOFTWARE",
      Communities: "COMMUNITY",
    };

    return products.filter(
      (product) => product.type === map[activeCategory]
    );
  }, [activeCategory]);

  if (!introComplete) {
    return <LinkVergeIntro onComplete={handleIntroComplete} />;
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050507] text-white">
      {/* ───────────────── BACKGROUND ───────────────── */}

      <div
        className="pointer-events-none fixed inset-0 z-0 transition-all duration-700"
        style={{
          background: `
            radial-gradient(
              600px circle at ${mouse.x}% ${mouse.y}%,
              rgba(124,58,237,.13),
              transparent 65%
            )
          `,
        }}
      />

      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
          backgroundSize: "70px 70px",
          animation: "slowGrid 20s linear infinite",
        }}
      />

      {/* ───────────────── NAV ───────────────── */}

      <nav className="relative z-30 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="group flex cursor-pointer items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-white/10 bg-white transition duration-500 group-hover:scale-110 group-hover:rotate-3">
            <img
              src="/logo.jpeg"
              alt="LinkVerge"
              className="h-full w-full object-cover"
            />
          </div>

          <span className="font-semibold tracking-[-0.03em]">
            LinkVerge
          </span>
        </div>

        <div className="hidden items-center gap-8 text-sm text-white/50 md:flex">
          <a
            href="#discover"
            className="transition hover:text-white"
          >
            Discover
          </a>

          <a
            href="#how"
            className="transition hover:text-white"
          >
            How it works
          </a>
        </div>

        <button className="group relative overflow-hidden rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm text-white/80 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08]">
          <span className="relative z-10">Sign in</span>
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition duration-700 group-hover:translate-x-full" />
        </button>
      </nav>

      {/* ───────────────── HERO ───────────────── */}

      <section className="relative z-10 mx-auto flex min-h-[760px] max-w-7xl flex-col items-center px-6 pt-20 text-center lg:pt-28">
        <div className="animate-[fadeUp_.8s_ease-out_both]">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/[0.08] px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-violet-200/80 backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-300" />
            </span>
            8,120+ products indexed
          </div>
        </div>

        <h1 className="mt-9 max-w-5xl animate-[heroIn_1s_.1s_ease-out_both] text-5xl font-semibold tracking-[-0.055em] sm:text-6xl lg:text-8xl">
          Find what{" "}
          <span className="relative inline-block">
            actually
            <span className="absolute -bottom-1 left-0 h-3 w-full bg-violet-500/20 blur-xl" />
          </span>{" "}
          fits.
        </h1>

        <p className="mt-7 max-w-2xl animate-[fadeUp_.8s_.25s_ease-out_both] text-base leading-7 text-white/45 sm:text-lg">
          Tell LinkVerge what you need. We understand the request,
          filter the noise, and surface digital products that actually
          match.
        </p>

        {/* SEARCH */}
        <div className="group relative mt-12 w-full max-w-3xl animate-[searchIn_1s_.4s_ease-out_both]">
          <div className="absolute -inset-[1px] rounded-[25px] bg-gradient-to-r from-violet-500/50 via-cyan-400/30 to-fuchsia-500/50 opacity-40 blur-[2px] transition duration-700 group-hover:opacity-80" />

          <div className="relative flex items-center rounded-[24px] border border-white/10 bg-[#0b0b10]/90 p-2 shadow-2xl shadow-violet-950/20 backdrop-blur-2xl">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center text-white/35">
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
            </div>

            <div className="relative min-w-0 flex-1 text-left">
              {!query && (
                <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden text-sm text-white/25">
                  <span
                    key={exampleIndex}
                    className="animate-[placeholderIn_.5s_ease-out_both]"
                  >
                    Try "{searchExamples[exampleIndex]}"
                  </span>
                </div>
              )}

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSearch();
                }}
                className="w-full bg-transparent py-4 text-sm text-white outline-none placeholder:text-transparent"
                placeholder=""
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={searching}
              className="group/button relative hidden overflow-hidden rounded-2xl bg-white px-6 py-4 text-sm font-medium text-black transition duration-300 hover:scale-[1.03] sm:block"
            >
              <span className="relative z-10">
                {searching ? "Searching..." : "Find"}
              </span>

              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-violet-200 to-transparent transition duration-700 group-hover/button:translate-x-full" />
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-2 animate-[fadeUp_.8s_.6s_ease-out_both]">
          {["Courses", "Ebooks", "Templates", "Guides"].map((item) => (
            <button
              key={item}
              onClick={() => {
                setActiveCategory(item);
                document
                  .getElementById("discover")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-full border border-white/[0.07] bg-white/[0.025] px-4 py-2 text-xs text-white/35 transition duration-300 hover:-translate-y-0.5 hover:border-violet-400/20 hover:bg-violet-500/[0.06] hover:text-white/70"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-16 flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-white/20">
          <span>8,120+ digital products</span>
          <span className="h-1 w-1 rounded-full bg-violet-400/50" />
          <span>One intelligent search</span>
        </div>
      </section>

      {/* ───────────────── PRODUCT UNIVERSE ───────────────── */}

      <section className="relative z-10 mx-auto flex max-w-7xl justify-center px-6 pb-32">
        <div className="relative h-[500px] w-full max-w-5xl">
          {/* glow */}
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[100px] animate-pulse" />

          {/* orbit lines */}
          <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.05]" />

          <div className="absolute left-1/2 top-1/2 h-[470px] w-[470px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035]" />

          {/* center */}
          <div className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <div className="relative flex h-28 w-28 items-center justify-center rounded-[32px] border border-white/15 bg-[#0b0b10]/90 shadow-[0_0_100px_rgba(124,58,237,.25)] backdrop-blur-xl transition duration-500 hover:scale-110">
              <div className="absolute -inset-3 rounded-[38px] border border-violet-400/10 animate-ping" />

              <img
                src="/logo.jpeg"
                alt="LinkVerge"
                className="h-16 w-16 rounded-2xl object-cover"
              />
            </div>
          </div>

          {/* cards */}
          <div className="absolute left-[5%] top-[15%] animate-[floatOne_6s_ease-in-out_infinite]">
            <FloatingProduct
              product={products[0]}
              rotate="-rotate-6"
            />
          </div>

          <div className="absolute right-[4%] top-[20%] animate-[floatTwo_7s_ease-in-out_infinite]">
            <FloatingProduct
              product={products[1]}
              rotate="rotate-6"
            />
          </div>

          <div className="absolute bottom-[10%] left-[18%] animate-[floatThree_8s_ease-in-out_infinite]">
            <FloatingProduct
              product={products[2]}
              rotate="rotate-3"
            />
          </div>

          <div className="absolute bottom-[8%] right-[17%] hidden animate-[floatOne_7s_1s_ease-in-out_infinite] sm:block">
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-4 backdrop-blur-xl">
              <div className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                Decision engine
              </div>
              <div className="mt-2 text-sm text-white/70">
                Match → Rank → Explain
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20">
              One search → thousands of possibilities
            </p>
          </div>
        </div>
      </section>

      {/* ───────────────── TICKER ───────────────── */}

      <section className="relative overflow-hidden border-y border-white/[0.06] py-5">
        <div className="flex w-max animate-[marquee_25s_linear_infinite]">
          {[...tickerItems, ...tickerItems, ...tickerItems].map(
            (item, index) => (
              <div
                key={`${item}-${index}`}
                className="mx-8 flex items-center gap-8 text-[10px] font-medium tracking-[0.28em] text-white/20"
              >
                {item}
                <span className="h-1 w-1 rounded-full bg-violet-400/40" />
              </div>
            )
          )}
        </div>
      </section>

      {/* ───────────────── DISCOVER ───────────────── */}

      <section
        id="discover"
        className="relative z-10 mx-auto max-w-7xl px-6 py-32 lg:px-10"
      >
        <div className="max-w-3xl">
          <div className="mb-5 text-[10px] uppercase tracking-[0.3em] text-violet-300/60">
            Discovery
          </div>

          <h2 className="text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
            Digital products.
            <br />
            <span className="text-white/30">Without the noise.</span>
          </h2>

          <p className="mt-6 max-w-xl text-sm leading-7 text-white/40">
            Browse by category, or let LinkVerge understand exactly
            what you are looking for.
          </p>
        </div>

        <div className="mt-12 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-xs transition duration-300 ${
                activeCategory === category
                  ? "border-white/20 bg-white text-black"
                  : "border-white/[0.08] bg-white/[0.025] text-white/40 hover:border-white/15 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="group animate-[cardIn_.7s_ease-out_both]"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="relative overflow-hidden rounded-[25px] border border-white/[0.07] bg-white/[0.025] p-2 backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:border-violet-400/20 hover:bg-white/[0.04] hover:shadow-[0_25px_80px_rgba(124,58,237,.12)]">
                <ProductCover product={product} />

                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-medium text-white/90">
                        {product.title}
                      </h3>

                      <p className="mt-1 text-xs text-white/30">
                        {product.creator}
                      </p>
                    </div>

                    <span className="whitespace-nowrap text-sm font-medium text-white/70">
                      {product.price}
                    </span>
                  </div>

                  <p className="mt-4 text-xs leading-6 text-white/35">
                    {product.description}
                  </p>

                  <button className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-xs text-white/45 transition hover:border-violet-400/20 hover:bg-violet-500/[0.06] hover:text-white">
                    <span>View match</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────────── HOW IT WORKS ───────────────── */}

      <section
        id="how"
        className="relative z-10 border-y border-white/[0.06] bg-white/[0.015]"
      >
        <div className="mx-auto max-w-7xl px-6 py-32 lg:px-10">
          <div className="max-w-2xl">
            <div className="text-[10px] uppercase tracking-[0.3em] text-cyan-300/50">
              The engine
            </div>

            <h2 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
              Search less.
              <br />
              <span className="text-white/30">Decide faster.</span>
            </h2>
          </div>

          <div className="mt-20 grid gap-px overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.05] md:grid-cols-4">
            {[
              {
                number: "01",
                title: "Understand",
                text: "Your natural-language request becomes structured requirements.",
              },
              {
                number: "02",
                title: "Filter",
                text: "Hard constraints remove products that do not actually fit.",
              },
              {
                number: "03",
                title: "Rank",
                text: "Remaining products are scored against your preferences.",
              },
              {
                number: "04",
                title: "Explain",
                text: "You see why each recommendation matches and where it compromises.",
              },
            ].map((step, index) => (
              <div
                key={step.number}
                className="group relative min-h-[280px] bg-[#08080c] p-7 transition duration-500 hover:bg-[#0d0d13]"
              >
                <div className="text-[10px] tracking-[0.25em] text-violet-300/40">
                  {step.number}
                </div>

                <div className="mt-20">
                  <h3 className="text-lg font-medium">{step.title}</h3>

                  <p className="mt-3 text-sm leading-6 text-white/35">
                    {step.text}
                  </p>
                </div>

                <div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-700 group-hover:w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── CTA ───────────────── */}

      <section className="relative z-10 px-6 py-40">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[35px] border border-white/[0.08] bg-white/[0.025] px-6 py-24 text-center backdrop-blur-xl sm:px-12">
          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[100px]" />

          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.3em] text-violet-300/50">
              LinkVerge
            </div>

            <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
              Stop browsing.
              <br />
              <span className="text-white/30">
                Start finding what fits.
              </span>
            </h2>

            <button
              onClick={() => {
                document
                  .getElementById("discover")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group relative mt-10 overflow-hidden rounded-full bg-white px-7 py-4 text-sm font-medium text-black transition duration-300 hover:scale-105"
            >
              <span className="relative z-10">Start discovering</span>

              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-violet-200 to-transparent transition duration-700 group-hover:translate-x-full" />
            </button>
          </div>
        </div>
      </section>

      {/* ───────────────── FOOTER ───────────────── */}

      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 text-xs text-white/25 sm:flex-row">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt=""
              className="h-7 w-7 rounded-lg"
            />
            <span>LinkVerge</span>
          </div>

          <span>Digital discovery, intelligently.</span>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes heroIn {
          from {
            opacity: 0;
            transform: translateY(30px) scale(.97);
            filter: blur(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes searchIn {
          from {
            opacity: 0;
            transform: translateY(25px) scale(.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes placeholderIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floatOne {
          0%, 100% {
            transform: translateY(0) rotate(-6deg);
          }
          50% {
            transform: translateY(-15px) rotate(-3deg);
          }
        }

        @keyframes floatTwo {
          0%, 100% {
            transform: translateY(0) rotate(6deg);
          }
          50% {
            transform: translateY(-20px) rotate(9deg);
          }
        }

        @keyframes floatThree {
          0%, 100% {
            transform: translateY(0) rotate(3deg);
          }
          50% {
            transform: translateY(-12px) rotate(0deg);
          }
        }

        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-33.333%);
          }
        }

        @keyframes slowGrid {
          from {
            transform: translate(0, 0);
          }
          to {
            transform: translate(70px, 70px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  );
}

/* ─────────────────────────────────────────────
   FLOATING PRODUCT
───────────────────────────────────────────── */

function FloatingProduct({
  product,
  rotate,
}: {
  product: Product;
  rotate: string;
}) {
  return (
    <div
      className={`group w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b10]/80 p-2 shadow-2xl backdrop-blur-xl transition duration-500 hover:z-50 hover:scale-110 hover:rotate-0 hover:border-violet-400/30 ${rotate}`}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
        <img
          src={product.image}
          alt=""
          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="absolute bottom-2 left-2 right-2 text-[9px] font-medium text-white/80">
          {product.title}
        </div>
      </div>

      <div className="px-2 py-2">
        <div className="text-[8px] uppercase tracking-[0.2em] text-white/25">
          {product.type}
        </div>

        <div className="mt-1 text-xs text-white/70">
          {product.price}
        </div>
      </div>
    </div>
  );
}