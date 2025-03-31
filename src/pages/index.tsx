// pages/index.tsx
import React from "react";
import { Typography, Container } from "@mui/material";

const HomePage: React.FC = () => {
  return (
    <Container className='mt-8'>
      <Typography variant='h4' align='center' gutterBottom>
        欢迎使用学生选课成绩管理系统
      </Typography>
      <Typography variant='body1' align='center'>
        使用顶部导航栏访问和管理您的数据。
      </Typography>
    </Container>
  );
};

export default HomePage;
