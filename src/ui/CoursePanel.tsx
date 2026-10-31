/**
 * 课程栏：选课、看课程导言，并把数据自检的结果摊开（有问题当场说，不装没看见）。
 */
import { Alert, Card, List, Space, Tag, Typography } from "antd";
import { useMemo } from "react";
import { validateCourse, type ChainCourse } from "../core/chain.ts";

const { Paragraph, Text } = Typography;

interface Props {
  courses: ChainCourse[];
  currentId: string;
  course: ChainCourse;
  onPick: (id: string) => void;
}

export default function CoursePanel({ courses, currentId, course, onPick }: Props) {
  const issues = useMemo(() => validateCourse(course), [course]);

  return (
    <Space orientation="vertical" size={10} style={{ width: "100%" }}>
      <Card size="small" title="课程">
        <List
          size="small"
          dataSource={courses}
          renderItem={(c) => (
            <List.Item
              style={{ cursor: "pointer", color: c.id === currentId ? "#2e7cf6" : undefined }}
              onClick={() => onPick(c.id)}
            >
              <List.Item.Meta
                title={c.title}
                description={
                  <Text type="secondary" style={{ fontSize: 11.5 }}>
                    {c.era}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Card size="small" title="课程导言">
        <Tag color="orange">{course.era}</Tag>
        <Paragraph style={{ marginBottom: 8, fontSize: 12.5, lineHeight: 1.75 }}>{course.summary}</Paragraph>
        <Text type="secondary" style={{ fontSize: 11.5 }}>
          {course.events.length} 个事件 · {course.edges.length} 条因果边 · {course.actors.length} 位人物
        </Text>
      </Card>

      {issues.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`课程数据有 ${issues.length} 处待确认`}
          description={
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11.5 }}>
              {issues.map((i, k) => (
                <li key={k}>{i.message}</li>
              ))}
            </ul>
          }
        />
      )}
    </Space>
  );
}
