import { useState } from "react";

type Mode = "digital" | "physical";

type Product = {
  product_id: string;
  title: string;
  creator: string;
  description: string;
  category: string;
  product_type: string;
  price: number;
  currency: string;
  rating: number | null;
  product_url: string;
  affiliate_url: string | null;
  reasons: string[];
};

const API_URL = "http://localhost:3000";
const NGN_PER_USD = 1330;

const categories = [
  {
    name: "Tech & Coding",
    icon: "⌘",
    description: "Code, AI & development",
  },
  {
    name: "Business & Money",
    icon: "◈",
    description: "Business, finance & income",
  },
  {
    name: "Design & Creativity",
    icon: "✦",
    description: "Design, graphics & creativity",
  },
  {
    name: "Social Media",
    icon: "◎",
    description: "Growth, content & strategy",
  },
  {
    name: "Video & Content",
    icon: "▶",
    description: "Video, editing & creation",
  },
  {
    name: "Education",
    icon: "◇",
    description: "Learning & academics",
  },
  {
    name: "Personal Development",
    icon: "↗",
    description: "Habits, mindset & growth",
  },
  {
    name: "Career & Skills",
    icon: "▣",
    description: "Skills & career building",
  },
  {
    name: "Tools & Templates",
    icon: "⌘",
    description: "Ready-to-use resources",
  },
];

const exampleSearches = [
  "A beginner Python course",
  "Social media templates",
  "A course to learn video editing",
];

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatUSD(amountNGN: number) {
  const usd = amountNGN / NGN_PER_USD;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(usd);
}

