import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Sector,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Layers } from "lucide-react";
import {
  Emenda,
  formatBRL,
  PUBLIC_SECTOR_COLORS,
  PRIVATE_SECTOR_COLORS,
} from "@/data/emendas";

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
const renderActiveShape = (
  props: ActiveShapeProps & { payload: { setor: string } },
) => {
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
        dy={-14}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px] uppercase tracking-tighter font-semibold"
      >
        Estrutura ({payload.setor})
      </text>
      <text
        x={cx}
        y={cy}
        dy={10}
        textAnchor="middle"
        className="fill-foreground text-sm font-bold"
      >
        {payload.name.length > 15
          ? `${payload.name.substring(0, 15)}...`
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

// Tooltip Personalizado
// const CustomTooltip = ({ active, payload }: any) => {
//   if (active && payload && payload.length) {
//     const data = payload[0].payload;
//     return (
//       <div className="bg-background/95 border border-border p-3 rounded-lg shadow-xl backdrop-blur-sm">
//         <p className="font-medium text-foreground mb-1">{data.name}</p>
//         <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
//           <div
//             className="w-2 h-2 rounded-full"
//             style={{ backgroundColor: data.fill }}
//           />
//           <span>Setor {data.setor}</span>
//         </div>
//         <p className="font-bold text-foreground">{formatBRL(data.value)}</p>
//       </div>
//     );
//   }
//   return null;
// };

export function EstruturaChart({ data }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Agrupa os dados primeiro por setor, e depois por estrutura
  const groupedData: Record<string, Record<string, number>> = data.reduce(
    (acc, e) => {
      const setor = e.setor || "Outro";
      if (!acc[setor]) {
        acc[setor] = {};
      }
      acc[setor][e.estrutura] =
        (acc[setor][e.estrutura] || 0) + e.valorProposto;
      return acc;
    },
    {} as Record<string, Record<string, number>>,
  );

  // Transforma em array e calcula cores
  interface FinalChartData extends ChartDataItem {
    fill: string;
    setor: string;
    formattedPercent?: string;
  }

  const chartData: FinalChartData[] = [];

  // Array de setores para priorizar Público e Privado
  const setores = Object.keys(groupedData).sort((a, b) => {
    if (a === "Público") return -1;
    if (b === "Público") return 1;
    if (a === "Privado") return -1;
    if (b === "Privado") return 1;
    return 0;
  });

  setores.forEach((setor) => {
    const estruturas = Object.entries(groupedData[setor])
      .sort((a, b) => b[1] - a[1]) // Ordem decrescente de valor dentro do setor
      .map(([name, value]) => ({ name, value }));

    estruturas.forEach((estrutura, index) => {
      let fill = "#ccc"; // Default color
      if (setor === "Público") {
        fill = PUBLIC_SECTOR_COLORS[index % PUBLIC_SECTOR_COLORS.length];
      } else if (setor === "Privado") {
        fill = PRIVATE_SECTOR_COLORS[index % PRIVATE_SECTOR_COLORS.length];
      }

      chartData.push({
        name: estrutura.name,
        value: estrutura.value,
        setor,
        fill,
      });
    });
  });

  // Calcula porcentagens arredondadas usando o Método do Maior Resto (Largest Remainder Method) para garantir exatos 100%
  const totalValue = chartData.reduce((acc, item) => acc + item.value, 0);
  if (totalValue > 0) {
    const exactPercents = chartData.map(
      (item) => (item.value / totalValue) * 100,
    );
    // Multiplicamos por 10 para trabalhar com uma casa decimal (ex: 33.3% -> 333)
    const floorPercents = exactPercents.map((p) => Math.floor(p * 10));
    const remainders = exactPercents.map((p, i) => ({
      index: i,
      remainder: p * 10 - floorPercents[i],
    }));

    const currentSum = floorPercents.reduce((acc, val) => acc + val, 0);
    const diff = 1000 - currentSum;

    // Distribui o resto para as fatias com maiores casas decimais
    remainders.sort((a, b) => b.remainder - a.remainder);
    for (let i = 0; i < diff && i < remainders.length; i++) {
      floorPercents[remainders[i].index] += 1;
    }

    // Atribui a porcentagem formatada
    chartData.forEach((item, index) => {
      item.formattedPercent = `${(floorPercents[index] / 10).toFixed(1)}%`;
    });
  }

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden h-full">
      <div className="px-6 pt-5 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
            <Layers className="h-4 w-4 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Distribuição por Área</h3>
            <p className="text-[12px] text-muted-foreground">
              Distribuição por estrutura
            </p>
          </div>
        </div>

        {/* Legenda de Setores */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: PUBLIC_SECTOR_COLORS[2] }}
            />
            <span className="text-xs font-medium text-muted-foreground">
              Setor Público
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: PRIVATE_SECTOR_COLORS[1] }}
            />
            <span className="text-xs font-medium text-muted-foreground">
              Setor Privado
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-5">
        <div className={isMobile ? "h-[300px] relative" : "h-[400px] relative"}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={isMobile ? 60 : 75}
                outerRadius={isMobile ? 90 : 120}
                paddingAngle={4}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(undefined)}
                stroke="none"
                labelLine={true}
                label={({ payload }) => payload.formattedPercent}
              >
                {chartData.map((entry, i) => (
                  <Cell
                    key={`cell-${i}`}
                    fill={entry.fill}
                    className="outline-none"
                  />
                ))}
              </Pie>

              {/* <Tooltip content={<CustomTooltip />} /> */}

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
