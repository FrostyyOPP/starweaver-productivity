'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Target, Calendar, Filter, BarChart, LineChart, PieChart } from 'lucide-react';

interface TeamReportsProps {
  teamId?: string;
}

interface AnalyticsData {
  period: string;
  memberId: string;
  teamStats: {
    totalMembers: number;
    totalVideos: number;
    totalCourseVideos: number;
    totalMarketingVideos: number;
    averageProductivity: number;
    weeklyProgress: number;
    monthlyProgress: number;
  };
  memberStats?: {
    name: string;
    courseVideos: number;
    marketingVideos: number;
    totalVideos: number;
    productivityScore: number;
  };
  chartData?: Array<{
    date: string;
    value: number;
  }>;
  productivityData?: Array<{
    date: string;
    productivity: number;
    videos: number;
  }>;
}

export default function TeamReports({ teamId }: TeamReportsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMember, setSelectedMember] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'last-week', label: 'Last Week' },
    { value: 'last-3-weeks', label: 'Last 3 Weeks' },
    { value: 'month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'last-3-months', label: 'Last 3 Months' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'last-12-months', label: 'Last 12 Months' }
  ];

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod, selectedMember]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No access token found');
        return;
      }

      const response = await fetch(
        `/api/teams/analytics?period=${selectedPeriod}&memberId=${selectedMember}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        const errorText = await response.text();
        setError(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      setError(`Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="loading-spinner w-8 h-8 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          <BarChart3 className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Analytics</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchAnalyticsData}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <BarChart3 className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600">Analytics data will appear here once available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reports & Insights</h2>
          <p className="text-gray-600">Track team performance and productivity metrics</p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="form-select"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="form-select"
            >
              <option value="all">All Members</option>
              <option value="individual">Individual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="stat-icon">
            <Users className="w-6 h-6" />
          </div>
          <div className="stat-value">{analyticsData.teamStats?.totalMembers || 0}</div>
          <div className="stat-label">Team Members</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Target className="w-6 h-6" />
          </div>
          <div className="stat-value">{analyticsData.teamStats?.totalVideos || 0}</div>
          <div className="stat-label">Total Videos</div>
          <div className="stat-breakdown">
            <span className="breakdown-item">
              {analyticsData.teamStats?.totalCourseVideos || 0} Course
            </span>
            <span className="breakdown-item">
              {analyticsData.teamStats?.totalMarketingVideos || 0} Marketing
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="stat-value">{(analyticsData.teamStats?.averageProductivity || 0).toFixed(1)}%</div>
          <div className="stat-label">Team Productivity</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="stat-value">{(analyticsData.teamStats?.weeklyProgress || 0).toFixed(1)}%</div>
          <div className="stat-label">Weekly Progress</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Team Productivity Overview</h3>
            <p className="text-gray-600">Performance metrics for {selectedPeriod}</p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Course Videos</span>
                <span className="text-lg font-semibold text-blue-600">
                  {analyticsData.teamStats?.totalCourseVideos || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                                         <div 
                           className="bg-blue-600 h-2 rounded-full" 
                           style={{ 
                             width: `${Math.min((analyticsData.teamStats?.totalCourseVideos || 0) / Math.max(analyticsData.teamStats?.totalCourseVideos || 1, 1) * 100, 100)}%` 
                           }}
                         ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Marketing Videos</span>
                <span className="text-lg font-semibold text-purple-600">
                  {analyticsData.teamStats?.totalMarketingVideos || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                                         <div 
                           className="bg-purple-600 h-2 rounded-full" 
                           style={{ 
                             width: `${Math.min((analyticsData.teamStats?.totalMarketingVideos || 0) / Math.max(analyticsData.teamStats?.totalMarketingVideos || 1, 1) * 100, 100)}%` 
                           }}
                         ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Videos (Converted)</span>
                <span className="text-lg font-semibold text-green-600">
                  {analyticsData.teamStats?.totalVideos || 0}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                                         <div 
                           className="bg-green-600 h-2 rounded-full" 
                           style={{ 
                             width: `${Math.min((analyticsData.teamStats?.totalVideos || 0) / Math.max(analyticsData.teamStats?.totalVideos || 1, 1) * 100, 100)}%` 
                           }}
                         ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Progress Tracking</h3>
            <p className="text-gray-600">Weekly and monthly achievements</p>
          </div>
          <div className="card-content">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Weekly Progress</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {(analyticsData.teamStats?.weeklyProgress || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${analyticsData.teamStats?.weeklyProgress || 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Monthly Progress</span>
                  <span className="text-lg font-semibold text-green-600">
                    {(analyticsData.teamStats?.monthlyProgress || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${analyticsData.teamStats?.monthlyProgress || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

             {/* Insights Summary */}
       <div className="card">
         <div className="card-header">
           <h3 className="card-title">Key Insights</h3>
           <p className="text-gray-600">Analysis for {selectedPeriod}</p>
         </div>
         <div className="card-content">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <h4 className="font-semibold text-gray-900 mb-3">Video Production Analysis</h4>
               <ul className="space-y-2 text-sm text-gray-600">
                 <li>• Course videos: {analyticsData.teamStats?.totalCourseVideos || 0} units</li>
                 <li>• Marketing videos: {analyticsData.teamStats?.totalMarketingVideos || 0} units</li>
                 <li>• Total converted: {analyticsData.teamStats?.totalVideos || 0} course equivalents</li>
                 <li>• Conversion ratio: 1 marketing = 6 course videos</li>
               </ul>
             </div>
             
             <div>
               <h4 className="font-semibold text-gray-900 mb-3">Performance Metrics</h4>
               <ul className="space-y-2 text-sm text-gray-600">
                 <li>• Team productivity: {(analyticsData.teamStats?.averageProductivity || 0).toFixed(1)}%</li>
                 <li>• Weekly progress: {(analyticsData.teamStats?.weeklyProgress || 0).toFixed(1)}%</li>
                 <li>• Monthly progress: {(analyticsData.teamStats?.monthlyProgress || 0).toFixed(1)}%</li>
                 <li>• Active members: {analyticsData.teamStats?.totalMembers || 0}</li>
               </ul>
             </div>
           </div>
         </div>
       </div>

       {/* Graphs Section */}
       <div className="space-y-6">
         <div className="flex items-center justify-between">
           <h2 className="text-xl font-bold text-gray-900">Analytics Charts</h2>
           <p className="text-gray-600">Visual representation of team performance</p>
         </div>

         {/* Video Production Comparison Chart */}
         <div className="card">
           <div className="card-header">
             <h3 className="card-title">Video Production Comparison</h3>
             <p className="text-gray-600">Course vs Marketing Videos Breakdown for {selectedPeriod}</p>
           </div>
           <div className="card-content">
             <div className="h-64 flex items-end justify-center space-x-8 p-6">
               {/* Course Videos Bar */}
               <div className="flex flex-col items-center">
                                          <div 
                           className="w-16 bg-blue-600 rounded-t-lg transition-all duration-500 hover:bg-blue-700 cursor-pointer"
                           style={{ 
                             height: `${Math.min((analyticsData.teamStats?.totalCourseVideos || 0) / Math.max(analyticsData.teamStats?.totalCourseVideos || 1, 1) * 200, 200)}px` 
                           }}
                         ></div>
                 <div className="mt-2 text-center">
                   <div className="text-lg font-bold text-blue-600">
                     {analyticsData.teamStats?.totalCourseVideos || 0}
                   </div>
                   <div className="text-sm text-gray-600">Course Videos</div>
                 </div>
               </div>

               {/* Marketing Videos Bar */}
               <div className="flex flex-col items-center">
                                          <div 
                           className="w-16 bg-purple-600 rounded-t-lg transition-all duration-500 hover:bg-purple-700 cursor-pointer"
                           style={{ 
                             height: `${Math.min((analyticsData.teamStats?.totalMarketingVideos || 0) / Math.max(analyticsData.teamStats?.totalMarketingVideos || 1, 1) * 200, 200)}px` 
                           }}
                         ></div>
                 <div className="mt-2 text-center">
                   <div className="text-lg font-bold text-purple-600">
                     {analyticsData.teamStats?.totalMarketingVideos || 0}
                   </div>
                   <div className="text-sm text-gray-600">Marketing Videos</div>
                 </div>
               </div>

               {/* Total Videos Bar */}
               <div className="flex flex-col items-center">
                                          <div 
                           className="w-16 bg-green-600 rounded-t-lg transition-all duration-500 hover:bg-green-700 cursor-pointer"
                           style={{ 
                             height: `${Math.min((analyticsData.teamStats?.totalVideos || 0) / Math.max(analyticsData.teamStats?.totalVideos || 1, 1) * 200, 200)}px` 
                           }}
                         ></div>
                 <div className="mt-2 text-center">
                   <div className="text-lg font-bold text-green-600">
                     {analyticsData.teamStats?.totalVideos || 0}
                   </div>
                   <div className="text-sm text-gray-600">Total (Converted)</div>
                 </div>
               </div>
             </div>
           </div>
         </div>

         {/* Productivity Trend Chart */}
         <div className="card">
           <div className="card-header">
             <h3 className="card-title">Progress Tracking</h3>
             <p className="text-gray-600">Weekly and monthly achievements for {selectedPeriod}</p>
           </div>
           <div className="card-content">
             <div className="h-64 p-6">
               <div className="flex items-end justify-between h-full space-x-2">
                 {/* Weekly Progress */}
                 <div className="flex flex-col items-center flex-1">
                   <div className="text-sm text-gray-600 mb-2">Weekly</div>
                   <div 
                     className="w-full bg-blue-200 rounded-t transition-all duration-500"
                     style={{ 
                       height: `${Math.min((analyticsData.teamStats?.weeklyProgress || 0) / 100 * 200, 200)}px` 
                     }}
                   ></div>
                   <div className="mt-2 text-center">
                     <div className="text-lg font-bold text-blue-600">
                       {(analyticsData.teamStats?.weeklyProgress || 0).toFixed(1)}%
                     </div>
                   </div>
                 </div>

                 {/* Monthly Progress */}
                 <div className="flex flex-col items-center flex-1">
                   <div className="text-sm text-gray-600 mb-2">Monthly</div>
                   <div 
                     className="w-full bg-green-200 rounded-t transition-all duration-500"
                     style={{ 
                       height: `${Math.min((analyticsData.teamStats?.monthlyProgress || 0) / 100 * 200, 200)}px` 
                     }}
                   ></div>
                   <div className="mt-2 text-center">
                     <div className="text-lg font-bold text-green-600">
                       {(analyticsData.teamStats?.monthlyProgress || 0).toFixed(1)}%
                     </div>
                   </div>
                 </div>

                 {/* Team Productivity */}
                 <div className="flex flex-col items-center flex-1">
                   <div className="text-sm text-gray-600 mb-2">Team Avg</div>
                   <div 
                     className="w-full bg-purple-200 rounded-t transition-all duration-500"
                     style={{ 
                       height: `${Math.min((analyticsData.teamStats?.averageProductivity || 0) / 100 * 200, 200)}px` 
                     }}
                   ></div>
                   <div className="mt-2 text-center">
                     <div className="text-lg font-bold text-purple-600">
                       {(analyticsData.teamStats?.averageProductivity || 0).toFixed(1)}%
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>

         {/* Timeline Performance Chart */}
         <div className="card">
           <div className="card-header">
             <h3 className="card-title">Timeline Performance</h3>
             <p className="text-gray-600">Performance trends over {selectedPeriod}</p>
           </div>
           <div className="card-content">
             <div className="h-64 p-6">
               {analyticsData.chartData && analyticsData.chartData.length > 0 ? (
                 <div className="flex items-end justify-between h-full space-x-2">
                   {analyticsData.chartData?.map((data, index) => (
                     <div key={index} className="flex flex-col items-center flex-1">
                       <div className="text-xs text-gray-600 mb-2 text-center">{data.date}</div>
                       <div 
                         className="w-full bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all duration-500 hover:from-blue-600 hover:to-blue-400 cursor-pointer"
                         style={{ 
                           height: `${Math.min((data.value / Math.max(...(analyticsData.chartData?.map(d => d.value) || [0]))) * 200, 200)}px`,
                           minHeight: '20px'
                         }}
                       ></div>
                       <div className="mt-2 text-center">
                         <div className="text-sm font-semibold text-blue-600">
                           {data.value}
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="flex items-center justify-center h-full">
                   <div className="text-center text-gray-500">
                     <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                     <p>Timeline data will be displayed here</p>
                     <p className="text-sm">Select different periods to view performance trends</p>
                   </div>
                 </div>
               )}
             </div>
           </div>
         </div>

         {/* Team Member Performance Chart */}
         <div className="card">
           <div className="card-header">
             <h3 className="card-title">Team Member Performance</h3>
             <p className="text-gray-600">Individual productivity scores for {selectedPeriod}</p>
           </div>
           <div className="card-content">
             <div className="space-y-4">
               {selectedMember === 'individual' ? (
                 <div className="text-center py-8 text-gray-500">
                   <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                   <p>Individual member data will be displayed here</p>
                   <p className="text-sm">Select specific team members to view detailed analytics</p>
                 </div>
               ) : (
                 <div className="text-center py-8 text-gray-500">
                   <BarChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                   <p>Team overview data displayed above</p>
                   <p className="text-sm">Switch to "Individual" view to see detailed member analytics</p>
                 </div>
               )}
             </div>
           </div>
         </div>

         {/* Chart Legend */}
         <div className="bg-gray-50 rounded-lg p-4">
           <h4 className="font-semibold text-gray-900 mb-3">Chart Legend & Data Summary</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <h5 className="font-medium text-gray-800 mb-2">Color Coding</h5>
               <div className="space-y-2 text-sm">
                 <div className="flex items-center space-x-2">
                   <div className="w-4 h-4 bg-blue-600 rounded"></div>
                   <span className="text-gray-700">Course Videos</span>
                 </div>
                 <div className="flex items-center space-x-2">
                   <div className="w-4 h-4 bg-purple-600 rounded"></div>
                   <span className="text-gray-700">Marketing Videos</span>
                 </div>
                 <div className="flex items-center space-x-4">
                   <div className="w-4 h-4 bg-green-600 rounded"></div>
                   <span className="text-gray-700">Total (Converted)</span>
                 </div>
               </div>
             </div>
             
             <div>
               <h5 className="font-medium text-gray-800 mb-2">Current Period: {selectedPeriod}</h5>
               <div className="space-y-1 text-sm text-gray-600">
                 <div>• Filter: {selectedMember === 'all' ? 'All Members' : 'Individual View'}</div>
                 <div>• Data Source: Real-time from MongoDB</div>
                 <div>• Last Updated: {new Date().toLocaleString()}</div>
               </div>
             </div>
           </div>
         </div>

         {/* Quick Actions */}
         <div className="flex flex-wrap gap-3 justify-center">
           <button
             onClick={() => {
               setSelectedPeriod('week');
               setSelectedMember('all');
             }}
             className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
           >
             Reset to Week View
           </button>
           <button
             onClick={() => setSelectedMember(selectedMember === 'all' ? 'individual' : 'all')}
             className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
           >
             Toggle Member View
           </button>
           <button
             onClick={fetchAnalyticsData}
             className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
           >
             Refresh Data
           </button>
         </div>
       </div>
     </div>
   );
 }
