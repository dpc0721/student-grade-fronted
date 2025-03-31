// pages/courses/edit/[courseId].tsx
import React from "react";
import { useRouter } from "next/router";
import CourseForm from "../../../components/Courses/CourseForm";

const EditCoursePage: React.FC = () => {
  const router = useRouter();
  const { courseId } = router.query;

  return (
    <div>
      <CourseForm />
    </div>
  );
};

export default EditCoursePage;
