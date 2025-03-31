// pages/course-selections/edit/[studentId]/[semester]/[courseId].tsx
import React from "react";
import { useRouter } from "next/router";
import CourseSelectionForm from "../../../../../components/CourseSelections/CourseSelectionForm";

const EditCourseSelectionPage: React.FC = () => {
  const router = useRouter();
  const { studentId, semester, courseId } = router.query;

  return (
    <div>
      <CourseSelectionForm />
    </div>
  );
};

export default EditCourseSelectionPage;
