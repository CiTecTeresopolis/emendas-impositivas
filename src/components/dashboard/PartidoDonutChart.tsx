import { useState } from "react";
import {
  Pie,
  Cell,
  PieChart,
  ResponsiveContainer,
  Sector,
  Legend,
} from "recharts";
import { Emenda, formatBRL, CHART_COLORS } from "@/data/emendas";
import { PieChartIcon } from "lucide-react";

// 1. Definição da interface para os dados do gráfico
interface ChartDataItem {
  name: string;
  value: number;
}

interface Props {
  data: Emenda[];
}

// 2. Tipagem para as propriedades do Active Shape (provenientes do Recharts)
interface ActiveShapeProps {
  cx: number;
  cy: number;
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  payload: ChartDataItem;
}

const renderActiveShape = (props: ActiveShapeProps) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
  } = props;

  return (
    <g>
      <text
        x={cx}
        y={cy}
        dy={-8}
        textAnchor="middle"
        className="fill-muted-foreground text-[12px] font-medium uppercase tracking-wider"
      >
        Partido
      </text>
      <text
        x={cx}
        y={cy}
        dy={20}
        textAnchor="middle"
        className="fill-foreground text-md font-bold"
      >
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export function PartidoDonutChart({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const partidoTotals = data.reduce<Record<string, number>>((acc, e) => {
    acc[e.partido] = (acc[e.partido] || 0) + e.valorProposto;
    return acc;
  }, {});

  const chartData: ChartDataItem[] = Object.entries(partidoTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // 3. Tipagem dos eventos de Mouse
  // O Recharts passa o objeto de dados como primeiro argumento e o índice como segundo
  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden h-full">
      <div className="px-6 pt-5 pb-2 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15">
          <PieChartIcon className="h-4 w-4 text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Top 5 Partidos</h3>
          <p className="text-[12px] text-muted-foreground">
            Passe o mouse para ver os valores
          </p>
        </div>
      </div>

      <div className="px-4 pb-5">
        <div className="h-[400px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="42%"
                innerRadius={75}
                outerRadius={120}
                paddingAngle={4}
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                labelLine={false}
                label={({ percent }: { percent: number }) =>
                  `${(percent * 100).toFixed(0)}%`
                }
                stroke="none"
              >
                {chartData.map((_, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                    className="outline-none"
                  />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: 14, paddingTop: 20 }}
              />
            </PieChart>
          </ResponsiveContainer>

          {activeIndex !== undefined && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none text-center bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border border-border">
              <p className="text-sm font-bold">
                {formatBRL(chartData[activeIndex].value)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
