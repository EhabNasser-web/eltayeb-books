import { LeafDivider } from "./Ornaments";
import { Prose } from "./Prose";

/** حالة فارغة صادقة — تُعرض قبل الربط أو عند غياب البيانات. */
export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="max-w-xl">
      <LeafDivider className="mb-6 max-w-xs" />
      <Prose>
        <p className="font-display text-2xl text-ink">{title}</p>
        <p className="text-ink-soft">{body}</p>
      </Prose>
    </div>
  );
}
