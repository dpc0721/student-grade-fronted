import React, { useEffect, useState } from "react";
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
  Box,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";

interface CourseSelection {
  courseId: string;
  courseName: string;
  teacherName: string;
  staffId: string; // 对应老师或职工ID
  deptName: string;
  classTime: string;
  isSelected: boolean; // 标识当前学生是否已选该课程
  semester: string; // 学期
}

interface StudentInfo {
  studentId: number;
  name: string;
  sex: string;
  dateOfBirth: string;
  nativePlace: string;
  mobilePhone: string;
  deptName: string;
  status: string | null;
}

const parseClassTime = (timeStr: string) => {
  const match = timeStr.match(/(星期[一二三四五])(\d+)-(\d+)/);
  if (match) {
    const day = match[1];
    const start = Number(match[2]);
    const end = Number(match[3]);
    const slots = [];
    for (let i = start; i <= end; i++) {
      slots.push(i);
    }
    return { day, slots };
  }
  return null;
};

const colorPalette = [
  "#90caf9",
  "#f48fb1",
  "#ce93d8",
  "#81c784",
  "#ffb74d",
  "#4dd0e1",
  "#ffd54f",
];
const getCourseColor = (courseName: string) => {
  let hash = 0;
  for (let i = 0; i < courseName.length; i++) {
    hash = courseName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
};

const StudentDashboard: React.FC = () => {
  const { userId } = useAuth();
  const [selectedCourses, setSelectedCourses] = useState<CourseSelection[]>([]);
  const [search, setSearch] = useState<string>("");

  // 可选课程状态
  interface AvailableCourse {
    courseId: string;
    courseName: string;
    teacherName: string;
    deptName: string;
    classTime: string;
    staffId: string;
    semester: string;
  }
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>(
    []
  );
  const [searchResults, setSearchResults] = useState<AvailableCourse[]>([]);

  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  type Schedule = {
    星期一: string[];
    星期二: string[];
    星期三: string[];
    星期四: string[];
    星期五: string[];
  };
  const [schedule, setSchedule] = useState<Schedule>({
    星期一: Array(12).fill(""),
    星期二: Array(12).fill(""),
    星期三: Array(12).fill(""),
    星期四: Array(12).fill(""),
    星期五: Array(12).fill(""),
  });

  const [selectedSemester, setSelectedSemester] = useState<string>("");
  const [allSemesters, setAllSemesters] = useState<string[]>([]);
  const [courseOptions, setCourseOptions] = useState<string[]>([]);

  // 初始化时读取 chosenSemester
  useEffect(() => {
    const storedSemester = localStorage.getItem("chosenSemester") || "";
    setSelectedSemester(storedSemester);
  }, []);

  // 页面刷新时始终调用接口获取最新数据，不使用 localStorage 缓存
  useEffect(() => {
    fetchSelectedCourses();
    fetchStudentInfo();
  }, [selectedSemester, userId]);

  useEffect(() => {
    const fetchAllSemesters = async () => {
      try {
        const classesRes = await api.get<any[]>("/classes");
        const semesters: Set<string> = new Set();
        classesRes.data.forEach((cls) => {
          if (cls.semester) {
            semesters.add(cls.semester);
          }
        });
        setAllSemesters(Array.from(semesters));
      } catch (error) {
        console.error("Error fetching all classes:", error);
      }
    };
    fetchAllSemesters();
  }, []);

  useEffect(() => {
    const newSchedule: Schedule = {
      星期一: Array(12).fill(""),
      星期二: Array(12).fill(""),
      星期三: Array(12).fill(""),
      星期四: Array(12).fill(""),
      星期五: Array(12).fill(""),
    };
    selectedCourses
      .filter((course) => course.semester === selectedSemester)
      .forEach((course) => {
        if (course.classTime) {
          const info = parseClassTime(course.classTime);
          if (info && info.day in newSchedule) {
            info.slots.forEach((slot) => {
              newSchedule[info.day as keyof typeof newSchedule][slot - 1] =
                course.courseName;
            });
          }
        }
      });
    setSchedule(newSchedule);
  }, [selectedCourses, selectedSemester]);

  // 始终从后端接口获取最新的已选课程数据（增加详细错误日志）
  const fetchSelectedCourses = async () => {
    try {
      const response = await api.get<CourseSelection[]>(
        `/course-selections/student/${userId}/semester/${selectedSemester}`
      );
      const baseCourses = response.data;
      const courses = await Promise.all(
        baseCourses.map(async (course) => {
          try {
            const courseRes = await api.get<any>(`/courses/${course.courseId}`);
            const courseData = courseRes.data;
            const teacherRes = await api.get<any>(
              `/teachers/${course.staffId}`
            );
            const teacherData = teacherRes.data;
            const deptRes = await api.get<any>(
              `/departments/${teacherData.deptId}`
            );
            const deptData = deptRes.data;
            let updatedClassTime = "待定";
            try {
              const classRes = await api.get<any>(
                `/classes/${course.semester}/${course.courseId}/${course.staffId}`
              );
              if (classRes.data && classRes.data.classTime) {
                updatedClassTime = classRes.data.classTime;
              }
            } catch (error) {
              console.warn(`未获取到 ${course.courseId} 的班级信息`, error);
            }
            return {
              ...course,
              courseName: courseData.courseName,
              teacherName: `${teacherData.name} (${teacherData.professionalRanks})`,
              deptName: deptData.deptName,
              classTime: updatedClassTime,
              isSelected: true,
            };
          } catch (subError) {
            console.error(
              `Error processing course ${course.courseId}:`,
              subError
            );
            return {
              ...course,
              courseName: "未知课程",
              teacherName: "未知教师",
              deptName: "未知学院",
              classTime: "待定",
              isSelected: true,
            };
          }
        })
      );
      setSelectedCourses(courses);
    } catch (error: any) {
      if (error.response) {
        console.error("Error fetching selected courses:", error.response.data);
        console.error("Status code:", error.response.status);
      } else {
        console.error("Error fetching selected courses:", error.message);
      }
    }
  };

  // 获取学生基本信息（始终调用接口）
  const fetchStudentInfo = async () => {
    try {
      const response = await api.get<any>(`/students/${userId}`);
      const student = response.data;
      const deptRes = await api.get<any>(`/departments/${student.deptId}`);
      const deptData = deptRes.data;
      setStudentInfo({
        studentId: student.studentId,
        name: student.name,
        sex: student.sex,
        dateOfBirth: student.dateOfBirth,
        nativePlace: student.nativePlace,
        mobilePhone: student.mobilePhone,
        deptName: deptData.deptName,
        status: student.status,
      });
    } catch (error) {
      console.error("Error fetching student info:", error);
    }
  };

  // 获取可选课程，整合班级、课程、教师和学院信息
  const fetchAvailableCourses = async () => {
    try {
      const classesRes = await api.get<any[]>(
        `/classes/semester/${selectedSemester}`
      );
      const integrated = await Promise.all(
        classesRes.data.map(async (cls) => {
          const courseRes = await api.get<any>(`/courses/${cls.courseId}`);
          const courseDetail = courseRes.data;
          const teacherRes = await api.get<any>(`/teachers/${cls.staffId}`);
          const teacherData = teacherRes.data;
          const deptRes = await api.get<any>(
            `/departments/${teacherData.deptId}`
          );
          const deptData = deptRes.data;
          return {
            courseId: cls.courseId,
            courseName: courseDetail.courseName,
            teacherName: `${teacherData.name} (${teacherData.professionalRanks})`,
            deptName: deptData.deptName,
            classTime: cls.classTime,
            staffId: String(cls.staffId),
            semester: cls.semester,
          };
        })
      );
      setAvailableCourses(integrated);
      const lowerSearch = search.toLowerCase();
      const filtered = integrated.filter((item) =>
        [
          item.courseId,
          item.courseName,
          item.teacherName,
          item.deptName,
          item.classTime,
        ].some((field) => field.toLowerCase().includes(lowerSearch))
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error("Error fetching available courses:", error);
    }
  };

  // 选课/退课操作总是调用接口刷新数据
  const handleToggleCourse = async (course: CourseSelection) => {
    if (course.isSelected) {
      try {
        await api.delete(
          `/course-selections/${Number(userId)}/${course.semester}/${
            course.courseId
          }`
        );
        alert("退课成功");
        fetchSelectedCourses();
        if (searchResults.length > 0) {
          fetchAvailableCourses();
        }
      } catch (error) {
        console.error("Error withdrawing course:", error);
        alert("退课失败");
      }
    } else {
      // 新增：判断已选课程中是否存在相同课程名称
      if (selectedCourses.some((c) => c.courseName === course.courseName)) {
        alert("不能选两门相同的课程");
        return;
      }
      const newCourseTime = parseClassTime(course.classTime);
      if (newCourseTime) {
        const conflict = selectedCourses.some((selected) => {
          const selectedTime = parseClassTime(selected.classTime);
          if (!selectedTime) return false;
          if (selectedTime.day !== newCourseTime.day) return false;
          return selectedTime.slots.some((slot) =>
            newCourseTime.slots.includes(slot)
          );
        });
        if (conflict) {
          alert("上课时间冲突，无法选课");
          return;
        }
      }
      try {
        const requestData = {
          courseId: course.courseId,
          score: 0,
          semester: course.semester,
          staffId: Number(course.staffId),
          studentId: Number(userId),
        };
        await api.post("/course-selections", requestData);
        alert("选课成功");
        fetchSelectedCourses();
        if (searchResults.length > 0) {
          fetchAvailableCourses();
        }
      } catch (error) {
        console.error("Error selecting course:", error);
        alert("选课失败");
      }
    }
  };

  // 渲染课程表格单行
  const renderCourseRow = (course: CourseSelection) => (
    <TableRow key={`${course.courseId}-${course.staffId}`}>
      <TableCell>{course.semester || "未知学期"}</TableCell>
      <TableCell>{course.courseId}</TableCell>
      <TableCell>{course.courseName || "未知课程"}</TableCell>
      <TableCell>{course.teacherName || "未知教师"}</TableCell>
      <TableCell>{course.deptName || "未知学院"}</TableCell>
      <TableCell>{course.classTime || "待定"}</TableCell>
      <TableCell>
        <Button
          variant='contained'
          color={course.isSelected ? "secondary" : "primary"}
          onClick={() => handleToggleCourse(course)}>
          {course.isSelected ? "退课" : "选课"}
        </Button>
      </TableCell>
    </TableRow>
  );

  useEffect(() => {
    const fetchCoursesForAutocomplete = async () => {
      try {
        const res = await api.get<{ courseId: string; courseName: string }[]>(
          "/courses"
        );
        const names = res.data.map((c) => c.courseName);
        setCourseOptions(names);
      } catch (error) {
        console.error("error fetching courses for autocomplete", error);
      }
    };
    fetchCoursesForAutocomplete();
  }, []);

  return (
    <Container className='mt-8'>
      <Typography
        variant='h4'
        align='center'
        gutterBottom>
        学生选课信息
      </Typography>
      {studentInfo && (
        <Box mb={4}>
          <Typography variant='h6'>姓名: {studentInfo.name}</Typography>
          <Typography variant='h6'>学号: {studentInfo.studentId}</Typography>
          <Typography variant='h6'>性别: {studentInfo.sex}</Typography>
          <Typography variant='h6'>
            出生日期: {studentInfo.dateOfBirth}
          </Typography>
          <Typography variant='h6'>籍贯: {studentInfo.nativePlace}</Typography>
          <Typography variant='h6'>
            手机号码: {studentInfo.mobilePhone}
          </Typography>
          <Typography variant='h6'>所属学院: {studentInfo.deptName}</Typography>
          <Typography variant='h6'>状态: {studentInfo.status}</Typography>
        </Box>
      )}
      <Box
        display='flex'
        flexWrap='wrap'
        gap={2}
        mb={2}>
        <Autocomplete
          freeSolo
          options={courseOptions}
          value={search}
          onChange={(e, newValue) => setSearch(newValue || "")}
          sx={{ flex: 1, minWidth: 300 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label='搜索课程（支持任意匹配）'
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />
          )}
        />
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
      <Button
        variant='contained'
        color='primary'
        onClick={fetchAvailableCourses}
        fullWidth
        className='mt-2'>
        搜索
      </Button>
      {selectedCourses.length > 0 && (
        <>
          <Typography
            variant='h5'
            className='mt-4'>
            已选课程
          </Typography>
          <TableContainer
            component={Paper}
            className='mt-2'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>学期</TableCell>
                  <TableCell>课程ID</TableCell>
                  <TableCell>课程名称</TableCell>
                  <TableCell>教师名称</TableCell>
                  <TableCell>学院</TableCell>
                  <TableCell>上课时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedCourses.map((course) => renderCourseRow(course))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      {searchResults.length > 0 && (
        <>
          <Typography
            variant='h5'
            className='mt-4'>
            搜索结果
          </Typography>
          <TableContainer
            component={Paper}
            className='mt-2'>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>学期</TableCell>
                  <TableCell>课程ID</TableCell>
                  <TableCell>课程名称</TableCell>
                  <TableCell>教师名称</TableCell>
                  <TableCell>学院</TableCell>
                  <TableCell>上课时间</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchResults.map((course, index) => (
                  <TableRow key={index}>
                    <TableCell>{course.semester}</TableCell>
                    <TableCell>{course.courseId}</TableCell>
                    <TableCell>{course.courseName}</TableCell>
                    <TableCell>{course.teacherName}</TableCell>
                    <TableCell>{course.deptName}</TableCell>
                    <TableCell>{course.classTime}</TableCell>
                    <TableCell>
                      <Button
                        variant='contained'
                        color='primary'
                        onClick={() =>
                          handleToggleCourse({ ...course, isSelected: false })
                        }>
                        选课
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      {selectedCourses.length > 0 && (
        <Box
          mt={4}
          sx={{ overflowX: "auto" }}>
          <Typography
            variant='h5'
            gutterBottom>
            课程表 ({selectedSemester})
          </Typography>
          <Box>
            <Box display='flex'>
              <Box
                sx={{
                  width: "50px",
                  height: 40,
                  borderRight: "1px solid #ccc",
                }}
              />
              <Box
                display='flex'
                flex={1}>
                {["星期一", "星期二", "星期三", "星期四", "星期五"].map(
                  (day) => (
                    <Box
                      key={day}
                      sx={{
                        width: "18%",
                        height: 40,
                        borderRight: "1px solid #ccc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.9rem",
                        borderBottom: "1px solid #ccc",
                      }}>
                      {day}
                    </Box>
                  )
                )}
              </Box>
            </Box>
            <Box display='flex'>
              <Box sx={{ width: "50px", borderRight: "1px solid #ccc" }}>
                {Array.from({ length: 12 }).map((_, index) => (
                  <Box
                    key={index}
                    sx={{
                      height: 40,
                      borderBottom: "1px solid #eee",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem",
                    }}>
                    {index + 1}节
                  </Box>
                ))}
              </Box>
              <Box
                display='flex'
                flex={1}
                position='relative'>
                {["星期一", "星期二", "星期三", "星期四", "星期五"].map(
                  (day) => {
                    const daySchedule = schedule[day as keyof typeof schedule];
                    const blocks: {
                      courseName: string;
                      start: number;
                      duration: number;
                    }[] = [];
                    let i = 0;
                    while (i < daySchedule.length) {
                      if (daySchedule[i]) {
                        const courseName = daySchedule[i];
                        let start = i;
                        let j = i;
                        while (
                          j < daySchedule.length &&
                          daySchedule[j] === courseName
                        ) {
                          j++;
                        }
                        blocks.push({ courseName, start, duration: j - i });
                        i = j;
                      } else {
                        i++;
                      }
                    }
                    return (
                      <Box
                        key={day}
                        sx={{
                          width: "18%",
                          height: 12 * 40,
                          borderRight: "1px solid #ccc",
                          position: "relative",
                        }}>
                        {blocks.map((block, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              position: "absolute",
                              top: block.start * 40,
                              left: 5,
                              right: 5,
                              height: block.duration * 40 - 5,
                              backgroundColor: getCourseColor(block.courseName),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "4px",
                              color: "#fff",
                              fontWeight: "bold",
                              overflow: "hidden",
                              fontSize: "0.8rem",
                            }}>
                            {block.courseName}
                          </Box>
                        ))}
                      </Box>
                    );
                  }
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Container>
  );
};

export default StudentDashboard;
