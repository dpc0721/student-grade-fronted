// src/components/Classes/ClassList.tsx

import React, { useEffect, useState } from "react";
import api from "../../api/axios";
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
import Link from "next/link";

interface ClassEntity {
  semester: string;
  courseId: string;
  staffId: number;
  classTime: string;
}

const ClassList: React.FC = () => {
  const [classesData, setClassesData] = useState<ClassEntity[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get<ClassEntity[]>("/classes");
      setClassesData(response.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const handleDelete = async (
    semester: string,
    courseId: string,
    staffId: number
  ) => {
    if (confirm("确定要删除此班级吗？")) {
      try {
        await api.delete(`/classes/${semester}/${courseId}/${staffId}`);
        setClassesData(
          classesData.filter(
            (cls) =>
              !(
                cls.semester === semester &&
                cls.courseId === courseId &&
                cls.staffId === staffId
              )
          )
        );
      } catch (error) {
        console.error("Error deleting class:", error);
      }
    }
  };

  const handleEdit = (semester: string, courseId: string, staffId: number) => {
    router.push(`/classes/edit/${semester}/${courseId}/${staffId}`);
  };

  return (
    <div>
      <Button
        variant='contained'
        color='primary'
        component={Link}
        href='/classes/create'
        className='mb-4'>
        创建新班级
      </Button>

      <TableContainer component={Paper}>
        <Table aria-label='classes table'>
          <TableHead>
            <TableRow>
              <TableCell>学期</TableCell>
              <TableCell>课程ID</TableCell>
              <TableCell>教师ID</TableCell>
              <TableCell>上课时间</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {classesData.map((cls, idx) => (
              <TableRow key={idx}>
                <TableCell>{cls.semester}</TableCell>
                <TableCell>{cls.courseId}</TableCell>
                <TableCell>{cls.staffId}</TableCell>
                <TableCell>{cls.classTime}</TableCell>
                <TableCell>
                  <IconButton
                    color='primary'
                    onClick={() =>
                      handleEdit(cls.semester, cls.courseId, cls.staffId)
                    }>
                    <Edit />
                  </IconButton>
                  <IconButton
                    color='secondary'
                    onClick={() =>
                      handleDelete(cls.semester, cls.courseId, cls.staffId)
                    }>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {classesData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align='center'>
                  暂无班级数据。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ClassList;
