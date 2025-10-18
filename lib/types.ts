export type WorkforceByGender = {
    gender: string;
    employee_count: number;
};

export type DisabilityBreakdown = {
    gender: string;
    total_employees: number;
    employees_with_disabilities: number;
    percentage: number;
};

export type PercentageOfEmployeesWithDisabilities = {
    overall_percentage: number;
    total_employees: number;
    total_employees_with_disabilities: number;
    breakdown_by_gender: DisabilityBreakdown[];
};

export type EmployeeTurnoverRate = {
    overall_turnover_rate: number;
    total_employees: number;
    total_employees_departed: number;
};

export type TrainingBreakdown = {
    gender: string;
    total_employees: number;
    total_training_hours: number;
    average_hours_per_employee: number;
};

export type AverageTrainingHoursPerEmployee = {
    overall_average_hours: number;
    total_employees: number;
    total_training_hours: number;
    breakdown_by_gender: TrainingBreakdown[];
};

export type WorkplaceInjuryRate = {
    overall_injury_rate: number;
    total_employees: number;
    total_injuries: number;
};

export type WorkforceByGenderByOrgUnit = {
    OrganizationalUnitID: number;
    OrganizationalUnitName: string;
    genders: WorkforceByGender[];
};

export type EmployeeTurnoverRateByOrgUnit = {
    OrganizationalUnitID: number;
    OrganizationalUnitName: string;
    total_employees: number;
    total_employees_departed: number;
    turnover_rate: number;
};

export type ChartData = {
    "Total Workforce by Gender": WorkforceByGender[];
    "Percentage of Employees with Disabilities": PercentageOfEmployeesWithDisabilities;
    "Employee Turnover Rate": EmployeeTurnoverRate;
    "Average Training Hours per Employee": AverageTrainingHoursPerEmployee;
    "Workplace Injury Rate": WorkplaceInjuryRate;
    "Workforce by Gender by Organizational Unit": WorkforceByGenderByOrgUnit[];
    "Employee Turnover Rate by Organizational Unit": EmployeeTurnoverRateByOrgUnit[];
};
