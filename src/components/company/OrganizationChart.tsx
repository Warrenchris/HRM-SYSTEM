import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, User, Building, Mail, Phone } from "lucide-react";

interface Position {
  id: string;
  title: string;
  employee?: {
    name: string;
    email: string;
    avatar?: string;
  };
  department: string;
  level: number;
  parentId?: string;
  reportsTo?: string;
  directReports: number;
}

export function OrganizationChart() {
  const positions: Position[] = [
    {
      id: "CEO",
      title: "Chief Executive Officer",
      employee: {
        name: "Robert CEO",
        email: "ceo@techcorp.co.ke",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Robert CEO",
      },
      department: "Executive",
      level: 1,
      directReports: 4,
    },
    {
      id: "CTO",
      title: "Chief Technology Officer",
      employee: {
        name: "Sarah Manager",
        email: "sarah.manager@techcorp.co.ke",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Sarah Manager",
      },
      department: "Technology",
      level: 2,
      parentId: "CEO",
      reportsTo: "Robert CEO",
      directReports: 3,
    },
    {
      id: "CFO",
      title: "Chief Financial Officer",
      employee: {
        name: "David Finance Manager",
        email: "david.finance@techcorp.co.ke",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=David Finance",
      },
      department: "Finance",
      level: 2,
      parentId: "CEO",
      reportsTo: "Robert CEO",
      directReports: 2,
    },
    {
      id: "CHRO",
      title: "Chief Human Resources Officer",
      employee: {
        name: "Emily HR Manager",
        email: "emily.hr@techcorp.co.ke",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Emily HR",
      },
      department: "Human Resources",
      level: 2,
      parentId: "CEO",
      reportsTo: "Robert CEO",
      directReports: 3,
    },
    {
      id: "CMO",
      title: "Chief Marketing Officer",
      employee: {
        name: "Lisa Marketing Director",
        email: "lisa.marketing@techcorp.co.ke",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Lisa Marketing",
      },
      department: "Marketing",
      level: 2,
      parentId: "CEO",
      reportsTo: "Robert CEO",
      directReports: 2,
    },
    // Level 3 positions
    {
      id: "DEV_LEAD",
      title: "Development Team Lead",
      employee: {
        name: "John Lead Developer",
        email: "john.dev@techcorp.co.ke",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=John Lead",
      },
      department: "Technology",
      level: 3,
      parentId: "CTO",
      reportsTo: "Sarah Manager",
      directReports: 8,
    },
    {
      id: "OPS_LEAD",
      title: "Operations Team Lead",
      employee: {
        name: "Mike Operations",
        email: "mike.ops@techcorp.co.ke",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Mike Operations",
      },
      department: "Technology",
      level: 3,
      parentId: "CTO",
      reportsTo: "Sarah Manager",
      directReports: 5,
    },
    {
      id: "QA_LEAD",
      title: "Quality Assurance Lead",
      employee: {
        name: "Grace QA Manager",
        email: "grace.qa@techcorp.co.ke",
        avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Grace QA",
      },
      department: "Technology",
      level: 3,
      parentId: "CTO",
      reportsTo: "Sarah Manager",
      directReports: 4,
    },
  ];

  const getPositionsByLevel = (level: number) => {
    return positions.filter(pos => pos.level === level);
  };

  const getDirectReports = (positionId: string) => {
    return positions.filter(pos => pos.parentId === positionId);
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return "border-purple-500 bg-purple-50";
      case 2: return "border-blue-500 bg-blue-50";
      case 3: return "border-green-500 bg-green-50";
      default: return "border-gray-500 bg-gray-50";
    }
  };

  const getDepartmentColor = (department: string) => {
    const colors: Record<string, string> = {
      "Executive": "bg-purple-100 text-purple-800",
      "Technology": "bg-blue-100 text-blue-800",
      "Finance": "bg-green-100 text-green-800",
      "Human Resources": "bg-orange-100 text-orange-800",
      "Marketing": "bg-pink-100 text-pink-800",
    };
    return colors[department] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-8">
      {/* Organization Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Leadership Positions</p>
                <p className="text-2xl font-bold">{positions.filter(p => p.employee).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{positions.reduce((sum, pos) => sum + pos.directReports, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold">{new Set(positions.map(p => p.department)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Org Levels</p>
                <p className="text-2xl font-bold">{Math.max(...positions.map(p => p.level))}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organization Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Organization Structure
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Level 1 - Executive */}
            <div className="flex justify-center">
              <div className="space-y-4">
                {getPositionsByLevel(1).map((position) => (
                  <Card key={position.id} className={`w-80 border-4 ${getLevelColor(position.level)}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {position.employee && (
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={position.employee.avatar} />
                            <AvatarFallback>
                              {position.employee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{position.title}</h3>
                            <Badge className={getDepartmentColor(position.department)}>
                              {position.department}
                            </Badge>
                          </div>
                          {position.employee && (
                            <>
                              <p className="font-medium">{position.employee.name}</p>
                              <p className="text-sm text-muted-foreground">{position.employee.email}</p>
                            </>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {position.directReports} direct reports
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Connection Line */}
            <div className="flex justify-center">
              <div className="w-px h-8 bg-gray-300"></div>
            </div>

            {/* Level 2 - C-Level */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {getPositionsByLevel(2).map((position) => (
                <div key={position.id} className="flex flex-col items-center">
                  <Card className={`w-full border-4 ${getLevelColor(position.level)}`}>
                    <CardContent className="p-4">
                      <div className="text-center space-y-3">
                        {position.employee && (
                          <Avatar className="h-10 w-10 mx-auto">
                            <AvatarImage src={position.employee.avatar} />
                            <AvatarFallback className="text-xs">
                              {position.employee.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <Badge className={getDepartmentColor(position.department)} variant="outline">
                            {position.department}
                          </Badge>
                          <h4 className="font-medium text-sm mt-1">{position.title}</h4>
                          {position.employee && (
                            <>
                              <p className="font-medium text-sm">{position.employee.name}</p>
                              <p className="text-xs text-muted-foreground">{position.employee.email}</p>
                            </>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Reports to: {position.reportsTo}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {position.directReports} reports
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Level 3 - Direct Reports */}
                  {getDirectReports(position.id).length > 0 && (
                    <>
                      <div className="w-px h-4 bg-gray-300 my-2"></div>
                      <div className="space-y-2 w-full">
                        {getDirectReports(position.id).map((report) => (
                          <Card key={report.id} className={`border-2 ${getLevelColor(report.level)}`}>
                            <CardContent className="p-3">
                              <div className="flex items-center gap-2">
                                {report.employee && (
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={report.employee.avatar} />
                                    <AvatarFallback className="text-xs">
                                      {report.employee.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{report.title}</p>
                                  {report.employee && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {report.employee.name}
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground">
                                    {report.directReports} reports
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-purple-500 bg-purple-50 rounded"></div>
              <span className="text-sm">Executive Level</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 bg-blue-50 rounded"></div>
              <span className="text-sm">C-Level / Directors</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-green-500 bg-green-50 rounded"></div>
              <span className="text-sm">Team Leads / Managers</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}