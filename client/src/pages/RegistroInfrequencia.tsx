import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Trash2, ShieldAlert, Plus, User, Pencil, AlertTriangle, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MONTHS = [
  { value: "january", label: "Janeiro" }, { value: "february", label: "Fevereiro" },
  { value: "march", label: "Março" }, { value: "april", label: "Abril" },
  { value: "may", label: "Maio" }, { value: "june", label: "Junho" },
  { value: "july", label: "Julho" }, { value: "august", label: "Agosto" },
  { value: "september", label: "Setembro" }, { value: "october", label: "Outubro" },
  { value: "november", label: "Novembro" }, { value: "december", label: "Dezembro" },
];
const CURRENT_MONTH = new Date().toLocaleString("en-US", { month: "long" }).toLowerCase() as any;

type InfrequencyType = "5_consecutive" | "10_alternated";
type Occ = {
  id: number;
  studentName: string;
  infrequencyType: InfrequencyType;
  month: string;
  violationOfRights: boolean;
  createdAt: string;
};

export default function RegistroInfrequencia() {
  const [classroomId, setClassroomId] = useState<number | null>(null);
  const [classroomName, setClassroomName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [infrequencyType, setInfrequencyType] = useState<InfrequencyType>("5_consecutive");
  const [month, setMonth] = useState<string>(CURRENT_MONTH || "january");
  const [violationOfRights, setViolationOfRights] = useState(false);
  const [, setLocation] = useLocation();

  // Confirmação de exclusão
  const [deleteTarget, setDeleteTarget] = useState<Occ | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Confirmação de registro
  const [confirmRegisterOpen, setConfirmRegisterOpen] = useState(false);

  // Edição
  const [editTarget, setEditTarget] = useState<Occ | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<InfrequencyType>("5_consecutive");
  const [editMonth, setEditMonth] = useState("january");
  const [editViolation, setEditViolation] = useState(false);

  const createOccurrenceMutation = trpc.occurrence.create.useMutation();
  const occurrencesQuery = trpc.occurrence.getByClassroom.useQuery(
    { classroomId: classroomId || 0 },
    { enabled: !!classroomId }
  );
  const deleteOccurrenceMutation = trpc.occurrence.delete.useMutation();
  const updateOccurrenceMutation = trpc.occurrence.update.useMutation();

  useEffect(() => {
    const id = sessionStorage.getItem("classroomId");
    const name = sessionStorage.getItem("classroomName") || "";
    if (id) {
      setClassroomId(parseInt(id));
      setClassroomName(name);
    } else {
      setLocation("/dashboard-escola");
    }
  }, [setLocation]);

  const handleRegisterConfirm = async () => {
    if (!classroomId || !studentName.trim()) return;
    setConfirmRegisterOpen(false);
    try {
      await createOccurrenceMutation.mutateAsync({
        classroomId,
        studentName: studentName.trim(),
        infrequencyType,
        month: month as any,
        violationOfRights,
      });
      setStudentName("");
      setViolationOfRights(false);
      occurrencesQuery.refetch();
      toast.success("Ocorrência registrada com sucesso");
    } catch (err: any) {
      toast.error(err.message || "Erro ao registrar ocorrência");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setConfirmDeleteOpen(false);
    try {
      await deleteOccurrenceMutation.mutateAsync({ id: deleteTarget.id });
      occurrencesQuery.refetch();
      toast.success("Ocorrência excluída");
      setDeleteTarget(null);
    } catch {
      toast.error("Erro ao excluir ocorrência");
    }
  };

  const openEdit = (occ: Occ) => {
    setEditTarget(occ);
    setEditName(occ.studentName);
    setEditType(occ.infrequencyType);
    setEditMonth(occ.month);
    setEditViolation(occ.violationOfRights);
    setEditOpen(true);
  };

  const handleEditSave = async () => {
    if (!editTarget) return;
    try {
      await updateOccurrenceMutation.mutateAsync({
        id: editTarget.id,
        studentName: editName.trim(),
        infrequencyType: editType,
        month: editMonth as any,
        violationOfRights: editViolation,
      });
      occurrencesQuery.refetch();
      setEditOpen(false);
      setEditTarget(null);
      toast.success("Ocorrência atualizada");
    } catch {
      toast.error("Erro ao atualizar ocorrência");
    }
  };

  if (!classroomId) return null;
  const monthLabel = MONTHS.find((m) => m.value === month)?.label;
  const occs: Occ[] = (occurrencesQuery.data as any[]) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard-escola")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-blue-600">Registro de Infrequência</h1>
            <p className="text-sm text-gray-500">{classroomName || `Turma #${classroomId}`}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Formulário */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" /> Nova Ocorrência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="inline w-3.5 h-3.5 mr-1" />Nome do Aluno
              </label>
              <Input
                placeholder="Nome completo do aluno"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                disabled={createOccurrenceMutation.isPending}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && studentName.trim()) setConfirmRegisterOpen(true);
                }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Infrequência</label>
                <Select value={infrequencyType} onValueChange={(v) => setInfrequencyType(v as InfrequencyType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5_consecutive">5 faltas consecutivas</SelectItem>
                    <SelectItem value="10_alternated">10 faltas alternadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mês de Referência</label>
                <Select value={month} onValueChange={setMonth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-red-50 transition"
              onClick={() => setViolationOfRights(!violationOfRights)}
            >
              <Checkbox
                checked={violationOfRights}
                onCheckedChange={(v) => setViolationOfRights(!!v)}
                id="violation"
              />
              <div>
                <label htmlFor="violation" className="text-sm font-medium cursor-pointer flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                  Violação de direitos suspeita ou confirmada
                </label>
                <p className="text-xs text-gray-500">Marque se houver suspeita ou confirmação de violação</p>
              </div>
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={!studentName.trim() || createOccurrenceMutation.isPending}
              onClick={() => setConfirmRegisterOpen(true)}
            >
              {createOccurrenceMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Registrando...</>
                : <><Plus className="w-4 h-4 mr-2" />Registrar Ocorrência</>
              }
            </Button>
          </CardContent>
        </Card>

        {/* Lista */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Ocorrências Registradas
              {occs.length > 0 && (
                <Badge variant="secondary" className="ml-2">{occs.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {occurrencesQuery.isLoading ? (
              <div className="text-center py-8 text-gray-400">Carregando...</div>
            ) : occs.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Nenhuma ocorrência registrada nesta turma
              </div>
            ) : (
              <div className="space-y-2">
                {occs.map((occ) => (
                  <div
                    key={occ.id}
                    className={`flex items-center justify-between p-3 rounded-lg border text-sm ${
                      occ.violationOfRights ? "bg-red-50 border-red-200" : "bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{occ.studentName}</p>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <span className="text-xs text-gray-500">
                            {occ.infrequencyType === "5_consecutive" ? "5 faltas consec." : "10 faltas altern."}
                          </span>
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-500">{MONTHS.find(m => m.value === occ.month)?.label}</span>
                          {occ.violationOfRights && (
                            <Badge variant="destructive" className="text-xs px-1 py-0">
                              <ShieldAlert className="w-2.5 h-2.5 mr-1" />Violação
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-blue-600"
                        onClick={() => openEdit(occ)}
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-400 hover:text-red-600"
                        onClick={() => { setDeleteTarget(occ); setConfirmDeleteOpen(true); }}
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal: Confirmar Registro */}
      <Dialog open={confirmRegisterOpen} onOpenChange={setConfirmRegisterOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Confirmar Registro
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm text-gray-700 py-2">
            <p>Deseja registrar a ocorrência a seguir?</p>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1 border">
              <p><span className="font-medium">Aluno:</span> {studentName}</p>
              <p><span className="font-medium">Tipo:</span> {infrequencyType === "5_consecutive" ? "5 faltas consecutivas" : "10 faltas alternadas"}</p>
              <p><span className="font-medium">Mês:</span> {monthLabel}</p>
              {violationOfRights && (
                <p className="text-red-600 font-medium flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />Violação de direitos marcada
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmRegisterOpen(false)}>
              <X className="w-4 h-4 mr-1" />Cancelar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleRegisterConfirm}>
              <Check className="w-4 h-4 mr-1" />Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Confirmar Exclusão */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="w-5 h-5" />
              Excluir Ocorrência
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-700 py-2">
            <p>Tem certeza que deseja excluir a ocorrência de <strong>{deleteTarget?.studentName}</strong>?</p>
            <p className="text-gray-500 text-xs mt-1">Esta ação não pode ser desfeita.</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              <X className="w-4 h-4 mr-1" />Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              <Trash2 className="w-4 h-4 mr-1" />Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar Ocorrência */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-blue-600" />
              Editar Ocorrência
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Aluno</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <Select value={editType} onValueChange={(v) => setEditType(v as InfrequencyType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5_consecutive">5 consec.</SelectItem>
                    <SelectItem value="10_alternated">10 altern.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                <Select value={editMonth} onValueChange={setEditMonth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div
              className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-red-50 transition"
              onClick={() => setEditViolation(!editViolation)}
            >
              <Checkbox checked={editViolation} onCheckedChange={(v) => setEditViolation(!!v)} />
              <label className="text-sm cursor-pointer flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                Violação de direitos
              </label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              <X className="w-4 h-4 mr-1" />Cancelar
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleEditSave}
              disabled={!editName.trim() || updateOccurrenceMutation.isPending}
            >
              {updateOccurrenceMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Salvando...</>
                : <><Check className="w-4 h-4 mr-1" />Salvar</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
