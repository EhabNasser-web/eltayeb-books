import { Badge } from "./Badge";
import { BookCover } from "./BookCover";
import { Button } from "./Button";

export type StockState = "in_stock" | "out_of_stock";

/** بطاقة منتج — الغلاف هو البطل، والسعر والحالة بنص صريح. */
export function ProductCard({
  title,
  author,
  price,
  oldPrice,
  stock,
}: {
  title: string;
  author?: string;
  price: string;
  oldPrice?: string;
  stock: StockState;
}) {
  return (
    <article className="flex max-w-xs flex-col gap-3">
      <BookCover title={title} author={author} />
      <div>
        <h3 className="font-display text-xl leading-relaxed text-ink">{title}</h3>
        {author && <p className="text-base text-ink-soft">{author}</p>}
      </div>
      <div className="flex items-center gap-2">
        <p className="text-lg font-bold text-ink">
          {price} <span className="text-base font-normal text-ink-soft">جنيه</span>
        </p>
        {oldPrice && <p className="text-base text-muted line-through">{oldPrice} جنيه</p>}
      </div>
      <div className="flex items-center gap-2">
        {stock === "in_stock" ? (
          <Badge tone="success">متوفر</Badge>
        ) : (
          <Badge tone="error">غير متوفر حاليًا</Badge>
        )}
        <Button variant="text" size="sm" href="#">
          التفاصيل
        </Button>
      </div>
    </article>
  );
}
