/**
 * Página: Ocorrências
 * Design: Governo Digital Brasileiro — tabela com filtros de status, busca e detalhes em modal
 * Paleta: Azul institucional, status semânticos
 */

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Eye,
  ShieldAlert,
  X,
  User,
  School,
  Calendar,
  Phone,
  FileText,
} from "lucide-react";
import { ocorrencias, type Ocorrencia } from "@/lib/data";
import StatusBadge, { type StatusType } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";

const statusOptions: { value: StatusType | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pendente", label: "Pendente" },
  { value: "notificado", label: "Notificado ao CT" },
  { value: "busca_ativa", label: "Busca Ativa" },
  { value: "resolvido", label: "Resolvido" },
  { value: "violacao", label: "Violação de Direitos" },
];

interface DetalheModalProps {
  ocorrencia: Ocorrencia;
  onClose: () => void;
}

function DetalheModal({ ocorrencia: oc, onClose }: DetalheModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-card-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground">{oc.id}</span>
              <StatusBadge status={oc.status} />
            </div>
            <h2 className="text-lg font-bold text-foreground">{oc.aluno}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-accent"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <School size={15} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Escola</p>
                <p className="text-sm font-medium text-foreground">{oc.escola}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <User size={15} className="text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ano / Turma</p>
                <p className="text-sm font-medium text-foreground">{oc.ano}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                <Calendar size={15} className="text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Data do Registro</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(oc.dataRegistro + "T00:00:00").toLocaleDateString("pt-BR")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <ShieldAlert size={15} className="text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Faltas</p>
                <p className="text-sm font-medium text-foreground">{oc.faltas}</p>
              </div>
            </div>
          </div>

          {oc.responsavel && (
            <div className="pt-3 border-t border-border space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Responsável</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <User size={15} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{oc.responsavel}</p>
                  {oc.telefone && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Phone size={11} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{oc.telefone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {oc.observacoes && (
            <div className="pt-3 border-t border-border space-y-2">
              <div className="flex items-center gap-1.5">
                <FileText size={13} className="text-muted-foreground" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Observações</p>
              </div>
              <p className="text-sm text-foreground bg-accent/50 rounded-lg p-3">{oc.observacoes}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Ocorrencias() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusType | "todos">("todos");
  const [selected, setSelected] = useState<Ocorrencia | null>(null);

  const filtered = useMemo(() => {
    return ocorrencias.filter((oc) => {
      const matchesSearch =
        search === "" ||
        oc.aluno.toLowerCase().includes(search.toLowerCase()) ||
        oc.escola.toLowerCase().includes(search.toLowerCase()) ||
        oc.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "todos" || oc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Ocorrências</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filtered.length} ocorrência{filtered.length !== 1 ? "s" : ""} encontrada{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <a href="/novo-registro">
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-all duration-150 active:scale-[0.97] shadow-sm hover:shadow-md"
            style={{ background: "oklch(0.45 0.18 264)" }}
          >
            Nova Ocorrência
          </button>
        </a>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-border p-4 shadow-sm flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por aluno, escola ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusType | "todos")}
            className="pl-9 pr-8 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden animate-card-enter">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-accent/30">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aluno</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Escola</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Faltas</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Data</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground text-sm">
                    Nenhuma ocorrência encontrada com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtered.map((oc, idx) => (
                  <tr
                    key={oc.id}
                    className={cn(
                      "hover:bg-accent/30 transition-colors duration-150 animate-card-enter",
                    )}
                    style={{ animationDelay: `${idx * 30}ms` }}
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-xs text-muted-foreground">{oc.id}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="font-medium text-foreground">{oc.aluno}</p>
                        <p className="text-xs text-muted-foreground">{oc.ano}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-muted-foreground">{oc.escola}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-muted-foreground">{oc.faltas}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-muted-foreground">
                        {new Date(oc.dataRegistro + "T00:00:00").toLocaleDateString("pt-BR")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {oc.status === "violacao" && (
                          <ShieldAlert size={13} className="text-red-500" />
                        )}
                        <StatusBadge status={oc.status} showIcon={false} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setSelected(oc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <Eye size={13} />
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <DetalheModal ocorrencia={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
