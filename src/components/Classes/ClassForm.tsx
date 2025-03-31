// src/components/Classes/ClassForm.tsx

import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useRouter } from "next/router";
import {
  TextField,
  Button,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Formik, Form } from "formik";
import * as Yup from "yup";

interface ClassEntity {
  semester: string;
  courseId: string;
  staffId: number;
  classTime: string;
}

const ClassForm: React.FC = () => {
  const router = useRouter();
  const { semester, courseId, staffId } = router.query;
  const isEditMode = Boolean(semester && courseId && staffId);

  const [initialValues, setInitialValues] = useState<ClassEntity>({
    semester: "",
    courseId: "",
    staffId: 0,
    classTime: "",
  });

  useEffect(() => {
    if (
      isEditMode &&
      typeof semester === "string" &&
      typeof courseId === "string" &&
      typeof staffId === "string"
    ) {
      fetchClass(semester, courseId, Number(staffId));
    }
  }, [isEditMode, semester, courseId, staffId]);

  const fetchClass = async (sem: string, cid: string, sid: number) => {
    try {
      const response = await api.get<ClassEntity>(
        `/classes/${sem}/${cid}/${sid}`
      );
      setInitialValues(response.data);
    } catch (error) {
      console.error("Error fetching class:", error);
    }
  };

  const validationSchema = Yup.object({
    semester: Yup.string().required("学期是必需的"),
    courseId: Yup.string()
      .max(20, "课程ID不能超过20个字符")
      .required("课程ID是必需的"),
    staffId: Yup.number()
      .integer("教师ID必须是整数")
      .required("教师ID是必需的"),
    classTime: Yup.string()
      .max(20, "上课时间不能超过20个字符")
      .required("上课时间是必需的"),
  });

  const handleSubmit = async (values: ClassEntity) => {
    try {
      if (
        isEditMode &&
        typeof semester === "string" &&
        typeof courseId === "string" &&
        typeof staffId === "string"
      ) {
        await api.put(`/classes/${semester}/${courseId}/${staffId}`, values);
        alert("班级更新成功！");
      } else {
        await api.post("/classes", values);
        alert("班级创建成功！");
      }
      router.push("/classes");
    } catch (error) {
      console.error("Error submitting class:", error);
      alert("提交失败，请检查输入。");
    }
  };

  return (
    <Paper className='p-6 max-w-xl mx-auto'>
      <Typography variant='h5' className='mb-4'>
        {isEditMode ? "编辑班级" : "创建新班级"}
      </Typography>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}>
        {({ errors, touched, handleChange, values, isSubmitting }) => (
          <Form>
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
              disabled={isEditMode} // 编辑模式下禁用教师ID
              error={touched.staffId && Boolean(errors.staffId)}
              helperText={touched.staffId && errors.staffId}
            />
            <TextField
              label='上课时间'
              name='classTime'
              value={values.classTime}
              onChange={handleChange}
              fullWidth
              margin='normal'
              error={touched.classTime && Boolean(errors.classTime)}
              helperText={touched.classTime && errors.classTime}
            />
            <div className='mt-4 flex justify-end'>
              <Button
                type='submit'
                variant='contained'
                color='primary'
                disabled={isSubmitting}>
                {isEditMode ? "更新班级" : "创建班级"}
              </Button>
              <Button
                variant='outlined'
                color='secondary'
                onClick={() => router.push("/classes")}
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

export default ClassForm;
