import React, { useState } from "react";
import { useRouter } from "next/router";
import { Container, Typography, TextField, Button, MenuItem, Select, FormControl, InputLabel, Snackbar } from "@mui/material";
import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [role, setRole] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);

  const handleLogin = async () => {
    const success = await login(username, Number(password));
    if (success) {
      if (role === "student") {
        router.push("/students/dashboard");
      } else if (role === "teacher") {
        router.push("/teachers/dashboard");
      } else if (role === "admin") {
        router.push("/departments");
      }
    } else {
      setOpen(true);
    }
  };

  return (
    <Container className='mt-8'>
      <Typography variant='h4' align='center' gutterBottom>
        登录
      </Typography>
      <FormControl fullWidth margin='normal'>
        <InputLabel id='role-label'>选择身份</InputLabel>
        <Select
          labelId='role-label'
          value={role}
          onChange={(e) => setRole(e.target.value as string)}
          fullWidth>
          <MenuItem value='student'>学生</MenuItem>
          <MenuItem value='teacher'>教师</MenuItem>
          <MenuItem value='admin'>管理员</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label='用户名'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
        margin='normal'
      />
      <TextField
        label='密码'
        type='password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin='normal'
      />
      <Button variant='contained' color='primary' onClick={handleLogin} fullWidth className='mt-4'>
        登录
      </Button>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
        message="用户名或密码错误"
      />
    </Container>
  );
};

export default LoginPage;