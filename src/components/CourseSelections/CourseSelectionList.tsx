// src/components/CourseSelections/CourseSelectionList.tsx
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

interface CourseSelection {
  studentId: number;
  semester: string;
  courseId: string;
  staffId: number;
  score: number;
}

const CourseSelectionList: React.FC = () => {
  const [selections, setSelections] = useState<CourseSelection[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchSelections();
  }, []);

  const fetchSelections = async () => {
    try {
      const response = await api.get<CourseSelection[]>("/course-selections");
      setSelections(response.data);
    } catch (error) {
      console.error("Error fetching course selections:", error);
    }
  };

  const handleDelete = async (
    studentId: number,
    semester: string,
    courseId: string
  ) => {
    if (confirm("确定要删除这个选课记录吗？")) {
      try {
        await api.delete(
          `/course-selections/${studentId}/${semester}/${courseId}`
        );
        setSelections(
          selections.filter(
            (sel) =>
              !(
                sel.studentId === studentId &&
                sel.semester === semester &&
                sel.courseId === courseId
              )
          )
        );
      } catch (error) {
        console.error("Error deleting course selection:", error);
      }
    }
  };

  const handleEdit = (
    studentId: number,
    semester: string,
    courseId: string
  ) => {
    router.push(`/course-selections/edit/${studentId}/${semester}/${courseId}`);
  };

  return (
    <div>
      <Button
        variant='contained'
        color='primary'
        component={Link}
        href='/course-selections/create'
        className='mb-4'>
        创建新选课记录
      </Button>
      <TableContainer component={Paper}>
        <Table aria-label='course selections table'>
          <TableHead>
            <TableRow>
              <TableCell>学生ID</TableCell>
              <TableCell>学期</TableCell>
              <TableCell>课程ID</TableCell>
              <TableCell>教师ID</TableCell>
              <TableCell>成绩</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selections.map((sel, index) => (
              <TableRow key={index}>
                <TableCell>{sel.studentId}</TableCell>
                <TableCell>{sel.semester}</TableCell>
                <TableCell>{sel.courseId}</TableCell>
                <TableCell>{sel.staffId}</TableCell>
                <TableCell>{sel.score}</TableCell>
                <TableCell>
                  <IconButton
                    color='primary'
                    onClick={() =>
                      handleEdit(sel.studentId, sel.semester, sel.courseId)
                    }>
                    <Edit />
                  </IconButton>
                  <IconButton
                    color='secondary'
                    onClick={() =>
                      handleDelete(sel.studentId, sel.semester, sel.courseId)
                    }>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {selections.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align='center'>
                  没有选课记录数据。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default CourseSelectionList;
