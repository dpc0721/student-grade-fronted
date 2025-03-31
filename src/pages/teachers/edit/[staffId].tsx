// pages/teachers/edit/[staffId].tsx
import React from "react";
import { useRouter } from "next/router";
import TeacherForm from "../../../components/Teachers/TeacherForm";

const EditTeacherPage: React.FC = () => {
  const router = useRouter();
  const { staffId } = router.query;

  return (
    <div>
      <TeacherForm />
    </div>
  );
};

export default EditTeacherPage;
