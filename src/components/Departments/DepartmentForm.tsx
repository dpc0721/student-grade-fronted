// src/components/Departments/DepartmentForm.tsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useRouter } from "next/router";
import { TextField, Button, Paper, Typography } from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

interface Department {
  deptId: number;
  deptName: string;
  address: string;
  phoneCode: string;
}

const DepartmentForm: React.FC = () => {
  const router = useRouter();
  const { deptId } = router.query;
  const isEditMode = Boolean(deptId);
  const [initialValues, setInitialValues] = useState<Department>({
    deptId: 0,
    deptName: "",
    address: "",
    phoneCode: "",
  });

  useEffect(() => {
    if (isEditMode && typeof deptId === "string") {
      fetchDepartment(Number(deptId));
    }
  }, [isEditMode, deptId]);

  const fetchDepartment = async (id: number) => {
    try {
      const response = await api.get<Department>(`/departments/${id}`);
      setInitialValues(response.data);
    } catch (error) {
      console.error("Error fetching department:", error);
    }
  };

  const validationSchema = Yup.object({
    deptId: Yup.number().integer("部门ID必须是整数").required("部门ID是必需的"),
    deptName: Yup.string()
      .max(100, "部门名称不能超过100个字符")
      .required("部门名称是必需的"),
    address: Yup.string().max(255, "地址不能超过255个字符"),
    phoneCode: Yup.string().max(10, "电话代码不能超过10个字符"),
  });

  const handleSubmit = async (values: Department) => {
    try {
      if (isEditMode && typeof deptId === "string") {
        await api.put(`/departments/${deptId}`, values);
        alert("部门更新成功！");
      } else {
        await api.post("/departments", values);
        alert("部门创建成功！");
      }
      router.push("/departments");
    } catch (error) {
      console.error("Error submitting department:", error);
      alert("提交失败，请检查输入。");
    }
  };

  return (
    <Paper className='p-6 max-w-xl mx-auto'>
      <Typography variant='h5' className='mb-4'>
        {isEditMode ? "编辑部门" : "创建新部门"}
      </Typography>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}>
        {({ errors, touched, handleChange, values, isSubmitting }) => (
          <Form>
            <TextField
              label='部门ID'
              name='deptId'
              type='number'
              value={values.deptId}
              onChange={handleChange}
              fullWidth
              margin='normal'
              disabled={isEditMode} // 编辑模式下禁用部门ID
              error={touched.deptId && Boolean(errors.deptId)}
              helperText={touched.deptId && errors.deptId}
            />
            <TextField
              label='部门名称'
              name='deptName'
              value={values.deptName}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={touched.deptName && Boolean(errors.deptName)}
              helperText={touched.deptName && errors.deptName}
            />
            <TextField
              label='地址'
              name='address'
              value={values.address}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={touched.address && Boolean(errors.address)}
              helperText={touched.address && errors.address}
            />
            <TextField
              label='电话代码'
              name='phoneCode'
              value={values.phoneCode}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={touched.phoneCode && Boolean(errors.phoneCode)}
              helperText={touched.phoneCode && errors.phoneCode}
            />
            <div className='mt-4 flex justify-end'>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                disabled={isSubmitting}>
                {isEditMode ? "更新部门" : "创建部门"}
              </Button>
              <Button
                variant='outlined'
                color='secondary'
                onClick={() => router.push("/departments")}
                className='ml-2'>
                取消
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

export default DepartmentForm;
