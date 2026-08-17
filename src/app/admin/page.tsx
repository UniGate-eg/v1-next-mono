import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { primary } from "../../lib/prisma";
import { Building2, BookOpen, Users, AlertCircle } from "lucide-react";

export default async function AdminDashboard() {
  const [
    universityCount,
    facultyCount,
    programCount,
    pendingSuggestions,
  ] = await Promise.all([
    primary.university.count(),
    primary.faculty.count(),
    primary.degreeProgram.count(),
    primary.suggestion.count({ where: { status: "PENDING" } }),
  ]);

  const stats = [
    {
      title: "Total Universities",
      value: universityCount,
      icon: Building2,
      color: "text-blue-500",
    },
    {
      title: "Total Faculties",
      value: facultyCount,
      icon: Users,
      color: "text-emerald-500",
    },
    {
      title: "Degree Programs",
      value: programCount,
      icon: BookOpen,
      color: "text-indigo-500",
    },
    {
      title: "Pending Suggestions",
      value: pendingSuggestions,
      icon: AlertCircle,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h2>
        <p className="text-muted-foreground mt-2">
          Overview of UniGate data and pending actions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
