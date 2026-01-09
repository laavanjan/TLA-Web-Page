import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import "./BarChart.css";

// Register necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ counts, answerValues }) => {
  // Calculate total count
  const totalCount = counts.reduce((sum, count) => sum + count, 0);

  // Calculate percentage for each count
  const percentageData = counts.map(count => ((count / totalCount) * 100).toFixed(2));

  const data = {
    labels: answerValues,
    datasets: [
      {
        label: "",
        data: percentageData,
        backgroundColor: ["#002245", "#002245"],
        borderColor: ["#002245", "#002245"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allows height control
    plugins: {
      legend: {
        display: false, // Hide legend
      },
      title: {
        display: false, // Hide title
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const percentage = context.raw; // Get the percentage value
            return `${percentage}%`; // Show percentage in tooltip
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide x-axis grid lines
        },
      },
      y: {
        display: false, // Hide y-axis
      },
    },
  };

  return (
    <div className="bar-chart-container-mmvc">
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;
