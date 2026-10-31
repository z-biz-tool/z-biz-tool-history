/**
 * 工作台状态：只有「当前课程」与「当前选中事件」两件事是界面态，
 * 课程本体是静态数据（src/data/courses.ts），不存进 store。
 */
import { create } from "zustand";

interface HistoryStore {
  courseId: string;
  selectedEventId: string | null;
  setCourse: (courseId: string) => void;
  selectEvent: (eventId: string | null) => void;
}

export const useHistory = create<HistoryStore>((set) => ({
  courseId: "industrial-revolution",
  selectedEventId: null,
  setCourse: (courseId) => set({ courseId, selectedEventId: null }),
  selectEvent: (selectedEventId) => set({ selectedEventId }),
}));
