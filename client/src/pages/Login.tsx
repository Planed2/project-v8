import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { AlertCircle, KeyRound, Shield, User, School } from "lucide-react";

type Stage =
  | "login"
  | "ativar-conta"
  | "cadastro-escola-inicial"
  | "selecao-turmas-inicial";

export default function Login() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [stage, setStage] = useState<Stage>("login");
  const [codeId, setCodeId] = useState<number | null>(null);

  // Ativação
  const [nomeCoordenador, setNomeCoordenador] = useState("");
  const [nomeEscola, setNomeEscola] = useState("");

  const [, setLocation] = useLocation();

  const loginMutation = trpc.auth.loginWithCode.useMutation();
  const activateMutation = trpc.access.activateCoordinator.useMutation();

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!code.trim()) {
      setError("Digite um código de acesso");
      return;
    }

    try {
      const result = await loginMutation.mutateAsync({ code });

      if (result.accessType === "sec") {
        sessionStorage.setItem("accessType", "sec");
        sessionStorage.setItem("codeId", result.codeId.toString());
        setLocation("/painel-administrativo");
        return;
      }

      // Coordenador
      sessionStorage.setItem("accessType", "coordenador");
      sessionStorage.setItem("codeId", result.codeId.toString());
      setCodeId(result.codeId);

      if (!result.usado) {
        // Primeira vez — precisa ativar conta
        setStage("ativar-conta");
      } else {
        // Já ativou — entrar direto
        if (result.schoolId) sessionStorage.setItem("schoolId", result.schoolId.toString());
        if (result.coordinatorId) sessionStorage.setItem("coordinatorId", result.coordinatorId.toString());
        if (result.nome) sessionStorage.setItem("coordinatorName", result.nome);
        setLocation("/dashboard-escola");
      }
    } catch (err: any) {
      setError(err.message || "Código inválido");
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nomeCoordenador.trim()) { setError("Digite seu nome completo"); return; }
    if (!nomeEscola.trim()) { setError("Digite o nome da escola"); return; }
    if (!codeId) return;

    try {
      const result = await activateMutation.mutateAsync({
        codeId,
        nome: nomeCoordenador.trim(),
        schoolName: nomeEscola.trim(),
      });

      sessionStorage.setItem("schoolId", result.schoolId.toString());
      sessionStorage.setItem("schoolName", result.schoolName);
      sessionStorage.setItem("coordinatorId", result.coordinatorId.toString());
      sessionStorage.setItem("coordinatorName", result.coordinatorName);
      sessionStorage.setItem("usedClassrooms", JSON.stringify(result.usedClassrooms || []));

      // Ir para seleção de turmas
      setLocation("/selecao-turmas");
    } catch (err: any) {
      setError(err.message || "Erro ao ativar conta");
    }
  };

  // ─── Tela de Ativação ─────────────────────────────────────────────────────
  if (stage === "ativar-conta") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
                IF
              </div>
            </div>
            <CardTitle className="text-2xl">Ativação da Conta</CardTitle>
            <CardDescription>Bem-vindo! Preencha seus dados para ativar o acesso.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleActivate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Nome Completo
                </label>
                <Input
                  type="text"
                  placeholder="Seu nome completo"
                  value={nomeCoordenador}
                  onChange={(e) => setNomeCoordenador(e.target.value)}
                  disabled={activateMutation.isPending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <School className="inline w-4 h-4 mr-1" />
                  Nome da Escola
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Escola Municipal João XXIII"
                  value={nomeEscola}
                  onChange={(e) => setNomeEscola(e.target.value)}
                  disabled={activateMutation.isPending}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={activateMutation.isPending}
              >
                {activateMutation.isPending ? "Ativando..." : "Ativar Conta"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => { setStage("login"); setError(""); }}
              >
                Voltar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Tela de Login ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold">
              IF
            </div>
          </div>
          <CardTitle className="text-2xl">Infrequência Escolar</CardTitle>
          <CardDescription>Rede Municipal de Juiz de Fora</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                <KeyRound className="inline w-4 h-4 mr-1" />
                Código de Acesso
              </label>
              <Input
                id="code"
                type="text"
                placeholder="Digite seu código"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full"
                disabled={loginMutation.isPending}
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Verificando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 text-sm font-medium mb-2">
              <Shield className="w-4 h-4" />
              Sistema de Acesso por Código
            </div>
            <p className="text-xs text-gray-600">
              Utilize o código de acesso fornecido pela Secretaria de Educação para entrar no sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
