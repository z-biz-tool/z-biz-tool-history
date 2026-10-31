/**
 * 事件详情：左边是「它因谁」（入边），右边是「它又因谁」（出边）。
 * 边上的那句话是本产品的核心表达，必须整句露出，不能只留个箭头。
 */
import { Card, Empty, Space, Tag, Typography } from "antd";
import { EDGE_LABELS, formatYear, type ChainCourse, type EdgeKind } from "../core/chain.ts";

const { Text, Paragraph } = Typography;

const KIND_COLOR: Record<EdgeKind, string> = {
  caused: "#e5533c",
  enabled: "#2e7cf6",
  triggered: "#f6a623",
  revealed: "#12a594",
};

interface Props {
  course: ChainCourse;
  eventId: string | null;
  onSelect: (eventId: string) => void;
}

export default function EventPanel({ course, eventId, onSelect }: Props) {
  if (!eventId) {
    return (
      <Card size="small" title="事件详情" style={{ height: "100%" }}>
        <Empty description="在时间轴上点一个事件，看它的因与果" />
      </Card>
    );
  }
  const ev = course.events.find((e) => e.id === eventId);
  if (!ev) {
    return (
      <Card size="small" title="事件详情" style={{ height: "100%" }}>
        <Empty description="该事件不在当前课程里" />
      </Card>
    );
  }
  const place = course.places.find((p) => p.id === ev.placeId);
  const actors = course.actors.filter((a) => ev.actorIds.includes(a.id));
  const causes = course.edges.filter((e) => e.to === ev.id);
  const effects = course.edges.filter((e) => e.from === ev.id);
  const titleOf = (id: string) => course.events.find((e) => e.id === id)?.title ?? id;

  return (
    <Card size="small" title="事件详情" style={{ height: "100%", overflowY: "auto" }}>
      <Space orientation="vertical" size={12} style={{ width: "100%" }}>
        <div>
          <Tag color="gold">{formatYear(ev.year)}</Tag>
          {place && <Tag>{place.name}</Tag>}
          {actors.map((a) => (
            <Tag key={a.id} color="blue">
              {a.name}
            </Tag>
          ))}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{ev.title}</div>
        <Paragraph style={{ marginBottom: 0, fontSize: 12.5 }}>{ev.summary}</Paragraph>

        <div>
          <Text strong style={{ fontSize: 12.5 }}>
            因（{causes.length}）
          </Text>
          <Space orientation="vertical" size={8} style={{ width: "100%", marginTop: 6 }}>
            {causes.length === 0 && <Text type="secondary" style={{ fontSize: 12 }}>没有上游事件</Text>}
            {causes.map((e) => (
              <div key={`${e.from}->${e.to}`}>
                <a onClick={() => onSelect(e.from)} style={{ fontSize: 12.5 }}>
                  {titleOf(e.from)}
                </a>
                <Tag color={KIND_COLOR[e.kind]} style={{ marginLeft: 6 }}>
                  {EDGE_LABELS[e.kind]}
                </Tag>
                <div style={{ fontSize: 12, color: "#5c5648", lineHeight: 1.6 }}>{e.note}</div>
              </div>
            ))}
          </Space>
        </div>

        <div>
          <Text strong style={{ fontSize: 12.5 }}>
            果（{effects.length}）
          </Text>
          <Space orientation="vertical" size={8} style={{ width: "100%", marginTop: 6 }}>
            {effects.length === 0 && <Text type="secondary" style={{ fontSize: 12 }}>没有下游事件</Text>}
            {effects.map((e) => (
              <div key={`${e.from}->${e.to}`}>
                <a onClick={() => onSelect(e.to)} style={{ fontSize: 12.5 }}>
                  {titleOf(e.to)}
                </a>
                <Tag color={KIND_COLOR[e.kind]} style={{ marginLeft: 6 }}>
                  {EDGE_LABELS[e.kind]}
                </Tag>
                <div style={{ fontSize: 12, color: "#5c5648", lineHeight: 1.6 }}>{e.note}</div>
              </div>
            ))}
          </Space>
        </div>

        {actors.length > 0 && (
          <div>
            <Text strong style={{ fontSize: 12.5 }}>
              相关人物
            </Text>
            {actors.map((a) => (
              <div key={a.id} style={{ fontSize: 12, marginTop: 4, lineHeight: 1.6 }}>
                <Text strong>{a.name}</Text>
                <Text type="secondary">
                  {" "}
                  {a.role}
                  {a.note ? `（${a.note}）` : ""}
                </Text>
              </div>
            ))}
          </div>
        )}
      </Space>
    </Card>
  );
}
