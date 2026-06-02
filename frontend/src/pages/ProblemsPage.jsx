import { Link } from "react-router";
import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";

import { useProblems } from "../hooks/useProblems";
import { BookmarkIcon, ChevronRightIcon, Code2Icon, FilterIcon, SearchIcon, Loader2Icon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

function ProblemsPage() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [onlyBookmarked, setOnlyBookmarked] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  const { data: problemsData, isLoading } = useProblems();
  const problems = useMemo(() => problemsData || [], [problemsData]);

  useEffect(() => {
    const saved = localStorage.getItem("coderelay_bookmarked_problems");
    if (saved) {
      try {
        setBookmarkedIds(JSON.parse(saved));
      } catch {
        setBookmarkedIds([]);
      }
    }
  }, []);

  const toggleBookmark = (id) => {
    setBookmarkedIds((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem("coderelay_bookmarked_problems", JSON.stringify(next));
      return next;
    });
  };

  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      if (onlyBookmarked && !bookmarkedIds.includes(p.id)) return false;
      if (difficulty !== "All" && p.difficulty !== difficulty) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.text.toLowerCase().includes(q)
      );
    });
  }, [problems, bookmarkedIds, onlyBookmarked, difficulty, search]);

  const easyProblemsCount = problems.filter((p) => p.difficulty === "Easy").length;
  const mediumProblemsCount = problems.filter((p) => p.difficulty === "Medium").length;
  const hardProblemsCount = problems.filter((p) => p.difficulty === "Hard").length;

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* HEADER + CONTROLS */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2Icon className="size-10 animate-spin text-primary" />
          </div>
        ) : (
          <>


            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">Problem Explorer</h1>
                <p className="text-base-content/70 max-w-xl">
                  Search, filter, and bookmark problems to build your personal DSA playlist.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="flex-1 flex items-center gap-2 bg-base-100 rounded-xl px-3 py-2 border border-base-300">
                  <SearchIcon className="size-4 text-base-content/60" />
                  <input
                    type="text"
                    placeholder="Search by title, topic, or description..."
                    className="input input-ghost input-sm flex-1 px-1"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-base-100 border border-base-300 rounded-xl px-3 py-1.5">
                    <FilterIcon className="size-4 text-base-content/60" />
                    <select
                      className="select select-ghost select-xs"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    className={`btn btn-sm ${onlyBookmarked ? "btn-primary" : "btn-ghost border border-base-300"
                      }`}
                    onClick={() => setOnlyBookmarked((v) => !v)}
                  >
                    <BookmarkIcon className="size-4" />
                    <span className="hidden sm:inline">
                      {onlyBookmarked ? "Bookmarked only" : "All problems"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* PROBLEMS LIST */}
            <div className="space-y-4">
              {filteredProblems.map((problem) => {
                const isBookmarked = bookmarkedIds.includes(problem.id);
                return (
                  <Link
                    key={problem.id}
                    to={`/problem/${problem.id}`}
                    className="card bg-base-100 hover:scale-[1.01] transition-transform border border-base-300 hover:border-primary/50"
                  >
                    <div className="card-body">
                      <div className="flex items-center justify-between gap-4">
                        {/* LEFT SIDE */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Code2Icon className="size-6 text-primary" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-xl font-bold">{problem.title}</h2>
                                <span
                                  className={`badge ${getDifficultyBadgeClass(problem.difficulty)}`}
                                >
                                  {problem.difficulty}
                                </span>
                              </div>
                              <p className="text-sm text-base-content/60">{problem.category}</p>
                            </div>
                          </div>
                          <p className="text-base-content/80 mb-3 line-clamp-2">
                            {problem.description.text}
                          </p>
                        </div>
                        {/* RIGHT SIDE */}

                        <div className="flex flex-col items-end gap-3">
                          <button
                            type="button"
                            className={`btn btn-xs ${isBookmarked ? "btn-warning" : "btn-ghost border border-base-300"
                              }`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleBookmark(problem.id);
                            }}
                          >
                            <BookmarkIcon
                              className={`size-4 ${isBookmarked ? "fill-current" : ""}`}
                            />
                            <span className="hidden sm:inline">
                              {isBookmarked ? "Saved" : "Save"}
                            </span>
                          </button>
                          <div className="flex items-center gap-2 text-primary">
                            <span className="font-medium text-sm">Solve</span>
                            <ChevronRightIcon className="size-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {filteredProblems.length === 0 && (
                <div className="card bg-base-100 shadow-inner">
                  <div className="card-body text-center">
                    <p className="font-semibold mb-1">No problems match your filters.</p>
                    <p className="text-sm text-base-content/60">
                      Try clearing the search or difficulty filter.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* STATS FOOTER */}
            <div className="mt-12 card bg-base-100 shadow-lg">
              <div className="card-body">
                <div className="stats stats-vertical lg:stats-horizontal">
                  <div className="stat">
                    <div className="stat-title">Total Problems</div>
                    <div className="stat-value text-primary">{problems.length}</div>
                  </div>

                  <div className="stat">
                    <div className="stat-title">Easy</div>
                    <div className="stat-value text-success">{easyProblemsCount}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Medium</div>
                    <div className="stat-value text-warning">{mediumProblemsCount}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Hard</div>
                    <div className="stat-value text-error">{hardProblemsCount}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Bookmarked</div>
                    <div className="stat-value text-accent">{bookmarkedIds.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default ProblemsPage;
