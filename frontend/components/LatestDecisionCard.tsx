export type LatestDecision = {
  id: string;
  sourceTelemetryId: string | null;
  decisionSource: string;
  fanAction: string;
  lightAction: string;
  mode: string | null;
  reason: string | null;
  modelName: string | null;
  createdAt: string;
};

function actionLabel(action: string) {
  return ({ ON: 'Bật', OFF: 'Tắt', KEEP: 'Giữ nguyên' } as Record<string, string>)[action] ?? 'Chưa xác định';
}

export function LatestDecisionCard({ decision, loading, loadError }: {
  decision?: LatestDecision | null;
  loading: boolean;
  loadError: boolean;
}) {
  const date = decision ? new Date(decision.createdAt) : null;
  const timestamp = date && !Number.isNaN(date.getTime())
    ? date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour12: false })
    : 'Chưa có thời gian';
  const mode = decision?.mode === 'SMART_COMFORT' ? 'Tiện nghi khi có người'
    : decision?.mode === 'ENERGY_SAVING' ? 'Tiết kiệm năng lượng' : decision?.mode ?? 'Chưa xác định';

  return <section className="panel" aria-labelledby="latest-decision-heading">
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
      <h2 id="latest-decision-heading">Quyết định gần nhất</h2>
      {decision && <span className="pill">{decision.decisionSource === 'AI' ? 'AI · có kiểm tra rule'
        : decision.decisionSource === 'RULE' ? 'RULE · quy tắc' : decision.decisionSource}</span>}
    </div>
    {loadError && <p role="status" className="muted">Không thể cập nhật lúc này. Dữ liệu đang hiển thị, nếu có, là lần tải thành công gần nhất.</p>}
    {!decision ? <p className="muted">{loading ? 'Đang tải quyết định…' : loadError
      ? 'Chưa tải được quyết định.' : decision === undefined
      ? 'API chưa cung cấp quyết định. Hãy cập nhật và khởi động lại backend.'
      : 'Chưa có quyết định cho phòng này. Khi cảm biến gửi dữ liệu và flow xử lý xong, kết quả sẽ xuất hiện tại đây.'}</p>
      : <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 12 }}>
          <div className="card"><span>Quạt · yêu cầu</span><strong>{actionLabel(decision.fanAction)}</strong></div>
          <div className="card"><span>Đèn · yêu cầu</span><strong>{actionLabel(decision.lightAction)}</strong></div>
        </div>
        <p><b>Chế độ:</b> {mode}</p>
        <div style={{ background: 'rgba(127,127,127,0.08)', padding: 16, borderRadius: 12 }}>
          <b>Lý do quyết định</b>
          <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', lineHeight: 1.65, marginBottom: 0 }}>{decision.reason?.trim() || 'Chưa có giải thích.'}</p>
        </div>
        <p className="muted"><time dateTime={date && !Number.isNaN(date.getTime()) ? decision.createdAt : undefined}>{timestamp}</time> (giờ Việt Nam)
          {decision.sourceTelemetryId && <> · Bản ghi cảm biến #{decision.sourceTelemetryId}</>}
        </p>
        {decision.modelName && <p className="muted">Model / bộ xử lý: {decision.modelName}</p>}
        <p className="muted">Đây là trạng thái hệ thống yêu cầu. Thiết bị chỉ được xác nhận đã thực hiện khi có phản hồi ACK.</p>
      </>}
  </section>;
}
