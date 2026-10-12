import { Container } from "./Container";

// TODO(copy): نص الشريط يُدار من الداشبورد (content_blocks) في المرحلة 1.
export function AnnouncementBar() {
  return (
    <div className="bg-primary-deep text-paper">
      <Container>
        <p className="py-1.5 text-center text-base">التوصيل لباب البيت في كل محافظات مصر</p>
      </Container>
    </div>
  );
}
