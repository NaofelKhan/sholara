import { getDashboard } from "../api/dashboard";

export async function loadDashboard() {
  return getDashboard();
}
