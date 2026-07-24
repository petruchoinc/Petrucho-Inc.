import { useState } from 'react';
import { localStore } from '@/api/localStoreClient';
import { X, Loader2 } from 'lucide-react';

export default function EmployeeForm({ employee, onClose, onSaved }) {
  const editing = !!employee;
  const [form, setForm] = useState({
    name: employee?.name || '',
    position: employee?.position || '',
    slogan: employee?.slogan || '',
    photo_url: employee?.photo_url || '',
    link_url: employee?.link_url || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        position: form.position.trim(),
        slogan: form.slogan.trim(),
        photo_url: form.photo_url.trim(),
        link_url: form.link_url.trim(),
      };
      if (editing) {
        await localStore.entities.Employee.update(employee.id, payload);
      } else {
        await localStore.entities.Employee.create(payload);
      }
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err?.response?.data?.error || 'Не удалось сохранить.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form onSubmit={submit} className="relative w-full max-w-md border border-[color:var(--pi-ink)] bg-[color:var(--pi-bg)] p-6">
        <button type="button" onClick={onClose} className="absolute right-3 top-3">
          <X className="h-5 w-5" />
        </button>
        <h3 className="pi-display mb-4 text-2xl">{editing ? 'Изменить сотрудника' : 'Новый сотрудник'}</h3>
        <div className="flex flex-col gap-3">
          <input value={form.name} onChange={set('name')} placeholder="Имя" required className="border border-[color:var(--pi-ink)] bg-transparent px-3 py-2 font-mono text-sm" />
          <input value={form.position} onChange={set('position')} placeholder="Должность" required className="border border-[color:var(--pi-ink)] bg-transparent px-3 py-2 font-mono text-sm" />
          <textarea value={form.slogan} onChange={set('slogan')} placeholder="Лозунг / описание" rows={3} className="border border-[color:var(--pi-ink)] bg-transparent px-3 py-2 font-mono text-sm" />
          <input value={form.photo_url} onChange={set('photo_url')} placeholder="URL фото" className="border border-[color:var(--pi-ink)] bg-transparent px-3 py-2 font-mono text-sm" />
          <input value={form.link_url} onChange={set('link_url')} placeholder="Ссылка (URL)" className="border border-[color:var(--pi-ink)] bg-transparent px-3 py-2 font-mono text-sm" />
        </div>
        {error && <p className="pi-mono-label mt-3 text-[color:var(--pi-ink)]">{error}</p>}
        <button type="submit" disabled={saving} className="pi-mono-label mt-5 flex w-full items-center justify-center gap-2 border border-[color:var(--pi-ink)] bg-[color:var(--pi-ink)] px-4 py-3 text-[color:var(--pi-bg)] disabled:opacity-50">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? 'Сохранить' : 'Добавить'}
        </button>
      </form>
    </div>
  );
}