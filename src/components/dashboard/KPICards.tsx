import {
  DollarSign,
  FileText,
  Users,
  Building2,
  TrendingUp,
} from "lucide-react";
import { Emenda, formatBRL } from "@/data/emendas";

interface KPICardsProps {
  data: Emenda[];
}

export function KPICards({ data }: KPICardsProps) {
  const totalValor = data.reduce((sum, e) => sum + e.valorProposto, 0);
  const totalEmendas = data.length;

  const partidoTotals = data.reduce<Record<string, number>>((acc, e) => {
    acc[e.partido] = Math.round(((acc[e.partido] || 0) + e.valorProposto) * 100) / 100;
    return acc;
  }, {});
  const sortedPartidos = Object.entries(partidoTotals).sort(
    (a, b) => b[1] - a[1],
  );
  const maxPartidoValue = sortedPartidos[0]?.[1] || 0;
  const topPartidos = sortedPartidos.filter((p) => p[1] === maxPartidoValue);

  console.log("sortedPartidos", sortedPartidos);


  const estruturaTotals = data.reduce<Record<string, number>>((acc, e) => {
    acc[e.estrutura] = (acc[e.estrutura] || 0) + e.valorProposto;
    return acc;
  }, {});
  const topEstrutura = Object.entries(estruturaTotals).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const cards = [
    {
      title: "Valor Total",
      value: formatBRL(totalValor),
      icon: DollarSign,
      sub: "Total proposto",
      color: "from-[hsl(199,72%,44%)] to-[hsl(199,72%,56%)]",
      iconBg: "bg-[hsl(199,72%,44%)]",
    },
    {
      title: "Emendas",
      value: totalEmendas.toString(),
      icon: FileText,
      sub: "Registradas no período",
      color: "from-[hsl(199,72%,44%)] to-[hsl(199,72%,56%)]",
      iconBg: "bg-[hsl(199,72%,44%)]",
    },

    {
      title: "Teto da Emenda",
      value: formatBRL(
        Math.round((totalValor / (new Set(data.map((e) => e.parlamentar)).size || 1)) * 100) / 100,
      ),
      icon: Users,
      sub: `Rateio entre ${new Set(data.map((e) => e.parlamentar)).size} parlamentares`,
      color: "from-[hsl(199,72%,44%)] to-[hsl(199,72%,56%)]",
      iconBg: "bg-[hsl(199,72%,44%)]",
    },

    {
      title: "Maior Recurso Proposto",
      value: topEstrutura?.[0] || "-",
      icon: Building2,
      sub: topEstrutura ? formatBRL(topEstrutura[1]) : "",
      color: "from-[hsl(199,72%,44%)] to-[hsl(199,72%,56%)]",
      iconBg: "bg-[hsl(199,72%,44%)]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, i) => (
        <div
          key={card.title}
          className="group relative rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
        >
          {/* Gradient accent bar */}
          <div
            className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`}
          />

          <div className="p-5 pt-5">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[15px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                {card.title}
              </p>
              <div
                className={`${card.iconBg} rounded-xl p-2 shadow-lg transition-transform duration-300 group-hover:scale-110`}
              >
                <card.icon className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <p className="text-[1.8rem] font-extrabold tracking-tight leading-none mb-1.5">
              {card.value}
            </p>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <p className="text-[14px] text-muted-foreground font-medium">
                {card.sub}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
