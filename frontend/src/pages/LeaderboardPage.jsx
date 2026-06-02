
import { useLeaderboard } from "../hooks/useUsers";
import Navbar from "../components/Navbar";
import { Loader, Trophy, Medal } from "lucide-react";

function LeaderboardPage() {
    const { data: users, isLoading } = useLeaderboard();

    const getRankIcon = (index) => {
        if (index === 0) return <Trophy className="size-6 text-yellow-500" />;
        if (index === 1) return <Medal className="size-6 text-gray-400" />;
        if (index === 2) return <Medal className="size-6 text-amber-600" />;
        return <span className="font-bold text-base-content/50">#{index + 1}</span>;
    };

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Community Leaderboard
                    </h1>
                    <p className="text-base-content/60">Top performers based on completed sessions</p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader className="size-10 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="card bg-base-100 shadow-xl overflow-hidden border border-base-300">
                        <div className="overflow-x-auto">
                            <table className="table table-lg">
                                <thead>
                                    <tr className="bg-base-200/50">
                                        <th className="w-24 text-center">Rank</th>
                                        <th>User</th>
                                        <th className="text-right">Sessions Completed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users?.map((user, index) => (
                                        <tr key={user._id} className="hover:bg-base-200/50 transition-colors">
                                            <td className="text-center">
                                                <div className="flex justify-center">
                                                    {getRankIcon(index)}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar">
                                                        <div className="mask mask-squircle w-12 h-12">
                                                            <img src={user.profileImage} alt={user.name} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold">{user.name}</div>
                                                        <div className="text-xs opacity-50">CodeRelay Member</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-right font-mono font-bold text-lg">
                                                {user.completedSessions}
                                            </td>
                                        </tr>
                                    ))}

                                    {users?.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-center py-10 opacity-50">
                                                No data available yet. Start coding!
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default LeaderboardPage;
