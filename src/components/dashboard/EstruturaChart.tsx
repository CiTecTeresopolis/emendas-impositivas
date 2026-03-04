import { useState } from "react";
import {
  PieChart,
  Pie,
  Sector,
  Cell,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Layers } from "lucide-react";
import { Emenda, formatBRL, CHART_COLORS } from "@/data/emendas";

interface Props {
  data: Emenda[];
}

interface ChartDataItem {
  name: string;
  value: number;
}

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

// Componente para o centro dinâmico do Donut
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
        className="fill-muted-foreground text-[10px] uppercase tracking-tighter font-semibold"
      >
        Estrutura
      </text>
      <text
        x={cx}
        y={cy}
        dy={16}
        textAnchor="middle"
        className="fill-foreground text-sm font-bold"
      >
        {payload.name.length > 15
          ? `${payload.name.substring(0, 12)}...`
          : payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export function EstruturaChart({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);

  const totals = data.reduce<Record<string, number>>((acc, e) => {
    acc[e.estrutura] = (acc[e.estrutura] || 0) + e.valorProposto;
    return acc;
  }, {});

  const chartData = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden h-full">
      <div className="px-6 pt-5 pb-2 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
          <Layers className="h-4 w-4 text-destructive" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Valor por Área</h3>
          <p className="text-[12px] text-muted-foreground">
            Distribuição por estrutura
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
                cy="45%"
                innerRadius={75}
                outerRadius={120}
                paddingAngle={4}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
                stroke="none"
                labelLine={true}
                label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
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
                formatter={(value) => (
                  <span className="text-[14px] text-muted-foreground font-medium">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Valor Monetário Centralizado Abaixo do Gráfico ou no Rodapé */}
          {activeIndex !== undefined && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none text-center bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border border-border">
              <p className="text-sm font-bold ">
                {formatBRL(chartData[activeIndex].value)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
