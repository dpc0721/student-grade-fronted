// pages/students/edit/[studentId].tsx
import React from "react";
import { useRouter } from "next/router";
import StudentForm from "../../../components/Students/StudentForm";

const EditStudentPage: React.FC = () => {
  const router = useRouter();
  const { studentId } = router.query;

  return (
    <div>
      <StudentForm />
    </div>
  );
};

export default EditStudentPage;
