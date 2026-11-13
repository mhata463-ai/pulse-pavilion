import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from '@/components/ui/button';
import { loadLive, saveHospitalAction } from '@/lib/hospital-data';

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "نبض المشافي - إدارة المستشفيات" },
      { name: "description", content: "تطبيق لإدارة ومتابعة المستشفيات بالمؤشرات الحيوية والصندوق والموظفين." },
      { property: "og:title", content: "نبض المشافي - إدارة المستشفيات" },
      { property: "og:description", content: "متابعة الإيرادات والعمليات والأسرة والموظفين والمصروفات لحظياً." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const frame = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getUser().then(async ({ data: user }) => {
      if (!user.user) { setSession(null); return; }
      const { data: current } = await supabase.auth.getSession();
      setSession(current.session);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    let stop = false;
    let pushing = false;
    const push = async () => {
      if (pushing || stop) return;
      pushing = true;
      try {
        const live = await loadLive();
        if (!stop) { setError(''); frame.current?.contentWindow?.postMessage({ type: 'live', live }, window.location.origin); }
      } catch { if (!stop) setError('تعذّر تحديث البيانات. ستُعاد المحاولة؛ الأرقام المعروضة قديمة.'); }
      finally { pushing = false; }
    };
    const onMsg = async (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      if (e.data?.type === "ready") push();
      if (e.data?.type === 'logout') {
        stop = true;
        const { error: logoutError } = await supabase.auth.signOut();
        if (logoutError) { stop = false; setError('تعذّر الخروج؛ حاول مجدداً.'); } else { setSession(null); setError(''); }
      }
      if (e.data?.type === 'action' && typeof e.data.requestId === 'string') {
        try {
          await saveHospitalAction(e.data.action, e.data.input ?? {});
          const live = await loadLive();
          if (!stop) frame.current?.contentWindow?.postMessage({ type: 'saved', requestId: e.data.requestId, live }, window.location.origin);
        } catch {
          if (!stop) frame.current?.contentWindow?.postMessage({ type: 'saved', requestId: e.data.requestId, error: 'لم يتم الحفظ. تحقق من اتصالك وصلاحية حسابك.' }, window.location.origin);
        }
      }
    };
    window.addEventListener("message", onMsg);
    push();
    const t = setInterval(push, 60_000);
    return () => { stop = true; clearInterval(t); window.removeEventListener("message", onMsg); };
  }, [session]);

  if (session === undefined) return <div className="h-screen bg-background" />;
  if (!session) return <Login />;
  return (
    <div className="h-screen w-full bg-background">
      {error && <p role="alert" dir="rtl" className="fixed top-0 z-50 w-full bg-destructive p-2 text-center text-sm text-destructive-foreground">{error}</p>}
      <iframe ref={frame} src="/hospital.html?connected=1" title="نبض المشافي" className="h-full w-full border-0" />
    </div>
  );
}

function Login() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg("");
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg("البريد أو كلمة السر غير صحيحة");
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      setMsg(error ? error.message : "تم إنشاء الحساب. افتح بريدك واضغط رابط التأكيد ثم ادخل.");
    }
    setBusy(false);
  }

  return (
    <div dir="rtl" className="flex min-h-screen items-center justify-center bg-background p-6">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="text-center">
          <div className="text-5xl">🏥</div>
          <h1 className="mt-2 text-2xl font-bold text-foreground">نبض المشافي</h1>
          <p className="text-sm text-muted-foreground">{mode === "in" ? "دخول المالك" : "إنشاء حساب المالك"}</p>
        </div>
        <input type="email" required placeholder="البريد الإلكتروني" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground" />
        <input type="password" required minLength={6} placeholder="كلمة السر" value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground" />
        {msg && <p className="text-center text-sm text-muted-foreground">{msg}</p>}
        <Button disabled={busy} className="h-auto w-full py-3 font-bold">
          {busy ? "..." : mode === "in" ? "دخول" : "إنشاء حساب"}
        </Button>
        <Button variant="link" type="button" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }} className="w-full text-sm text-muted-foreground">
          {mode === "in" ? "ليس لديك حساب؟ أنشئ حساباً" : "لديك حساب؟ ادخل"}
        </Button>
      </form>
    </div>
  );
}
