import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  LogOut, BarChart3, AlertTriangle, Bell, ShieldAlert,
  Plus, Key, Copy, Check, Lock, Unlock, Trash2, Users,
  School, Shield, RefreshCw, Download, X, GraduationCap,
  User, Calendar, FileText, Search, Clock, History, TableIcon
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MONTH_NAMES: Record<string, string> = {
  january: "Janeiro", february: "Fevereiro", march: "Março",
  april: "Abril", may: "Maio", june: "Junho",
  july: "Julho", august: "Agosto", september: "Setembro",
  october: "Outubro", november: "Novembro", december: "Dezembro",
};

type InfrequencyType = "5_consecutive" | "10_alternated";
type EnrichedOccurrence = {
  id: number; classroomId: number; studentName: string;
  infrequencyType: InfrequencyType; month: string;
  violationOfRights: boolean; createdAt: string;
  classroomName: string; schoolName: string; schoolId: number;
  coordinatorName?: string;
};

// ─── Helpers de exportação ────────────────────────────────────────────────────

function gerarComunicacaoTxt(occ: EnrichedOccurrence): void {
  const hoje = new Date().toLocaleDateString("pt-BR");
  const tipoLabel = occ.infrequencyType === "5_consecutive" ? "5 faltas consecutivas" : "10 faltas alternadas";
  const mesLabel = MONTH_NAMES[occ.month] || occ.month;
  const linhas = [
    "COMUNICAÇÃO AO CONSELHO TUTELAR",
    `Secretaria Municipal de Educação — Juiz de Fora`,
    "────────────────────────────────────────────",
    `Data: ${hoje}`,
    "",
    `Estudante: ${occ.studentName}`,
    `Série/Turma: ${occ.classroomName}`,
    `Escola: ${occ.schoolName}`,
    ...(occ.coordinatorName ? [`Coordenador(a): ${occ.coordinatorName}`] : []),
    "",
    `Tipo de infrequência: ${tipoLabel}`,
    `Mês de referência: ${mesLabel}`,
    "",
    ...(occ.violationOfRights ? ["⚠ ATENÇÃO: Suspeita ou confirmação de violação de direitos identificada.", ""] : []),
    "Este documento é gerado pelo Sistema de Infrequência Escolar.",
    "____________________________",
    "Coordenação Pedagógica",
  ];
  const blob = new Blob([linhas.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `comunicacao_${occ.studentName.replace(/\s+/g, "_").toLowerCase()}_${occ.month}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("Comunicação gerada!");
}

function exportarCSV(occs: EnrichedOccurrence[], mes?: string): void {
  const header = ["Aluno","Turma","Escola","Coordenador","Tipo Infrequência","Mês","Violação Direitos","Data Registro"];
  const rows = occs.map((o) => [
    o.studentName,
    o.classroomName,
    o.schoolName,
    o.coordinatorName || "",
    o.infrequencyType === "5_consecutive" ? "5 faltas consecutivas" : "10 faltas alternadas",
    MONTH_NAMES[o.month] || o.month,
    o.violationOfRights ? "Sim" : "Não",
    new Date(o.createdAt).toLocaleDateString("pt-BR"),
  ]);
  const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ocorrencias${mes ? `_${mes}` : ""}_${new Date().toISOString().slice(0,10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("Planilha CSV exportada!");
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function MetricCard({ label, value, sublabel, icon, iconBg }: {
  label: string; value: number; sublabel: string; icon: React.ReactNode; iconBg: string;
}) {
  return (
    <div className="bg-white rounded-xl border p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", iconBg)}>{icon}</div>
      </div>
      <div>
        <span className="text-3xl font-bold text-foreground">{value}</span>
        <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="ml-2 p-1 rounded hover:bg-gray-100 transition text-gray-400 hover:text-gray-700">
      {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function OccurrenceDetailModal({ occ, onClose }: { occ: EnrichedOccurrence | null; onClose: () => void }) {
  if (!occ) return null;
  const tipoLabel = occ.infrequencyType === "5_consecutive" ? "5 faltas consecutivas" : "10 faltas alternadas";
  const mesLabel = MONTH_NAMES[occ.month] || occ.month;
  return (
    <Dialog open={!!occ} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="w-5 h-5 text-blue-600" />Detalhes da Ocorrência
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Aluno</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{occ.studentName}</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <GraduationCap className="w-4 h-4 text-indigo-500" />, label: "Turma", value: occ.classroomName },
              { icon: <School className="w-4 h-4 text-green-600" />, label: "Escola", value: occ.schoolName },
              { icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, label: "Tipo", value: tipoLabel },
              { icon: <Calendar className="w-4 h-4 text-blue-500" />, label: "Mês", value: mesLabel },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1">{item.icon}<span className="text-xs text-gray-500">{item.label}</span></div>
                <p className="font-medium text-gray-900 text-sm">{item.value}</p>
              </div>
            ))}
          </div>
          {occ.violationOfRights && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span className="font-medium">Suspeita ou confirmação de violação de direitos</span>
            </div>
          )}
          {occ.coordinatorName && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-3.5 h-3.5" />Registrado por: <strong>{occ.coordinatorName}</strong>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            Registrado em {new Date(occ.createdAt).toLocaleDateString("pt-BR")} às {new Date(occ.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}><X className="w-4 h-4 mr-1" />Fechar</Button>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => gerarComunicacaoTxt(occ)}>
            <Download className="w-4 h-4 mr-1" />Gerar Comunicação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function PainelAdministrativo() {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [newCodeTipo, setNewCodeTipo] = useState<"sec" | "coordenador">("coordenador");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [selectedOcc, setSelectedOcc] = useState<EnrichedOccurrence | null>(null);
  const [searchOcc, setSearchOcc] = useState("");
  const [searchSchool, setSearchSchool] = useState("");
  const [searchCoord, setSearchCoord] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [historyCodeId, setHistoryCodeId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [, setLocation] = useLocation();

  const schoolsQuery = trpc.school.getAll.useQuery();
  const occurrencesQuery = trpc.occurrence.getAllEnriched.useQuery();
  const accessCodesQuery = trpc.access.getAll.useQuery();
  const loginHistoryQuery = trpc.access.getLoginHistory.useQuery(
    { codeId: historyCodeId ?? undefined },
    { enabled: historyCodeId !== null }
  );

  const generateCodeMutation = trpc.access.generateCode.useMutation();
  const blockMutation = trpc.access.block.useMutation();
  const unblockMutation = trpc.access.unblock.useMutation();
  const deleteMutation = trpc.access.delete.useMutation();

  const handleLogout = () => { sessionStorage.clear(); setLocation("/"); };

  // Ocorrências filtradas
  const filteredOccurrences = useMemo(() => {
    let list = (occurrencesQuery.data as EnrichedOccurrence[] | undefined) || [];
    if (selectedMonth !== "all") list = list.filter((o) => o.month === selectedMonth);
    if (searchOcc.trim()) {
      const q = searchOcc.toLowerCase();
      list = list.filter((o) =>
        o.studentName.toLowerCase().includes(q) ||
        o.schoolName.toLowerCase().includes(q) ||
        o.classroomName.toLowerCase().includes(q) ||
        (o.coordinatorName || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [occurrencesQuery.data, selectedMonth, searchOcc]);

  const stats = {
    totalSchools: schoolsQuery.data?.length || 0,
    totalOccurrences: filteredOccurrences.length,
    violationCases: filteredOccurrences.filter((o) => o.violationOfRights).length,
    consecutiveCases: filteredOccurrences.filter((o) => o.infrequencyType === "5_consecutive").length,
  };

  const filteredSchools = useMemo(() => {
    const list = schoolsQuery.data || [];
    if (!searchSchool.trim()) return list;
    return list.filter((s) => s.name.toLowerCase().includes(searchSchool.toLowerCase()));
  }, [schoolsQuery.data, searchSchool]);

  const coordenadores = useMemo(() => {
    const list = accessCodesQuery.data?.filter((c) => c.tipo === "coordenador") || [];
    if (!searchCoord.trim()) return list;
    const q = searchCoord.toLowerCase();
    return list.filter((c) =>
      (c.nome || "").toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      (schoolsQuery.data?.find((s) => s.id === c.schoolId)?.name || "").toLowerCase().includes(q)
    );
  }, [accessCodesQuery.data, schoolsQuery.data, searchCoord]);

  const filteredCodes = useMemo(() => {
    const list = accessCodesQuery.data || [];
    if (!searchCode.trim()) return list;
    const q = searchCode.toLowerCase();
    return list.filter((c) =>
      c.code.toLowerCase().includes(q) ||
      (c.nome || "").toLowerCase().includes(q) ||
      c.tipo.toLowerCase().includes(q)
    );
  }, [accessCodesQuery.data, searchCode]);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const result = await generateCodeMutation.mutateAsync({ tipo: newCodeTipo });
      setGeneratedCode(result?.code || null);
      accessCodesQuery.refetch();
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar código");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleBlock = async (id: number) => {
    await blockMutation.mutateAsync({ id });
    accessCodesQuery.refetch();
    toast.success("Código bloqueado");
  };

  const handleUnblock = async (id: number) => {
    await unblockMutation.mutateAsync({ id });
    accessCodesQuery.refetch();
    toast.success("Código reativado");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync({ id: deleteTarget });
    setDeleteTarget(null);
    accessCodesQuery.refetch();
    toast.success("Acesso excluído");
  };

  const OccurrenceCard = ({ occ }: { occ: EnrichedOccurrence }) => (
    <div
      className="border rounded-lg p-4 hover:bg-blue-50 hover:border-blue-300 transition cursor-pointer group"
      onClick={() => setSelectedOcc(occ)}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-800 group-hover:text-blue-700">{occ.studentName}</h3>
          <p className="text-sm text-gray-500">{occ.classroomName} · {occ.schoolName} · {MONTH_NAMES[occ.month]}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={occ.infrequencyType === "5_consecutive" ? "pendente" : "notificado"} />
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
        <span>{occ.infrequencyType === "5_consecutive" ? "5 Faltas Consecutivas" : "10 Faltas Alternadas"}</span>
        {occ.violationOfRights && (
          <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
            <ShieldAlert className="w-3.5 h-3.5" />Violação de Direitos
          </span>
        )}
        {occ.coordinatorName && <span className="text-xs text-gray-400">Coord.: {occ.coordinatorName}</span>}
      </div>
      <p className="text-xs text-blue-500 mt-2 opacity-0 group-hover:opacity-100 transition">
        Clique para detalhes e gerar comunicação →
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <OccurrenceDetailModal occ={selectedOcc} onClose={() => setSelectedOcc(null)} />

      {/* Modal confirmação exclusão */}
      <Dialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />Excluir Acesso
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-700 py-2">
            Tem certeza que deseja excluir este código de acesso? O coordenador perderá o acesso imediatamente.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}><X className="w-4 h-4 mr-1" />Cancelar</Button>
            <Button variant="destructive" onClick={handleDelete}><Trash2 className="w-4 h-4 mr-1" />Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal histórico de login */}
      <Dialog open={historyCodeId !== null} onOpenChange={() => setHistoryCodeId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />Histórico de Acesso
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto space-y-2 mt-2">
            {loginHistoryQuery.isLoading ? (
              <p className="text-center text-gray-400 py-4">Carregando...</p>
            ) : (loginHistoryQuery.data?.length || 0) === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Nenhum acesso registrado ainda</p>
            ) : (
              loginHistoryQuery.data?.map((h) => (
                <div key={h.id} className="flex items-center justify-between border rounded-lg p-3 text-sm">
                  <div>
                    <p className="font-medium text-gray-800">{h.coordinatorName || "—"}</p>
                    <p className="text-xs text-gray-500">{h.schoolName || "—"}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {new Date(h.loggedAt).toLocaleDateString("pt-BR")} {new Date(h.loggedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryCodeId(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">IF</div>
            <div>
              <h1 className="text-xl font-bold text-blue-600">Painel Administrativo</h1>
              <p className="text-xs text-gray-500">Secretaria de Educação — Juiz de Fora</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2 text-sm">
            <LogOut className="w-4 h-4" />Sair
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="dashboard" className="gap-2"><BarChart3 className="w-4 h-4" />Painel Geral</TabsTrigger>
            <TabsTrigger value="escolas" className="gap-2"><School className="w-4 h-4" />Escolas</TabsTrigger>
            <TabsTrigger value="coordenadores" className="gap-2"><Users className="w-4 h-4" />Coordenadores</TabsTrigger>
            <TabsTrigger value="ocorrencias" className="gap-2"><AlertTriangle className="w-4 h-4" />Ocorrências</TabsTrigger>
            <TabsTrigger value="acessos" className="gap-2"><Key className="w-4 h-4" />Acessos</TabsTrigger>
          </TabsList>

          {/* ─── ABA: Dashboard ─────────────────────────────────────────── */}
          <TabsContent value="dashboard">
            <div className="mb-6 flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os meses</SelectItem>
                    {Object.entries(MONTH_NAMES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => exportarCSV(filteredOccurrences, selectedMonth !== "all" ? selectedMonth : undefined)}
                disabled={filteredOccurrences.length === 0}
              >
                <TableIcon className="w-4 h-4" />Exportar CSV
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard label="Escolas" value={stats.totalSchools} sublabel="Cadastradas"
                icon={<BarChart3 className="w-5 h-5 text-blue-600" />} iconBg="bg-blue-100" />
              <MetricCard label="Ocorrências" value={stats.totalOccurrences}
                sublabel={selectedMonth !== "all" ? `em ${MONTH_NAMES[selectedMonth]}` : "No período"}
                icon={<AlertTriangle className="w-5 h-5 text-amber-600" />} iconBg="bg-amber-100" />
              <MetricCard label="Casos Críticos" value={stats.consecutiveCases} sublabel="5 faltas consecutivas"
                icon={<ShieldAlert className="w-5 h-5 text-red-600" />} iconBg="bg-red-100" />
              <MetricCard label="Violações" value={stats.violationCases} sublabel="Direitos violados"
                icon={<Bell className="w-5 h-5 text-red-600" />} iconBg="bg-red-100" />
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle>Ocorrências Recentes</CardTitle>
                    <CardDescription>Clique para ver detalhes e gerar comunicação ao Conselho Tutelar</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredOccurrences.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredOccurrences.slice(0, 10).map((occ) => <OccurrenceCard key={occ.id} occ={occ} />)}
                    {filteredOccurrences.length > 10 && (
                      <p className="text-center text-sm text-gray-400 pt-2">
                        +{filteredOccurrences.length - 10} ocorrência(s). Veja todas na aba <strong>Ocorrências</strong>.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    Nenhuma ocorrência no período selecionado
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── ABA: Escolas ──────────────────────────────────────────── */}
          <TabsContent value="escolas">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle>Escolas Cadastradas</CardTitle>
                    <CardDescription>{filteredSchools.length} de {schoolsQuery.data?.length || 0} escola(s)</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      className="pl-9 h-9"
                      placeholder="Buscar escola..."
                      value={searchSchool}
                      onChange={(e) => setSearchSchool(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredSchools.length > 0 ? (
                  <div className="space-y-2">
                    {filteredSchools.map((school) => {
                      const occCount = (occurrencesQuery.data as EnrichedOccurrence[] | undefined)?.filter(o => o.schoolId === school.id).length || 0;
                      return (
                        <div key={school.id} className="flex items-center justify-between border rounded-lg p-3 hover:bg-gray-50 transition">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <School className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{school.name}</p>
                              <p className="text-xs text-gray-500">Cadastrada em {new Date(school.createdAt).toLocaleDateString("pt-BR")}</p>
                            </div>
                          </div>
                          {occCount > 0 && (
                            <Badge className="bg-amber-100 text-amber-700 text-xs">
                              {occCount} ocorrência{occCount !== 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    {searchSchool ? "Nenhuma escola encontrada" : "Nenhuma escola cadastrada"}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── ABA: Coordenadores ─────────────────────────────────────── */}
          <TabsContent value="coordenadores">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <CardTitle>Coordenadores</CardTitle>
                    <CardDescription>{coordenadores.length} coordenador(es) no sistema</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      className="pl-9 h-9"
                      placeholder="Buscar por nome, escola..."
                      value={searchCoord}
                      onChange={(e) => setSearchCoord(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {coordenadores.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="py-3 px-2 font-semibold text-gray-600">Nome</th>
                          <th className="py-3 px-2 font-semibold text-gray-600">Código</th>
                          <th className="py-3 px-2 font-semibold text-gray-600">Escola</th>
                          <th className="py-3 px-2 font-semibold text-gray-600">Status</th>
                          <th className="py-3 px-2 font-semibold text-gray-600">Último Acesso</th>
                          <th className="py-3 px-2 font-semibold text-gray-600">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {coordenadores.map((coord) => {
                          const escola = schoolsQuery.data?.find((s) => s.id === coord.schoolId);
                          return (
                            <tr key={coord.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-600">
                                    {(coord.nome || "?")[0].toUpperCase()}
                                  </div>
                                  {coord.nome || <span className="text-gray-400 italic">Não ativado</span>}
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{coord.code}</code>
                                <CopyButton text={coord.code} />
                              </td>
                              <td className="py-3 px-2 text-gray-600">{escola?.name || "—"}</td>
                              <td className="py-3 px-2">
                                {coord.bloqueado ? (
                                  <Badge variant="destructive" className="text-xs">Bloqueado</Badge>
                                ) : coord.usado ? (
                                  <Badge className="bg-green-100 text-green-700 text-xs">Ativo</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs">Aguardando</Badge>
                                )}
                              </td>
                              <td className="py-3 px-2 text-gray-500 text-xs">
                                {coord.lastLoginAt
                                  ? new Date(coord.lastLoginAt).toLocaleDateString("pt-BR") + " " + new Date(coord.lastLoginAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                                  : "Nunca acessou"}
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setHistoryCodeId(coord.id)}
                                    className="p-1.5 rounded hover:bg-blue-50 text-blue-500"
                                    title="Ver histórico de acessos"
                                  >
                                    <History className="w-4 h-4" />
                                  </button>
                                  {coord.bloqueado ? (
                                    <button onClick={() => handleUnblock(coord.id)} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Reativar">
                                      <Unlock className="w-4 h-4" />
                                    </button>
                                  ) : (
                                    <button onClick={() => handleBlock(coord.id)} className="p-1.5 rounded hover:bg-amber-50 text-amber-600" title="Bloquear">
                                      <Lock className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button onClick={() => setDeleteTarget(coord.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Excluir">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    {searchCoord ? "Nenhum coordenador encontrado" : "Nenhum coordenador cadastrado"}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── ABA: Ocorrências ──────────────────────────────────────── */}
          <TabsContent value="ocorrencias">
            <div className="mb-4 flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os meses</SelectItem>
                    {Object.entries(MONTH_NAMES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  className="pl-9"
                  placeholder="Buscar por aluno, escola, turma..."
                  value={searchOcc}
                  onChange={(e) => setSearchOcc(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => exportarCSV(filteredOccurrences, selectedMonth !== "all" ? selectedMonth : undefined)}
                disabled={filteredOccurrences.length === 0}
              >
                <TableIcon className="w-4 h-4" />Exportar CSV
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Todas as Ocorrências</CardTitle>
                <CardDescription>
                  {filteredOccurrences.length} ocorrência(s) · Clique para detalhes e gerar comunicação
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredOccurrences.length > 0 ? (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {filteredOccurrences.map((occ) => <OccurrenceCard key={occ.id} occ={occ} />)}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    {searchOcc ? "Nenhuma ocorrência encontrada para essa busca" : "Nenhuma ocorrência no período selecionado"}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── ABA: Acessos ──────────────────────────────────────────── */}
          <TabsContent value="acessos">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Key className="w-5 h-5 text-blue-600" />Gerar Novo Código</CardTitle>
                  <CardDescription>Crie um código único para dar acesso a um coordenador ou à SEC</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Usuário</label>
                      <Select value={newCodeTipo} onValueChange={(v) => setNewCodeTipo(v as "sec" | "coordenador")}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="coordenador">
                            <div className="flex items-center gap-2"><Users className="w-4 h-4 text-indigo-500" />Coordenador Escolar</div>
                          </SelectItem>
                          <SelectItem value="sec">
                            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-blue-600" />Administrador SEC</div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 gap-2" onClick={handleGenerateCode} disabled={isGenerating}>
                      {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Gerar Código
                    </Button>
                  </div>
                  {generatedCode && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium mb-2 flex items-center gap-2">
                        <Check className="w-4 h-4" />Código gerado com sucesso!
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="text-2xl font-mono font-bold text-green-800 bg-white px-4 py-2 rounded-lg border border-green-200">
                          {generatedCode}
                        </code>
                        <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(generatedCode); toast.success("Código copiado!"); }}>
                          <Copy className="w-4 h-4 mr-1" />Copiar
                        </Button>
                      </div>
                      <p className="text-xs text-green-700 mt-2">Compartilhe este código com o coordenador. Ele será usado uma vez para ativar a conta.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <CardTitle>Todos os Códigos</CardTitle>
                      <CardDescription>{filteredCodes.length} de {accessCodesQuery.data?.length || 0} código(s)</CardDescription>
                    </div>
                    <div className="relative w-56">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        className="pl-9 h-9"
                        placeholder="Buscar código ou nome..."
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredCodes.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left">
                            <th className="py-3 px-2 font-semibold text-gray-600">Código</th>
                            <th className="py-3 px-2 font-semibold text-gray-600">Tipo</th>
                            <th className="py-3 px-2 font-semibold text-gray-600">Nome</th>
                            <th className="py-3 px-2 font-semibold text-gray-600">Status</th>
                            <th className="py-3 px-2 font-semibold text-gray-600">Último Acesso</th>
                            <th className="py-3 px-2 font-semibold text-gray-600">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCodes.map((ac) => (
                            <tr key={ac.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-2">
                                <div className="flex items-center">
                                  <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono font-bold">{ac.code}</code>
                                  <CopyButton text={ac.code} />
                                </div>
                              </td>
                              <td className="py-3 px-2">
                                {ac.tipo === "sec" ? (
                                  <Badge className="bg-blue-100 text-blue-700 text-xs gap-1"><Shield className="w-3 h-3" />SEC</Badge>
                                ) : (
                                  <Badge className="bg-indigo-100 text-indigo-700 text-xs gap-1"><Users className="w-3 h-3" />Coordenador</Badge>
                                )}
                              </td>
                              <td className="py-3 px-2 text-gray-700">{ac.nome || <span className="text-gray-400 italic text-xs">Não ativado</span>}</td>
                              <td className="py-3 px-2">
                                {ac.bloqueado ? (
                                  <Badge variant="destructive" className="text-xs">Bloqueado</Badge>
                                ) : ac.usado ? (
                                  <Badge className="bg-green-100 text-green-700 text-xs">Ativo</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-200">Aguardando</Badge>
                                )}
                              </td>
                              <td className="py-3 px-2 text-gray-500 text-xs">
                                {ac.lastLoginAt
                                  ? new Date(ac.lastLoginAt).toLocaleDateString("pt-BR") + " " + new Date(ac.lastLoginAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                                  : "—"}
                              </td>
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => setHistoryCodeId(ac.id)}
                                    className="p-1.5 rounded hover:bg-blue-50 text-blue-500"
                                    title="Histórico de acessos"
                                  >
                                    <History className="w-4 h-4" />
                                  </button>
                                  {ac.bloqueado ? (
                                    <button onClick={() => handleUnblock(ac.id)} className="p-1.5 rounded hover:bg-green-50 text-green-600" title="Reativar"><Unlock className="w-4 h-4" /></button>
                                  ) : (
                                    <button onClick={() => handleBlock(ac.id)} className="p-1.5 rounded hover:bg-amber-50 text-amber-600" title="Bloquear"><Lock className="w-4 h-4" /></button>
                                  )}
                                  <button onClick={() => setDeleteTarget(ac.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Key className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="font-medium">{searchCode ? "Nenhum código encontrado" : "Nenhum código gerado ainda"}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
