import { useState } from 'react';
import { localStore } from '@/api/localStoreClient';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash2, Upload } from 'lucide-react';

const EMPTY = {
  title: '',
  description: '',
  category: 'archive',
  media_type: 'image',
  media_url: '',
  text_content: '',
  external_links: [],
};

const TYPES = [
  { value: 'image', label: 'Изображение' },
  { value: 'video', label: 'Видео' },
  { value: 'audio', label: 'Аудио' },
  { value: 'text', label: 'Текст' },
];

export default function ArtifactForm({ editing, onSaved, onCancel }) {
  const { toast } = useToast();
  const [form, setForm] = useState(() => ({
    ...EMPTY,
    ...(editing || {}),
    external_links: editing?.external_links || [],
  }));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await localStore.integrations.Core.UploadFile({ file });
      set('media_url', file_url);
      toast({ title: 'Файл загружен' });
    } catch {
      toast({ title: 'Ошибка загрузки', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const addLink = () =>
    setForm((f) => ({ ...f, external_links: [...f.external_links, { label: '', url: '' }] }));
  const setLink = (i, k, v) =>
    setForm((f) => ({
      ...f,
      external_links: f.external_links.map((l, idx) => (idx === i ? { ...l, [k]: v } : l)),
    }));
  const removeLink = (i) =>
    setForm((f) => ({ ...f, external_links: f.external_links.filter((_, idx) => idx !== i) }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      toast({ title: 'Укажите заголовок', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        external_links: (form.external_links || []).filter((l) => l.url),
      };
      if (editing?.id) {
        await localStore.entities.PortfolioItem.update(editing.id, payload);
        toast({ title: 'Артефакт обновлён' });
      } else {
        await localStore.entities.PortfolioItem.create(payload);
        toast({ title: 'Артефакт создан' });
      }
      onSaved();
    } catch (err) {
      toast({ title: 'Ошибка', description: String(err), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5 border border-[color:var(--pi-ink)] p-5">
      <div className="flex items-center justify-between border-b border-[color:var(--pi-ink)] pb-3">
        <span className="pi-mono-label">{editing?.id ? 'редактировать' : 'новый артефакт'}</span>
        {onCancel && (
          <button type="button" onClick={onCancel} className="pi-mono-label text-[color:var(--pi-ghost)]">
            отмена
          </button>
        )}
      </div>

      <div>
        <label className="pi-mono-label mb-1 block text-[color:var(--pi-ghost)]">заголовок *</label>
        <input
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          className="w-full border border-[color:var(--pi-ink)] bg-transparent px-3 py-2 font-mono text-sm outline-none"
        />
      </div>

      <div>
        <label className="pi-mono-label mb-1 block text-[color:var(--pi-ghost)]">категория</label>
        <input
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
          className="w-full border border-[color:var(--pi-ink)] bg-transparent px-3 py-2 font-mono text-sm outline-none"
        />
      </div>

      <div>
        <label className="pi-mono-label mb-1 block text-[color:var(--pi-ghost)]">тип медиа</label>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => set('media_type', t.value)}
              className={`pi-mono-label border border-[color:var(--pi-ink)] px-3 py-1.5 transition-colors ${
                form.media_type === t.value
                  ? 'bg-[color:var(--pi-ink)] text-[color:var(--pi-bg)]'
                  : 'hover:bg-[color:var(--pi-ink)]/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {form.media_type !== 'text' && (
        <div>
          <label className="pi-mono-label mb-1 block text-[color:var(--pi-ghost)]">файл</label>
          <div className="flex items-center gap-2">
            <label className="pi-stamp flex cursor-pointer items-center gap-2 border border-[color:var(--pi-ink)] px-3 py-2 transition-transform hover:translate-x-0.5 hover:translate-y-0.5">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              <span className="pi-mono-label">загрузить</span>
              <input type="file" onChange={onFile} className="hidden" />
            </label>
            {form.media_url && (
              <span className="truncate font-mono text-xs text-[color:var(--pi-ghost)]">
                готово
              </span>
            )}
          </div>
          <input
            value={form.media_url}
            onChange={(e) => set('media_url', e.target.value)}
            placeholder="или вставьте ссылку"
            className="mt-2 w-full border border-[color:var(--pi-ink)] bg-transparent px-3 py-2 font-mono text-xs outline-none placeholder:text-[color:var(--pi-ghost)]"
          />
        </div>
      )}

      <div>
        <label className="pi-mono-label mb-1 block text-[color:var(--pi-ghost)]">описание</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          className="w-full resize-none border border-[color:var(--pi-ink)] bg-transparent px-3 py-2 font-mono text-sm outline-none"
        />
      </div>

      {form.media_type === 'text' && (
        <div>
          <label className="pi-mono-label mb-1 block text-[color:var(--pi-ghost)]">текст</label>
          <textarea
            value={form.text_content}
            onChange={(e) => set('text_content', e.target.value)}
            rows={6}
            className="w-full resize-none border border-[color:var(--pi-ink)] bg-transparent px-3 py-2 font-mono text-sm outline-none"
          />
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="pi-mono-label text-[color:var(--pi-ghost)]">ссылки на ресурсы</label>
          <button type="button" onClick={addLink} className="pi-mono-label flex items-center gap-1">
            <Plus className="h-3.5 w-3.5" /> добавить
          </button>
        </div>
        <div className="space-y-2">
          {(form.external_links || []).map((l, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={l.label}
                onChange={(e) => setLink(i, 'label', e.target.value)}
                placeholder="метка"
                className="w-1/3 border border-[color:var(--pi-ink)] bg-transparent px-2 py-1.5 font-mono text-xs outline-none placeholder:text-[color:var(--pi-ghost)]"
              />
              <input
                value={l.url}
                onChange={(e) => setLink(i, 'url', e.target.value)}
                placeholder="https://"
                className="w-full border border-[color:var(--pi-ink)] bg-transparent px-2 py-1.5 font-mono text-xs outline-none placeholder:text-[color:var(--pi-ghost)]"
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="border border-[color:var(--pi-ink)] px-2"
                aria-label="Удалить ссылку"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="pi-stamp flex w-full items-center justify-center gap-2 border border-[color:var(--pi-ink)] bg-[color:var(--pi-ink)] py-3 text-[color:var(--pi-bg)] transition-opacity hover:opacity-80 disabled:opacity-50"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        <span className="pi-mono-label">{editing?.id ? 'сохранить' : 'добавить в реестр'}</span>
      </button>
    </form>
  );
}