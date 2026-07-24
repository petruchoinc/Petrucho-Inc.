import { useSiteTextStore } from '@/lib/SiteTextContext';
import { Pencil, Check } from 'lucide-react';

export default function EditModeToggle() {
  const { editMode, setEditMode } = useSiteTextStore();
  return (
    <button
      onClick={() => setEditMode(!editMode)}
      className="pi-glass pi-stamp fixed bottom-5 left-1/2 z-[75] flex -translate-x-1/2 items-center gap-2 px-3 py-2 transition-transform hover:translate-x-0.5 hover:translate-y-0.5"
      aria-label={editMode ? 'Завершить редактирование' : 'Редактировать текст'}
    >
      {editMode ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
      <span className="pi-mono-label">{editMode ? 'готово' : 'ред. текст'}</span>
    </button>
  );
}