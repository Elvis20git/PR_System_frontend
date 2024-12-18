import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Label, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Sidebar from '../../../src/components/layout/Sidebar';
import Navbar from '../../../src/components/layout/Navbar';
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from "@coreui/react";

interface StatCardProps {
  title: string;
  value: number;
  percentage?: number;
  isPositive?: boolean;
}

interface ActivityItem {
  title: string;
  department: string;
  id: number;
  time: string;
}

interface Category {
  name: string;
  purchase_type: string;
  count: number;
}

interface DashboardData {
  total_requests: number;
  pending_approval: number;
  approved_this_month: number;
  rejected_this_month: number;
  monthly_trends: any[];
  department_distribution: any[];
  recent_activity: ActivityItem[];
  top_categories: Category[];
}

type DepartmentName = 'IT & Business Support' | 'Finance' | 'Quality Assurance' | 'Marketing' | 'Operations';

const DEPARTMENT_COLORS: Record<DepartmentName, string> = {
  'IT & Business Support': '#3B82F6',
  'Finance': '#10B981',
  'Quality Assurance': '#F59E0B',
  'Marketing': '#EF4444',
  'Operations': '#8B5CF6'
};

const StatCard = ({ title, value, percentage, isPositive }: StatCardProps) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <h3 className="text-gray-500 text-sm">{title}</h3>
    <div className="flex items-center mt-2">
      <span className="text-3xl font-semibold">{value}</span>
      {percentage && (
        <span className={`ml-2 flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
          {percentage}%
        </span>
      )}
    </div>
  </div>
);

const RecentActivity = ({ activity }: { activity?: ActivityItem[] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredActivity = activity?.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-[250px] flex flex-col">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <div className="relative w-[200px]">
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-8 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>
      <div className="overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <div className="space-y-4">
          {filteredActivity?.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{item.title}</h4>
                <p className="text-sm text-gray-500">{item.department} • PR#{item.id}</p>
              </div>
              <span className="text-sm text-gray-500">{item.time}</span>
            </div>
          ))}
          {filteredActivity?.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-2">
              No matching activities found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TopCategories = ({ categories }: { categories?: Category[] }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm h-[250px] flex flex-col overflow-y-auto">
    <div className="flex justify-between items-center mb-4 flex-shrink-0">
      <h3 className="text-lg font-semibold">Top Request Categories</h3>
      <a href="/purchase-request-list" className="text-blue-600 text-sm">View All</a>
    </div>
    <div className="overflow-y-auto flex-grow scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
      <div className="space-y-4">
        {categories?.map((category, index) => (
          <div key={index} className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">{category.name}</h4>
              <div className="flex items-center mt-1">
                <p className="text-sm text-gray-500">{category.purchase_type} • ~</p>
                <span className="text-sm text-gray-500">{category.count} requests</span>
                <span className="mx-2 text-gray-300">•</span>
                {/*<span className="text-sm text-gray-500">${category.amount}</span>*/}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Add this helper function to format the date properly
// const formatDate = (date) => {
//   if (!date) return '';
//   const d = new Date(date);
//   return d.toLocaleString('default', { month: 'short' });
// };

const formatDate = (date: string | number, period: string) => {
  if (!date) return '';
  const d = new Date(date);

  switch (period) {
    case 'Weekly':
      return d.toLocaleString('default', { weekday: 'short' }); // Shows 'Mon', 'Tue', etc.
    case 'Monthly':
      return d.toLocaleString('default', { month: 'short' }); // Shows 'Jan', 'Feb', etc.
    case 'Yearly':
      return d.getFullYear().toString(); // Shows '2024', '2025', etc.
    default:
      return d.toLocaleString('default', { month: 'short' });
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  // const [dashboardData, setDashboardData] = useState(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');

  const renderCustomizedLabel = (props: { 
    cx: number; 
    cy: number; 
    midAngle: number; 
    innerRadius: number; 
    outerRadius: number; 
    percent: number; 
    value: number; 
    name: string; 
  }) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, value, name } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    // const fill = DEPARTMENT_COLORS[name] || '#666';
    const fill = DEPARTMENT_COLORS[name as DepartmentName] || '#666';

    return (
      <text
        x={x}
        y={y}
        fill={fill}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`http://192.168.222.43:8080/api/dashboard/metrics/?period=${selectedPeriod}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            handleLogout();
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setDashboardData(data);
        setError(null);
      } catch (error:any) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
        if (error.message.includes('authentication')) {
          handleLogout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token, selectedPeriod]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-600">
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 bg-gray-50">
        <Navbar username={user.username} />
        <main className="p-6 h-[calc(100vh-64px)] overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Purchase Request Dashboard</h1>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              Export Report
            </button>
          </div>
          <div className="lg:col-span-2 bg-gray-100 p-6 rounded-lg shadow-sm h-[calc(90vh-64px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard
                title="Total Requests"
                value={dashboardData?.total_requests ?? 0}
                isPositive={true}
              />
              <StatCard
                title="Pending Approval"
                value={dashboardData?.pending_approval ?? 0}
                isPositive={false}
              />
              <StatCard
                title="Approved This Month"
                value={dashboardData?.approved_this_month ?? 0}
                isPositive={true}
              />
              <StatCard
                title="Rejected This Month"
                value={dashboardData?.rejected_this_month ?? 0}
                isPositive={false}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Request Trends</h3>
                <div className="flex gap-2 mb-4">
                  {['Weekly', 'Monthly', 'Yearly'].map((period) => (
                      <button
                          key={period}
                          onClick={() => setSelectedPeriod(period)}
                          className={`px-4 py-1.5 rounded-md transition-colors ${
                              selectedPeriod === period
                                  ? 'bg-gray-100 text-gray-900 font-medium'
                                  : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {period}
                      </button>
                  ))}
                </div>

                <ResponsiveContainer width="90%" height={250}>
                  <LineChart
                    data={dashboardData?.monthly_trends}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#f0f0f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      tickFormatter={(date) => formatDate(date, selectedPeriod)}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#666', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#666', fontSize: 12 }}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #f0f0f0',
                        borderRadius: '4px',
                        padding: '8px'
                      }}
                      labelFormatter={(date) => formatDate(date, selectedPeriod)}
                    />
                    <Line
                      type="monotone"
                      dataKey="approved"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pending"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rejected"
                      stroke="#EF4444"
                      strokeWidth={2}
                      dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      wrapperStyle={{
                        paddingBottom: '20px'
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>


              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Requests by Department</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                        data={dashboardData?.department_distribution}
                        dataKey="count"
                        nameKey="department"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={renderCustomizedLabel}
                        labelLine={true}
                    >
                      {dashboardData?.department_distribution?.map((entry, index) => (
                          <Cell
                              key={`cell-${index}`}
                              // fill={DEPARTMENT_COLORS[entry.department] || '#666'}
                              fill={DEPARTMENT_COLORS[entry.department as DepartmentName] || '#666'}
                          />
                      ))}
                    </Pie>
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ paddingTop: '20px' }}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <RecentActivity activity={dashboardData?.recent_activity} />
              <TopCategories categories={dashboardData?.top_categories} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;