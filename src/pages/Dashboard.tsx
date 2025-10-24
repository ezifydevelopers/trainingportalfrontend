
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Users, Database, ArrowRight, BarChart2, MessageSquare } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();

  const stats = [
    {
      title: "Total Users",
      value: "24",
      change: "+2 from last month",
      icon: <Users className="h-5 w-5" />
    },
    {
      title: "Data Entries",
      value: "1432",
      change: "+123 from last week",
      icon: <Database className="h-5 w-5" />
    },
    {
      title: "Log Entries",
      value: "356",
      change: "+42 in the last 24h",
      icon: <BarChart2 className="h-5 w-5" />
    },
    {
      title: "New Messages",
      value: "85",
      change: "+12 since yesterday",
      icon: <MessageSquare className="h-5 w-5" />
    }
  ];

  const recentActivity = [
    {
      user: "John Doe",
      action: "Created a new data entry",
      details: "Added contact information for Apple Inc.",
      time: "4 months ago",
      initials: "JD"
    },
    {
      user: "Jane Smith",
      action: "Updated a data entry",
      details: "Modified contact details for Microsoft",
      time: "4 months ago",
      initials: "JS"
    },
    {
      user: "Alan Johnson",
      action: "Sent an email",
      details: "Marketing campaign to 50 recipients",
      time: "4 months ago",
      initials: "AJ"
    },
    {
      user: "John Doe",
      action: "Added a new user",
      details: "Sarah Wilson was added as a team member",
      time: "4 months ago",
      initials: "JD"
    },
    {
      user: "Sarah Wilson",
      action: "Logged in",
      details: "First time login",
      time: "4 months ago",
      initials: "SW"
    }
  ];

  const tasks = [
    {
      title: "Follow up with Apple Inc. representative",
      due: "Due 4 months ago",
      completed: false
    },
    {
      title: "Prepare monthly report for management",
      due: "Due 3 months ago",
      completed: false
    },
    {
      title: "Verify new data entries from last import",
      due: "Due 4 months ago",
      completed: true
    },
    {
      title: "Schedule call with Microsoft team",
      due: "Due 4 months ago",
      completed: false
    },
    {
      title: "Finalize email templates for next campaign",
      due: "Due 3 months ago",
      completed: false
    }
  ];

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, view your overview and performance.</p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-gray-500">{stat.title}</div>
                    <div className="p-2 bg-gray-50 rounded-md">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="mt-2 text-3xl font-semibold">{stat.value}</div>
                  <div className="mt-1 text-xs text-gray-500">{stat.change}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Recent Activity</h2>
                    <p className="text-sm text-gray-500">Latest actions and events in your workspace</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">All Companies</Button>
                    <Button variant="outline" size="sm">All Users</Button>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {recentActivity.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm font-medium">
                        {item.initials}
                      </div>
                      <div>
                        <div className="font-medium">{item.user} {item.action}</div>
                        <div className="text-sm text-gray-500">{item.details}</div>
                        <div className="text-xs text-gray-400 mt-1">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Upcoming Tasks</h2>
                  <p className="text-sm text-gray-500">Tasks that need your attention</p>
                </div>

                <div className="space-y-4">
                  {tasks.map((task, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <input 
                        type="checkbox" 
                        className="mt-1"
                        checked={task.completed}
                        readOnly
                      />
                      <div>
                        <div className={`text-sm ${task.completed ? 'line-through text-gray-400' : ''}`}>
                          {task.title}
                        </div>
                        <div className="text-xs text-gray-400">{task.due}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-right">
                  <Button variant="ghost" size="sm" className="text-sm">
                    View All Tasks
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Analytics Content</h2>
              <p className="text-gray-600">Analytics data will be displayed here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="performance">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Performance Content</h2>
              <p className="text-gray-600">Performance metrics will be displayed here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
