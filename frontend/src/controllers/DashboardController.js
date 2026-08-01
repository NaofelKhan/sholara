import { getDashboardData } from "../services/DashboardService";

export function loadDashboard() {
    return getDashboardData();
}