const Dashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <h3 className="text-2xl font-bold text-gray-700">بەخێربێی بۆ داشبۆردەکەت 👋</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
          <p className="text-lg font-medium">ئەمە ناوەرۆکی یەکەمە</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
          <p className="text-lg font-medium">ئەمە ناوەرۆکی دووەمە</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
