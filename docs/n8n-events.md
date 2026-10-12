# أحداث n8n — الطيب للكتب (المرحلة 1)

الطلب يُحفظ في `outbox_events` أولًا، ثم يرسله العامل (`POST /api/worker/outbox`
بمفتاح `OUTBOX_WORKER_KEY`) إلى n8n. كل حدث يُرسل لـ:

```
POST {N8N_WEBHOOK_BASE_URL}/{event}
X-Webhook-Secret: {N8N_WEBHOOK_SECRET}
Content-Type: application/json
```

## الغلاف (لكل حدث)

```json
{
  "event": "order.created",
  "occurred_at": "2026-10-11T18:00:00Z",
  "data": { "...": "حمولة الحدث" }
}
```

## order.created

```json
{
  "order_id": "uuid",
  "order_number": "T-1042",
  "total": 585,
  "payment_method": "cod",
  "customer": { "name": "عبد الله محمد", "phone": "01091429629" },
  "items": [
    {
      "product_id": "uuid",
      "variant_id": "uuid",
      "title": "المختصر في التفسير",
      "variant_title": "الربع",
      "unit_price": 260,
      "quantity": 2,
      "line_total": 520
    }
  ]
}
```

## waitlist.created

```json
{
  "contact": "01091429629",
  "channel": "phone",
  "category_id": "uuid | null",
  "product_id": "uuid | null",
  "variant_id": "uuid | null"
}
```

## سير عمل n8n المقترح

`Webhook (production) → IF السر صحيح → Telegram/Email + Google Sheets → Respond 200`

- أول node يتحقق من header `X-Webhook-Secret` ويرفض أي قيمة مختلفة (كود غير 200).
- العامل يعيد المحاولة بتأخير متزايد (2، 4، 8… دقيقة حتى 180) ويتوقف بعد 10 محاولات
  بحالة `failed` — يمكن إعادة الإرسال من الداشبورد (زر «إعادة إرسال المعلّق»).
- جدولة الاستدعاء من n8نفسها: Schedule Trigger كل دقيقة →
  `POST https://DOMIN/api/worker/outbox` مع header `Authorization: Bearer {OUTBOX_WORKER_KEY}`.
