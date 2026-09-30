"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/src/components/PageHeader";
import Badge from "@/src/components/Badge";
import LoadingState from "@/src/components/LoadingState";
import ErrorState from "@/src/components/ErrorState";
import {
  getUserById,
  updateUser,
  parseJwt,
  type ApiUser,
  type UpdateUserBody,
} from "@/src/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Action feedback states
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadUserData = async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
    const token = localStorage.getItem("API_TOKEN");
    if (!token) {
      router.push("/");
      return;
    }

    const decoded = parseJwt(token);
    if (!decoded || !decoded.sub) {
      router.push("/");
      return;
    }

    try {
      const data = await getUserById(decoded.sub);
      setUser(data);
      setName(data.name);
      setEmail(data.email);
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
      setError(
        err instanceof Error ? err.message : "Falha ao carregar perfil do usuário.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setFormError("");
    setSuccessMessage("");

    if (!name.trim()) {
      setFormError("O nome é obrigatório.");
      return;
    }

    if (!email.trim()) {
      setFormError("O e-mail é obrigatório.");
      return;
    }

    if (password && password.length < 6) {
      setFormError("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password && password !== confirmPassword) {
      setFormError("As senhas não coincidem.");
      return;
    }

    setIsSaving(true);

    try {
      const body: UpdateUserBody = {
        name: name.trim(),
        email: email.trim(),
        ...(password ? { password } : {}),
      };

      const updated = await updateUser(user.id, body);
      setUser(updated);
      setName(updated.name);
      setEmail(updated.email);
      setPassword("");
      setConfirmPassword("");
      setSuccessMessage("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      setFormError(
        err instanceof Error
          ? err.message
          : "Erro ao atualizar dados do usuário.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return (parts[0]?.[0] || "U").toUpperCase();
  };

  return (
    <div className="max-w-container-max mx-auto flex flex-col gap-section-gap">
      <PageHeader
        title="Perfil do Usuário"
        description="Visualize e gerencie as informações da sua conta"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
          { label: "Perfil de Usuário", icon: "person" },
        ]}
      />

      {isLoading ? (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 shadow-sm">
          <LoadingState message="Carregando informações do usuário..." />
        </div>
      ) : error ? (
        <ErrorState
          title="Erro ao carregar usuário"
          message={error}
          onRetry={loadUserData}
        />
      ) : user ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Resumo do Perfil */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col items-center text-center">
              {/* Avatar com Iniciais */}
              <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-2xl shadow-md mb-4 border-2 border-outline-variant">
                {getInitials(user.name)}
              </div>

              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-1">
                {user.name}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4">
                {user.email}
              </p>

              <div className="flex items-center gap-2 mb-6">
                <Badge
                  label={user.role === "ADMIN" ? "Administrador" : "Vendedor"}
                  color={user.role === "ADMIN" ? "#0051d5" : "#006d3c"}
                />
                <Badge
                  label={user.isActive ? "Ativo" : "Inativo"}
                  variant={user.isActive ? "success" : "danger"}
                />
              </div>

              <div className="w-full border-t border-outline-variant/60 pt-4 flex flex-col gap-3 text-left font-body-md text-sm">
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>ID da Conta:</span>
                  <span className="font-data-tabular font-mono text-xs text-on-surface truncate max-w-[140px]" title={user.id}>
                    {user.id}
                  </span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Nível de Acesso:</span>
                  <span className="font-semibold text-on-surface">
                    {user.role}
                  </span>
                </div>
                <div className="flex justify-between items-center text-on-surface-variant">
                  <span>Status do Cadastro:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {user.isActive ? "Ativo no Sistema" : "Suspenso"}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Informativo de Permissões */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
              <h4 className="font-label-lg font-semibold text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[20px]">
                  verified_user
                </span>
                Permissões da Conta
              </h4>
              <ul className="text-body-md text-sm text-on-surface-variant space-y-2">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-[18px] mt-0.5">
                    check_circle
                  </span>
                  <span>Acesso ao painel de inventário e vendas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-emerald-500 text-[18px] mt-0.5">
                    check_circle
                  </span>
                  <span>Gerenciamento de estoque e precificação</span>
                </li>
                {user.role === "ADMIN" && (
                  <li className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-emerald-500 text-[18px] mt-0.5">
                      check_circle
                    </span>
                    <span>Permissões administrativas completas e relatórios</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Formulário de Edição */}
          <div className="lg:col-span-2">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[24px]">
                  manage_accounts
                </span>
                Editar Informações da Conta
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                Atualize seus dados pessoais e credenciais de acesso abaixo.
              </p>

              {successMessage && (
                <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-body-md text-sm flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">
                    check_circle
                  </span>
                  <span>{successMessage}</span>
                </div>
              )}

              {formError && (
                <div className="mb-6 p-4 rounded-lg bg-error-container/20 border border-error/30 text-error font-body-md text-sm flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[20px]">
                    error
                  </span>
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5">
                      Nome Completo <span className="text-error">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3.5 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary transition"
                    />
                  </div>

                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5">
                      Endereço de E-mail <span className="text-error">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3.5 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary transition"
                    />
                  </div>
                </div>

                <hr className="my-2 border-outline-variant/60" />

                <div>
                  <h4 className="font-label-lg font-semibold text-on-surface mb-1">
                    Alterar Senha
                  </h4>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">
                    Deixe os campos abaixo em branco caso não deseje alterar sua senha atual.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3.5 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary transition"
                      />
                    </div>

                    <div>
                      <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5">
                        Confirmar Nova Senha
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a nova senha"
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3.5 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/60 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (user) {
                        setName(user.name);
                        setEmail(user.email);
                        setPassword("");
                        setConfirmPassword("");
                        setFormError("");
                        setSuccessMessage("");
                      }
                    }}
                    disabled={isSaving}
                    className="px-4 py-2.5 rounded-lg border border-outline text-on-surface-variant font-label-sm hover:bg-surface-container-low transition-colors cursor-pointer disabled:opacity-60"
                  >
                    Restaurar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-lg bg-slate-900 text-white font-label-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-75 flex items-center gap-2"
                  >
                    {isSaving && (
                      <span className="material-symbols-outlined text-[18px] animate-spin">
                        progress_activity
                      </span>
                    )}
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
