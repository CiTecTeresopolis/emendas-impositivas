import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, Search, TableIcon } from "lucide-react";
import { Emenda, formatBRL, PARTY_COLORS } from "@/data/emendas";

interface Props {
  data: Emenda[];
}

type SortKey =
  | "parlamentar"
  | "partido"
  | "valorProposto"
  | "estrutura"
  | "programa";

export function EmendasTable({ data }: Props) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("valorProposto");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data
      .filter(
        (e) =>
          e.parlamentar.toLowerCase().includes(q) ||
          e.partido.toLowerCase().includes(q) ||
          e.estrutura.toLowerCase().includes(q) ||
          e.origem.toLowerCase().includes(q) ||
          e.objeto.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        const cmp =
          typeof valA === "number"
            ? valA - (valB as number)
            : String(valA).localeCompare(String(valB));
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [data, search, sortKey, sortDir]);

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <TableHead
      className="cursor-pointer select-none hover:text-foreground transition-colors text-[12px] font-bold uppercase tracking-wider text-muted-foreground"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <ArrowUpDown
          className={`h-3 w-3 ${sortKey === field ? "text-primary" : "text-muted-foreground/50"}`}
        />
      </div>
    </TableHead>
  );

  return (
    <div className="rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
      <div className="px-6 pt-5 pb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <TableIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Detalhamento</h3>
            <p className="text-[14px] text-muted-foreground">
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, partido, área..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-10 text-sm rounded-xl bg-muted/30 border-border focus:bg-card"
          />
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-thin max-h-[460px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <SortHeader label="Parlamentar" field="parlamentar" />
              <SortHeader label="Partido" field="partido" />
              <SortHeader label="Valor" field="valorProposto" />
              <SortHeader label="Estrutura" field="estrutura" />
              <SortHeader label="Programa" field="programa" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((e, i) => (
              <TableRow
                key={i}
                className="text-sm hover:bg-muted/20 transition-colors"
              >
                <TableCell className="font-semibold max-w-[220px] truncate py-3.5">
                  {e.parlamentar}
                </TableCell>
                <TableCell className="py-3.5">
                  <Badge
                    variant="secondary"
                    className="text-[10px] font-bold border-0 rounded-md px-2 py-0.5"
                    style={{
                      backgroundColor: `${PARTY_COLORS[e.partido] || "hsl(201,20%,46%)"}18`,
                      color: "hsl(201,20%,46%)",
                    }}
                  >
                    {e.partido}
                  </Badge>
                </TableCell>
                <TableCell className="font-bold tabular-nums py-3.5">
                  {formatBRL(e.valorProposto)}
                </TableCell>
                <TableCell className="py-3.5">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-medium rounded-md"
                  >
                    {e.estrutura}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs py-3.5">
                  {e.programa}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-12 text-sm"
                >
                  Nenhuma emenda encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
