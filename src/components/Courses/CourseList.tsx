// src/components/Courses/CourseList.tsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useRouter } from "next/router";

interface Course {
  courseId: string;
  deptId: number;
  courseName: string;
  credit: number;
  creditHours: number;
}

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get<Course[]>("/courses");
      setCourses(response.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (confirm("确定要删除这个课程吗？")) {
      try {
        await api.delete(`/courses/${courseId}`);
        setCourses(courses.filter((course) => course.courseId !== courseId));
      } catch (error) {
        console.error("Error deleting course:", error);
      }
    }
  };

  const handleEdit = (courseId: string) => {
    router.push(`/courses/edit/${courseId}`);
  };

  return (
    <div>
      <Button
        variant='contained'
        color='primary'
        component={Link}
        href='/courses/create'
        className='mb-4'>
        创建新课程
      </Button>
      <TableContainer component={Paper}>
        <Table aria-label='courses table'>
          <TableHead>
            <TableRow>
              <TableCell>课程ID</TableCell>
              <TableCell>部门ID</TableCell>
              <TableCell>课程名称</TableCell>
              <TableCell>学分</TableCell>
              <TableCell>学时</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.courseId}>
                <TableCell>{course.courseId}</TableCell>
                <TableCell>{course.deptId}</TableCell>
                <TableCell>{course.courseName}</TableCell>
                <TableCell>{course.credit}</TableCell>
                <TableCell>{course.creditHours}</TableCell>
                <TableCell>
                  <IconButton
                    color='primary'
                    onClick={() => handleEdit(course.courseId)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    color='secondary'
                    onClick={() => handleDelete(course.courseId)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {courses.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align='center'>
                  没有课程数据。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default CourseList;
