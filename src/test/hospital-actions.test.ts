import { describe, it, expect, vi, beforeEach } from 'vitest';
const { rpc, from, update, eq, select } = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn(), update: vi.fn(), eq: vi.fn(), select: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { rpc, from } }));
import { saveHospitalAction } from '@/lib/hospital-data';

beforeEach(() => {
  vi.clearAllMocks();
  from.mockReturnValue({ update }); update.mockReturnValue({ eq }); eq.mockReturnValue({ eq, select });
  select.mockResolvedValue({ data: [{ id: 'r1' }], error: null }); rpc.mockResolvedValue({ error: null });
});
describe('Saved hospital decisions', () => {
  it('matches a day through the atomic matching operation', async () => {
    await saveHospitalAction('match', { id: 'day1', undo: false });
    expect(rpc).toHaveBeenCalledWith('match_cashbox', { record_id: 'day1', undo: false });
  });
  it('undoes the same day without rewriting the current balance', async () => {
    await saveHospitalAction('match', { id: 'day1', undo: true });
    expect(rpc).toHaveBeenCalledWith('match_cashbox', { record_id: 'day1', undo: true });
    expect(from).not.toHaveBeenCalled();
  });
  it('approves only a pending return', async () => {
    await saveHospitalAction('return', { id: 'r1', approved: true });
    expect(update).toHaveBeenCalledWith({ status: 'approved' });
    expect(eq).toHaveBeenCalledWith('status', 'pending');
  });
  it('does not claim success for an already processed return', async () => {
    select.mockResolvedValue({ data: [], error: null });
    await expect(saveHospitalAction('return', { id: 'r1', approved: true })).rejects.toThrow();
  });
  it('saves replies as read without sending a message to the external hospital system', async () => {
    await saveHospitalAction('reply', { id: 'n1', reply: 'تمت المراجعة' });
    expect(update).toHaveBeenCalledWith({ reply: 'تمت المراجعة', is_read: true });
  });
});