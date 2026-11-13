import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const num = z.number().finite();
const obj = z.record(z.string(), z.unknown());
const base = { hospital: z.string().min(1).max(10) };
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const schemas = {
  vitals: z.object({ ...base, day: date, revenue: num, returns: num, surgeries: obj.optional(), emergency: obj.optional(), beds: obj.optional(), attendance: obj.optional(), electricity: obj.optional() }),
  cashbox: z.object({ ...base, day: date, cash: num, wallets: num, cheques: num, insurance: num, deferred: num, pledges: obj.optional() }),
  returns: z.object({ ...base, items: z.array(z.object({ external_ref: z.string().max(100), kind: z.string().max(100), amount: num, quantity: z.number().int().optional(), reason: z.string().max(500).optional() })).max(500) }),
  expenses: z.object({ ...base, items: z.array(z.object({ external_ref: z.string().max(100), period: z.enum(["daily", "monthly", "yearly"]), category: z.string().max(100), item: z.string().max(200), amount: num, invoice_no: z.string().max(100).optional(), spent_on: date, details: obj.optional() })).max(1000) }),
  attendance: z.object({ ...base, items: z.array(z.object({ employee_code: z.string().max(50), employee_name: z.string().max(200), job_title: z.string().max(100).optional(), day: date, shift: z.enum(["day", "night"]), check_in: z.string().nullable().optional(), check_out: z.string().nullable().optional(), status: z.enum(["present", "late", "absent", "leave"]), late_minutes: z.number().int().optional() })).max(2000) }),
  notifications: z.object({ ...base, items: z.array(z.object({ external_ref: z.string().min(1).max(100), source: z.enum(['staff','gov']), kind: z.string().min(1).max(100), body: z.string().min(1).max(4000), sender: z.string().max(200).optional(), remind_at: z.string().datetime().nullable().optional() })).max(500) }),
} as const;

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export const Route = createFileRoute("/api/public/sync/$kind")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const key = process.env['SYNC_API_KEY'];
        const got = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
        if (!key || !safeEqual(got, key)) return new Response("Unauthorized", { status: 401 });

        const kind = params.kind as keyof typeof schemas;
        const schema = schemas[kind];
        if (!schema) return new Response("Unknown endpoint", { status: 404 });

        const parsed = schema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: parsed.error.flatten() }, { status: 400 });

        const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
        const { hospital, ...data } = parsed.data as any;
        const { data: h } = await db.from("hospitals").select("id").eq("code", hospital).maybeSingle();
        if (!h) return Response.json({ error: "unknown hospital" }, { status: 404 });
        const hid = h.id;
        const stamp = new Date().toISOString();

        let error;
        if (kind === "vitals") ({ error } = await db.from("hospital_vitals").upsert({ hospital_id: hid, ...data, updated_at: stamp }, { onConflict: "hospital_id,day" }));
        else if (kind === "cashbox") ({ error } = await db.from("cashbox_records").upsert({ hospital_id: hid, ...data, updated_at: stamp }, { onConflict: "hospital_id,day" }));
        else {
          const table = { returns: "revenue_returns", expenses: "expenses", attendance: "staff_attendance", notifications: 'notifications' }[kind] as "revenue_returns" | "expenses" | "staff_attendance" | 'notifications';
          const conflict = kind === "attendance" ? "hospital_id,employee_code,day,shift" : "hospital_id,external_ref";
          ({ error } = await db.from(table).upsert(data.items.map((i: any) => ({ hospital_id: hid, ...i })), { onConflict: conflict, ignoreDuplicates: kind === "returns" || kind === 'notifications' }));
        }
        if (error) return Response.json({ error: error.message }, { status: 500 });
        await db.from("hospitals").update({ last_sync_at: stamp }).eq("id", hid);
        return Response.json({ ok: true });
      },
    },
  },
});
