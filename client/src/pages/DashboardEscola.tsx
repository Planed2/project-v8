import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { BookOpen, LogOut, AlertTriangle, Clock, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardEscola() {
  const [schoolId, setSchoolId] = useState<number | null>(null);
  const [schoolName, setSchoolName] = useState("");
  const [coordinatorName, setCoordinatorName] = useState("");
  const [coordinatorId, setCoordinatorId] = useState<number | null>(null);
  const [selectedClassroomNames, setSelectedClassroomNames] = useState<string[]>([]);
  const [, setLocation] = useLocation();

  const classroomsQuery = trpc.classroom.getBySchool.useQuery(
    { schoolId: schoolId || 0 },
    { enabled: !!schoolId }
  );

  const coordinatorQuery = trpc.coordinator.getById.useQuery(
    { id: coordinatorId || 0 },
    { enabled: !!coordinatorId }
  );

  const occurrencesQuery = trpc.occurrence.getAll.useQuery();

  useEffect(() => {
    const id = sessionStorage.getItem("schoolId");
    const name = sessionStorage.getItem("schoolName") || sessionStorage.getItem("selectedSchoolName") || "";
    const coord = sessionStorage.getItem("coordinatorName") || "";
    const coordId = sessionStorage.getItem("coordinatorId");

    // Turmas selecionadas salvas localmente (evita round-trip na sessão atual)
    const localSelected = sessionStorage.getItem("selectedClassrooms");
    if (localSelected) {
      try {
        setSelectedClassroomNames(JSON.parse(localSelected));
      } catch {
        // ignorar
      }
    }

    if (id) {
      setSchoolId(parseInt(id));
      setSchoolName(name);
      setCoordinatorName(coord);
      if (coordId) setCoordinatorId(parseInt(coordId));
    } else {
      setLocation("/");
    }
  }, [setLocation]);

  // Quando o coordenador é carregado do servidor, usar selectedClassrooms dele
  useEffect(() => {
    if (coordinatorQuery.data?.selectedClassrooms) {
      try {
        const parsed = JSON.parse(coordinatorQuery.data.selectedClassrooms);
        setSelectedClassroomNames(parsed);
        // Sincronizar sessionStorage
        sessionStorage.setItem("selectedClassrooms", coordinatorQuery.data.selectedClassrooms);
      } catch {
        // ignorar
      }
    }
  }, [coordinatorQuery.data]);

  const handleLogout = () => {
    sessionStorage.clear();
    setLocation("/");
  };

  const handleSelectClassroom = (classroomId: number, classroomName: string) => {
    sessionStorage.setItem("classroomId", classroomId.toString());
    sessionStorage.setItem("classroomName", classroomName);
    setLocation("/registro-infrequencia");
  };

  const getOccurrenceCount = (classroomId: number) => {
    if (!occurrencesQuery.data) return 0;
    return occurrencesQuery.data.filter((o) => o.classroomId === classroomId).length;
  };

  const getLastUpdate = (classroomId: number) => {
    if (!occurrencesQuery.data) return null;
    const occs = occurrencesQuery.data
      .filter((o) => o.classroomId === classroomId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return occs.length > 0 ? occs[0].createdAt : null;
  };

  if (!schoolId) return null;

  const colors = [
    "bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-purple-500",
    "bg-pink-500", "bg-rose-500", "bg-orange-500", "bg-amber-500",
    "bg-teal-500", "bg-cyan-500", "bg-green-500", "bg-emerald-500",
  ];

  // Filtrar apenas as turmas que pertencem a este coordenador
  const myClassrooms = classroomsQuery.data?.filter((c) =>
    selectedClassroomNames.length === 0 || selectedClassroomNames.includes(c.name)
  ) ?? [];

  const isLoading = classroomsQuery.isLoading || (!!coordinatorId && coordinatorQuery.isLoading);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              IF
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{schoolName || "Minha Escola"}</h1>
              <p className="text-xs text-gray-500">{coordinatorName ? `Coordenador: ${coordinatorName}` : "Dashboard"}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2 text-sm">
            <LogOut className="w-4 h-4" />
            Sair
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Minhas Turmas</h2>
          <p className="text-gray-500 text-sm mt-1">Clique em uma turma para registrar infrequências</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl border p-5 animate-pulse h-40" />
            ))}
          </div>
        ) : myClassrooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myClassrooms.map((classroom, idx) => {
              const occCount = getOccurrenceCount(classroom.id);
              const lastUpdate = getLastUpdate(classroom.id);
              const color = colors[idx % colors.length];

              return (
                <Card
                  key={classroom.id}
                  className="hover:shadow-lg transition-all cursor-pointer border-0 shadow-sm overflow-hidden group"
                  onClick={() => handleSelectClassroom(classroom.id, classroom.name)}
                >
                  <div className={cn("h-2", color)} />
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white", color)}>
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <CardTitle className="text-base font-semibold">{classroom.name}</CardTitle>
                      </div>
                      <BookOpen className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>{occCount} ocorrência{occCount !== 1 ? "s" : ""}</span>
                      </div>
                      {lastUpdate ? (
                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(lastUpdate).toLocaleDateString("pt-BR")}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Sem registros</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-medium mb-2">Nenhuma turma configurada</p>
            <p className="text-gray-400 text-sm mb-6">Configure as turmas para começar a registrar</p>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => setLocation("/selecao-turmas")}
            >
              Configurar Turmas
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
