import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import {
  Emenda,
  formatBRL,
  formatBRLCompact,
  CHART_COLORS,
} from "@/data/emendas";
import { BarChart3 } from "lucide-react";

interface Props {
  data: Emenda[];
}

export function TopParlamentaresChart({ data }: Props) {
  const estruturas = Array.from(new Set(data.map((e) => e.estrutura)));

  const parlamentarData = data.reduce<
    Record<string, { total: number } & Record<string, number>>
  >((acc, e) => {
    if (!acc[e.parlamentar]) {
      acc[e.parlamentar] = { total: 0 };
    }
    acc[e.parlamentar].total += e.valorProposto;
    acc[e.parlamentar][e.estrutura] =
      (acc[e.parlamentar][e.estrutura] || 0) + e.valorProposto;
    return acc;
  }, {});

  const chartData = Object.entries(parlamentarData)
    .sort((a, b) => {
      if (b[1].total !== a[1].total) {
        return b[1].total - a[1].total;
      }
      const aEstruturasCount = Object.keys(a[1]).length - 1;
      const bEstruturasCount = Object.keys(b[1]).length - 1;
      return bEstruturasCount - aEstruturasCount;
    })
    .slice(0, 10)
    .map(([name, values]) => ({
      name,
      ...values,
    }));

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden h-full">
      <div className="px-6 pt-5 pb-2 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <BarChart3 className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Top 10 Vereadores</h3>
          <p className="text-[12px] text-muted-foreground">
            Por valor proposto
          </p>
        </div>
      </div>
      <div className="px-4 pb-5">
        <div className="h-[480px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ left: 10, right: 10, top: 40, bottom: 60 }}
            >
              <XAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 14, fill: "hsl(201,95%,14%)" }}
                angle={-45}
                textAnchor="end"
                dx={-8}
                dy={8}
                height={80}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="number"
                tickFormatter={(v) => formatBRLCompact(v)}
                width={80}
                tick={{ fontSize: 14, fill: "hsl(201,20%,46%)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number) => formatBRL(value)}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid hsl(210,16%,90%)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                  fontFamily: "Plus Jakarta Sans",
                  fontSize: 14,
                }}
                cursor={{ fill: "hsl(210,14%,92%)", radius: 6 }}
              />
              {estruturas.map((estrutura, i) => (
                <Bar
                  key={estrutura}
                  dataKey={estrutura}
                  stackId="a"
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                  barSize={40}
                  radius={
                    i === estruturas.length - 1 || estruturas.length === 1
                      ? [8, 8, 0, 0]
                      : [0, 0, 0, 0]
                  }
                >
                  {i === estruturas.length - 1 && (
                    <LabelList
                      dataKey="total"
                      position="top"
                      formatter={(value: number) => formatBRLCompact(value)}
                    />
                  )}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
