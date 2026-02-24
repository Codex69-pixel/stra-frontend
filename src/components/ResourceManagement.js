export default function ResourceManagement() {
  // No resource fetch; default view is users
  const resources = [];
  const loading = false;

  if (loading) return <div className="p-8">Loading resources...</div>;
  // Error display removed: errors are only logged to console

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Resource Management</h1>
      <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Resource Name</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(resources) && resources.length > 0 ? resources.map((res, idx) => (
            <tr key={res.name + idx} className="border-t">
              <td className="px-4 py-2">{res.name}</td>
              <td className="px-4 py-2">{res.type || (res.role ? 'Staff' : 'Equipment/Bed')}</td>
              <td className="px-4 py-2">{res.status || res.available || res.operational || '-'}</td>
              <td className="px-4 py-2 flex flex-wrap gap-2">
                <button className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Allocate resource ' + res.name)}>Allocate</button>
                <button className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Release resource ' + res.name)}>Release</button>
                <button className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('Predictive load for ' + res.name)}>Predictive Load</button>
                <button className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold" onClick={() => alert('View availability for ' + res.name)}>View Availability</button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={4} className="px-4 py-2 text-center text-gray-500">No resources available.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
