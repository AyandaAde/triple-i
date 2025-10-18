"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MultiStepLoader as Loader } from "@/components/ui/multi-step-loader"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartData, WorkforceByGender } from "@/lib/types"
import { calculateTotalEmployees, handleDownloadReport } from "@/lib/utils/heplers"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { Download, FileText, Loader2, Mail, RefreshCcw, RotateCcw, Upload } from "lucide-react"
import { useState } from "react"
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { toast } from "sonner"

const defaultTrainingByGenderData = [
  {
    "gender": "Male",
    "total_employees": 430,
    "total_training_hours": 27675.0,
    "average_hours_per_employee": 2.67
  },
  {
    "gender": "Female",
    "total_employees": 379,
    "total_training_hours": 23575.0,
    "average_hours_per_employee": 2.67
  },
  {
    "gender": "Non-binary",
    "total_employees": 26,
    "total_training_hours": 8126.0,
    "average_hours_per_employee": 2.67
  },
  {
    "gender": "Other",
    "total_employees": 358,
    "total_training_hours": 10250.0,
    "average_hours_per_employee": 2.67
  }
];

const defaultWorkforceByGenderData = [
  { gender: "Male", value: 1368.0, percentage: 45.6, fill: "hsl(210, 70%, 60%)" },
  { gender: "Female", value: 1100.0, percentage: 36.7, fill: "hsl(155, 70%, 45%)" },
  { gender: "Other", value: 532.0, percentage: 17.7, fill: "hsl(300, 70%, 50%)" },
];

const genderLegend = [
  { label: "Male", color: "hsl(210, 70%, 60%)" },
  { label: "Female", color: "hsl(155, 70%, 45%)" },
  { label: "Non-binary", color: "hsl(45, 70%, 50%)" },
  { label: "Other", color: "hsl(300, 70%, 50%)" },
];

