import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Box,
  MenuItem,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import DonutChart from "../../components/DonutChart";

// 班级信息（来自 /api/classes/teacher/{staffId}）
interface Course {
  semester: string;
  courseId: string;
  staffId: number;
  classTime: string;
}

// 课程详细信息（来自 /api/courses/{courseId}）
interface CourseDetail {
  courseId: string;
  deptId: number;
  courseName: string;
  credit: number;
  creditHours: number;
}

// 选课中返回的学生简要信息
interface Student {
  studentId: string;
  studentName: string;
  score: number;
}

// 学生详细信息（需要调用 /api/students/{studentId} 获取）
interface StudentDetail {
  studentId: number;
  name: string;
  sex: string;
  dateOfBirth: string;
  nativePlace: string;
  mobilePhone: string;
  deptId: number;
  status: string | null;
}

// 新增教师信息接口定义
interface TeacherInfo {
  staffId: number;
  deptName: string; // 使用学院名称替换deptId
  name: string;
  sex: string;
  dateOfBirth: string;
  professionalRanks: string;
  salary: number;
}

const TeacherDashboard: React.FC = () => {
  const { userId } = useAuth(); // 假设当前教师的 userId 即为 staffId
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseDetails, setCourseDetails] = useState<
    Record<string, CourseDetail>
  >({});
  const [search, setSearch] = useState<string>("");
  const [classStudents, setClassStudents] = useState<Record<string, Student[]>>(
    {}
  );
  const [expandedCourses, setExpandedCourses] = useState<string[]>([]);
  const [updatedScores, setUpdatedScores] = useState<Record<string, number>>(
    {}
  );
  // 存储通过 /api/students/{studentId} 获取的学生详细信息，key 为 studentId
  const [studentDetails, setStudentDetails] = useState<
    Record<string, StudentDetail>
  >({});
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo | null>(null);

  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [allSemesters, setAllSemesters] = useState<string[]>([]);

  // 新增：获取教师基本信息，并替换deptId为学院名称
  const fetchTeacherInfo = async () => {
    try {
      const response = await api.get<any>(`/teachers/${userId}`);
      const teacher = response.data;
      const deptRes = await api.get<any>(`/departments/${teacher.deptId}`);
      const deptData = deptRes.data;
      setTeacherInfo({
        staffId: teacher.staffId,
        deptName: deptData.deptName,
        name: teacher.name,
        sex: teacher.sex,
        dateOfBirth: teacher.dateOfBirth,
        professionalRanks: teacher.professionalRanks,
        salary: teacher.salary,
      });
    } catch (error) {
      console.error("Error fetching teacher info:", error);
    }
  };

  useEffect(() => {
    const storedSemester = localStorage.getItem("chosenSemester") || "";
    setSelectedSemester(storedSemester);
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTeacherInfo();
      fetchCourses();
    }
  }, [userId]);

  // 获取教师管辖下的班级信息
  const fetchCourses = async () => {
    try {
      // 确保 userId 有效，否则后端可能返回 400 错误
      const response = await api.get(`/classes/teacher/${userId}`);
      const data: Course[] = response.data;
      // 如果设置了学期，则过滤
      const filtered = selectedSemester
        ? data.filter((course) => course.semester === selectedSemester)
        : data;
      setAllCourses(data);
      setCourses(filtered);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    // 提取所有学期，并存入状态
    if (allCourses.length > 0) {
      const semesters = new Set(allCourses.map((c) => c.semester));
      setAllSemesters(Array.from(semesters));
    }
  }, [allCourses]);

  useEffect(() => {
    if (userId) {
      fetchCourses();
    }
  }, [selectedSemester, userId]);

  // 当班级信息发生变化时，为每个班级调用接口获取详细信息（如果未获取过）
  useEffect(() => {
    courses.forEach((course) => {
      if (!courseDetails[course.courseId]) {
        api
          .get<CourseDetail>(`/courses/${course.courseId}`)
          .then((response) => {
            setCourseDetails((prev) => ({
              ...prev,
              [course.courseId]: response.data,
            }));
          })
          .catch((error) => {
            console.error("Error fetching course details:", error);
          });
      }
    });
  }, [courses, courseDetails]);

  // 更新 handleSearch 函数实现搜索功能
  const handleSearch = () => {
    if (!search.trim()) {
      // 输入为空则显示所有班级
      setCourses(allCourses);
    } else {
      const filtered = allCourses.filter((course) => {
        const courseName = courseDetails[course.courseId]?.courseName || "";
        return (
          course.courseId.toLowerCase().includes(search.toLowerCase()) ||
          courseName.toLowerCase().includes(search.toLowerCase())
        );
      });
      if (filtered.length === 0) {
        setNotification({
          open: true,
          message: "未找到匹配的班级",
          severity: "error",
        });
      }
      setCourses(filtered);
    }
  };

  // 获取指定学生的详细信息，如果未加载过则调用 /api/students/{studentId}
  const fetchStudentDetail = async (studentId: string) => {
    if (!studentDetails[studentId]) {
      try {
        const response = await api.get<StudentDetail>(`/students/${studentId}`);
        setStudentDetails((prev) => ({
          ...prev,
          [studentId]: response.data,
        }));
      } catch (error) {
        console.error("Error fetching student detail:", error);
      }
    }
  };

  // 新增通用函数：预加载课程的学生数据
  const fetchStudentsForCourse = async (
    course: Course,
    setClassStudents: React.Dispatch<
      React.SetStateAction<Record<string, Student[]>>
    >,
    fetchStudentDetail: (studentId: string) => Promise<void>
  ) => {
    try {
      const response = await api.get<Student[]>(
        `/course-selections/${course.courseId}/${course.staffId}`
      );
      setClassStudents((prev) => ({
        ...prev,
        [course.courseId]: response.data,
      }));
      response.data.forEach((student) => {
        fetchStudentDetail(student.studentId);
      });
    } catch (error) {
      console.error("Error fetching students for course:", error);
    }
  };

  // 当 courses 更新后预加载所有课程的学生数据
  useEffect(() => {
    courses.forEach((course) => {
      if (!classStudents[course.courseId]) {
        fetchStudentsForCourse(course, setClassStudents, fetchStudentDetail);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses]);

  // 展开或收起某个班级的学生列表
  const toggleExpansion = async (course: Course) => {
    if (expandedCourses.includes(course.courseId)) {
      setExpandedCourses(
        expandedCourses.filter((id) => id !== course.courseId)
      );
    } else {
      if (!classStudents[course.courseId]) {
        try {
          // 获取当前课程学生简要信息
          const response = await api.get<Student[]>(
            `/course-selections/${course.courseId}/${course.staffId}`
          );
          setClassStudents((prev) => ({
            ...prev,
            [course.courseId]: response.data,
          }));
          // 保存成绩到 updatedScores 状态，并调用获取详细信息
          response.data.forEach((student) => {
            setUpdatedScores((prev) => ({
              ...prev,
              [`${course.courseId}_${student.studentId}`]: student.score,
            }));
            fetchStudentDetail(student.studentId);
          });
        } catch (error) {
          console.error("Error fetching students for course:", error);
        }
      }
      setExpandedCourses([...expandedCourses, course.courseId]);
    }
  };

  // 踢出学生操作
  const handleKickStudent = async (course: Course, studentId: string) => {
    try {
      console.log(
        "kicking out sutdents...",
        `Id:${studentId}`,
        `course semester:${course.semester}`,
        `courseId:${course.courseId}`
      );
      await api.delete(
        `/course-selections/${studentId}/${course.semester}/${course.courseId}`
      );
      const response = await api.get<Student[]>(
        `/course-selections/${course.courseId}/${course.staffId}`
      );
      setClassStudents((prev) => ({
        ...prev,
        [course.courseId]: response.data,
      }));
      setNotification({
        open: true,
        message: "踢出学生成功",
        severity: "success",
      });
    } catch (error) {
      console.error("Error kicking out student:", error);
      setNotification({ open: true, message: "踢出失败", severity: "error" });
    }
  };

  // 修改学生成绩操作
  const handleUpdateScore = async (course: Course, studentId: string) => {
    const key = `${course.courseId}_${studentId}`;
    const newScore = updatedScores[key];
    try {
      await api.put(
        `/course-selections/${studentId}/${course.semester}/${course.courseId}`,
        {
          score: newScore,
        }
      );
      // 更新成功后刷新该班级学生数据
      const response = await api.get<Student[]>(
        `/course-selections/${course.courseId}/${course.staffId}`
      );
      setClassStudents((prev) => ({
        ...prev,
        [course.courseId]: response.data,
      }));
      setNotification({
        open: true,
        message: "更新成绩成功",
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating student score:", error);
      setNotification({
        open: true,
        message: "更新成绩失败",
        severity: "error",
      });
    }
  };

  // 在组件函数内新增聚合统计数据计算
  const aggregatedStats = useMemo(() => {
    const totalClasses = courses.length;
    const deptSet = new Set<number>();
    courses.forEach((course) => {
      const details = courseDetails[course.courseId];
      if (details?.deptId) {
        deptSet.add(details.deptId);
      }
    });
    const departments = Array.from(deptSet).join(", ");

    let maleCount = 0,
      femaleCount = 0;
    Object.values(classStudents).forEach((students) => {
      students.forEach((student) => {
        const detail = studentDetails[student.studentId];
        if (detail?.sex) {
          // 根据返回的性别值同时判断M/F和男/女
          if (detail.sex === "男" || detail.sex === "M") {
            maleCount++;
          } else if (detail.sex === "女" || detail.sex === "F") {
            femaleCount++;
          }
        }
      });
    });
    const totalStudents = maleCount + femaleCount;
    const malePercent = totalStudents
      ? ((maleCount / totalStudents) * 100).toFixed(1)
      : "0";
    const femalePercent = totalStudents
      ? ((femaleCount / totalStudents) * 100).toFixed(1)
      : "0";

    const classStats = courses.map((course) => {
      const students = classStudents[course.courseId] || [];
      if (students.length === 0)
        return { courseId: course.courseId, avg: "-", max: "-" };
      const scores = students.map((s) => s.score);
      const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(
        1
      );
      const max = Math.max(...scores);
      return { courseId: course.courseId, avg, max };
    });
    return {
      totalClasses,
      departments,
      maleCount,
      femaleCount,
      malePercent,
      femalePercent,
      classStats,
    };
  }, [courses, courseDetails, classStudents, studentDetails]);

  return (
    <Container className='mt-8'>
      <Typography
        variant='h4'
        align='center'
        gutterBottom>
        教师课程班级信息
      </Typography>
      {/* 新增：教师基本信息展示区域 */}
      {teacherInfo && (
        <Box
          mb={4}
          p={2}
          border='1px solid #ccc'
          borderRadius={2}>
          <Typography variant='h6'>姓名：{teacherInfo.name}</Typography>
          <Typography variant='h6'>性别：{teacherInfo.sex}</Typography>
          <Typography variant='h6'>
            出生日期：{teacherInfo.dateOfBirth}
          </Typography>
          <Typography variant='h6'>
            职称：{teacherInfo.professionalRanks}
          </Typography>
          <Typography variant='h6'>工资：{teacherInfo.salary}</Typography>
          <Typography variant='h6'>所属学院：{teacherInfo.deptName}</Typography>
        </Box>
      )}
      <Box
        display='flex'
        justifyContent='flex-end'
        mb={2}>
        <TextField
          select
          label='选择学期'
          value={selectedSemester}
          onChange={(e) => {
            setSelectedSemester(e.target.value);
            localStorage.setItem("chosenSemester", e.target.value);
          }}
          sx={{ width: 200 }}>
          {allSemesters.map((sem) => (
            <MenuItem
              key={sem}
              value={sem}>
              {sem}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <TextField
        label='搜索课程'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        margin='normal'
      />
      <Button
        variant='contained'
        color='primary'
        onClick={handleSearch}
        fullWidth
        className='mt-4'>
        搜索
      </Button>

      {/* 新增图形化统计部分 */}
      <Box mt={4}>
        <Typography
          variant='h5'
          gutterBottom>
          图形化统计
        </Typography>
        <Typography
          variant='body1'
          color='primary'>
          班级总数: {aggregatedStats.totalClasses}
        </Typography>
        <Typography
          variant='body1'
          color='secondary'>
          所属学院: {aggregatedStats.departments || "无"}
        </Typography>
        <Typography variant='body1'>
          学生性别比例 - 男: {aggregatedStats.malePercent}% ， 女:{" "}
          {aggregatedStats.femalePercent}%
        </Typography>
        {/* 使用扇形图展示性别比例 */}
        <Box
          display='flex'
          justifyContent='center'
          mt={2}>
          <DonutChart
            data={[
              { name: "男", value: aggregatedStats.maleCount },
              { name: "女", value: aggregatedStats.femaleCount },
            ]}
          />
        </Box>
        <TableContainer
          component={Paper}
          sx={{ mt: 2 }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>课程ID</TableCell>
                <TableCell>平均分</TableCell>
                <TableCell>最高分</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {aggregatedStats.classStats.map((stat) => (
                <TableRow key={stat.courseId}>
                  <TableCell>{stat.courseId}</TableCell>
                  <TableCell>{stat.avg}</TableCell>
                  <TableCell>{stat.max}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {courses.length === 0 ? (
        <Typography
          variant='h6'
          align='center'
          className='mt-4'>
          暂无班级信息
        </Typography>
      ) : (
        <TableContainer
          component={Paper}
          className='mt-4'>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>学期</TableCell>
                <TableCell>课程ID</TableCell>
                <TableCell>课程名称</TableCell>
                <TableCell>上课时间</TableCell>
                <TableCell>操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <React.Fragment key={course.courseId}>
                  <TableRow>
                    <TableCell>{course.semester}</TableCell>
                    <TableCell>{course.courseId}</TableCell>
                    <TableCell>
                      {courseDetails[course.courseId]
                        ? courseDetails[course.courseId].courseName
                        : "加载中..."}
                    </TableCell>
                    <TableCell>{course.classTime}</TableCell>
                    <TableCell>
                      <Button
                        variant='contained'
                        color='primary'
                        onClick={() => toggleExpansion(course)}>
                        {expandedCourses.includes(course.courseId)
                          ? "隐藏学生"
                          : "查看学生"}
                      </Button>
                    </TableCell>
                  </TableRow>
                  {expandedCourses.includes(course.courseId) && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        {classStudents[course.courseId] ? (
                          <Table size='small'>
                            <TableHead>
                              <TableRow>
                                <TableCell>学生ID</TableCell>
                                <TableCell>姓名</TableCell>
                                <TableCell>性别</TableCell>
                                <TableCell>出生日期</TableCell>
                                <TableCell>籍贯</TableCell>
                                <TableCell>手机号码</TableCell>
                                <TableCell>成绩</TableCell>
                                <TableCell>操作</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {classStudents[course.courseId].length > 0 ? (
                                classStudents[course.courseId].map(
                                  (student) => {
                                    const key = `${course.courseId}_${student.studentId}`;
                                    // 从 studentDetails 状态中获取详细信息
                                    const detail =
                                      studentDetails[student.studentId];
                                    return (
                                      <TableRow key={student.studentId}>
                                        <TableCell>
                                          {student.studentId}
                                        </TableCell>
                                        <TableCell>
                                          {detail
                                            ? detail.name
                                            : student.studentName}
                                        </TableCell>
                                        <TableCell>
                                          {detail ? detail.sex : "加载中..."}
                                        </TableCell>
                                        <TableCell>
                                          {detail
                                            ? detail.dateOfBirth
                                            : "加载中..."}
                                        </TableCell>
                                        <TableCell>
                                          {detail
                                            ? detail.nativePlace
                                            : "加载中..."}
                                        </TableCell>
                                        <TableCell>
                                          {detail
                                            ? detail.mobilePhone
                                            : "加载中..."}
                                        </TableCell>
                                        <TableCell>
                                          <TextField
                                            type='number'
                                            value={
                                              updatedScores[key] ||
                                              student.score
                                            }
                                            onChange={(e) =>
                                              setUpdatedScores((prev) => ({
                                                ...prev,
                                                [key]: Number(e.target.value),
                                              }))
                                            }
                                            size='small'
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Button
                                            variant='contained'
                                            color='primary'
                                            onClick={() =>
                                              handleUpdateScore(
                                                course,
                                                student.studentId
                                              )
                                            }
                                            style={{ marginRight: 8 }}>
                                            更新成绩
                                          </Button>
                                          <Button
                                            variant='contained'
                                            color='secondary'
                                            onClick={() =>
                                              handleKickStudent(
                                                course,
                                                student.studentId
                                              )
                                            }>
                                            踢出
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  }
                                )
                              ) : (
                                <TableRow>
                                  <TableCell
                                    colSpan={8}
                                    align='center'>
                                    暂无学生选课
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        ) : (
                          <Typography variant='body1'>加载中...</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}>
        <Alert
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: "100%" }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TeacherDashboard;
