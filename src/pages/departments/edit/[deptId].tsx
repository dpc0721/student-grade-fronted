// pages/departments/edit/[deptId].tsx
import React from "react";
import { useRouter } from "next/router";
import DepartmentForm from "../../../components/Departments/DepartmentForm";

const EditDepartmentPage: React.FC = () => {
  const router = useRouter();
  const { deptId } = router.query;

  return (
    <div>
      <DepartmentForm />
    </div>
  );
};

export default EditDepartmentPage;
