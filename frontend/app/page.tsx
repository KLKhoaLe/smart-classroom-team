"use client";
<<<<<<< HEAD
import { useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

type Reading = { id?: string; temperature: number|string; humidity: number|string; occupancy: boolean; lightPercent: number|string|null; lightRaw: number; receivedAt: string };
type Device = { id: string; deviceCode: string; status: string; lastSeen: string|null };
type Dashboard = { room: {code:string;name:string}; latest: Reading|null; devices: Device[]; openIncidents: {id:string;incidentType:string;severity:string;message:string;openedAt:string}[] };
type Command = {id:string;command_type:string;action:string;status:string;source:string;device_code:string;requested_at:string};
type Monitoring = { config:{empty_delay_seconds:number;allowed_start_minute:number;allowed_end_minute:number;timezone:string}; energy:{mode?:string;fan_target?:string;light_target?:string}; security:{active?:boolean} };
type Environment = {severity?:string;updated_at?:string};
const room='A101';
const time=(v?:string|null)=>v&&Number.isFinite(Date.parse(v))?new Date(v).toLocaleString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour12:false}):'Chưa có';
const num=(v:unknown,d=1)=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))?Number(v).toFixed(d):'—';
const clock=(m:number)=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
const target:Record<string,string>={ON:'Bật',OFF:'Tắt',KEEP:'Giữ nguyên'};
const statuses:Record<string,string>={PENDING:'Đang chờ gửi',SENT:'Đã chuyển tiếp',ACK:'Đã xác nhận',FAILED:'Thất bại'};
=======
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
>>>>>>> main

