import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

function SalesChart({ data }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* Revenue Trend Chart */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Revenue Trend (₹)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#000000" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Order Volume Chart */}
      <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Order Volume</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
              <Tooltip 
                cursor={{fill: '#f9fafb'}}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="orders" fill="#000000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default SalesChart;