function App() {
  const [mode, setMode] = useState<Mode>("digital");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<string | null>(null);

  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  async function handleSearch(searchQuery = query) {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) return;

    if (mode === "physical") {
      setSearchError(
        "Physical-product matching is coming soon."
      );
      setResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setResults([]);

    try {
      const parseResponse = await fetch(
        `${API_URL}/parse-intent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: trimmedQuery,
          }),
        }
      );

      const parseData = await parseResponse.json();

      if (!parseResponse.ok) {
        throw new Error(
          parseData.error ||
            "Unable to understand your request."
        );
      }

      const recommendResponse = await fetch(
        `${API_URL}/recommend`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parseData.intent),
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

      setResults(
        Array.isArray(recommendData.recommendations)
          ? recommendData.recommendations
          : []
      );

      setTimeout(() => {
        document
          .getElementById("products")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 50);
    } catch (error) {
      console.error(error);

      setSearchError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setIsSearching(false);
    }
  }

  function handleCategoryClick(category: string) {
    setActiveCategory(category);

    const categoryQuery =
      `Find me digital products for ${category}`;

    setQuery(categoryQuery);
    handleSearch(categoryQuery);
  }

  function scrollToSearch() {
    document
      .getElementById("find-search")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

    setTimeout(() => {
      document
        .getElementById("findit-input")
        ?.focus();
    }, 500);
  }

  const hasSearchState =
    isSearching ||
    Boolean(searchError) ||
    results.length > 0 ||
    Boolean(query.trim());

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#070708] text-white selection:bg-violet-500/30">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-10%] top-[8%] h-[500px] w-[500px] rounded-full bg-violet-700/10 blur-[150px]" />
        <div className="absolute right-[-12%] top-[25%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.06] blur-[160px]" />
        <div className="absolute bottom-[-15%] left-[35%] h-[500px] w-[500px] rounded-full bg-orange-500/[0.05] blur-[160px]" />
      </div>

      {/* NAVBAR */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/[0.06] bg-[#070708]/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-[70px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="group flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-white text-sm font-black text-black transition duration-300 group-hover:rotate-6 group-hover:scale-105">
              F
            </div>

            <span className="text-lg font-black tracking-[-0.04em]">
              FindIt
            </span>
          </button>

          <div className="hidden items-center gap-8 text-sm font-medium text-white/40 md:flex">
            <a
              href="#categories"
              className="transition hover:text-white"
            >
              Explore
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-white"
            >
              How it works
            </a>

            <a
              href="#products"
              className="transition hover:text-white"
            >
              Results
            </a>
          </div>

          <button
            onClick={scrollToSearch}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Find something
          </button>
        </div>
      </nav>

      <main className="pt-[70px]">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/70 to-transparent" />

          <div className="mx-auto max-w-7xl px-5 pb-24 pt-20 sm:px-8 md:pb-32 md:pt-28">
            <div className="mx-auto max-w-5xl text-center">
              <div className="animate-[fadeUp_.6s_ease-out] inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-4 py-2 text-xs font-semibold text-white/50 backdrop-blur-xl">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                  <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
                </span>

                Digital products are live
              </div>

              <h1 className="animate-[fadeUp_.7s_.08s_ease-out_both] mt-7 text-[3.4rem] font-black leading-[0.9] tracking-[-0.07em] sm:text-7xl md:text-[6.4rem]">
                Stop searching.
                <br />

                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-orange-300 bg-clip-text text-transparent">
                  Start finding.
                </span>
              </h1>

              <p className="animate-[fadeUp_.7s_.16s_ease-out_both] mx-auto mt-7 max-w-2xl text-base leading-7 text-white/40 sm:text-lg">
                Tell FindIt what you actually need.
                We turn your request into requirements,
                then find products that fit.
              </p>

              {/* SEARCH */}
              <div
                id="find-search"
                className="animate-[fadeUp_.7s_.24s_ease-out_both] mx-auto mt-10 max-w-3xl scroll-mt-28"
              >
                <div className="rounded-[27px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-orange-400 p-[1px] shadow-[0_25px_100px_-35px_rgba(139,92,246,.55)]">
                  <div className="rounded-[26px] bg-[#101012] p-2">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <div className="flex min-h-[62px] flex-1 items-center">
                        <span className="pl-4 pr-2 text-xl text-white/20">
                          ✦
                        </span>

                        <input
                          id="findit-input"
                          value={query}
                          onChange={(event) =>
                            setQuery(event.target.value)
                          }
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              handleSearch();
                            }
                          }}
                          placeholder="Describe what you're looking for..."
                          aria-label="Describe what you're looking for"
                          className="h-full min-w-0 flex-1 bg-transparent px-2 text-base font-medium text-white outline-none placeholder:text-white/25"
                        />

                        {query && (
                          <button
                            type="button"
                            onClick={() => {
                              setQuery("");
                              setResults([]);
                              setSearchError("");
                            }}
                            className="mr-2 flex h-8 w-8 items-center justify-center rounded-full text-white/25 transition hover:bg-white/[0.06] hover:text-white/70"
                            aria-label="Clear search"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handleSearch()}
                        disabled={
                          isSearching || !query.trim()
                        }
                        className="min-h-[58px] rounded-[19px] bg-white px-7 font-bold text-black transition duration-300 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isSearching
                          ? "Finding..."
                          : "Find it →"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <span className="mr-1 py-2 text-xs text-white/20">
                    Try:
                  </span>

                  {exampleSearches.map((example) => (
                    <button
                      key={example}
                      onClick={() => {
                        setQuery(example);
                        handleSearch(example);
                      }}
                      className="rounded-full border border-white/[0.07] bg-white/[0.025] px-3.5 py-2 text-xs font-medium text-white/35 transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.06] hover:text-white/75"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* MODE SWITCH */}
              <div className="animate-[fadeUp_.7s_.32s_ease-out_both] mx-auto mt-10 flex w-fit rounded-full border border-white/[0.07] bg-white/[0.025] p-1.5 backdrop-blur-xl">
                <button
                  onClick={() => {
                    setMode("digital");
                    setResults([]);
                    setSearchError("");
                  }}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
                    mode === "digital"
                      ? "bg-white text-black shadow-lg"
                      : "text-white/35 hover:text-white"
                  }`}
                >
                  Digital
                </button>

                <button
                  onClick={() => {
                    setMode("physical");
                    setResults([]);
                    setSearchError("");
                  }}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
                    mode === "physical"
                      ? "bg-white text-black shadow-lg"
                      : "text-white/35 hover:text-white"
                  }`}
                >
                  Physical
                  <span className="ml-1.5 text-[9px] font-black tracking-wider opacity-50">
                    SOON
                  </span>
                </button>
              </div>
            </div>

            {/* HERO TRUST ROW */}
            <div className="mx-auto mt-20 grid max-w-3xl grid-cols-3 border-y border-white/[0.06] py-7">
              <div className="text-center">
                <div className="text-lg font-black">
                  Natural
                </div>
                <div className="mt-1 text-[11px] text-white/25">
                  language search
                </div>
              </div>

              <div className="border-x border-white/[0.06] text-center">
                <div className="text-lg font-black">
                  Real
                </div>
                <div className="mt-1 text-[11px] text-white/25">
                  products
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-black">
                  Smart
                </div>
                <div className="mt-1 text-[11px] text-white/25">
                  matching
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PHYSICAL */}
        {mode === "physical" && (
          <section className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
            <div className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#101012] p-8 shadow-2xl sm:p-14">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/20 blur-[90px]" />

              <div className="relative">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] text-xl text-violet-300">
                  ◈
                </div>

                <p className="text-xs font-black uppercase tracking-[.2em] text-white/25">
                  Coming soon
                </p>

                <h2 className="mt-3 max-w-xl text-4xl font-black tracking-tight sm:text-5xl">
                  The same intelligence.
                  <br />
                  <span className="text-white/30">
                    For physical products.
                  </span>
                </h2>

                <p className="mt-5 max-w-xl leading-7 text-white/40">
                  FindIt will eventually compare products
                  across retailers using your needs, budget
                  and preferences.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* CATEGORIES */}
        {mode === "digital" && (
          <section
            id="categories"
            className="mx-auto max-w-7xl px-5 py-24 sm:px-8"
          >
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[.2em] text-white/25">
                  Explore categories
                </p>

                <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                  Start with a category.
                </h2>
              </div>

              <p className="max-w-sm text-sm leading-6 text-white/35">
                Or skip the categories entirely and just
                describe what you need above.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {categories.map((category) => (
                <button
                  key={category.name}
                  onClick={() =>
                    handleCategoryClick(category.name)
                  }
                  className={`group relative min-h-[155px] overflow-hidden rounded-[24px] border p-5 text-left transition-all duration-300 hover:-translate-y-1 ${
                    activeCategory === category.name
                      ? "border-violet-400/40 bg-violet-500/10"
                      : "border-white/[0.07] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.045]"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition duration-300 group-hover:rotate-6 ${
                      activeCategory === category.name
                        ? "bg-violet-500/20 text-violet-300"
                        : "bg-white/[0.05] text-white/60"
                    }`}
                  >
                    {category.icon}
                  </div>

                  <div className="mt-7 text-sm font-bold">
                    {category.name}
                  </div>

                  <div className="mt-1 text-xs leading-5 text-white/30">
                    {category.description}
                  </div>

                  <span className="absolute bottom-5 right-5 text-white/15 transition group-hover:translate-x-1 group-hover:text-white/60">
                    →
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* RESULTS */}
        {mode === "digital" && hasSearchState && (
          <section
            id="products"
            className="scroll-mt-16 border-y border-white/[0.06] bg-[#0b0b0d]"
          >
            <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.2em] text-white/25">
                    FindIt results
                  </p>

                  <h2 className="mt-3 text-4xl font-black tracking-[-0.05em]">
                    {isSearching
                      ? "Finding your matches..."
                      : results.length > 0
                        ? "Here’s what fits."
                        : "Let's refine that."}
                  </h2>

                  {!isSearching &&
                    !searchError &&
                    results.length > 0 && (
                      <p className="mt-2 text-sm text-white/30">
                        Based on your request, ranked by fit.
                      </p>
                    )}
                </div>

                {!isSearching &&
                  !searchError &&
                  results.length > 0 && (
                    <span className="w-fit rounded-full border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-xs font-bold text-white/40">
                      {results.length}{" "}
                      {results.length === 1
                        ? "match"
                        : "matches"}
                    </span>
                  )}
              </div>

              {/* LOADING */}
              {isSearching && (
                <div className="mt-12 grid gap-5 md:grid-cols-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse overflow-hidden rounded-[28px] border border-white/[0.06] bg-white/[0.02]"
                    >
                      <div className="h-40 bg-white/[0.035]" />

                      <div className="p-6">
                        <div className="h-3 w-20 rounded bg-white/[0.06]" />
                        <div className="mt-5 h-6 w-4/5 rounded bg-white/[0.06]" />
                        <div className="mt-3 h-4 w-1/3 rounded bg-white/[0.05]" />

                        <div className="mt-7 space-y-2">
                          <div className="h-3 rounded bg-white/[0.04]" />
                          <div className="h-3 w-5/6 rounded bg-white/[0.04]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ERROR */}
              {searchError && !isSearching && (
                <div className="mt-10 rounded-[28px] border border-red-400/15 bg-red-500/[0.07] p-7">
                  <div className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-400/10 text-red-300">
                      !
                    </div>

                    <div>
                      <div className="font-bold text-red-200">
                        We couldn't complete that search.
                      </div>

                      <div className="mt-1 text-sm leading-6 text-red-200/50">
                        {searchError}
                      </div>

                      <button
                        onClick={() => handleSearch()}
                        className="mt-4 rounded-full border border-red-300/15 bg-red-300/10 px-4 py-2 text-xs font-bold text-red-200 transition hover:bg-red-300/15"
                      >
                        Try again
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* EMPTY */}
              {!isSearching &&
                !searchError &&
                results.length === 0 &&
                query.trim() && (
                  <div className="mt-10 rounded-[32px] border border-white/[0.06] bg-white/[0.025] p-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] text-2xl text-white/25">
                      ⌁
                    </div>

                    <h3 className="mt-5 text-xl font-black">
                      No close matches yet.
                    </h3>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/30">
                      Try adding something specific like your
                      skill level, topic, format or budget.
                    </p>

                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      {[
                        "under ₦10,000",
                        "for beginners",
                        "video course",
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() =>
                            setQuery(
                              `${query} ${suggestion}`
                            )
                          }
                          className="rounded-full border border-white/[0.07] px-3 py-2 text-xs text-white/35 transition hover:border-white/15 hover:text-white/70"
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              {/* PRODUCT GRID */}
              {results.length > 0 && (
                <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {results.map((product, index) => (
                    <article
                      key={product.product_id}
                      className="group flex flex-col overflow-hidden rounded-[30px] border border-white/[0.07] bg-[#111113] transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-[#151517] hover:shadow-[0_25px_80px_-25px_rgba(0,0,0,.8)]"
                      style={{
                        animation: `fadeUp .5s ${
                          index * 0.07
                        }s ease-out both`,
                      }}
                    >
                      {/* VISUAL */}
                      <div className="relative h-44 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-fuchsia-600 to-orange-500 transition duration-500 group-hover:scale-105" />

                        <div className="absolute inset-0 bg-black/10" />

                        <div className="absolute -right-10 -top-16 h-44 w-44 rounded-full bg-white/15 blur-2xl" />

                        <div className="relative flex h-full flex-col justify-between p-6">
                          <div className="flex items-center justify-between">
                            <span className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white/80 backdrop-blur">
                              {product.product_type}
                            </span>

                            {product.rating !== null && (
                              <span className="rounded-full bg-black/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                                ★ {product.rating}
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-[.2em] text-white/55">
                              {product.category}
                            </div>

                            <div className="mt-1 line-clamp-2 max-w-[90%] text-xl font-black leading-tight">
                              {product.title}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div className="flex flex-1 flex-col p-6">
                        <div className="text-sm font-semibold text-white/35">
                          by {product.creator}
                        </div>

                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/40">
                          {product.description}
                        </p>

                        <div className="mt-6 border-t border-white/[0.05] pt-5">
                          <div className="text-2xl font-black tracking-tight">
                            {product.currency ===
                            "USD"
                              ? formatUSD(
                                  product.price *
                                    NGN_PER_USD
                                )
                              : formatNaira(
                                  product.price
                                )}
                          </div>

                          <div className="mt-1 text-xs font-medium text-white/25">
                            {product.currency ===
                            "USD"
                              ? `≈ ${formatNaira(
                                  product.price *
                                    NGN_PER_USD
                                )}`
                              : `≈ ${formatUSD(
                                  product.price
                                )} USD`}
                          </div>
                        </div>

                        {product.reasons.length > 0 && (
                          <div className="mt-5 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4">
                            <div className="text-[10px] font-black uppercase tracking-[.15em] text-white/25">
                              Why it fits
                            </div>

                            <div className="mt-2 space-y-1.5">
                              {product.reasons
                                .slice(0, 2)
                                .map(
                                  (
                                    reason,
                                    reasonIndex
                                  ) => (
                                    <div
                                      key={`${product.product_id}-${reasonIndex}`}
                                      className="text-xs font-medium text-white/50"
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
                          href={
                            product.affiliate_url ||
                            product.product_url
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 flex items-center justify-between rounded-2xl bg-white px-5 py-4 text-sm font-bold text-black transition hover:bg-white/90"
                        >
                          View product

                          <span className="transition group-hover:translate-x-1">
                            →
                          </span>
                        </a>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* HOW IT WORKS */}
        <section
          id="how-it-works"
          className="relative overflow-hidden border-t border-white/[0.06] bg-black"
        >
          <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[.2em] text-white/25">
                The FindIt engine
              </p>

              <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] sm:text-6xl">
                You describe it.
                <br />
                <span className="text-white/30">
                  FindIt figures it out.
                </span>
              </h2>

              <p className="mt-6 max-w-xl leading-7 text-white/35">
                No complicated filters. No endless scrolling.
                Just explain what you want and let the matching
                system do the work.
              </p>
            </div>

            <div className="mt-20 grid overflow-hidden rounded-[32px] border border-white/[0.08] md:grid-cols-3">
              {[
                {
                  number: "01",
                  title: "Describe",
                  text: "Tell us your goal, budget, experience level and anything else that matters.",
                },
                {
                  number: "02",
                  title: "Understand",
                  text: "FindIt turns your natural-language request into structured requirements.",
                },
                {
                  number: "03",
                  title: "Match",
                  text: "Products are filtered and ranked according to what you actually asked for.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="border-b border-white/[0.08] bg-[#080809] p-8 transition hover:bg-white/[0.025] last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0 sm:p-10"
                >
                  <div className="text-xs font-black text-white/15">
                    {step.number}
                  </div>

                  <div className="mt-14 text-xl font-bold">
                    {step.title}
                  </div>

                  <p className="mt-4 text-sm leading-7 text-white/30">
                    {step.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative overflow-hidden border-t border-white/[0.06]">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-950/25 via-[#070708] to-orange-950/15" />

          <div className="relative mx-auto max-w-5xl px-5 py-28 text-center sm:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-lg font-black text-black">
              F
            </div>

            <h2 className="mt-7 text-5xl font-black tracking-[-0.06em] sm:text-7xl">
              Know what you need?
              <br />

              <span className="bg-gradient-to-r from-violet-400 to-orange-300 bg-clip-text text-transparent">
                Find it.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-white/35">
              One search. Real requirements. Products that
              actually fit.
            </p>

            <button
              onClick={scrollToSearch}
              className="mt-9 rounded-full bg-white px-7 py-4 text-sm font-bold text-black shadow-xl transition duration-300 hover:-translate-y-1 hover:bg-white/90"
            >
              Start searching →
            </button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] bg-[#070708]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-xs font-medium text-white/25 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[10px] font-black text-black">
              F
            </div>

            <span>FindIt</span>
          </div>

          <span>
            Discover less. Find better. © 2026 FindIt
          </span>
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
      `}</style>
    </div>
  );
}

export default App;