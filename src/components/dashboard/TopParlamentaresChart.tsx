import { useState, useEffect } from "react";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    .map(([name, values]) => ({
      name,
      ...values,
    }));

  // No mobile, exibimos na horizontal. Nas Recharts, isso significa layout="vertical".
  const layout = isMobile ? "vertical" : "horizontal";

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden h-full">
      <div className="px-6 pt-5 pb-2 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <BarChart3 className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Vereador X Alocação</h3>
          <p className="text-[12px] text-muted-foreground">

          </p>
        </div>
      </div>
      <div className="px-4 pb-5">
        <div className={isMobile ? "h-[500px]" : "h-[480px]"}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout={layout}
              margin={
                isMobile
                  ? { left: 0, right: 30, top: 20, bottom: 20 }
                  : { left: 10, right: 10, top: 40, bottom: 60 }
              }
            >
              {layout === "horizontal" ? (
                <>
                  <XAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 13, fill: "hsl(201,95%,14%)" }}
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
                    tick={{ fontSize: 12, fill: "hsl(201,20%,46%)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                </>
              ) : (
                <>
                  <XAxis
                    type="number"
                    hide
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 10, fill: "hsl(201,95%,14%)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                </>
              )}
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
                      position={isMobile ? "right" : "top"}
                      formatter={(value: number) => formatBRLCompact(value)}
                      style={{ fontSize: isMobile ? 10 : 12, fill: "hsl(201,20%,46%)" }}
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
