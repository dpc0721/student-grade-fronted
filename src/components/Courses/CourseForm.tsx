// src/components/Courses/CourseForm.tsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useRouter } from "next/router";
import { TextField, Button, Paper, Typography } from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";

interface Course {
  courseId: string;
  deptId: number;
  courseName: string;
  credit: number;
  creditHours: number;
}

const CourseForm: React.FC = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const isEditMode = Boolean(courseId);
  const [initialValues, setInitialValues] = useState<Course>({
    courseId: "",
    deptId: 0,
    courseName: "",
    credit: 0,
    creditHours: 0,
  });

  useEffect(() => {
    if (isEditMode && typeof courseId === "string") {
      fetchCourse(courseId);
    }
  }, [isEditMode, courseId]);

  const fetchCourse = async (id: string) => {
    try {
      const response = await api.get<Course>(`/courses/${id}`);
      setInitialValues(response.data);
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  };

  const validationSchema = Yup.object({
    courseId: Yup.string()
      .max(20, "课程ID不能超过20个字符")
      .required("课程ID是必需的"),
    deptId: Yup.number().integer("部门ID必须是整数").required("部门ID是必需的"),
    courseName: Yup.string()
      .max(100, "课程名称不能超过100个字符")
      .required("课程名称是必需的"),
    credit: Yup.number().integer("学分必须是整数").required("学分是必需的"),
    creditHours: Yup.number()
      .integer("学时必须是整数")
      .required("学时是必需的"),
  });

  const handleSubmit = async (values: Course) => {
    try {
      if (isEditMode && typeof courseId === "string") {
        await api.put(`/courses/${courseId}`, values);
        alert("课程更新成功！");
      } else {
        await api.post("/courses", values);
        alert("课程创建成功！");
      }
      router.push("/courses");
    } catch (error) {
      console.error("Error submitting course:", error);
      alert("提交失败，请检查输入。");
    }
  };

  return (
    <Paper className='p-6 max-w-xl mx-auto'>
      <Typography variant='h5' className='mb-4'>
        {isEditMode ? "编辑课程" : "创建新课程"}
      </Typography>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}>
        {({ errors, touched, handleChange, values, isSubmitting }) => (
          <Form>
            <TextField
              label='课程ID'
              name='courseId'
              value={values.courseId}
              onChange={handleChange}
              fullWidth
              margin='normal'
              disabled={isEditMode} // 编辑模式下禁用课程ID
              error={touched.courseId && Boolean(errors.courseId)}
              helperText={touched.courseId && errors.courseId}
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
              label='课程名称'
              name='courseName'
              value={values.courseName}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={touched.courseName && Boolean(errors.courseName)}
              helperText={touched.courseName && errors.courseName}
            />
            <TextField
              label='学分'
              name='credit'
              type='number'
              value={values.credit}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={touched.credit && Boolean(errors.credit)}
              helperText={touched.credit && errors.credit}
            />
            <TextField
              label='学时'
              name='creditHours'
              type='number'
              value={values.creditHours}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={touched.creditHours && Boolean(errors.creditHours)}
              helperText={touched.creditHours && errors.creditHours}
            />
            <div className='mt-4 flex justify-end'>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                disabled={isSubmitting}>
                {isEditMode ? "更新课程" : "创建课程"}
              </Button>
              <Button
                variant='outlined'
                color='secondary'
                onClick={() => router.push("/courses")}
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

export default CourseForm;
