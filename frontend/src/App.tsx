import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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

type RecommendationOffer = {
  offer_id: string;
  retailer_id: string;
  seller_name?: string;
  price: number;
  currency: string;
  in_stock: boolean;
  product_url: string;
  affiliate_url?: string;
};

type Recommendation = {
  product_id: string;
  title: string;
  brand: string;
  price: number;
  currency: string;
  in_stock: boolean;
  product_url: string;
  affiliate_url?: string;
  score: number;
  reasons: string[];
  offers: RecommendationOffer[];
};

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://linkverge-1.onrender.com"
).replace(/\/$/, "");

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

function formatPrice(
  price: number,
  currency: string
) {
  if (currency === "NGN") {
    return `₦${price.toLocaleString("en-NG")}`;
  }

  return `${currency} ${price.toLocaleString()}`;
}

function LinkVergeIntro({
  onComplete,
}: {
  onComplete: () => void;
}) {
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
        phase >= 4
          ? "pointer-events-none opacity-0"
          : "opacity-100"
      }`}
    >
      <div className="absolute left-1/2 top-1/2 h-[55vw] w-[55vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[150px]" />

      <div className="absolute left-[20%] top-[20%] h-40 w-40 rounded-full bg-cyan-500/10 blur-[100px]" />

      <div className="absolute bottom-[10%] right-[15%] h-48 w-48 rounded-full bg-fuchsia-500/10 blur-[110px]" />

      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)",
          backgroundSize: "55px 55px",
          animation: "gridMove 12s linear infinite",
        }}
      />

      <div
        className={`absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/20 transition-all duration-1000 ${
          phase >= 1
            ? "scale-[3] opacity-0"
            : "scale-50 opacity-100"
        }`}
      />

      <div
        className={`absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/20 transition-all duration-1000 delay-100 ${
          phase >= 1
            ? "scale-[4] opacity-0"
            : "scale-50 opacity-100"
        }`}
      />

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
          </div>
        </div>
      </div>

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
            phase >= 3
              ? "w-52 opacity-100"
              : "w-0 opacity-0"
          }`}
        />

        <p
          className={`mt-4 text-[10px] uppercase tracking-[0.35em] text-white/40 transition-all duration-700 ${
            phase >= 3
              ? "translate-y-0 opacity-100"
              : "translate-y-3 opacity-0"
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

function ProductCover({
  product,
}: {
  product: Product;
}) {
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
        <div className="text-xs text-white/50">
          {product.creator}
        </div>
      </div>
    </div>
  );
}

function FloatingProduct({
  product,
  rotate,
}: {
  product: Product;
  rotate: string;
}) {
  return (
    <div
      className={`w-44 overflow-hidden rounded-[20px] border border-white/[0.08] bg-[#0e0e12] shadow-2xl shadow-black/40 ${rotate}`}
    >
      <div className="relative h-28 overflow-hidden">
        <img
          src={product.image}
          alt=""
          className="h-full w-full object-cover"
        />

        <div
          className={`absolute inset-0 bg-gradient-to-br ${product.accent}`}
        />
      </div>

      <div className="p-4">
        <div className="text-[9px] uppercase tracking-[0.2em] text-white/25">
          {product.type}
        </div>

        <div className="mt-2 line-clamp-2 text-xs font-semibold text-white/70">
          {product.title}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [introComplete, setIntroComplete] =
    useState(false);

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState("All");

  const [searching, setSearching] =
    useState(false);

  const [searchError, setSearchError] =
    useState("");

  const [recommendations, setRecommendations] =
    useState<Recommendation[]>([]);

  const [exampleIndex, setExampleIndex] =
    useState(0);

  const [mouse, setMouse] = useState({
    x: 50,
    y: 50,
  });

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setExampleIndex(
        (current) =>
          (current + 1) %
          searchExamples.length
      );
    }, 2800);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleMouse = (event: MouseEvent) => {
      setMouse({
        x:
          (event.clientX /
            window.innerWidth) *
          100,
        y:
          (event.clientY /
            window.innerHeight) *
          100,
      });
    };

    window.addEventListener(
      "mousemove",
      handleMouse
    );

    return () =>
      window.removeEventListener(
        "mousemove",
        handleMouse
      );
  }, []);

  const handleSearch = async (
    searchQuery = query
  ) => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) return;

    setSearching(true);
    setSearchError("");
    setRecommendations([]);

    try {
      const parseResponse = await fetch(
        `${API_URL}/parse-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            query: trimmedQuery,
          }),
        }
      );

      const parseData =
        await parseResponse.json();

      if (!parseResponse.ok) {
        throw new Error(
          parseData.error ||
            "Unable to understand your request."
        );
      }

      const recommendResponse =
        await fetch(
          `${API_URL}/recommend`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              parseData.intent
            ),
          }
        );

      const recommendData =
        await recommendResponse.json();

      if (!recommendResponse.ok) {
        throw new Error(
          recommendData.error ||
            "Unable to find matching products."
        );
      }

      const nextRecommendations =
        Array.isArray(
          recommendData.recommendations
        )
          ? recommendData.recommendations
          : [];

      setRecommendations(
        nextRecommendations
      );

      window.setTimeout(() => {
        document
          .getElementById("discover")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 100);
    } catch (error) {
      console.error(
        "LinkVerge search error:",
        error
      );

      setSearchError(
        error instanceof Error
          ? error.message
          : "Something went wrong while searching."
      );

      document
        .getElementById("discover")
        ?.scrollIntoView({
          behavior: "smooth",
        });
    } finally {
      setSearching(false);
    }
  };

  const handleCategoryClick = (
    category: string
  ) => {
    setActiveCategory(category);

    if (category === "All") {
      setRecommendations([]);
      setSearchError("");
      return;
    }

    const categoryQuery =
      `Find me digital products ` +
      `in the ${category} category`;

    setQuery(categoryQuery);
    handleSearch(categoryQuery);
  };

  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") {
      return products;
    }

    const map: Record<
      string,
      ProductType
    > = {
      Courses: "COURSE",
      Ebooks: "EBOOK",
      Templates: "TEMPLATE",
      Guides: "GUIDE",
      Software: "SOFTWARE",
      Communities: "COMMUNITY",
    };

    const mappedType =
      map[activeCategory];

    if (!mappedType) {
      return products;
    }

    return products.filter(
      (product) =>
        product.type === mappedType
    );
  }, [activeCategory]);

  if (!introComplete) {
    return (
      <LinkVergeIntro
        onComplete={handleIntroComplete}
      />
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#050507] text-white">
      {/* AMBIENT BACKGROUND */}

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
          animation:
            "slowGrid 20s linear infinite",
        }}
      />

      {/* NAV */}

      <nav className="relative z-30 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <button
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className="group flex items-center gap-3"
        >
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
        </button>

        <div className="hidden items-center gap-8 text-sm text-white/35 md:flex">
          <a
            href="#discover"
            className="transition hover:text-white"
          >
            Discover
          </a>

          <a
            href="#how-it-works"
            className="transition hover:text-white"
          >
            How it works
          </a>
        </div>

        <button
          onClick={() =>
            document
              .getElementById("discover")
              ?.scrollIntoView({
                behavior: "smooth",
              })
          }
          className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition duration-300 hover:-translate-y-0.5 hover:bg-white/90"
        >
          Explore
        </button>
      </nav>

      {/* HERO */}

      <section className="relative z-10 overflow-hidden px-6 pb-10 pt-12 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-5xl text-center">
            <div className="animate-[fadeUp_.7s_ease-out] inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-4 py-2 text-xs font-medium text-white/50 backdrop-blur-xl">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              Intelligent digital discovery
            </div>

            <h1 className="animate-[fadeUp_.8s_.1s_ease-out_both] mt-7 text-[3.7rem] font-black leading-[0.9] tracking-[-0.065em] sm:text-7xl md:text-[6.8rem]">
              Tell us what
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-300 bg-clip-text text-transparent">
                you need.
              </span>
            </h1>

            <p className="animate-[fadeUp_.8s_.2s_ease-out_both] mx-auto mt-7 max-w-2xl text-base leading-7 text-white/40 sm:text-lg">
              Describe what you want naturally.
              LinkVerge turns your intent into
              requirements and finds the products
              that actually fit.
            </p>

            {/* SEARCH */}

            <div className="animate-[searchIn_.8s_.3s_ease-out_both] mx-auto mt-10 max-w-3xl">
              <div className="group relative rounded-[26px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400 p-[1px] shadow-[0_25px_90px_-30px_rgba(139,92,246,.5)]">
                <div className="rounded-[25px] bg-[#101012] p-2">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <div className="flex min-h-[62px] flex-1 items-center">
                      <span className="pl-4 pr-2 text-xl text-white/25">
                        ✦
                      </span>

                      <input
                        value={query}
                        onChange={(event) =>
                          setQuery(
                            event.target.value
                          )
                        }
                        onKeyDown={(event) => {
                          if (
                            event.key ===
                            "Enter"
                          ) {
                            handleSearch();
                          }
                        }}
                        placeholder={
                          searchExamples[
                            exampleIndex
                          ]
                        }
                        className="h-full min-w-0 flex-1 bg-transparent px-2 text-base font-medium text-white outline-none placeholder:text-white/25"
                      />
                    </div>

                    <button
                      onClick={() =>
                        handleSearch()
                      }
                      disabled={searching}
                      className="min-h-[58px] rounded-[18px] bg-white px-7 font-semibold text-black transition duration-300 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {searching
                        ? "Finding..."
                        : "Find it →"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {searchExamples.map(
                  (example) => (
                    <button
                      key={example}
                      onClick={() => {
                        setQuery(example);
                        handleSearch(
                          example
                        );
                      }}
                      className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3.5 py-2 text-xs font-medium text-white/35 backdrop-blur transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.06] hover:text-white/70"
                    >
                      {example}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* DISCOVERY ORBIT */}

          <div className="relative mx-auto mt-20 hidden h-[500px] w-full max-w-5xl md:block">
            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[100px] animate-pulse" />

            <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.05]" />

            <div className="absolute left-1/2 top-1/2 h-[470px] w-[470px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.035]" />

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
        </div>
      </section>

      {/* TICKER */}

      <section className="relative z-10 overflow-hidden border-y border-white/[0.06] py-5">
        <div className="flex w-max animate-[marquee_25s_linear_infinite]">
          {[
            ...tickerItems,
            ...tickerItems,
            ...tickerItems,
          ].map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="mx-8 flex items-center gap-8 text-[10px] font-medium tracking-[0.28em] text-white/20"
            >
              {item}
              <span className="h-1 w-1 rounded-full bg-violet-400/40" />
            </div>
          ))}
        </div>
      </section>

      {/* DISCOVER */}

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
            <span className="text-white/30">
              Without the noise.
            </span>
          </h2>

          <p className="mt-6 max-w-xl text-sm leading-7 text-white/40">
            Browse by category, or let
            LinkVerge understand exactly what
            you are looking for.
          </p>
        </div>

        <div className="mt-12 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() =>
                handleCategoryClick(category)
              }
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

        {searchError && (
          <div className="mt-8 rounded-2xl border border-red-400/10 bg-red-500/[0.04] px-5 py-4 text-sm text-red-300/80">
            {searchError}
          </div>
        )}

        {searching && (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[25px] border border-white/[0.06] bg-white/[0.02] p-6"
              >
                <div className="h-32 rounded-2xl bg-white/[0.05]" />

                <div className="mt-6 h-5 w-3/4 rounded bg-white/[0.06]" />

                <div className="mt-3 h-3 w-1/3 rounded bg-white/[0.05]" />

                <div className="mt-6 space-y-2">
                  <div className="h-3 rounded bg-white/[0.04]" />
                  <div className="h-3 w-5/6 rounded bg-white/[0.04]" />
                  <div className="h-3 w-4/6 rounded bg-white/[0.04]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!searching &&
          recommendations.length === 0 && (
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {filteredProducts.map(
                (product, index) => (
                  <div
                    key={product.id}
                    className="group animate-[cardIn_.7s_ease-out_both]"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <div className="relative overflow-hidden rounded-[25px] border border-white/[0.07] bg-white/[0.025] p-2 backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:border-violet-400/20 hover:bg-white/[0.04] hover:shadow-[0_25px_80px_rgba(124,58,237,.12)]">
                      <ProductCover
                        product={product}
                      />

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

                        <button
                          onClick={() => {
                            setQuery(
                              product.title
                            );
                            handleSearch(
                              product.title
                            );
                          }}
                          className="mt-5 flex w-full items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 text-xs text-white/45 transition hover:border-violet-400/20 hover:bg-violet-500/[0.06] hover:text-white"
                        >
                          <span>
                            Find similar
                          </span>

                          <span className="transition-transform duration-300 group-hover:translate-x-1">
                            →
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}

        {!searching &&
          recommendations.length > 0 && (
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {recommendations.map(
                (product, index) => {
                  const destination =
                    product.affiliate_url ||
                    `${API_URL}/go/${encodeURIComponent(
                      product.product_id
                    )}`;

                  const rankLabel =
                    index === 0
                      ? "BEST OVERALL"
                      : index === 1
                        ? "BEST TRADE-OFF"
                        : "BEST BUDGET";

                  return (
                    <article
                      key={product.product_id}
                      className="group flex flex-col overflow-hidden rounded-[30px] border border-white/[0.07] bg-[#111113] transition-all duration-500 hover:-translate-y-2 hover:border-violet-400/20 hover:bg-[#151517] hover:shadow-[0_25px_80px_-25px_rgba(124,58,237,.25)]"
                      style={{
                        animation: `fadeUp .6s ${
                          index * 0.08
                        }s ease-out both`,
                      }}
                    >
                      <div className="relative h-48 overflow-hidden bg-black">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-fuchsia-600 to-orange-500 opacity-90 transition duration-700 group-hover:scale-110" />

                        <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/15 blur-2xl" />

                        <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-black/30 blur-2xl" />

                        <div className="relative flex h-full flex-col justify-between p-6 text-white">
                          <div className="flex items-center justify-between">
                            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[9px] font-black tracking-[0.15em] backdrop-blur">
                              {rankLabel}
                            </span>

                            <span className="text-xs font-bold text-white/70">
                              {Math.round(
                                product.score
                              )}
                            </span>
                          </div>

                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-[.2em] text-white/50">
                              {product.brand}
                            </div>

                            <div className="mt-1 max-w-[85%] text-xl font-black leading-tight">
                              {product.title}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-base font-medium text-white/90">
                              {product.title}
                            </h3>

                            <p className="mt-1 text-xs text-white/30">
                              by {product.brand}
                            </p>
                          </div>

                          <span className="whitespace-nowrap text-sm font-semibold text-white/80">
                            {formatPrice(
                              product.price,
                              product.currency
                            )}
                          </span>
                        </div>

                        {product.reasons.length >
                          0 && (
                          <div className="mt-5 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4">
                            <div className="text-[10px] font-black uppercase tracking-[.15em] text-white/25">
                              Why this matches
                            </div>

                            <div className="mt-3 space-y-2">
                              {product.reasons
                                .slice(0, 3)
                                .map(
                                  (
                                    reason,
                                    reasonIndex
                                  ) => (
                                    <div
                                      key={`${product.product_id}-${reasonIndex}`}
                                      className="text-xs leading-5 text-white/50"
                                    >
                                      <span className="mr-1.5 text-emerald-400">
                                        ✓
                                      </span>
                                      {reason}
                                    </div>
                                  )
                                )}
                            </div>
                          </div>
                        )}

                        <a
                          href={destination}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 flex items-center justify-between rounded-2xl bg-white px-5 py-4 text-sm font-bold text-black transition-all duration-300 hover:bg-white/90"
                        >
                          <span>
                            View product
                          </span>

                          <span className="transition duration-300 group-hover:translate-x-1">
                            →
                          </span>
                        </a>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          )}
      </section>

      {/* HOW IT WORKS */}

      <section
        id="how-it-works"
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
              <span className="text-white/30">
                Decide faster.
              </span>
            </h2>

            <p className="mt-6 max-w-xl leading-7 text-white/35">
              LinkVerge turns everyday language
              into structured requirements,
              filters hard constraints, ranks the
              remaining products and explains the
              result.
            </p>
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
            ].map((step) => (
              <div
                key={step.number}
                className="group relative min-h-[280px] bg-[#08080c] p-7 transition duration-500 hover:bg-[#0d0d13]"
              >
                <div className="text-[10px] tracking-[0.25em] text-violet-300/40">
                  {step.number}
                </div>

                <div className="mt-20">
                  <h3 className="text-lg font-medium">
                    {step.title}
                  </h3>

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

      {/* CTA */}

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
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              className="group relative mt-10 overflow-hidden rounded-full bg-white px-7 py-4 text-sm font-medium text-black transition duration-300 hover:scale-105"
            >
              <span className="relative z-10">
                Start discovering
              </span>

              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-violet-200 to-transparent transition duration-700 group-hover:translate-x-full" />
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="relative z-10 border-t border-white/[0.06] px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 text-xs text-white/25 sm:flex-row">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpeg"
              alt="LinkVerge"
              className="h-7 w-7 rounded-lg"
            />

            <span>LinkVerge</span>
          </div>

          <span>
            Digital discovery, intelligently.
          </span>
        </div>
      </footer>

      {/* ANIMATIONS */}

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
          * {
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