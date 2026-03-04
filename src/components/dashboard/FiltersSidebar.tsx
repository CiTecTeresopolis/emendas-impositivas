import { useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { RotateCcw, Filter, Download, SlidersHorizontal } from "lucide-react";
import { emendasData, formatBRLCompact } from "@/data/emendas";

export interface Filters {
  partidos: string[];
  parlamentares: string[];
  valorRange: [number, number];
}

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  onExportCSV: () => void;
}

export function FiltersSidebar({ filters, onChange, onExportCSV }: Props) {
  const allPartidos = useMemo(() => [...new Set(emendasData.map((e) => e.partido))].sort(), []);
  const allParlamentares = useMemo(() => [...new Set(emendasData.map((e) => e.parlamentar))].sort(), []);
  const maxValue = useMemo(() => Math.max(...emendasData.map((e) => e.valorProposto)), []);

  const activeCount = filters.partidos.length + filters.parlamentares.length +
    (filters.valorRange[0] > 0 || filters.valorRange[1] < maxValue ? 1 : 0);

  const togglePartido = (p: string) => {
    const next = filters.partidos.includes(p)
      ? filters.partidos.filter((x) => x !== p)
      : [...filters.partidos, p];
    onChange({ ...filters, partidos: next });
  };

  const toggleParlamentar = (p: string) => {
    const next = filters.parlamentares.includes(p)
      ? filters.parlamentares.filter((x) => x !== p)
      : [...filters.parlamentares, p];
    onChange({ ...filters, parlamentares: next });
  };

  const reset = () => onChange({ partidos: [], parlamentares: [], valorRange: [0, maxValue] });

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Filtros</h2>
            {activeCount > 0 && (
              <p className="text-[10px] text-primary font-semibold">{activeCount} ativo{activeCount > 1 ? "s" : ""}</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={reset} className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground">
          <RotateCcw className="h-3 w-3 mr-1" /> Limpar
        </Button>
      </div>

      <Separator />

      {/* Partidos */}
      <div className="space-y-2.5">
        <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          Partido
        </Label>
        <ScrollArea className="h-40">
          <div className="space-y-0.5 pr-3">
            {allPartidos.map((p) => {
              const isActive = filters.partidos.includes(p);
              return (
                <label
                  key={p}
                  className={`flex items-center gap-2.5 cursor-pointer rounded-lg px-2.5 py-2 text-[13px] transition-all ${
                    isActive
                      ? "bg-primary/8 text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Checkbox
                    checked={isActive}
                    onCheckedChange={() => togglePartido(p)}
                    className="h-4 w-4 rounded border-2"
                  />
                  {p}
                </label>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Parlamentares */}
      <div className="space-y-2.5">
        <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          Parlamentar
        </Label>
        <ScrollArea className="h-48">
          <div className="space-y-0.5 pr-3">
            {allParlamentares.map((p) => {
              const isActive = filters.parlamentares.includes(p);
              return (
                <label
                  key={p}
                  className={`flex items-center gap-2.5 cursor-pointer rounded-lg px-2.5 py-2 text-[13px] transition-all ${
                    isActive
                      ? "bg-primary/8 text-foreground font-medium"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  }`}
                >
                  <Checkbox
                    checked={isActive}
                    onCheckedChange={() => toggleParlamentar(p)}
                    className="h-4 w-4 rounded border-2 shrink-0"
                  />
                  <span className="truncate">{p}</span>
                </label>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      <Separator />

      {/* Valor Range */}
      <div className="space-y-3">
        <Label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          Faixa de Valor
        </Label>
        <div className="bg-muted/40 rounded-xl p-4">
          <Slider
            min={0}
            max={maxValue}
            step={10000}
            value={filters.valorRange}
            onValueChange={(v) => onChange({ ...filters, valorRange: v as [number, number] })}
            className="py-1"
          />
          <div className="flex justify-between text-[11px] font-semibold text-muted-foreground mt-2">
            <span>{formatBRLCompact(filters.valorRange[0])}</span>
            <span>{formatBRLCompact(filters.valorRange[1])}</span>
          </div>
        </div>
      </div>

      {/* Export */}
      <Button
        size="sm"
        className="w-full text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-10"
        onClick={onExportCSV}
      >
        <Download className="h-3.5 w-3.5 mr-2" /> Exportar CSV
      </Button>
    </div>
  );
}
