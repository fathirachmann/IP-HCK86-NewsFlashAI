import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchNews, selectNews } from "../features/news/newsSlice";
import { generate } from "random-words";
import NewsCard from "../components/NewsCard";
import { Link } from "react-router";

export default function HomePage() {
  const dispatch = useDispatch();
  const { items, totalResults, status, q, from, to, page, pageSize } =
    useSelector(selectNews);
  const randomWord = generate();

  const [query, setQuery] = useState(q || randomWord);
  const [dateFrom, setDateFrom] = useState(from || "");
  const [dateTo, setDateTo] = useState(to || "");

  useEffect(() => {
    if (status === "idle") {
      dispatch(
        fetchNews({
          q: query,
          from: dateFrom || undefined,
          to: dateTo || undefined,
          page: 1,
          pageSize: 9,
        })
      );
    }
  }, [dispatch, status]); // one-time

  const onSearch = (e) => {
    e.preventDefault();
    dispatch(
      fetchNews({
        q: query.trim(),
        from: dateFrom || undefined,
        to: dateTo || undefined,
        page: 1,
        pageSize: 9,
      })
    );
  };

  const canPrev = page > 1;
  const canNext = page * 9 < totalResults;

  const onPrev = () => {
    if (!canPrev) return;
    dispatch(
      fetchNews({
        q,
        from: from || undefined,
        to: to || undefined,
        page: page - 1,
        pageSize: pageSize,
      })
    );
  };
  const onNext = () => {
    if (!canNext) return;
    dispatch(
      fetchNews({
        q,
        from: from || undefined,
        to: to || undefined,
        page: page + 1,
        pageSize: pageSize,
      })
    );
  };

  const showingRange = useMemo(() => {
    const start = totalResults === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalResults);
    return `${start}-${end}`;
  }, [page, pageSize, totalResults]);

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Background image */}
        <div className="absolute inset-0 bg-[url('https://wallpapers.com/images/featured/old-newspaper-background-xayuetybyd5mf1st.jpg')] bg-cover bg-center opacity-40" />

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(60% 60% at 100% 0%, rgba(88,160,200,0.18) 0%, rgba(88,160,200,0) 60%)," +
              "radial-gradient(55% 55% at 0% 100%, rgba(253,245,170,0.25) 0%, rgba(253,245,170,0) 60%)," +
              "linear-gradient(135deg, rgba(11,29,46,0.7) 0%, rgba(17,63,103,0.5) 42%, rgba(88,160,200,0.35) 100%)",
          }}
        />

        {/* Dark veil */}
        <div className="absolute inset-0 bg-[#FFFFFF]/25" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end">
          <form
            onSubmit={onSearch}
            className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3"
          >
            <div className="md:col-span-2">
              <label className="block text-xs text-[#FFFFFF]/80 mb-1">
                Query
              </label>
              <input
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="Search topic…"
                className="w-full rounded-lg px-3 py-2 bg-[#FDF5AA] outline-none ring-1 ring-[#34699A]/30 focus:ring-2 focus:ring-[#58A0C8]/60"
              />
            </div>

            <div>
              <label className="block text-xs text-[#FFFFFF]/80 mb-1">
                From (YYYY-MM-DD)
              </label>
              <input
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                type="date"
                className="w-full rounded-lg px-3 py-2 bg-white outline-none ring-1 ring-[#34699A]/30 focus:ring-2 focus:ring-[#58A0C8]/60"
              />
            </div>

            <div>
              <label className="block text-xs text-[#FFFFFF]/80 mb-1">
                To (YYYY-MM-DD)
              </label>
              <input
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                type="date"
                className="w-full rounded-lg px-3 py-2 bg-white outline-none ring-1 ring-[#34699A]/30 focus:ring-2 focus:ring-[#58A0C8]/60"
              />
            </div>

            <div className="md:col-span-4 flex items-center gap-3">
              <button
                type="submit"
                className="ml-auto rounded-full px-4 py-2 bg-[#113F67] text-white text-sm hover:opacity-90"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {status === "loading" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl bg-white p-4 shadow animate-pulse"
              >
                <div className="h-40 w-full rounded-lg bg-[#FDF5AA]" />
                <div className="h-4 mt-3 bg-[#FDF5AA] rounded w-3/4" />
                <div className="h-4 mt-2 bg-[#FDF5AA] rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {status === "failed" && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 d-flex itms-center justify-center">
            <h1> NO ARTICLE FOUND </h1>
          </div>
        )}

        {status === "succeeded" && (
          <>
            <div className="mb-3 text-sm text-[#113F67]/80">
              Showing{" "}
              <span className="font-semibold text-[#113F67]">
                {showingRange}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#113F67]">
                {totalResults}
              </span>{" "}
              results
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((a, idx) => (
                <div key={idx}>
                  <Link
                    to={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block group"
                    title={a.title}
                  >
                    <NewsCard article={a} key={idx} />
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={onPrev}
                disabled={!canPrev}
                className={`rounded-full px-4 py-2 text-sm ${
                  canPrev
                    ? "bg-[#58A0C8] text-white hover:opacity-90"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Prev
              </button>
              <div className="text-sm text-[#113F67]">
                Page <span className="font-semibold">{page}</span>
              </div>
              <button
                onClick={onNext}
                disabled={!canNext}
                className={`rounded-full px-4 py-2 text-sm ${
                  canNext
                    ? "bg-[#58A0C8] text-white hover:opacity-90"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
