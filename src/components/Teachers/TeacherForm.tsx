// src/components/Teachers/TeacherForm.tsx

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

interface Teacher {
  staffId: number;
  deptId: number;
  name: string;
  sex: string;
  dateOfBirth: string;
  professionalRanks: string;
  salary: number;
}

const TeacherForm: React.FC = () => {
  const router = useRouter();
  const { staffId } = router.query;
  const isEditMode = Boolean(staffId);

  const [initialValues, setInitialValues] = useState<Teacher>({
    staffId: 0,
    deptId: 0,
    name: "",
    sex: "M",
    dateOfBirth: "",
    professionalRanks: "",
    salary: 0,
  });

  useEffect(() => {
    if (isEditMode && typeof staffId === "string") {
      fetchTeacher(Number(staffId));
    }
  }, [isEditMode, staffId]);

  const fetchTeacher = async (id: number) => {
    try {
      const response = await api.get<Teacher>(`/teachers/${id}`);
      setInitialValues(response.data);
    } catch (error) {
      console.error("Error fetching teacher:", error);
    }
  };

  const validationSchema = Yup.object({
    staffId: Yup.number().integer("工号必须是整数").required("工号是必需的"),
    deptId: Yup.number().integer("部门ID必须是整数").required("部门ID是必需的"),
    name: Yup.string()
      .max(100, "姓名不能超过100个字符")
      .required("姓名是必需的"),
    sex: Yup.string()
      .oneOf(["M", "F"], "性别仅支持 M 或 F")
      .required("性别是必需的"),
    dateOfBirth: Yup.string().required("出生日期是必需的"),
    professionalRanks: Yup.string().max(50, "职称不能超过50个字符"),
    salary: Yup.number().min(0, "工资不能为负数"),
  });

  const handleSubmit = async (values: Teacher) => {
    try {
      if (isEditMode && typeof staffId === "string") {
        await api.put(`/teachers/${staffId}`, values);
        alert("教师更新成功！");
      } else {
        await api.post("/teachers", values);
        alert("教师创建成功！");
      }
      router.push("/teachers");
    } catch (error) {
      console.error("Error submitting teacher:", error);
      alert("提交失败，请检查输入。");
    }
  };

  return (
    <Paper className='p-6 max-w-xl mx-auto'>
      <Typography variant='h5' className='mb-4'>
        {isEditMode ? "编辑教师" : "创建新教师"}
      </Typography>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}>
        {({ errors, touched, handleChange, values, isSubmitting }) => (
          <Form>
            <TextField
              label='工号'
              name='staffId'
              type='number'
              value={values.staffId}
              onChange={handleChange}
              fullWidth
              margin='normal'
              disabled={isEditMode} // 编辑模式下禁用工号
              error={touched.staffId && Boolean(errors.staffId)}
              helperText={touched.staffId && errors.staffId}
            />
            <TextField
              label='部门ID'
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
              type='text'
              placeholder='例如：1990-01-01'
              value={values.dateOfBirth}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={touched.dateOfBirth && Boolean(errors.dateOfBirth)}
              helperText={touched.dateOfBirth && errors.dateOfBirth}
            />
            <TextField
              label='职称'
              name='professionalRanks'
              value={values.professionalRanks}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={
                touched.professionalRanks && Boolean(errors.professionalRanks)
              }
              helperText={touched.professionalRanks && errors.professionalRanks}
            />
            <TextField
              label='基本工资'
              name='salary'
              type='number'
              value={values.salary}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={touched.salary && Boolean(errors.salary)}
              helperText={touched.salary && errors.salary}
            />
            <div className='mt-4 flex justify-end'>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                disabled={isSubmitting}>
                {isEditMode ? "更新教师" : "创建教师"}
              </Button>
              <Button
                variant='outlined'
                color='secondary'
                onClick={() => router.push("/teachers")}
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

export default TeacherForm;
