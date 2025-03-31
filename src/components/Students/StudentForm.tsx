// src/components/Students/StudentForm.tsx

import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useRouter } from "next/router";
import {
  TextField,
  Button,
  Paper,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";

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

const StudentForm: React.FC = () => {
  const router = useRouter();
  const { studentId } = router.query;
  const isEditMode = Boolean(studentId);

  const [initialValues, setInitialValues] = useState<Student>({
    studentId: 0,
    name: "",
    sex: "F",
    dateOfBirth: "",
    nativePlace: "",
    mobilePhone: "",
    deptId: 0,
    status: "",
  });

  useEffect(() => {
    if (isEditMode && typeof studentId === "string") {
      fetchStudent(Number(studentId));
    }
  }, [isEditMode, studentId]);

  const fetchStudent = async (id: number) => {
    try {
      const response = await api.get<Student>(`/students/${id}`);
      setInitialValues(response.data);
    } catch (error) {
      console.error("Error fetching student:", error);
    }
  };

  const validationSchema = Yup.object({
    studentId: Yup.number().integer("学号必须是整数").required("学号是必需的"),
    name: Yup.string()
      .max(100, "姓名不能超过100个字符")
      .required("姓名是必需的"),
    sex: Yup.string()
      .oneOf(["M", "F"], "性别仅支持 M 或 F")
      .required("性别是必需的"),
    dateOfBirth: Yup.string().required("出生日期是必需的"),
    nativePlace: Yup.string().max(100, "籍贯不能超过100个字符"),
    mobilePhone: Yup.string().max(15, "手机号码不能超过15个字符"),
    deptId: Yup.number().integer("院系号必须是整数").required("院系号是必需的"),
    status: Yup.string().max(10, "状态不能超过10个字符"),
  });

  const handleSubmit = async (values: Student) => {
    try {
      if (isEditMode && typeof studentId === "string") {
        await api.put(`/students/${studentId}`, values);
        alert("学生更新成功！");
      } else {
        await api.post("/students", values);
        alert("学生创建成功！");
      }
      router.push("/students");
    } catch (error) {
      console.error("Error submitting student:", error);
      alert("提交失败，请检查输入。");
    }
  };

  return (
    <Paper className='p-6 max-w-xl mx-auto'>
      <Typography variant='h5' className='mb-4'>
        {isEditMode ? "编辑学生" : "创建新学生"}
      </Typography>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}>
        {({ errors, touched, handleChange, values, isSubmitting }) => (
          <Form>
            <TextField
              label='学号'
              name='studentId'
              type='number'
              value={values.studentId}
              onChange={handleChange}
              fullWidth
              margin='normal'
              disabled={isEditMode} // 编辑模式下禁用学号
              error={touched.studentId && Boolean(errors.studentId)}
              helperText={touched.studentId && errors.studentId}
            />
            <TextField
              label='姓名'
              name='name'
              value={values.name}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={touched.name && Boolean(errors.name)}
              helperText={touched.name && errors.name}
            />
            <FormControl fullWidth margin='normal'>
              <InputLabel id='sex-label'>性别</InputLabel>
              <Select
                labelId='sex-label'
                id='sex'
                name='sex'
                value={values.sex}
                label='性别'
                onChange={handleChange}
                error={touched.sex && Boolean(errors.sex)}>
                <MenuItem value='M'>男 (M)</MenuItem>
                <MenuItem value='F'>女 (F)</MenuItem>
              </Select>
              {touched.sex && errors.sex && (
                <Typography color='error' variant='caption'>
                  {errors.sex}
                </Typography>
              )}
            </FormControl>
            <TextField
              label='出生日期'
              name='dateOfBirth'
              placeholder='如：1995-06-07'
              value={values.dateOfBirth}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={touched.dateOfBirth && Boolean(errors.dateOfBirth)}
              helperText={touched.dateOfBirth && errors.dateOfBirth}
            />
            <TextField
              label='籍贯'
              name='nativePlace'
              value={values.nativePlace}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={touched.nativePlace && Boolean(errors.nativePlace)}
              helperText={touched.nativePlace && errors.nativePlace}
            />
            <TextField
              label='手机号码'
              name='mobilePhone'
              value={values.mobilePhone}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={touched.mobilePhone && Boolean(errors.mobilePhone)}
              helperText={touched.mobilePhone && errors.mobilePhone}
            />
            <TextField
              label='院系号'
              name='deptId'
              type='number'
              value={values.deptId}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={touched.deptId && Boolean(errors.deptId)}
              helperText={touched.deptId && errors.deptId}
            />
            <TextField
              label='状态'
              name='status'
              value={values.status}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={touched.status && Boolean(errors.status)}
              helperText={touched.status && errors.status}
            />
            <div className='mt-4 flex justify-end'>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                disabled={isSubmitting}>
                {isEditMode ? "更新学生" : "创建学生"}
              </Button>
              <Button
                variant='outlined'
                color='secondary'
                onClick={() => router.push("/students")}
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

export default StudentForm;
