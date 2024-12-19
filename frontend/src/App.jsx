import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import Papa from "papaparse";
import React, { useState } from "react";
import { Bar, Line, Scatter } from "react-chartjs-2";
import * as XLSX from "xlsx";

// Register necessary components of Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const fileExtension = file.name.split(".").pop().toLowerCase();

      // Handle CSV files using PapaParse
      if (fileExtension === "csv") {
        Papa.parse(file, {
          complete: (result) => {
            setData(result.data); // Store parsed CSV data
          },
          header: true,
        });
      }
      // Handle Excel files (.xls, .xlsx) using xlsx
      else if (fileExtension === "xls" || fileExtension === "xlsx") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const wb = XLSX.read(e.target.result, { type: "binary" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(ws);
          setData(jsonData); // Store parsed XLSX data
        };
        reader.readAsBinaryString(file);
      }
    }
  };

  const createChartData = (data) => {
    const dates = data.map((item) => item.Date);
    const totalRevenue = data.map((item) => item["Total Revenue"]);
    const products = [...new Set(data.map((item) => item["Product Name"]))];
    const quantities = data.map((item) => item["Quantity Sold"]);

    // Average Revenue per Product (Bar chart)
    const averageRevenue = products.map((product) => {
      const productData = data.filter(
        (item) => item["Product Name"] === product
      );
      const totalRevenue = productData.reduce(
        (sum, item) => sum + item["Total Revenue"],
        0
      );
      const totalQuantity = productData.reduce(
        (sum, item) => sum + item["Quantity Sold"],
        0
      );
      return totalRevenue / totalQuantity;
    });

    // Revenue vs Quantity Sold (Scatter plot)
    const revenueVsQuantity = products.map((product) => {
      const productData = data.filter(
        (item) => item["Product Name"] === product
      );
      const totalRevenue = productData.reduce(
        (sum, item) => sum + item["Total Revenue"],
        0
      );
      const totalQuantity = productData.reduce(
        (sum, item) => sum + item["Quantity Sold"],
        0
      );
      return { x: totalQuantity, y: totalRevenue };
    });

    // Monthly Growth (Line chart)
    const months = [
      ...new Set(dates.map((date) => date.split("/")[0] + "/2023")),
    ];
    const monthlyRevenue = months.map((month) => {
      return data
        .filter((item) => item.Date.startsWith(month))
        .reduce((sum, item) => sum + item["Total Revenue"], 0);
    });

    const monthlyGrowth = monthlyRevenue.map((revenue, index, arr) => {
      if (index === 0) return 0;
      return ((revenue - arr[index - 1]) / arr[index - 1]) * 100;
    });

    // Prepare datasets for charts
    const revenueOverTime = {
      labels: dates,
      datasets: [
        {
          label: "Revenue Over Time",
          data: totalRevenue,
          fill: false,
          borderColor: "#00bcd4",
          tension: 0.1,
        },
      ],
    };

    const productRevenueChart = {
      labels: products,
      datasets: [
        {
          label: "Product-Wise Revenue",
          data: products.map((product) => {
            return data
              .filter((item) => item["Product Name"] === product)
              .reduce((sum, item) => sum + item["Total Revenue"], 0);
          }),
          backgroundColor: "#00bcd4",
        },
      ],
    };

    const quantitySoldChart = {
      labels: products,
      datasets: [
        {
          label: "Quantity Sold",
          data: products.map((product) => {
            return data
              .filter((item) => item["Product Name"] === product)
              .reduce((sum, item) => sum + item["Quantity Sold"], 0);
          }),
          backgroundColor: "#ff9800",
        },
      ],
    };

    const averageRevenueChart = {
      labels: products,
      datasets: [
        {
          label: "Average Revenue per Product",
          data: averageRevenue,
          backgroundColor: "#4caf50",
        },
      ],
    };

    const scatterPlotData = {
      datasets: [
        {
          label: "Revenue vs Quantity Sold",
          data: revenueVsQuantity,
          backgroundColor: "#9c27b0",
          borderColor: "#9c27b0",
          borderWidth: 1,
        },
      ],
    };

    const monthlyGrowthChart = {
      labels: months,
      datasets: [
        {
          label: "Monthly Revenue Growth (%)",
          data: monthlyGrowth,
          fill: false,
          borderColor: "#f44336",
          tension: 0.1,
        },
      ],
    };

    return {
      revenueOverTime,
      productRevenueChart,
      quantitySoldChart,
      averageRevenueChart,
      scatterPlotData,
      monthlyGrowthChart,
    };
  };

  const charts = data ? createChartData(data) : null;

  return (
    <div
      style={{
        fontFamily: "Roboto, sans-serif",
        background: "#121212",
        color: "#fff",
        padding: "30px",
        minHeight: "100vh",
        width: "100%",
        margin: 0,
      }}
    >
      <header
        style={{
          textAlign: "center",
          padding: "40px",
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
          width: "100%",
        }}
      >
        <h1 style={{ fontSize: "3em", margin: 0 }}>
          Interactive Sales Dashboard
        </h1>
        <input
          type="file"
          onChange={handleFileChange}
          style={{
            margin: "20px auto",
            fontSize: "1.2em",
            padding: "12px 24px",
            border: "none",
            borderRadius: "6px",
            background: "#00bcd4",
            color: "#fff",
            cursor: "pointer",
            transition: "background 0.3s ease",
          }}
        />
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "20px",
          padding: "20px 0",
        }}
      >
        {charts && (
          <>
            {/* Revenue Over Time (Line chart) */}
            <div
              style={{
                backgroundColor: "#1e1e1e",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <Line data={charts.revenueOverTime} />
            </div>

            {/* Product-Wise Revenue Contribution (Bar chart) */}
            <div
              style={{
                backgroundColor: "#1e1e1e",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <Bar data={charts.productRevenueChart} />
            </div>

            {/* Quantity Sold by Product (Horizontal Bar chart) */}
            <div
              style={{
                backgroundColor: "#1e1e1e",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <Bar
                data={charts.quantitySoldChart}
                options={{ indexAxis: "y" }}
              />
            </div>

            {/* Average Revenue per Product (Bar chart) */}
            <div
              style={{
                backgroundColor: "#1e1e1e",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <Bar data={charts.averageRevenueChart} />
            </div>

            {/* Revenue vs Quantity Sold (Scatter plot) */}
            <div
              style={{
                backgroundColor: "#1e1e1e",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <Scatter data={charts.scatterPlotData} />
            </div>

            {/* Monthly Revenue Growth (Line chart) */}
            <div
              style={{
                backgroundColor: "#1e1e1e",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <Line data={charts.monthlyGrowthChart} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