export default function Home(){
 const [data,setData]=useState<Dashboard|null>(null);
 const [monitor,setMonitor]=useState<Monitoring|null>(null);
 const [env,setEnv]=useState<Environment|null>(null);
 const [commands,setCommands]=useState<Command[]>([]);
 const [readings,setReadings]=useState<Reading[]>([]);
 const [error,setError]=useState('');const [partial,setPartial]=useState('');
 const [loading,setLoading]=useState(true);const [lastSync,setLastSync]=useState<string|null>(null);
 const [refresh,setRefresh]=useState(0);const [busy,setBusy]=useState('');
 const [notice,setNotice]=useState<{text:string;error:boolean}|null>(null);
 const sending=useRef(false);
 useEffect(()=>{
  let cancelled=false;let timer:ReturnType<typeof setTimeout>;let controller:AbortController;
  async function tick(){
   controller=new AbortController();const options={signal:controller.signal};
   try{
    const responses=await Promise.allSettled([
     api<Dashboard>(`/dashboard/rooms/${room}`,options),api<Monitoring>(`/monitoring/rooms/${room}`,options),
     api<Environment>(`/environment/state/${room}`,options),api<Command[]>(`/monitoring/commands/${room}`,options),
     api<Reading[]>(`/telemetry/recent?room=${room}&limit=8`,options)]);
    if(cancelled)return;
    const [dashboard,monitoring,environment,history,telemetry]=responses;
    if(dashboard.status==='fulfilled'){setData(dashboard.value);setError('');setLastSync(new Date().toISOString());}
    else setError('Chưa tải được dữ liệu phòng. Kiểm tra backend; thông tin cũ được giữ để đối chiếu.');
    setMonitor(monitoring.status==='fulfilled'?monitoring.value:null);
    setEnv(environment.status==='fulfilled'?environment.value:null);
    setCommands(history.status==='fulfilled'?history.value:[]);
    setReadings(telemetry.status==='fulfilled'?telemetry.value:[]);
    const failed=['Giám sát tự động','Cảnh báo môi trường','Lịch sử lệnh','Lịch sử cảm biến'].filter((_,i)=>responses[i+1].status==='rejected');
    setPartial(failed.length?`Chưa tải được: ${failed.join(', ')}.`:'');
   }finally{if(!cancelled){setLoading(false);timer=setTimeout(tick,3000);}}
  }
<<<<<<< HEAD
  tick();return()=>{cancelled=true;clearTimeout(timer);controller?.abort();};
 },[refresh]);
 const device=data?.devices.find(d=>d.deviceCode==='ESP32_A101')??data?.devices[0];
 const t=data?.latest;const stale=!!t&&Date.now()-Date.parse(t.receivedAt)>120000;
 async function command(command_type:'FAN'|'LIGHT',action:'ON'|'OFF'){
  if(!device||sending.current)return;
  sending.current=true;setBusy(`${command_type}-${action}`);setNotice(null);
  try{
   const r=await api<{id:string;status:string}>('/commands/manual',{method:'POST',body:JSON.stringify({device_id:device.deviceCode,command_type,action,source:'MANUAL'})});
   const state=r.status==='ACK'?'Thiết bị đã xác nhận.':r.status==='SENT'?'Đã chuyển tiếp, đang chờ thiết bị xác nhận.':r.status==='PENDING'?'Đã lưu yêu cầu, đang chờ gửi.':`Trạng thái: ${r.status}.`;
   setNotice({text:`${command_type==='FAN'?'Quạt':'Đèn'} · ${target[action]}: ${state} Mã lệnh ${r.id.slice(0,8)}.`,error:false});
  }catch(e){setNotice({text:`Chưa xác nhận được yêu cầu. ${e instanceof Error?e.message:''} Kiểm tra lịch sử lệnh trước khi gửi lại.`,error:true});}
  finally{sending.current=false;setBusy('');setRefresh(v=>v+1);}
 }
 const envLabel=env?.severity==='CRITICAL'?'Nghiêm trọng':env?.severity==='WARNING'?'Cần chú ý':env?.severity==='NORMAL'?'Bình thường':'Chưa có trạng thái';
 const energyLabel=monitor?.energy.mode==='EMPTY'?'Phòng trống':monitor?.energy.mode==='WAITING'?'Chờ tiết kiệm điện':monitor?.energy.mode==='OCCUPIED'?'Có người sử dụng':'Chưa có trạng thái';
 return <main className="shell">
  <nav className="topbar" aria-label="Thông tin ứng dụng"><a className="brand" href="/">SC<span>Smart Classroom</span></a><span className="top-meta">GIÁM SÁT PHÒNG HỌC</span></nav>
  <header className="hero"><div><p className="eyebrow">TỔNG QUAN KHÔNG GIAN</p><h1>Phòng {room}<span className="title-dot">.</span></h1><p className="muted">Theo dõi môi trường và điều khiển thiết bị tại một nơi.</p></div><div className="hero-actions"><span className={`badge ${device?.status==='ONLINE'?'green':'neutral'}`}><i/>{device?.status??'CHƯA CÓ THIẾT BỊ'}</span><button className="secondary" onClick={()=>setRefresh(v=>v+1)}>Làm mới</button></div></header>
  {error&&<div className="banner danger" role="alert">{error}</div>}
  {partial&&<div className="banner warning" role="status">{partial}</div>}
  {stale&&<div className="banner warning">Dữ liệu cảm biến đã hơn 2 phút chưa cập nhật. Các giá trị bên dưới là lần nhận gần nhất.</div>}
  {loading&&!data&&<div className="banner" role="status">Đang tải thông tin phòng…</div>}
  <section className="sensor-grid" aria-label="Thông số cảm biến">
   <Sensor label="Nhiệt độ" value={t?num(t.temperature):'—'} unit="°C" caption="Nhiệt độ trong phòng" accent="orange" icon="°"/>
   <Sensor label="Độ ẩm" value={t?num(t.humidity):'—'} unit="%" caption="Độ ẩm tương đối" accent="blue" icon="≈"/>
   <Sensor label="Hiện diện" value={t?t.occupancy?'Có người':'Trống':'—'} caption="Theo cảm biến hiện diện" accent="green" icon="◎"/>
   <Sensor label="Ánh sáng" value={t?num(t.lightPercent,0):'—'} unit="%" caption={t?`Giá trị thô: ${t.lightRaw}`:'Chưa nhận dữ liệu'} accent="purple" icon="☀"/>
  </section>
  <section className="monitor-grid" aria-label="Giám sát tự động">
   <article className="monitor-card"><span className="section-kicker">01 / MÔI TRƯỜNG</span><h2>{envLabel}</h2><p>Nhiệt độ & độ ẩm</p><small>{time(env?.updated_at)}</small></article>
   <article className="monitor-card"><span className="section-kicker">02 / NĂNG LƯỢNG</span><h2>{energyLabel}</h2><p>Đề xuất: quạt {target[monitor?.energy.fan_target??'']??'—'} · đèn {target[monitor?.energy.light_target??'']??'—'}</p><small>Đề xuất tự động, chưa phải xác nhận từ thiết bị.</small></article>
   <article className={`monitor-card ${monitor?.security.active?'security-active':''}`}><span className="section-kicker">03 / AN NINH</span><h2>{monitor?.security.active===true?'Có cảnh báo ngoài giờ':monitor?.security.active===false?'Không có cảnh báo':'Chưa có trạng thái'}</h2><p>{monitor?`Giờ hoạt động ${clock(monitor.config.allowed_start_minute)}–${clock(monitor.config.allowed_end_minute)}`:'Đang chờ cấu hình'}</p><small>{monitor?.config.timezone??'Theo cấu hình của phòng'}</small></article>
  </section>
  <div className="workspace-grid">
   <section className="panel controls"><div className="section-heading"><div><p className="section-kicker">THIẾT BỊ</p><h2>Điều khiển thủ công</h2></div><span className="code">{device?.deviceCode??'—'}</span></div><p className="muted compact">Lệnh chỉ được coi là đã xác nhận khi có trạng thái ACK.</p>
    {(['FAN','LIGHT'] as const).map(kind=><div className="control-row" key={kind}><div><strong>{kind==='FAN'?'Quạt thông gió':'Đèn phòng học'}</strong><span>{kind==='FAN'?'Lưu thông không khí':'Chiếu sáng không gian'}</span></div><div className="button-pair">{(['ON','OFF'] as const).map(action=><button key={action} className={action==='OFF'?'secondary':''} disabled={!!busy||!device} onClick={()=>command(kind,action)} aria-label={`${action==='ON'?'Bật':'Tắt'} ${kind==='FAN'?'quạt':'đèn'}`}>{busy===`${kind}-${action}`?'Đang gửi…':target[action]}</button>)}</div></div>)}
    {notice&&<div className={`banner ${notice.error?'danger':'success'}`} role={notice.error?'alert':'status'}>{notice.text}</div>}
    <div className="device-meta"><span>Thiết bị liên lạc gần nhất</span><b>{time(device?.lastSeen)}</b></div>
   </section>
   <section className="panel"><div className="section-heading"><div><p className="section-kicker">CẦN THEO DÕI</p><h2>Sự cố đang mở</h2></div><span className="count">{data?.openIncidents.length??'—'}</span></div>
    {!data?<p className="empty">Chưa tải được danh sách sự cố.</p>:data.openIncidents.length?<div className="incident-list">{data.openIncidents.map(i=><article className="incident" key={i.id}><div><span className={`badge ${i.severity==='CRITICAL'?'red':'amber'}`}>{i.severity}</span><small>{time(i.openedAt)}</small></div><strong>{i.incidentType}</strong><p>{i.message}</p></article>)}</div>:<div className="empty"><span className="empty-icon">✓</span><strong>Không có sự cố đang mở</strong><p>Các sự cố được ghi nhận sẽ xuất hiện tại đây.</p></div>}
   </section>
  </div>
  <section className="panel"><div className="section-heading"><div><p className="section-kicker">THEO DÕI YÊU CẦU</p><h2>Lệnh điều khiển gần đây</h2></div><span className="muted small">PENDING → SENT → ACK</span></div><div className="table-wrap"><table><thead><tr><th>Thời gian</th><th>Thiết bị</th><th>Yêu cầu</th><th>Nguồn</th><th>Trạng thái</th></tr></thead><tbody>{commands.map(c=><tr key={c.id}><td>{time(c.requested_at)}</td><td className="code">{c.device_code}</td><td>{c.command_type==='FAN'?'Quạt':c.command_type==='LIGHT'?'Đèn':c.command_type} · {target[c.action]??c.action}</td><td>{c.source==='MANUAL'?'Thủ công':c.source}</td><td><span className={`badge ${c.status==='ACK'?'green':c.status==='FAILED'?'red':'amber'}`}>{c.status}</span><span className="status-detail">{statuses[c.status]??c.status}</span></td></tr>)}</tbody></table></div>{!commands.length&&<p className="table-empty">Chưa có lệnh để hiển thị hoặc lịch sử chưa tải được.</p>}</section>
  <section className="panel"><div className="section-heading"><div><p className="section-kicker">DỮ LIỆU ĐO</p><h2>Bản tin cảm biến gần đây</h2></div><span className="muted small">8 bản tin mới nhất</span></div><div className="table-wrap"><table><thead><tr><th>Thời gian nhận</th><th>Nhiệt độ</th><th>Độ ẩm</th><th>Hiện diện</th><th>Ánh sáng</th></tr></thead><tbody>{readings.map((r,i)=><tr key={r.id??`${r.receivedAt}-${i}`}><td>{time(r.receivedAt)}</td><td>{num(r.temperature)} °C</td><td>{num(r.humidity)} %</td><td>{r.occupancy?'Có người':'Trống'}</td><td>{num(r.lightPercent,0)} %</td></tr>)}</tbody></table></div>{!readings.length&&<p className="table-empty">Chưa có bản tin để hiển thị hoặc lịch sử chưa tải được.</p>}</section>
  <footer><span>SMART CLASSROOM / {room}</span><span>Tự cập nhật khoảng 3 giây · Đồng bộ: {time(lastSync)}</span></footer>
 </main>;
}
function Sensor({label,value,unit,caption,accent,icon}:{label:string;value:string;unit?:string;caption:string;accent:string;icon:string}){
 return <article className={`sensor ${accent}`}><div className="sensor-top"><span>{label}</span><b aria-hidden="true">{icon}</b></div><div className="sensor-value">{value}{value!=='—'&&unit&&<small>{unit}</small>}</div><p>{caption}</p></article>;
=======

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
>>>>>>> main
}
