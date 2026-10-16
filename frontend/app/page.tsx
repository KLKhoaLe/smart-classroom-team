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
type Incident = {
  id: string;
  incidentType: string;
  severity: string;
  status: string;
  message: string;
  openedAt: string;
};
type DailyReport = {
  room: string;
  date: string;
  totalIncidents: number;
  openIncidents: number;
  resolvedIncidents: number;
  incidentsBySeverity: Record<string, number>;
  totalDevices: number;
  devicesOnline: number;
  devicesWithIssues: number;
  telemetry: {
    sampleCount: number;
    averageTemperature: number | null;
    averageHumidity: number | null;
    averageLightPercent: number | null;
    occupiedSamples: number;
  };
};
type WeeklyOptimization = {
  periodStart: string;
  periodEnd: string;
  totalIncidents: number;
  incidentsByType: { incidentType: string; count: number }[];
  devicesWithIssues: number;
  recommendation: string;
  source: 'AI_REPORT' | 'SYSTEM_SUMMARY';
};

export default function Home() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [weeklyOptimization, setWeeklyOptimization] = useState<WeeklyOptimization | null>(null);
  const [error, setError] = useState('');
  const [incidentError, setIncidentError] = useState('');
  const [reportsError, setReportsError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reportBusy, setReportBusy] = useState(false);
  const [statusBusyId, setStatusBusyId] = useState('');

  const load = useCallback(async () => {
    try { setData(await api<Dashboard>('/dashboard/rooms/A101')); setError(''); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không tải được dữ liệu'); }
  }, []);

  const loadIncidents = useCallback(async () => {
    try { setIncidents(await api<Incident[]>('/incidents')); setIncidentError(''); }
    catch (e) { setIncidentError(e instanceof Error ? e.message : 'Không tải được danh sách sự cố'); }
  }, []);

  const loadReports = useCallback(async () => {
    const [daily, weekly] = await Promise.allSettled([
      api<DailyReport>('/reports/daily?room=A101'),
      api<WeeklyOptimization>('/reports/weekly?room=A101'),
    ]);
    if (daily.status === 'fulfilled') setDailyReport(daily.value);
    if (weekly.status === 'fulfilled') setWeeklyOptimization(weekly.value);
    const failures = [daily, weekly].filter((result) => result.status === 'rejected');
    setReportsError(failures.length ? 'Không tải được báo cáo tổng hợp. Vui lòng thử lại.' : '');
  }, []);

  useEffect(() => {
    load();
    loadIncidents();
    loadReports();
    const t = setInterval(() => { load(); loadIncidents(); }, 5000);
    const reportTimer = setInterval(loadReports, 30000);
    return () => { clearInterval(t); clearInterval(reportTimer); };
  }, [load, loadIncidents, loadReports]);

  async function submitIncident(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setReportBusy(true);
    setIncidentError('');
    try {
      await api('/incidents/workflow', {
        method: 'POST',
        body: JSON.stringify({
          action: 'CREATE',
          room: 'A101',
          incident_type: form.get('incident_type'),
          severity: form.get('severity'),
          message: form.get('message'),
        }),
      });
      formElement.reset();
      await loadIncidents();
      await loadReports();
    } catch (e) {
      setIncidentError(e instanceof Error ? e.message : 'Gửi báo cáo thất bại');
    } finally {
      setReportBusy(false);
    }
  }

  async function changeIncidentStatus(incident: Incident) {
    setStatusBusyId(incident.id);
    setIncidentError('');
    try {
      const isOpen = incident.status === 'OPEN';
      await api('/incidents/workflow', {
        method: 'POST',
        body: JSON.stringify(isOpen
          ? { action: 'RESOLVE', incident_id: incident.id }
          : { action: 'UPDATE_STATUS', incident_id: incident.id, status: 'OPEN' }),
      });
      await Promise.all([loadIncidents(), loadReports()]);
    } catch (e) {
      setIncidentError(e instanceof Error ? e.message : 'Cập nhật trạng thái thất bại');
    } finally {
      setStatusBusyId('');
    }
  }

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
    <section className="reportsGrid">
      <DailyReportPanel report={dailyReport} error={reportsError} />
      <WeeklyOptimizationPanel report={weeklyOptimization} error={reportsError} />
    </section>
    <section className="incidentWorkspace">
      <form className="panel reportForm" onSubmit={submitIncident}>
        <div className="sectionHeading"><div><p className="eyebrow">PHÒNG A101</p><h2>Gửi báo cáo sự cố</h2></div><span className="formMark">+</span></div>
        <label>Loại sự cố<select name="incident_type" defaultValue="EQUIPMENT"><option value="EQUIPMENT">Thiết bị</option><option value="SENSOR">Cảm biến</option><option value="ENVIRONMENT">Môi trường</option><option value="SAFETY">An toàn</option><option value="OTHER">Khác</option></select></label>
        <label>Mức độ<select name="severity" defaultValue="MEDIUM"><option value="LOW">Thấp</option><option value="MEDIUM">Trung bình</option><option value="HIGH">Cao</option><option value="INFO">Thông tin</option><option value="WARNING">Cảnh báo</option><option value="CRITICAL">Khẩn cấp</option></select></label>
        <label>Mô tả<textarea name="message" placeholder="Mô tả tình trạng đang gặp phải..." required minLength={3} rows={4} /></label>
        <button type="submit" disabled={reportBusy}>{reportBusy ? 'Đang gửi...' : 'Gửi báo cáo'}</button>
      </form>
      <section className="panel incidentPanel">
        <div className="sectionHeading"><div><p className="eyebrow">THEO DÕI</p><h2>Danh sách sự cố</h2></div><span className="incidentCount">{incidents.length} báo cáo</span></div>
        {incidentError && <div className="error">{incidentError}</div>}
        {incidents.length ? <div className="incidentList">{incidents.map((incident) => <article className="incident" key={incident.id}>
          <div className="incidentTop"><div className="incidentTags"><span className={`severity severity-${incident.severity.toLowerCase()}`}>{incident.severity}</span><span className="incidentType">{incident.incidentType}</span></div><span className={`status status-${incident.status.toLowerCase()}`}>{incident.status === 'OPEN' ? 'Đang mở' : 'Đã xử lý'}</span></div>
          <p>{incident.message}</p>
          <div className="incidentFooter"><time dateTime={incident.openedAt}>{new Date(incident.openedAt).toLocaleString('vi-VN')}</time><button className="statusAction" type="button" disabled={statusBusyId === incident.id} onClick={() => changeIncidentStatus(incident)}>{statusBusyId === incident.id ? 'Đang cập nhật...' : incident.status === 'OPEN' ? 'Đánh dấu đã xử lý' : 'Mở lại'}</button></div>
        </article>)}</div> : <div className="emptyState"><span>—</span><p>Chưa có báo cáo sự cố</p><small>Các báo cáo mới sẽ xuất hiện tại đây.</small></div>}
      </section>
    </section>
    <footer>Cập nhật tự động mỗi 3 giây. {t?.receivedAt ? `Dữ liệu cuối: ${new Date(t.receivedAt).toLocaleString()}` : ''}</footer>
  </main>;
}
function Card({label,value}:{label:string;value:string}) { return <div className="card"><span>{label}</span><strong>{value}</strong></div>; }
function DailyReportPanel({ report, error }: { report: DailyReport | null; error: string }) {
  return <section className="panel dailyPanel">
    <div className="sectionHeading"><div><p className="eyebrow">TỔNG HỢP THEO NGÀY</p><h2>Báo cáo hằng ngày</h2></div><span className="reportDate">{report?.date ?? 'A101'}</span></div>
    {error && <div className="error">{error}</div>}
    {report ? <>
      <div className="dailyMetrics">
        <div><span>Sự cố hôm nay</span><strong>{report.totalIncidents}</strong></div>
        <div><span>Đang mở</span><strong>{report.openIncidents}</strong></div>
        <div><span>Thiết bị bình thường</span><strong>{report.devicesOnline}/{report.totalDevices}</strong></div>
        <div><span>Thiết bị cần kiểm tra</span><strong>{report.devicesWithIssues}</strong></div>
      </div>
      <div className="telemetrySummary">
        <div className="telemetryHeading"><span>Telemetry trong ngày</span><strong>{report.telemetry?.sampleCount ?? 0} mẫu</strong></div>
        <div className="telemetryMetrics">
          <div><span>Nhiệt độ TB</span><strong>{report.telemetry?.averageTemperature == null ? '--' : `${report.telemetry.averageTemperature.toFixed(1)} °C`}</strong></div>
          <div><span>Độ ẩm TB</span><strong>{report.telemetry?.averageHumidity == null ? '--' : `${report.telemetry.averageHumidity.toFixed(1)} %`}</strong></div>
          <div><span>Ánh sáng TB</span><strong>{report.telemetry?.averageLightPercent == null ? '--' : `${report.telemetry.averageLightPercent.toFixed(0)} %`}</strong></div>
          <div><span>Mẫu có người</span><strong>{report.telemetry?.occupiedSamples ?? 0}</strong></div>
        </div>
      </div>
      <div className="severitySummary"><span className="muted">Theo mức độ</span>{Object.entries(report.incidentsBySeverity ?? {}).length ? Object.entries(report.incidentsBySeverity ?? {}).map(([severity, count]) => <span className={`severity severity-${severity.toLowerCase()}`} key={severity}>{severity} · {count}</span>) : <span className="muted">Không có sự cố</span>}</div>
    </> : <p className="muted">Đang tải số liệu trong ngày...</p>}
  </section>;
}
function WeeklyOptimizationPanel({ report, error }: { report: WeeklyOptimization | null; error: string }) {
  return <section className="panel weeklyPanel">
    <div className="sectionHeading"><div><p className="eyebrow">7 NGÀY GẦN NHẤT</p><h2>Tối ưu vận hành tuần</h2></div><span className={`sourceTag ${report?.source === 'AI_REPORT' ? 'sourceAi' : ''}`}>{report?.source === 'AI_REPORT' ? 'AI / n8n' : 'Tổng hợp hệ thống'}</span></div>
    {error && <div className="error">{error}</div>}
    {report ? <>
      <p className="recommendation">{report.recommendation}</p>
      <div className="weeklyStats"><span>{report.totalIncidents} sự cố trong tuần</span><span>{report.devicesWithIssues} thiết bị cần kiểm tra</span></div>
      {(report.incidentsByType ?? []).length > 0 && <div className="weeklyBreakdown">{(report.incidentsByType ?? []).slice(0, 3).map((item) => <div key={item.incidentType}><span>{item.incidentType}</span><strong>{item.count}</strong></div>)}</div>}
    </> : <p className="muted">Đang tải khuyến nghị tuần...</p>}
  </section>;
}
