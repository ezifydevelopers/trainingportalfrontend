import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Users, 
  BookOpen, 
  TrendingUp,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  Target,
  Award,
  Loader2
} from 'lucide-react';
import { useTimeTrackingStats, useAllTrainees, useAllCompanies } from '@/hooks/useApi';
import { toast } from 'sonner';

export default function TimeTrackingDashboard() {
  const [filters, setFilters] = useState({
    traineeId: 'all',
    companyId: 'all',
    startDate: '',
    endDate: ''
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const { data: timeStats, isLoading, error, refetch, isFetching } = useTimeTrackingStats({
    traineeId: filters.traineeId && filters.traineeId !== 'all' ? parseInt(filters.traineeId) : undefined,
    companyId: filters.companyId && filters.companyId !== 'all' ? parseInt(filters.companyId) : undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined
  });

  const { data: trainees = [], isLoading: traineesLoading } = useAllTrainees();
  const { data: companiesData, isLoading: companiesLoading } = useAllCompanies();
  const companies = companiesData?.companies || [];

  // Update last updated time when data changes
  useEffect(() => {
    if (timeStats) {
      setLastUpdated(new Date());
    }
  }, [timeStats]);

  // Show notification when data is automatically refreshed
  useEffect(() => {
    if (timeStats && !isLoading) {
      // Only show notification if this is an automatic refresh (not initial load)
      const now = new Date();
      const timeDiff = now.getTime() - lastUpdated.getTime();
      if (timeDiff > 5000) { // Only if more than 5 seconds have passed
        toast.success('Data updated automatically', { duration: 2000 });
      }
    }
  }, [timeStats, isLoading, lastUpdated]);

  const handleFilterChange = (key: string, value: string) => {
    // Convert "all" to empty string for API calls
    const filterValue = value === "all" ? "" : value;
    setFilters(prev => ({ ...prev, [key]: filterValue }));
  };

  const handleClearFilters = () => {
    setFilters({
      traineeId: 'all',
      companyId: 'all',
      startDate: '',
      endDate: ''
    });
  };

  const handleRefresh = () => {
    refetch();
    setLastUpdated(new Date());
    toast.success('Time tracking data refreshed');
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatTimeDetailed = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading time tracking data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center">
          <div className="text-red-600 text-xl font-semibold mb-2">Failed to load time tracking data</div>
          <div className="text-gray-600 mb-6">{error.message}</div>
          <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const stats = timeStats?.stats;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Time Tracking Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive analysis of trainee training time investment</p>
            {/* Real-time indicator */}
            <div className="flex items-center space-x-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${isFetching ? 'bg-blue-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></div>
              <span className={`text-sm font-medium ${isFetching ? 'text-blue-600' : 'text-green-600'}`}>
                {isFetching ? 'Updating...' : 'Auto-updating'}
              </span>
              <span className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={handleRefresh} variant="outline" disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </CardTitle>
            <CardDescription>Filter time tracking data by trainee, company, or date range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Trainee</label>
                <Select value={filters.traineeId} onValueChange={(value) => handleFilterChange('traineeId', value)} disabled={traineesLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={traineesLoading ? "Loading trainees..." : "All trainees"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All trainees</SelectItem>
                    {Array.isArray(trainees) && trainees.map((trainee) => (
                      <SelectItem key={trainee.id} value={trainee.id.toString()}>
                        {trainee.name} ({trainee.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Company</label>
                <Select value={filters.companyId} onValueChange={(value) => handleFilterChange('companyId', value)} disabled={companiesLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder={companiesLoading ? "Loading companies..." : "All companies"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All companies</SelectItem>
                    {Array.isArray(companies) && companies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</label>
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">End Date</label>
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trainees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTrainees || 0}</div>
              <p className="text-xs text-muted-foreground">Active trainees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Time Invested</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.totalTimeSpent ? formatTime(stats.totalTimeSpent) : '0s'}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalTimeSpent ? `${Math.round(stats.totalTimeSpent / 60)} minutes` : 'No time recorded'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average per Trainee</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.averageTimePerTrainee ? formatTime(stats.averageTimePerTrainee) : '0s'}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.averageTimePerTrainee ? `${Math.round(stats.averageTimePerTrainee / 60)} min avg` : 'No data'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalModules || 0}</div>
              <p className="text-xs text-muted-foreground">Training modules</p>
            </CardContent>
          </Card>
        </div>

        {/* Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Time Distribution
            </CardTitle>
            <CardDescription>Distribution of trainees by total training time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.timeDistribution.under30min || 0}
                </div>
                <div className="text-sm text-blue-700">Under 30 min</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {stats?.timeDistribution.thirtyTo60min || 0}
                </div>
                <div className="text-sm text-green-700">30-60 min</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats?.timeDistribution.oneTo2hours || 0}
                </div>
                <div className="text-sm text-yellow-700">1-2 hours</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {stats?.timeDistribution.twoTo4hours || 0}
                </div>
                <div className="text-sm text-orange-700">2-4 hours</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {stats?.timeDistribution.over4hours || 0}
                </div>
                <div className="text-sm text-red-700">Over 4 hours</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Trainees by Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Top Trainees by Training Time
            </CardTitle>
            <CardDescription>Most engaged trainees ranked by total training time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.traineeStats.slice(0, 10).map((trainee, index) => (
                <div key={trainee.traineeId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{trainee.traineeName}</div>
                      <div className="text-sm text-gray-500">{trainee.traineeEmail}</div>
                      <div className="text-xs text-gray-400">{trainee.company?.name || 'No company'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatTimeDetailed(trainee.totalTimeSpent)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {trainee.completedModules}/{trainee.totalModules} modules ({Math.round(trainee.completionRate)}%)
                    </div>
                    <div className="text-xs text-gray-400">
                      Avg score: {trainee.averageScore}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Company Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Company Statistics
            </CardTitle>
            <CardDescription>Training time breakdown by company</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.companyStats.map((company, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-gray-900">{company.companyName}</div>
                    <div className="text-sm text-gray-500">{company.traineeCount} trainees</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatTimeDetailed(company.totalTimeSpent)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Avg: {formatTime(company.averageTimePerTrainee)} per trainee
                    </div>
                    <div className="text-xs text-gray-400">
                      Completion: {Math.round(company.completionRate)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
