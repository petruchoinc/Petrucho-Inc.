import { useSiteText } from '@/lib/SiteTextContext';

export default function EditableText({ id, defaultValue, as: Tag = 'span', className = '', multiline = false, style }) {
  const { value, save, editMode } = useSiteText(id, defaultValue);
  const cls = `${className} ${multiline ? 'whitespace-pre-wrap' : ''}`;

  if (!editMode) {
    return <Tag className={cls} style={style}>{value}</Tag>;
  }

  return (
    <Tag
      style={style}
      className={`${cls} cursor-text outline-dashed outline-1 outline-offset-2 outline-[color:var(--pi-ink)] focus:outline-2 focus:outline-[color:var(--pi-ink)]`}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      onBlur={(e) => {
        const v = e.currentTarget.innerText;
        if (v !== value) save(v);
      }}
    >
      {value}
    </Tag>
  );
}