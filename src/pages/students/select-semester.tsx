import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  TextField,
  MenuItem,
  Button,
  Container,
  Typography,
} from "@mui/material";
import api from "../../api/axios";

const SelectSemesterPage: React.FC = () => {
  const router = useRouter();
  const [allSemesters, setAllSemesters] = useState<string[]>([]);
  const [selectedSemester, setSelectedSemester] = useState("");

  useEffect(() => {
    // 获取所有学期
    const fetchAllSemesters = async () => {
      try {
        const classesRes = await api.get<any[]>("/classes");
        const semesters: Set<string> = new Set();
        classesRes.data.forEach((cls) => {
          if (cls.semester) {
            semesters.add(cls.semester);
          }
        });
        setAllSemesters(Array.from(semesters));
      } catch (error) {
        console.error("Error fetching all classes:", error);
      }
    };
    fetchAllSemesters();
  }, []);

  const handleConfirm = () => {
    if (selectedSemester) {
      localStorage.setItem("chosenSemester", selectedSemester);
      router.push("/students/dashboard");
    }
  };

  return (
    <Container>
      <Typography
        variant='h5'
        sx={{ mt: 4, mb: 2 }}>
        请选择当前学期
      </Typography>
      <TextField
        select
        fullWidth
        label='学期(6位数)'
        value={selectedSemester}
        onChange={(e) => setSelectedSemester(e.target.value)}
        sx={{ mb: 3 }}>
        {allSemesters.map((sem) => (
          <MenuItem
            key={sem}
            value={sem}>
            {sem}
          </MenuItem>
        ))}
      </TextField>
      <Button
        variant='contained'
        onClick={handleConfirm}
        fullWidth>
        确认
      </Button>
    </Container>
  );
};

export default SelectSemesterPage;
