/**
 * 因果链时间轴：横轴是年份，纵轴是因果层级（上游垫在下层）。
 *
 * 用 SVG 而不是 Canvas：节点与边都要可点、可选中、要能挂文本，
 * DOM 侧直接处理这些更省事，节点量在百级也不会卡。
 */
import { useMemo } from "react";
import {
  EDGE_LABELS,
  layoutTimeline,
  relatedEdges,
  relatedEventIds,
  type ChainCourse,
  type EdgeKind,
  type LayoutNode,
} from "../core/chain.ts";

const KIND_COLOR: Record<EdgeKind, string> = {
  caused: "#e5533c",
  enabled: "#2e7cf6",
  triggered: "#f6a623",
  revealed: "#12a594",
};

const ROLE_COLOR: Record<string, string> = {
  cause: "#5b6bd6",
  core: "#e5533c",
  effect: "#12a594",
};

const ROLE_LABEL: Record<string, string> = {
  cause: "起因",
  core: "枢纽",
  effect: "后果",
};

const VIEW_W = 1600;
const LAYER_H = 118;
const NODE_R = 15;

interface Props {
  course: ChainCourse;
  selectedId: string | null;
  onSelect: (eventId: string) => void;
}

export default function Timeline({ course, selectedId, onSelect }: Props) {
  const { nodes, height, byId } = useMemo(() => {
    const laid = layoutTimeline(course, { width: VIEW_W, height: 420, layerHeight: LAYER_H });
    const map = new Map<string, LayoutNode>();
    for (const n of laid) map.set(n.event.id, n);
    const h = Math.max(320, ...laid.map((n) => n.y + 80));
    return { nodes: laid, height: h, byId: map };
  }, [course]);

  /** 选中事件相关的边高亮，其余淡出：一眼看清「它因谁、又因谁」 */
  const active = useMemo(() => {
    if (!selectedId) return null;
    return new Set(relatedEdges(course, selectedId).map((e) => `${e.from}->${e.to}`));
  }, [course, selectedId]);

  const related = useMemo(() => {
    if (!selectedId) return null;
    return relatedEventIds(course, selectedId);
  }, [course, selectedId]);

  return (
    <div style={{ width: "100%", overflowX: "auto", overflowY: "hidden" }}>
      <svg
        width={VIEW_W}
        height={height}
        viewBox={`0 0 ${VIEW_W} ${height}`}
        style={{ display: "block", background: "#fbfaf7", borderRadius: 12 }}
        role="img"
        aria-label={`${course.title} 的因果链时间轴`}
      >
        <defs>
          {Object.entries(KIND_COLOR).map(([k, c]) => (
            <marker
              key={k}
              id={`arrow-${k}`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={c} />
            </marker>
          ))}
        </defs>

        {/* 层位基准线：同一层是同一「因果高度」 */}
        {Array.from(new Set(nodes.map((n) => n.layer))).map((l) => (
          <g key={`layer-${l}`}>
            <line
              x1={40}
              x2={VIEW_W - 40}
              y1={nodes.find((n) => n.layer === l)!.y}
              y2={nodes.find((n) => n.layer === l)!.y}
              stroke="#d8d2c4"
              strokeDasharray="4 6"
            />
            <text x={8} y={nodes.find((n) => n.layer === l)!.y - 14} fontSize={12} fill="#9a917c">
              第 {l + 1} 层
            </text>
          </g>
        ))}

        {/* 因果边 */}
        {course.edges.map((e) => {
          const a = byId.get(e.from);
          const b = byId.get(e.to);
          if (!a || !b) return null;
          const key = `${e.from}->${e.to}`;
          const dim = active && !active.has(key);
          const color = KIND_COLOR[e.kind];
          const x1 = a.x;
          const y1 = a.y;
          const x2 = b.x;
          const y2 = b.y;
          /* 同层或回指的边走侧向弧，不然会和节点重叠 */
          const side = y2 <= y1;
          const path = side
            ? `M ${x1 + NODE_R} ${y1} C ${x1 + 90} ${y1 - 70}, ${x2 - 90} ${y2 - 70}, ${x2 - NODE_R} ${y2}`
            : `M ${x1} ${y1 + NODE_R} C ${x1} ${y1 + 60}, ${x2} ${y2 - 60}, ${x2} ${y2 - NODE_R}`;
          return (
            <g key={key} opacity={dim ? 0.18 : 1}>
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={active?.has(key) ? 2.6 : 1.6}
                markerEnd={`url(#arrow-${e.kind})`}
              />
              {active?.has(key) && (
                <text
                  x={(x1 + x2) / 2}
                  y={(y1 + y2) / 2 - 8}
                  fontSize={12}
                  fill={color}
                  textAnchor="middle"
                  style={{ paintOrder: "stroke", stroke: "#fbfaf7", strokeWidth: 4 }}
                >
                  {EDGE_LABELS[e.kind]}
                </text>
              )}
            </g>
          );
        })}

        {/* 事件节点 */}
        {nodes.map((n) => {
          const id = n.event.id;
          const isSel = id === selectedId;
          const dim = related && !related.has(id);
          const color = ROLE_COLOR[n.event.role] ?? "#5b6bd6";
          return (
            <g
              key={id}
              transform={`translate(${n.x} ${n.y})`}
              opacity={dim ? 0.28 : 1}
              style={{ cursor: "pointer" }}
              onClick={() => onSelect(id)}
            >
              <circle
                r={isSel ? NODE_R + 4 : NODE_R}
                fill={isSel ? color : "#ffffff"}
                stroke={color}
                strokeWidth={isSel ? 4 : 2.6}
              />
              <text
                y={-NODE_R - 12}
                fontSize={12}
                fill="#6b6250"
                textAnchor="middle"
                style={{ paintOrder: "stroke", stroke: "#fbfaf7", strokeWidth: 4 }}
              >
                {n.event.year < 0 ? `前${-n.event.year}` : n.event.year}
              </text>
              <text
                y={NODE_R + 20}
                fontSize={13}
                fontWeight={isSel ? 700 : 500}
                fill="#2c2a24"
                textAnchor="middle"
                style={{ paintOrder: "stroke", stroke: "#fbfaf7", strokeWidth: 5 }}
              >
                {n.event.title}
              </text>
              <text y={NODE_R + 36} fontSize={11} fill="#9a917c" textAnchor="middle">
                {ROLE_LABEL[n.event.role] ?? ""}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
