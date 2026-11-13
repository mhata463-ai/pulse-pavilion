import { supabase } from '@/integrations/supabase/client';

export async function loadLive() {
  const hospitals = await supabase.from('hospitals').select('*').order('code');
  if (hospitals.error) throw hospitals.error;
  return Promise.all((hospitals.data ?? []).map(async (h) => {
    const [vitals, cashbox, returns, attendance, expenses, notifications, limits] = await Promise.all([
      supabase.from('hospital_vitals').select('*').eq('hospital_id', h.id).order('day', { ascending: false }),
      supabase.from('cashbox_records').select('*').eq('hospital_id', h.id).order('day', { ascending: false }),
      supabase.from('revenue_returns').select('*').eq('hospital_id', h.id).order('created_at', { ascending: false }),
      supabase.from('staff_attendance').select('*').eq('hospital_id', h.id).order('day', { ascending: false }),
      supabase.from('expenses').select('*').eq('hospital_id', h.id).order('spent_on', { ascending: false }),
      supabase.from('notifications').select('*').eq('hospital_id', h.id).order('created_at', { ascending: false }),
      supabase.from('expense_limits').select('*').eq('hospital_id', h.id),
    ]);
    for (const result of [vitals, cashbox, returns, attendance, expenses, notifications, limits]) {
      if (result.error) throw result.error;
    }
    return { ...h, vitals: vitals.data?.[0] ?? null, vitalsHistory: vitals.data ?? [], cashbox: cashbox.data?.[0] ?? null,
      cashboxHistory: cashbox.data ?? [], returns: returns.data ?? [], attendance: attendance.data ?? [],
      expenses: expenses.data ?? [], notifications: notifications.data ?? [], limits: limits.data ?? [] };
  }));
}

export async function saveHospitalAction(action: string, input: Record<string, unknown>) {
  const id = typeof input['id'] === 'string' ? input['id'] : '';
  if (action === 'return' && id && typeof input['approved'] === 'boolean') {
    const result = await supabase.from('revenue_returns').update({ status: input['approved'] ? 'approved' : 'cancelled' })
      .eq('id', id).eq('status', 'pending').select('id');
    if (result.error) throw result.error;
    if (!result.data?.length) throw new Error('المرتجع غير متاح أو تمت معالجته');
  } else if (action === 'match' && id && typeof input['undo'] === 'boolean') {
    const result = await supabase.rpc('match_cashbox', { record_id: id, undo: input['undo'] });
    if (result.error) throw result.error;
  } else if (action === 'reply' && id && typeof input['reply'] === 'string') {
    const result = await supabase.from('notifications').update({ reply: input['reply'].slice(0, 4000), is_read: true }).eq('id', id).select('id');
    if (result.error) throw result.error;
    if (!result.data?.length) throw new Error('الإشعار غير متاح');
  } else if (action === 'limit' && typeof input['hospital_id'] === 'string' && typeof input['category'] === 'string' && Array.isArray(input['limits'])) {
    const rows = input['limits'].map((item: { period: string; max_amount: number }) => {
      if (!['daily', 'weekly', 'monthly'].includes(item.period) || !Number.isFinite(item.max_amount) || item.max_amount < 0) throw new Error('حد غير صحيح');
      return { hospital_id: String(input['hospital_id']), category: String(input['category']), ...item };
    });
    const result = await supabase.from('expense_limits').upsert(rows, { onConflict: 'hospital_id,category,period' });
    if (result.error) throw result.error;
  } else throw new Error('طلب غير صحيح');
}