import CustomerCard from "../../components/app/dashboard/CustomerCard";
import EcommerceMetrics from "../../components/app/dashboard/EcommerceMetrics";
import MonthlySalesChart from "../../components/app/dashboard/MonthlySalesChart";
import MonthlyTarget from "../../components/app/dashboard/MonthlyTarget";
import RecentOrders from "../../components/app/dashboard/RecentOrders";
import StatisticsChart from "../../components/app/dashboard/StatisticsChart";

const DashboardPage = () => (
  <div className="dashboard-grid">
    <div className="dashboard-column dashboard-column-main">
      <EcommerceMetrics />
      <MonthlySalesChart />
    </div>
    <MonthlyTarget />
    <div className="dashboard-full"><StatisticsChart /></div>
    <CustomerCard />
    <RecentOrders />
  </div>
);

export default DashboardPage;

