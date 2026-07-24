import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { localStore } from '@/api/localStoreClient';
import { useAuth } from '@/lib/AuthContext';
import { Image } from '@/components/ui/image';
import { safeUrl } from '@/lib/media';
import { ArrowUpRight, UserPlus, Loader2, Trash2, Pencil, GripVertical } from 'lucide-react';
import EmployeeForm from '@/components/staff/EmployeeForm';

export default function Staff() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formState, setFormState] = useState(null); // null | { mode: 'create' | 'edit', employee? }

  const load = () => localStore.entities.Employee.list('sort_order', 200).then(setEmployees).catch(() => {});

  useEffect(() => {
    (async () => {
      try {
        await load();
      } finally {
        setLoading(false);
      }
    })();
    const unsub = localStore.entities.Employee.subscribe(() => { load(); });
    return unsub;
  }, []);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const from = result.source.index;
    const to = result.destination.index;
    if (from === to) return;
    const next = Array.from(employees);
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setEmployees(next);
    try {
      await localStore.entities.Employee.bulkUpdate(
        next.map((emp, i) => ({ id: emp.id, sort_order: i }))
      );
    } catch {
      load();
    }
  };

  const handleDelete = async (emp) => {
    if (!confirm(`Удалить «${emp.name}»?`)) return;
    try {
      await localStore.entities.Employee.delete(emp.id);
    } catch {
      load();
    }
  };

  return (
    <section className="min-h-screen px-5 py-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col gap-4 border-b border-[color:var(--pi-ink)] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="pi-mono-label text-[color:var(--pi-ghost)]">/ коллектив</span>
            <h1 className="pi-display mt-2 text-[clamp(2.5rem,8vw,6rem)]">СОТРУДНИКИ</h1>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => setFormState({ mode: 'create' })}
                className="pi-stamp flex items-center gap-2 border border-[color:var(--pi-ink)] bg-[color:var(--pi-bg)] px-5 py-2"
              >
                <UserPlus className="h-4 w-4" />
                <span className="pi-mono-label">добавить</span>
              </button>
            )}
            <Link to="/" className="pi-mono-label border border-[color:var(--pi-ink)] px-5 py-2">
              // назад
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : employees.length === 0 ? (
          <p className="font-mono text-sm text-[color:var(--pi-ghost)]">реестр пуст — добавьте сотрудников.</p>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="staff-grid" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {employees.map((emp, index) => (
                    <Draggable
                      key={emp.id}
                      draggableId={emp.id}
                      index={index}
                      isDragDisabled={!isAdmin}
                    >
                      {(drag) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          className="group relative border border-[color:var(--pi-ink)] bg-[color:var(--pi-bg)]"
                        >
                          {emp.photo_url && (
                            <div className="aspect-[4/5] overflow-hidden bg-[color:var(--pi-ink)]">
                              <Image src={safeUrl(emp.photo_url)} alt={emp.name} className="h-full w-full" fittingType="fit" />
                            </div>
                          )}
                          {isAdmin && (
                            <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
                              <span {...drag.dragHandleProps} className="cursor-grab border border-[color:var(--pi-ink)] bg-[color:var(--pi-bg)] p-1.5 active:cursor-grabbing">
                                <GripVertical className="h-3.5 w-3.5" />
                              </span>
                              <button onClick={() => setFormState({ mode: 'edit', employee: emp })} className="border border-[color:var(--pi-ink)] bg-[color:var(--pi-bg)] p-1.5 hover:bg-[color:var(--pi-ink)] hover:text-[color:var(--pi-bg)]">
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => handleDelete(emp)} className="border border-[color:var(--pi-ink)] bg-[color:var(--pi-bg)] p-1.5 hover:bg-[color:var(--pi-ink)] hover:text-[color:var(--pi-bg)]">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                          <div className="p-5">
                            <h2 className="pi-display text-2xl leading-tight">{emp.name}</h2>
                            <p className="pi-mono-label mt-1 text-[color:var(--pi-ghost)]">{emp.position}</p>
                            {emp.slogan && <p className="mt-3 font-mono text-sm leading-relaxed">{emp.slogan}</p>}
                            {emp.link_url && (
                              <a
                                href={emp.link_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="pi-mono-label mt-5 inline-flex items-center gap-2 border border-[color:var(--pi-ink)] bg-[color:var(--pi-ink)] px-4 py-2 text-[color:var(--pi-bg)]"
                              >
                                связаться
                                <ArrowUpRight className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {formState && (
        <EmployeeForm
          employee={formState.mode === 'edit' ? formState.employee : undefined}
          onClose={() => setFormState(null)}
          onSaved={() => { load(); setFormState(null); }}
        />
      )}
    </section>
  );
}