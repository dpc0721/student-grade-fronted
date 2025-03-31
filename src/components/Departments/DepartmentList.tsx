// src/components/Departments/DepartmentList.tsx
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

interface Department {
  deptId: number;
  deptName: string;
  address: string;
  phoneCode: string;
}

const DepartmentList: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await api.get<Department[]>("/departments");
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleDelete = async (deptId: number) => {
    if (confirm("确定要删除这个部门吗？")) {
      try {
        await api.delete(`/departments/${deptId}`);
        setDepartments(departments.filter((dept) => dept.deptId !== deptId));
      } catch (error) {
        console.error("Error deleting department:", error);
      }
    }
  };

  const handleEdit = (deptId: number) => {
    router.push(`/departments/edit/${deptId}`);
  };

  return (
    <div>
      <Button
        variant='contained'
        color='primary'
        component={Link}
        href='/departments/create'
        className='mb-4'>
        创建新部门
      </Button>
      <TableContainer component={Paper}>
        <Table aria-label='departments table'>
          <TableHead>
            <TableRow>
              <TableCell>部门ID</TableCell>
              <TableCell>部门名称</TableCell>
              <TableCell>地址</TableCell>
              <TableCell>电话代码</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {departments.map((dept) => (
              <TableRow key={dept.deptId}>
                <TableCell>{dept.deptId}</TableCell>
                <TableCell>{dept.deptName}</TableCell>
                <TableCell>{dept.address}</TableCell>
                <TableCell>{dept.phoneCode}</TableCell>
                <TableCell>
                  <IconButton
                    color='primary'
                    onClick={() => handleEdit(dept.deptId)}>
                    <Edit />
                  </IconButton>
                  <IconButton
                    color='secondary'
                    onClick={() => handleDelete(dept.deptId)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {departments.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align='center'>
                  没有部门数据。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default DepartmentList;
