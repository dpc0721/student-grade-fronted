// pages/classes/edit/[semester]/[courseId]/[staffId].tsx
import React from "react";
import { useRouter } from "next/router";
import ClassForm from "../../../../../components/Classes/ClassForm";

const EditClassPage: React.FC = () => {
  const router = useRouter();
  const { semester, courseId, staffId } = router.query;

  return (
    <div>
      <ClassForm />
    </div>
  );
};

export default EditClassPage;
