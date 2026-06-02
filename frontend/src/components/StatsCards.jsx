import { FlameIcon, TrophyIcon, UsersIcon } from "lucide-react";

function StatsCards({ activeSessionsCount, recentSessionsCount, recentSessions = [] }) {
  const today = new Date().toDateString();
  const todayCount = recentSessions.filter(
    (s) => new Date(s.createdAt).toDateString() === today
  ).length;

  const hardestCompleted =
    recentSessions
      .map((s) => s.difficulty)
      .sort((a, b) => {
        const order = { Easy: 0, Medium: 1, Hard: 2 };
        return (order[b] ?? 0) - (order[a] ?? 0);
      })[0] || null;

  return (
    <div className="lg:col-span-1 grid grid-cols-1 gap-6">
      {/* Active Count */}
      <div className="card bg-base-100 border-2 border-primary/20 hover:border-primary/40">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <UsersIcon className="w-7 h-7 text-primary" />
            </div>
            <div className="badge badge-primary">Live</div>
          </div>
          <div className="text-4xl font-black mb-1">{activeSessionsCount}</div>
          <div className="text-sm opacity-60">Active Sessions</div>
        </div>
      </div>

      {/* Recent Count */}
      <div className="card bg-base-100 border-2 border-secondary/20 hover:border-secondary/40">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-secondary/10 rounded-2xl">
              <TrophyIcon className="w-7 h-7 text-secondary" />
            </div>
          </div>
          <div className="text-4xl font-black mb-1">{recentSessionsCount}</div>
          <div className="text-sm opacity-60">Completed Sessions</div>
        </div>
      </div>

      {/* Progress Today */}
      <div className="card bg-base-100 border-2 border-accent/20 hover:border-accent/40">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-accent/10 rounded-2xl">
              <FlameIcon className="w-7 h-7 text-accent" />
            </div>
            {hardestCompleted && (
              <div className="badge badge-outline text-xs">
                Hardest today: <span className="ml-1 font-semibold">{hardestCompleted}</span>
              </div>
            )}
          </div>
          <div className="text-4xl font-black mb-1">{todayCount}</div>
          <div className="text-sm opacity-60">Sessions today</div>
        </div>
      </div>
    </div>
  );
}

export default StatsCards;
