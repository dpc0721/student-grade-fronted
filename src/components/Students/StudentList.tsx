// src/components/Students/StudentList.tsx

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

interface Student {
  studentId: number;
  name: string;
  sex: string;
  dateOfBirth: string;
  nativePlace: string;
  mobilePhone: string;
  deptId: number;
  status: string;
}

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get<Student[]>("/students");
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleDelete = async (studentId: number) => {
    if (confirm("确定要删除这位学生吗？")) {
      try {
        await api.delete(`/students/${studentId}`);
        setStudents(students.filter((stu) => stu.studentId !== studentId));
      } catch (error) {
        console.error("Error deleting student:", error);
      }
    }
  };

  const handleEdit = (studentId: number) => {
    router.push(`/students/edit/${studentId}`);
  };

  return (
    <div>
      <Button
        variant='contained'
        color='primary'
        component={Link}
        href='/students/create'
        className='mb-4'>
        创建新学生
      </Button>

      <TableContainer component={Paper}>
        <Table aria-label='students table'>
          <TableHead>
            <TableRow>
              <TableCell>学号</TableCell>
              <TableCell>姓名</TableCell>
              <TableCell>性别</TableCell>
              <TableCell>出生日期</TableCell>
              <TableCell>籍贯</TableCell>
              <TableCell>手机号码</TableCell>
              <TableCell>院系号</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map((stu) => (
              <TableRow key={stu.studentId}>
                <TableCell>{stu.studentId}</TableCell>
                <TableCell>{stu.name}</TableCell>
                <TableCell>{stu.sex}</TableCell>
                <TableCell>{stu.dateOfBirth}</TableCell>
                <TableCell>{stu.nativePlace}</TableCell>
                <TableCell>{stu.mobilePhone}</TableCell>
                <TableCell>{stu.deptId}</TableCell>
                <TableCell>{stu.status}</TableCell>
                <TableCell>
                  <IconButton
                    color='primary'
                    onClick={() => handleEdit(stu.studentId)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    color='secondary'
                    onClick={() => handleDelete(stu.studentId)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align='center'>
                  暂无学生数据。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default StudentList;
