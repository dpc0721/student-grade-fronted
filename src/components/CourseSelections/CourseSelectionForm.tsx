// src/components/CourseSelections/CourseSelectionForm.tsx
import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useRouter } from "next/router";
import { TextField, Button, Paper, Typography } from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";

interface CourseSelection {
  studentId: number;
  semester: string;
  courseId: string;
  staffId: number;
  score: number;
}

const CourseSelectionForm: React.FC = () => {
  const router = useRouter();
  const { studentId, semester, courseId } = router.query;
  const isEditMode = Boolean(studentId && semester && courseId);
  const [initialValues, setInitialValues] = useState<CourseSelection>({
    studentId: 0,
    semester: "",
    courseId: "",
    staffId: 0,
    score: 0,
  });

  useEffect(() => {
    if (
      isEditMode &&
      typeof studentId === "string" &&
      typeof semester === "string" &&
      typeof courseId === "string"
    ) {
      fetchSelection(Number(studentId), semester, courseId);
    }
  }, [isEditMode, studentId, semester, courseId]);

  const fetchSelection = async (sid: number, sem: string, cid: string) => {
    try {
      const response = await api.get<CourseSelection>(
        `/course-selections/${sid}/${sem}/${cid}`
      );
      setInitialValues(response.data);
    } catch (error) {
      console.error("Error fetching course selection:", error);
    }
  };

  const validationSchema = Yup.object({
    studentId: Yup.number()
      .integer("学生ID必须是整数")
      .required("学生ID是必需的"),
    semester: Yup.string()
      .max(255, "学期不能超过255个字符")
      .required("学期是必需的"),
    courseId: Yup.string()
      .max(20, "课程ID不能超过20个字符")
      .required("课程ID是必需的"),
    staffId: Yup.number()
      .integer("教师ID必须是整数")
      .required("教师ID是必需的"),
    score: Yup.number()
      .min(0, "成绩不能低于0")
      .max(100, "成绩不能超过100")
      .required("成绩是必需的"),
  });

  const handleSubmit = async (values: CourseSelection) => {
    try {
      if (
        isEditMode &&
        typeof studentId === "string" &&
        typeof semester === "string" &&
        typeof courseId === "string"
      ) {
        await api.put(
          `/course-selections/${studentId}/${semester}/${courseId}`,
          values
        );
        alert("选课记录更新成功！");
      } else {
        await api.post("/course-selections", values);
        alert("选课记录创建成功！");
      }
      router.push("/course-selections");
    } catch (error) {
      console.error("Error submitting course selection:", error);
      alert("提交失败，请检查输入。");
    }
  };

  return (
    <Paper className='p-6 max-w-xl mx-auto'>
      <Typography variant='h5' className='mb-4'>
        {isEditMode ? "编辑选课记录" : "创建新选课记录"}
      </Typography>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}>
        {({ errors, touched, handleChange, values, isSubmitting }) => (
          <Form>
            <TextField
              label='学生ID'
              name='studentId'
              type='number'
              value={values.studentId}
              onChange={handleChange}
              fullWidth
              margin='normal'
              disabled={isEditMode} // 编辑模式下禁用学生ID
              error={touched.studentId && Boolean(errors.studentId)}
              helperText={touched.studentId && errors.studentId}
            />
            <TextField
              label='学期'
              name='semester'
              value={values.semester}
              onChange={handleChange}
              fullWidth
              margin='normal'
              disabled={isEditMode} // 编辑模式下禁用学期
              error={touched.semester && Boolean(errors.semester)}
              helperText={touched.semester && errors.semester}
            />
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
              label='教师ID'
              name='staffId'
              type='number'
              value={values.staffId}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={touched.staffId && Boolean(errors.staffId)}
              helperText={touched.staffId && errors.staffId}
            />
            <TextField
              label='成绩'
              name='score'
              type='number'
              value={values.score}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={touched.score && Boolean(errors.score)}
              helperText={touched.score && errors.score}
            />
            <div className='mt-4 flex justify-end'>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                disabled={isSubmitting}>
                {isEditMode ? "更新选课记录" : "创建选课记录"}
              </Button>
              <Button
                variant='outlined'
                color='secondary'
                onClick={() => router.push("/course-selections")}
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

export default CourseSelectionForm;
