/**
 * 工作台三栏：左选课与导言，中间因果链时间轴，右看选中事件的因与果。
 */
import { useMemo } from "react";
import CoursePanel from "../ui/CoursePanel.tsx";
import EventPanel from "../ui/EventPanel.tsx";
import Timeline from "../ui/Timeline.tsx";
import { COURSES, courseById } from "../data/courses.ts";
import { useHistory } from "../state.ts";

export default function Workbench() {
  const courseId = useHistory((s) => s.courseId);
  const selectedEventId = useHistory((s) => s.selectedEventId);
  const setCourse = useHistory((s) => s.setCourse);
  const selectEvent = useHistory((s) => s.selectEvent);
  const course = useMemo(() => courseById(courseId) ?? COURSES[0], [courseId]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#f7f5f0" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 20px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          background: "#fffdf8",
        }}
      >
        <span style={{ fontSize: 22 }}>⌛</span>
        <span>
          <span style={{ fontSize: 15, fontWeight: 700 }}>ChronoLab 历史因果实验室</span>
          <div style={{ fontSize: 11.5, opacity: 0.65 }}>时间轴 · 地图 · 因果链</div>
        </span>
      </header>

      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "290px 1fr 330px", gap: 12, padding: 12, minHeight: 0 }}>
        <div style={{ overflowY: "auto" }}>
          <CoursePanel courses={COURSES} currentId={course.id} course={course} onPick={setCourse} />
        </div>

        <div style={{ overflow: "auto", minWidth: 0 }}>
          <Timeline course={course} selectedId={selectedEventId} onSelect={selectEvent} />
        </div>

        <div style={{ overflowY: "auto", minHeight: 0 }}>
          <EventPanel course={course} eventId={selectedEventId} onSelect={selectEvent} />
        </div>
      </div>
    </div>
  );
}
