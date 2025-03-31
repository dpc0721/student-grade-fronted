// src/components/Teachers/TeacherList.tsx

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

interface Teacher {
  staffId: number;
  deptId: number;
  name: string;
  sex: string;
  dateOfBirth: string;
  professionalRanks: string;
  salary: number;
}

const TeacherList: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await api.get<Teacher[]>("/teachers");
      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const handleDelete = async (staffId: number) => {
    if (confirm("确定要删除这位教师吗？")) {
      try {
        await api.delete(`/teachers/${staffId}`);
        setTeachers(teachers.filter((teacher) => teacher.staffId !== staffId));
      } catch (error) {
        console.error("Error deleting teacher:", error);
      }
    }
  };

  const handleEdit = (staffId: number) => {
    router.push(`/teachers/edit/${staffId}`);
  };

  return (
    <div>
      <Button
        variant='contained'
        color='primary'
        component={Link}
        href='/teachers/create'
        className='mb-4'>
        创建新教师
      </Button>

      <TableContainer component={Paper}>
        <Table aria-label='teachers table'>
          <TableHead>
            <TableRow>
              <TableCell>工号</TableCell>
              <TableCell>部门ID</TableCell>
              <TableCell>姓名</TableCell>
              <TableCell>性别</TableCell>
              <TableCell>出生日期</TableCell>
              <TableCell>职称</TableCell>
              <TableCell>基本工资</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher.staffId}>
                <TableCell>{teacher.staffId}</TableCell>
                <TableCell>{teacher.deptId}</TableCell>
                <TableCell>{teacher.name}</TableCell>
                <TableCell>{teacher.sex}</TableCell>
                <TableCell>{teacher.dateOfBirth}</TableCell>
                <TableCell>{teacher.professionalRanks}</TableCell>
                <TableCell>{teacher.salary}</TableCell>
                <TableCell>
                  <IconButton
                    color='primary'
                    onClick={() => handleEdit(teacher.staffId)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    color='secondary'
                    onClick={() => handleDelete(teacher.staffId)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {teachers.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align='center'>
                  暂无教师数据。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TeacherList;
