"use client";
import { useCallback, useEffect, useState } from 'react';
import { LatestDecisionCard, type LatestDecision } from '@/components/LatestDecisionCard';
import { api } from '@/lib/api';

type Dashboard = {
  latestDecision?: LatestDecision | null;
  room: { code: string; name: string };
  latest: null | { temperature: string | number; humidity: string | number; occupancy: boolean; lightRaw: number; lightPercent: string | number | null; receivedAt: string };
  devices: { id: string; deviceCode: string; status: string; lastSeen: string | null }[];
  openIncidents: { id: string; incidentType: string; severity: string; message: string; openedAt: string }[];
};

export default function Home() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try { setData(await api<Dashboard>('/dashboard/rooms/A101')); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không tải được dữ liệu'); }
  }, []);

  useEffect(() => { load(); const t=setInterval(load, 3000); return () => clearInterval(t); }, [load]);

  async function command(command_type: 'FAN'|'LIGHT', action: 'ON'|'OFF') {
    setBusy(true);
    try {
      await api('/commands/manual', { method:'POST', body: JSON.stringify({ device_id:'ESP32_A101', command_type, action, source:'MANUAL' }) });
    } catch(e) { setError(e instanceof Error ? e.message : 'Gửi lệnh thất bại'); }
    finally { setBusy(false); }
  }

  const t=data?.latest;
  return <main className="shell">
    <header><div><p className="eyebrow">AI SMART OFFICE AGENT</p><h1>Smart Classroom A101</h1><p className="muted">Wokwi + MQTT + n8n + NestJS + PostgreSQL</p></div><span className="pill">{data?.devices?.[0]?.status ?? 'UNKNOWN'}</span></header>
    {error && <div className="error">{error}</div>}
    <section className="grid">
      <Card label="Nhiệt độ" value={t ? `${Number(t.temperature).toFixed(1)} °C` : '--'} />
      <Card label="Độ ẩm" value={t ? `${Number(t.humidity).toFixed(1)} %` : '--'} />
      <Card label="Hiện diện" value={t ? (t.occupancy ? 'Có người' : 'Không có người') : '--'} />
      <Card label="Ánh sáng" value={t?.lightPercent != null ? `${Number(t.lightPercent).toFixed(0)} %` : '--'} />
    </section>
    <LatestDecisionCard decision={data?.latestDecision} loading={!data && !error} loadError={Boolean(error)} />
    <section className="panel"><h2>Điều khiển thủ công</h2><div className="actions"><button disabled={busy} onClick={()=>command('FAN','ON')}>Bật quạt</button><button disabled={busy} onClick={()=>command('FAN','OFF')}>Tắt quạt</button><button disabled={busy} onClick={()=>command('LIGHT','ON')}>Bật đèn</button><button disabled={busy} onClick={()=>command('LIGHT','OFF')}>Tắt đèn</button></div><p className="muted">Frontend → NestJS → n8n Webhook → MQTT → ESP32.</p></section>
    <section className="panel"><h2>Sự cố đang mở</h2>{data?.openIncidents?.length ? <div className="incidentList">{data.openIncidents.map(i=><div className="incident" key={i.id}><b>{i.severity} · {i.incidentType}</b><span>{i.message}</span></div>)}</div> : <p className="muted">Chưa có sự cố mở.</p>}</section>
    <footer>Cập nhật tự động mỗi 3 giây. {t?.receivedAt ? `Dữ liệu cuối: ${new Date(t.receivedAt).toLocaleString()}` : ''}</footer>
  </main>;
}
function Card({label,value}:{label:string;value:string}) { return <div className="card"><span>{label}</span><strong>{value}</strong></div>; }
