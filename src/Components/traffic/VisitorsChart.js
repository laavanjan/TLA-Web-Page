// Visitors and page views over time. Hovering anywhere on the chart snaps to
// the nearest day and shows both numbers; long ranges are shown by month.
import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from "chart.js";
import { FaChartLine } from "react-icons/fa";

import TrafficCard from "./TrafficCard";
import { bucketSeries } from "../../admin/trafficMath";
import { COLORS } from "../../admin/trafficLabels";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

// A thin vertical line under the pointer, so it's clear which day the
// tooltip is about.
const crosshair = {
  id: "trCrosshair",
  afterDatasetsDraw(chart) {
    const active = chart.tooltip && chart.tooltip.getActiveElements();
    if (!active || !active.length) return;
    const { ctx, chartArea } = chart;
    const x = active[0].element.x;
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.stroke();
    ctx.restore();
  },
};

const label = (ymd, unit, long) => {
  if (unit === "hour") return long ? `${hourName(Number(ymd))}–${hourName((Number(ymd) + 1) % 24)}` : hourName(Number(ymd));
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  if (unit === "month") return date.toLocaleDateString("en-GB", { month: "short", year: long ? "numeric" : "2-digit" });
  return date.toLocaleDateString("en-GB", long ? { weekday: "short", day: "numeric", month: "short" } : { day: "numeric", month: "short" });
};

const hourName = (h) => `${h % 12 || 12}${h < 12 ? "am" : "pm"}`;

// For "Today" there's only one day, so show its page views hour by hour
// instead (visitors aren't counted per hour).
function hourlyPoints(hours) {
  return Array.from({ length: 24 }, (_, h) => ({ day: String(h), views: Number((hours || {})[h]) || 0, visitors: null }));
}

export default function VisitorsChart({ series, hours, index }) {
  const { unit, points } = useMemo(
    () => (hours ? { unit: "hour", points: hourlyPoints(hours) } : bucketSeries(series)),
    [series, hours]
  );
  const single = points.length === 1;

  const data = useMemo(
    () => ({
      labels: points.map((p) => label(p.day, unit)),
      datasets: [
        unit !== "hour" && {
          label: "Visitors",
          data: points.map((p) => p.visitors),
          borderColor: COLORS.visitors,
          backgroundColor: (ctx) => {
            const { chart } = ctx;
            if (!chart.chartArea) return "rgba(201,133,0,0.2)";
            const g = chart.ctx.createLinearGradient(0, chart.chartArea.top, 0, chart.chartArea.bottom);
            g.addColorStop(0, "rgba(201,133,0,0.35)");
            g.addColorStop(1, "rgba(201,133,0,0)");
            return g;
          },
          fill: true,
        },
        {
          label: "Page views",
          data: points.map((p) => p.views),
          borderColor: COLORS.views,
          backgroundColor: COLORS.views,
          fill: false,
          borderDash: unit === "hour" ? [] : [5, 4],
        },
      ].filter(Boolean),
    }),
    [points, unit]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      elements: {
        line: { borderWidth: 2, tension: 0.32 },
        point: { radius: single ? 5 : 0, hoverRadius: 5, hoverBorderWidth: 2, hoverBorderColor: "#121723" },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { color: "rgba(255,255,255,0.12)" },
          ticks: { color: "#8d97ab", maxRotation: 0, autoSkipPadding: 18, font: { size: 11 } },
        },
        y: {
          beginAtZero: true,
          grid: { color: "rgba(255,255,255,0.06)" },
          border: { display: false },
          ticks: { color: "#8d97ab", precision: 0, maxTicksLimit: 5, font: { size: 11 } },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(10,13,20,0.95)",
          borderColor: "rgba(255,255,255,0.12)",
          borderWidth: 1,
          padding: 10,
          titleColor: "#c3cad8",
          bodyColor: "#f4f6fb",
          bodyFont: { weight: "bold" },
          boxWidth: 10,
          boxHeight: 2,
          usePointStyle: false,
          callbacks: {
            title: (items) => (items.length ? label(points[items[0].dataIndex].day, unit, true) : ""),
            label: (item) => ` ${item.formattedValue} ${item.dataset.label.toLowerCase()}`,
          },
        },
      },
    }),
    [points, unit, single]
  );

  const key = unit === "hour" ? "views" : "visitors";
  const peak = points.reduce((best, p) => (p[key] > best[key] ? p : best), points[0] || { [key]: 0 });

  return (
    <TrafficCard
      icon={FaChartLine}
      title={unit === "month" ? "Visitors by month" : unit === "hour" ? "Page views by hour today" : "Visitors by day"}
      hint={`Hover over the chart to see the numbers for each ${unit}.`}
      index={index}
      actions={
        unit !== "hour" && (
          <div className="tr-legend" aria-hidden="true">
            <span>
              <i style={{ background: COLORS.visitors }} /> Visitors
            </span>
            <span>
              <i className="is-dashed" style={{ color: COLORS.views }} /> Page views
            </span>
          </div>
        )
      }
    >
      <div className="tr-chart" role="img" aria-label={`Line chart of visitors and page views by ${unit}.`}>
        <Line data={data} options={options} plugins={[crosshair]} />
      </div>
      {peak && peak[key] > 0 && !single && (
        <p className="tr-chart-note">
          Busiest {unit}: <b>{label(peak.day, unit, true)}</b> with <b>{peak[key].toLocaleString("en-GB")}</b>{" "}
          {unit === "hour" ? "page views" : "visitors"}.
        </p>
      )}
    </TrafficCard>
  );
}