export default function Dashboard() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const colors = ["#3b82f6", "#ef4444", "#22c55e", "#a855f7"];
  const pieChartColors = ["#4A90E2", "#50C878", "#DA70D6", "#FFA500"];

  const loadingStates = [
    {
      text: "Uploading File",
    },
    {
      text: "Computing Data",
    },
    {
      text: "Generating Report",
    },
    {
      text: "Grabbing a cup of coffee",
    },
    {
      text: "Eating a croissant",
    },
    {
      text: "Report Generated",
    },
  ];

  const uploadFile = useMutation({
    mutationFn: async (formData: FormData) => {

      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      return data;
    },
  });

  const downloadReport = useMutation({
    mutationFn: async () => {

      const { data } = await axios.post("http://localhost:8000/report", {
        kpi_data: chartData,
        company_id: 1,
        year: new Date().getFullYear(),
        company_name: "Company 1"
      });

      console.error("Data", data);
      return data;
    },
  });

  const renderLegend = () => {
    return (
      <ul className="list-none m-0 p-0">
        {workforceByGenderData.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center mb-1">
            <div
              className="w-3 h-3 rounded-sm mr-2"
              style={{ backgroundColor: pieChartColors[index] }}
            />
            <span className="text-sm">{entry.gender}</span>
          </li>
        ))}
      </ul>
    );
  };

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx";

    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const formData = new FormData();

        formData.append("file", file);

        uploadFile.mutate(formData, {
          onSuccess: async (data) => {
            setChartData(data.kpi_result);
            toast.success("Success", {
              description: "Successfully uploaded file",
            });
          },
          onError: (error) => {
            console.error("Error uploading file", error);
            toast.error("Error", {
              description: `Error uploading file ${error}`
            });
          },
        });
      }
    };

    input.click();
  };

  const handleDownload = (type: string) => {
    if (!chartData) {
      toast.error("Error", {
        description: "Please upload a file to generate and download a report."
      });
      return
    }

    downloadReport.mutate(undefined, {
      onSuccess: async (data) => {
        handleDownloadReport(data, type);
      },
      onError: (error) => {
        console.error("Error downloading reports", error);
        toast.error("Error", {
          description: `Error downloading reports ${error}`
        })
      }
    })
  }


  const totalEmployees =
    calculateTotalEmployees(chartData?.["Total Workforce by Gender"] ?? []) || 3000;

  const trainingByGenderData =
    chartData?.["Average Training Hours per Employee"]?.breakdown_by_gender?.length > 0
      ? chartData?.["Average Training Hours per Employee"].breakdown_by_gender
      : defaultTrainingByGenderData;

  const workforceByGenderData =
    chartData?.["Total Workforce by Gender"]?.length
      ? chartData?.["Total Workforce by Gender"].map((item: WorkforceByGender) => ({
        ...item,
        value: item.employee_count,
        percentage: ((item.employee_count / totalEmployees) * 100).toFixed(1),
      }))
      : defaultWorkforceByGenderData.map((item) => ({
        ...item,
        value: item.value,
        percentage: item.percentage,
      }));

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background p-6">
      {
        uploadFile.isPending && (
          <Loader loadingStates={loadingStates} loading={uploadFile.isPending} duration={1000} />
        )
      }
      <div className="space-y-6 w-[90vw]">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">S1: Own Workforce Metrics</h1>
            <p className="flex flex-row items-center text-sm text-muted-foreground mt-1">
              <RefreshCcw className="mr-1 size-4" />
              Last updated less than a minute ago
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select defaultValue="organizational">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Organizational" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="organizational">Organizational</SelectItem>
                <SelectItem value="departmental">Departmental</SelectItem>
                <SelectItem value="regional">Regional</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="year">
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={downloadReport.isPending}
                >
                  {downloadReport.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </>
                  )}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleDownload("pdf")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Download as PDF
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => handleDownload("docx")}>
                  <FileText className="h-4 w-4 mr-2" />
                  Download as DOCX
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm">
              Change ESG Standard
            </Button>
            <div>
              <Button
                size="sm"
                onClick={handleUpload}
                className="bg-primary text-primary-foreground"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Data
              </Button>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Active Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{totalEmployees ?? 3000}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Training Hours</CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  S1-6/S1-9
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{chartData?.["Average Training Hours per Employee"].total_training_hours ?? 61500}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Training Hours</CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  S1-6/S1-9
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{chartData?.["Average Training Hours per Employee"].overall_average_hours ?? 20.5}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Workplace Injury Rate</CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  S1-14
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{chartData?.["Workplace Injury Rate"].overall_injury_rate ?? 0.089}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Total Training Hours by Gender</CardTitle>
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  S1-13
                </Badge>
                <div className="flex flex-wrap gap-4 mt-4">
                  {genderLegend.map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  hours: {
                    label: "Training Hours",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart width={500} height={300} data={trainingByGenderData}>
                    <XAxis
                      dataKey="gender"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      cursor={{ fill: "hsl(var(--muted) / 0.2)" }}
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg bg-white p-2 shadow-md border text-sm">
                              <p className="font-medium">{label}</p>
                              <p>Total Training Hours: {data.total_training_hours.toFixed(2)}</p>
                              <p>Avg Hours per Employee: {data.average_hours_per_employee.toFixed(2)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: "20px" }}
                      iconType="square"
                    />

                    {/* Show TOTAL hours in bar height */}
                    <Bar
                      dataKey="total_training_hours"
                      name="Total Training Hours"
                      radius={[4, 4, 0, 0]}
                      label={{ position: "insideTop", fill: "white" }}
                    >
                      {trainingByGenderData?.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>

          </Card>

          {/* Donut Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium">Workforce by Gender</CardTitle>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  S1-0/S1-9
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  value: {
                    label: "Employees",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart width={400} height={300}>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid gap-2">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-medium">{data.gender}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    Employees:
                                  </span>
                                  <span className="text-sm font-bold">{data.value}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    Percentage:
                                  </span>
                                  <span className="text-sm font-bold">
                                    {data.percentage}%
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />

                    {/* 🧩 Custom legend showing gender names */}
                    <Legend
                      verticalAlign="middle"
                      align="left"
                      layout="vertical"
                      iconType="square"
                      content={renderLegend}
                    />

                    <Pie
                      data={workforceByGenderData}
                      cx="65%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ percentage }) => `${percentage}%`}
                      labelLine={false}
                    >
                      {workforceByGenderData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={pieChartColors[index % pieChartColors.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
