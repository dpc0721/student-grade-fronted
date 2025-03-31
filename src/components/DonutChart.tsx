import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface DonutChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ["#0088FE", "#FF8042"];

const DonutChart: React.FC<DonutChartProps> = ({ data }) => {
  return (
    <PieChart
      width={300}
      height={300}>
      <Pie
        data={data}
        innerRadius={60}
        outerRadius={80}
        fill='#8884d8'
        dataKey='value'
        label>
        {data.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

export default DonutChart;
