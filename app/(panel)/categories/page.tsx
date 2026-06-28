"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type ApiCategory,
  type CreateCategoryBody,
  type UpdateCategoryBody,
} from "@/src/lib/api";

const PRESET_COLORS = [
  "#0051d5", "#ba1a1a", "#006d3c", "#6b48ff",
  "#c25a00", "#007a70", "#8b44ac", "#b5006c",
  "#4a6500", "#006493", "#795548", "#546e7a",
];

interface FormState {
  name: string;
  description: string;
  color: string;
}
const EMPTY_FORM: FormState = { name: "", description: "", color: PRESET_COLORS[0] };

function CategoryForm({
  form,
  setForm,
  error,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  error: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5">
          Nome <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Ex: Eletrônicos"
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary transition"
        />
      </div>
      <div>
        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1.5">
          Descrição
        </label>
        <textarea
          rows={2}
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Descrição opcional..."
          className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-secondary transition resize-none"
        />
      </div>
      <div>
        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-2">
          Cor da Categoria
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setForm((f) => ({ ...f, color: c }))}
              className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer"
              style={{
                backgroundColor: c,
                borderColor: form.color === c ? "#fff" : "transparent",
                outline: form.color === c ? `2px solid ${c}` : "none",
                outlineOffset: "2px",
              }}
              title={c}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
            style={{ backgroundColor: form.color }}
          />
          <input
            type="text"
            value={form.color}
            onChange={(e) => {
              const v = e.target.value;
              if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setForm((f) => ({ ...f, color: v }));
            }}
            placeholder="#RRGGBB"
            maxLength={7}
            className="w-28 bg-surface-container-low border border-outline-variant rounded-lg px-2.5 py-1.5 text-body-md font-data-tabular text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary transition"
          />
          <span className="text-label-sm text-on-surface-variant">hex</span>
        </div>
      </div>
      {error && (
        <p className="text-error font-label-sm text-label-sm flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </p>
      )}
    </div>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);
  const [createError, setCreateError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [editTarget, setEditTarget] = useState<ApiCategory | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [editError, setEditError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ApiCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Falha ao carregar categorias.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const openCreate = () => {
    setCreateForm(EMPTY_FORM);
    setCreateError("");
    setIsCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) { setCreateError("O nome é obrigatório."); return; }
    setIsSaving(true);
    setCreateError("");
    try {
      const body: CreateCategoryBody = {
        name: createForm.name.trim(),
        ...(createForm.description.trim() ? { description: createForm.description.trim() } : {}),
        color: createForm.color,
      };
      const created = await createCategory(body);
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setIsCreateOpen(false);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Erro ao criar categoria.");
    } finally {
      setIsSaving(false);
    }
  };

  const openEdit = (cat: ApiCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTarget(cat);
    setEditForm({ name: cat.name, description: cat.description ?? "", color: cat.color ?? PRESET_COLORS[0] });
    setEditError("");
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    if (!editForm.name.trim()) { setEditError("O nome é obrigatório."); return; }
    setIsEditing(true);
    setEditError("");
    try {
      const body: UpdateCategoryBody = {
        name: editForm.name.trim(),
        description: editForm.description.trim() || undefined,
        color: editForm.color,
      };
      const updated = await updateCategory(editTarget.id, body);
      setCategories((prev) =>
        prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      setEditTarget(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Erro ao atualizar.");
    } finally {
      setIsEditing(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteCategory(deleteTarget.id);
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao remover.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-container-max mx-auto flex flex-col gap-section-gap">
      {/* Header */}
      <div className="flex justify-between items-end border-b border-outline-variant pb-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm mb-2">
            <span className="material-symbols-outlined text-[16px]">category</span>
            <span>Configurações</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-on-surface">Categorias</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface">Gerenciar Categorias</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadCategories}
            className="p-2 rounded-DEFAULT border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
            title="Atualizar"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
          <button
            onClick={openCreate}
            className="px-4 py-2.5 rounded-DEFAULT bg-secondary text-on-secondary font-label-sm text-label-sm hover:bg-opacity-90 transition-colors flex items-center gap-2 shadow-sm font-semibold cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nova Categoria
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex justify-between items-center gap-4 bg-surface-container-lowest border border-outline-variant p-4 rounded-xl shadow-sm">
        <div className="relative w-full max-w-md focus-within:ring-2 focus-within:ring-secondary rounded-DEFAULT">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
          <input
            className="w-full bg-surface-container-low border-none rounded-DEFAULT py-2 pl-9 pr-4 text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none"
            placeholder="Filtrar por nome ou descrição..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-label-sm text-on-surface-variant font-medium whitespace-nowrap">
          {isLoading ? "Carregando..." : `${filtered.length} de ${categories.length} categorias`}
        </div>
      </div>

      {/* Error */}
      {loadError && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container border border-error/20 flex items-center gap-3">
          <span className="material-symbols-outlined text-error text-[24px]">error</span>
          <div>
            <p className="font-label-sm font-semibold">Falha ao carregar categorias</p>
            <p className="font-body-md text-sm">{loadError}</p>
          </div>
          <button
            onClick={loadCategories}
            className="ml-auto px-3 py-1.5 rounded-lg border border-error text-error font-label-sm text-label-sm hover:bg-error hover:text-on-error transition-colors cursor-pointer"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-secondary text-[48px] animate-spin">progress_activity</span>
            <p className="font-body-md text-on-surface-variant">Carregando categorias...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-outline-variant text-[48px]">category</span>
            <p className="font-headline-md text-on-surface font-semibold">Nenhuma categoria encontrada</p>
            <p className="font-body-md text-on-surface-variant max-w-sm">
              {searchTerm ? "Nenhuma categoria com esse filtro." : "Comece criando a primeira categoria."}
            </p>
            {!searchTerm && (
              <button
                onClick={openCreate}
                className="mt-2 px-4 py-2 rounded-DEFAULT bg-secondary text-on-secondary font-label-sm text-label-sm hover:opacity-90 transition-all font-semibold cursor-pointer"
              >
                Nova Categoria
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant text-on-surface font-label-sm text-label-sm">
                  <th className="p-4 font-semibold">Categoria</th>
                  <th className="p-4 font-semibold">Descrição</th>
                  <th className="p-4 font-semibold text-center">Produtos</th>
                  <th className="p-4 font-semibold">Criada em</th>
                  <th className="p-4 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((cat) => (
                  <tr key={cat.id} className="border-b border-outline-variant/60 hover:bg-surface-container-low transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-black/10"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span
                          className="px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                          style={{
                            backgroundColor: cat.color + "22",
                            color: cat.color,
                            borderColor: cat.color + "44",
                          }}
                        >
                          {cat.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-on-surface-variant text-sm max-w-xs truncate">
                      {cat.description ?? <span className="italic opacity-50">—</span>}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container text-on-surface-variant border border-outline-variant/50 font-data-tabular">
                        {cat._count?.products ?? 0}
                      </span>
                    </td>
                    <td className="p-4 font-data-tabular text-on-surface-variant text-sm">
                      {new Intl.DateTimeFormat("pt-BR").format(new Date(cat.createdAt))}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={(e) => openEdit(cat, e)}
                          className="p-1.5 rounded hover:bg-surface-container-high text-secondary hover:text-on-secondary-fixed-variant transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="p-1.5 rounded hover:bg-error-container text-outline hover:text-error transition-colors cursor-pointer"
                          title="Remover"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 max-w-md w-full shadow-2xl flex flex-col gap-5 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Nova Categoria</h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>
            <CategoryForm form={createForm} setForm={setCreateForm} error={createError} />
            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => setIsCreateOpen(false)} disabled={isSaving} className="px-4 py-2 rounded-lg border border-outline text-on-surface-variant font-label-sm hover:bg-surface-container-low transition-colors cursor-pointer disabled:opacity-60">
                Cancelar
              </button>
              <button onClick={handleCreate} disabled={isSaving} className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-label-sm font-semibold hover:opacity-90 transition-colors cursor-pointer disabled:opacity-75 flex items-center gap-2">
                {isSaving && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                Criar Categoria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 max-w-md w-full shadow-2xl flex flex-col gap-5 animate-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Editar Categoria</h3>
              <button onClick={() => setEditTarget(null)} className="p-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>
            <CategoryForm form={editForm} setForm={setEditForm} error={editError} />
            <div className="flex justify-end gap-3 pt-1">
              <button onClick={() => setEditTarget(null)} disabled={isEditing} className="px-4 py-2 rounded-lg border border-outline text-on-surface-variant font-label-sm hover:bg-surface-container-low transition-colors cursor-pointer disabled:opacity-60">
                Cancelar
              </button>
              <button onClick={handleEdit} disabled={isEditing} className="px-4 py-2 rounded-lg bg-secondary text-on-secondary font-label-sm font-semibold hover:opacity-90 transition-colors cursor-pointer disabled:opacity-75 flex items-center gap-2">
                {isEditing && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 animate-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-error">
              <span className="material-symbols-outlined text-[32px]">warning</span>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Confirmar Exclusão</h3>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Tem certeza que deseja remover a categoria{" "}
              <span className="font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: deleteTarget.color + "22", color: deleteTarget.color }}>
                {deleteTarget.name}
              </span>
              ? Os produtos vinculados ficarão sem categoria. Essa ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3 mt-2">
              <button onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="px-4 py-2 rounded-lg border border-outline text-on-surface-variant font-label-sm hover:bg-surface-container-low transition-colors cursor-pointer disabled:opacity-60">
                Cancelar
              </button>
              <button onClick={confirmDelete} disabled={isDeleting} className="px-4 py-2 rounded-lg bg-error text-on-error font-label-sm font-semibold hover:opacity-95 transition-colors cursor-pointer disabled:opacity-75 flex items-center gap-2">
                {isDeleting && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                Remover Categoria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
