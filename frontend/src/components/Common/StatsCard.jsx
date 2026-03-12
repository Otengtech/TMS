export default function StatsCard({ title, value, icon, color }) {
  return (
    <div className={`p-4 rounded shadow flex items-center space-x-4 ${color}`}>
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}