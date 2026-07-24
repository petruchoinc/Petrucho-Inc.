import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { Music, Type, Video, Image as ImageIcon } from 'lucide-react';
import { safeUrl } from '@/lib/media';

const ICONS = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  text: Type,
};

const ASPECTS = ['aspect-[4/3]', 'aspect-[3/4]', 'aspect-square', 'aspect-[16/10]', 'aspect-[4/5]'];

export default function PortfolioCard({ item, index = 0 }) {
  const Icon = ICONS[item.media_type] || ImageIcon;

  return (
    <Link
      to={`/artifact/${item.id}`}
      className="group mb-4 block break-inside-avoid border border-[color:var(--pi-ink)] bg-[color:var(--pi-bg)] transition-all duration-300 hover:shadow-[6px_6px_0_0_var(--pi-ink)]"
    >
      <div className="relative overflow-hidden">
        {item.media_type === 'image' && item.media_url && (
          <div className={`pi-skew-img overflow-hidden ${ASPECTS[index % ASPECTS.length]}`}>
            <Image
              src={safeUrl(item.media_url)}
              className="h-full w-full object-cover"
              fittingType="fill"
              alt={item.title}
            />
          </div>
        )}
        {item.media_type === 'video' && item.media_url && (
          <video src={item.media_url} muted className="pi-skew-img w-full" />
        )}
        {item.media_type === 'audio' && (
          <div className="flex aspect-square items-center justify-center bg-[color:var(--pi-ink)] text-[color:var(--pi-bg)]">
            <Music className="h-10 w-10" />
          </div>
        )}
        {item.media_type === 'text' && (
          <div className="line-clamp-6 bg-[color:var(--pi-ink)] p-4 font-mono text-xs text-[color:var(--pi-bg)]">
            {item.text_content || item.description}
          </div>
        )}
        {!item.media_url && item.media_type !== 'text' && item.media_type !== 'audio' && (
          <div className="flex aspect-[4/3] items-center justify-center text-[color:var(--pi-ghost)]">
            <Icon className="h-8 w-8" />
          </div>
        )}
        <div className="absolute left-0 top-0 m-2 flex items-center gap-1 bg-[color:var(--pi-bg)] px-2 py-1">
          <Icon className="h-3 w-3" />
          <span className="pi-mono-label">{item.media_type}</span>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-display text-lg font-bold leading-tight">{item.title}</h3>
        {item.category && (
          <p className="pi-mono-label mt-1 text-[color:var(--pi-ghost)]">{item.category}</p>
        )}
      </div>
    </Link>
  );
}