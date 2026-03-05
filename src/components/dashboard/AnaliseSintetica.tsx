import { useMemo, useState } from "react";
import {
  ChartColumnIncreasing,
  CheckCircle2,
  Users,
  User,
  Landmark,
  FileText,
  X,
  Target,
  TrendingUp,
  Activity,
  PieChart,
  Receipt,
  ClipboardList,
} from "lucide-react";
import { Emenda, formatBRL, formatBRLCompact } from "@/data/emendas";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
  data: Emenda[];
}

export function AnaliseSintetica({ data }: Props) {
  const isMobile = useIsMobile();
  const [isModalOpen, setIsModalOpen] = useState(false);


  const metrics = useMemo(() => {
    if (data.length === 0) return null;

    const totalValor = data.reduce((s, e) => s + e.valorProposto, 0);

    // Setor Chave (Estrutura com mais funding)
    const porEstrutura = data.reduce(
      (acc, e) => {
        acc[e.estrutura] = (acc[e.estrutura] || 0) + e.valorProposto;
        return acc;
      },
      {} as Record<string, number>,
    );

    const setorChave = Object.entries(porEstrutura).sort(
      (a, b) => b[1] - a[1],
    )[0];
    const setorChavePercent = setorChave
      ? Math.round((setorChave[1] / totalValor) * 100)
      : 0;

    // Tipologia (Coletivas vs Individuais)
    // Assumindo que "BANCADA" ou parlamentares com "Coletivas" no nome são coletivas
    const coletivas = data.filter(
      (e) =>
        e.partido === "BANCADA" ||
        e.parlamentar.toLowerCase().includes("bancada") ||
        e.parlamentar.toLowerCase().includes("comissão"),
    );
    const valorColetivas = coletivas.reduce((s, e) => s + e.valorProposto, 0);
    const tipologiaPredominante =
      valorColetivas > totalValor / 2
        ? "Predomínio de emendas coletivas"
        : "Predomínio de emendas individuais";

    // Líderes Individuais (Top 10 parlamentares que não são bancada/comissão)
    const individuais = data.filter(
      (e) =>
        e.partido !== "BANCADA" &&
        !e.parlamentar.toLowerCase().includes("bancada") &&
        !e.parlamentar.toLowerCase().includes("comissão"),
    );
    const porParlamentarIndiv = individuais.reduce(
      (acc, e) => {
        acc[e.parlamentar] = (acc[e.parlamentar] || 0) + e.valorProposto;
        return acc;
      },
      {} as Record<string, number>,
    );
    const lideresIndividuais = Object.entries(porParlamentarIndiv)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map((l) => l[0]);

    // Partidos com Maior Aporte (Top 5)
    const porPartido = data.reduce(
      (acc, e) => {
        acc[e.partido] = (acc[e.partido] || 0) + e.valorProposto;
        return acc;
      },
      {} as Record<string, number>,
    );
    const topPartidos = Object.entries(porPartido)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([party]) => (party === "BANCADA" ? "Bancada (coletiva)" : party));

    // Ano e Fonte
    const ano = data[0]?.anoVigencia || 2025;

    // Projeto/Programa Mais Frequente (por valor)
    const porPrograma = data.reduce(
      (acc, e) => {
        acc[e.programa] = (acc[e.programa] || 0) + e.valorProposto;
        return acc;
      },
      {} as Record<string, number>,
    );
    const programaDestaque = Object.entries(porPrograma).sort(
      (a, b) => b[1] - a[1],
    )[0]?.[0] || "N/A";

    // Diversificação (Quantidade de áreas/estruturas atendidas)
    const qteAreas = new Set(data.map((e) => e.estrutura)).size;

    // Ticket Médio
    const ticketMedio = data.length > 0 ? totalValor / data.length : 0;

    return {
      totalValor,
      setorChave: setorChave?.[0] || "N/A",
      setorChavePercent,
      tipologiaPredominante,
      lideresIndividuais,
      topPartidos,
      ano,
      valorColetivas,
      porEstrutura,
      porParlamentarIndiv,
      programaDestaque,
      qteAreas,
      ticketMedio,
    };
  }, [data]);

  if (!metrics) return null;

  return (
    <>
      <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden h-full flex flex-col">
        {/* Header com Botão para Modal */}
        <div className="px-6 py-5 flex items-center justify-between bg-muted/20 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-background border border-border shadow-sm">
              <ChartColumnIncreasing className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className={`text-lg font-bold leading-none ${isMobile ? "text-sm" : "text-lg"}`}>
                Análise Sintética
              </h3>
              <p className="text-xs text-muted-foreground mt-1.5 italic">
                Insights extraídos dos dados atuais
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all shadow-sm active:scale-95"
          >
            <FileText className="h-3.5 w-3.5" />
            Ver Relatório
          </button>
        </div>

        {/* Conteúdo em Lista Vertical (Resumo Rápido) */}
        <div className="flex-1 px-6 divide-y divide-border/50">
          <div className="py-5 grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Setor Chave
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground leading-snug">
                Forte concentração na {metrics.setorChave} (
                {metrics.setorChavePercent}%)
              </p>
            </div>

            <div className="space-y-1.5 col-span-2">
              <div className="flex items-center gap-2 text-primary">
                <Receipt className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Ticket Médio
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground leading-snug">
                {formatBRLCompact(metrics.ticketMedio)} / proposta
              </p>
            </div>

            <div className="space-y-1.5 col-span-2">
              <div className="flex items-center gap-2 text-primary">
                <PieChart className="h-4 w-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Diversificação
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground leading-snug">
                Recursos distribuídos em {metrics.qteAreas} {metrics.qteAreas === 1 ? "área" : "áreas diferentes"}.
              </p>
            </div>
          </div>

          <div className="py-5 space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ClipboardList className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Foco Principal
              </span>
            </div>
            <p className="text-sm font-medium text-foreground/80 line-clamp-2">
              {metrics.programaDestaque}
            </p>
          </div>


          <div className="py-5 space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Landmark className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Top 3 Estruturas
              </span>
            </div>

            <p className="text-sm font-medium text-foreground/80">
              {Object.entries(metrics.porEstrutura)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([estrutura], index, array) => (
                  <span key={estrutura}>
                    {estrutura}
                    {index < array.length - 1 ? ", " : "."}
                  </span>
                ))}
            </p>

          </div>
        </div>

        <div className="px-6 py-3 bg-muted/10 border-t border-border/50 text-[10px] text-muted-foreground text-right italic">
          Fonte: Dotações Orçamentárias {metrics.ano}
        </div>
      </div>

      {/* MODAL ESTILIZADO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-border bg-muted/30">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-foreground">
                    Análise de Dados {metrics.ano}
                  </h2>
                  <p className="text-sm text-muted-foreground font-medium">
                    Emendas Gerais Teresópolis {metrics.ano}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-muted-foreground" />
              </button>
            </div>

            {/* Corpo do Modal */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Visão Geral */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-primary">
                  <Target className="h-5 w-5" />
                  <h4 className="text-xs font-black uppercase tracking-[0.2em]">
                    Visão Geral
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-xl border border-border/50">
                  O painel apresenta um retrato consolidado das emendas
                  impositivas em Teresópolis. Organiza valores,
                  autores, áreas beneficiadas e origem dos recursos, permitindo
                  identificar padrões de investimento político.
                </p>
              </section>

              {/* Grid de Números */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className="text-[10px] font-bold uppercase text-primary/70 mb-1">
                    Valor Total Proposto
                  </p>
                  <p className="text-2xl font-black text-foreground">
                    {formatBRL(metrics.totalValor)}
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                  <p className="text-[10px] font-bold uppercase text-primary/70 mb-1">
                    Área Predominante
                  </p>
                  <p className="text-2xl font-black text-foreground">
                    {metrics.setorChave} ({metrics.setorChavePercent}%)
                  </p>
                </div>
              </div>

              {/* Destaques Estratégicos */}
              <section className="space-y-5">
                <div className="flex items-center gap-2 text-primary">
                  <TrendingUp className="h-5 w-5" />
                  <h4 className="text-xs font-black uppercase tracking-[0.2em]">
                    Destaques Estratégicos
                  </h4>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: `Concentração na ${metrics.setorChave}`,
                      content: `Absorve ${formatBRL(
                        metrics.porEstrutura[metrics.setorChave],
                      )}. Padrão de investimento prioritário no município para o ano de ${metrics.ano}.`,
                      icon: <Activity className="h-4 w-4" />,
                    }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="h-10 w-10 shrink-0 rounded-xl bg-muted border border-border flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors font-bold text-sm">
                        {item.icon}
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-sm text-foreground">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Síntese Final */}
              {/* <div className="p-6 rounded-2xl bg-foreground text-background shadow-lg">
                <p className="text-xs font-bold uppercase tracking-widest mb-2 opacity-70 italic">
                  Síntese do Cenário
                </p>
                <p className="text-sm font-medium leading-relaxed">
                  O cenário revela alto volume de recursos com baixíssima
                  diversificação, reforçando a centralidade da Saúde na agenda
                  de investimentos para o município.
                </p>
              </div> */}
            </div>

            {/* Footer Modal */}
            <div className="p-6 border-t border-border bg-muted/20 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-2.5 text-sm font-bold bg-foreground text-background hover:opacity-90 rounded-xl transition-all shadow-md active:scale-95"
              >
                Concluir Leitura
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
