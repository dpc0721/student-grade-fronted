// src/components/Layout.tsx
import React from "react";
import Link from "next/link";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, userRole, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <>
      <AppBar position='static'>
        <Toolbar>
          <Typography variant='h6' style={{ flexGrow: 1 }}>
            学生选课成绩管理系统
          </Typography>
          {userRole === "admin" && (
            <>
              <Button color='inherit' component={Link} href='/departments'>
                部门
              </Button>
              <Button color='inherit' component={Link} href='/courses'>
                课程
              </Button>
              <Button color='inherit' component={Link} href='/teachers'>
                教师
              </Button>
              <Button color='inherit' component={Link} href='/students'>
                学生
              </Button>
              <Button color='inherit' component={Link} href='/classes'>
                班级
              </Button>
              <Button color='inherit' component={Link} href='/course-selections'>
                选课记录
              </Button>
            </>
          )}
          {userRole === "student" && (
            <Button color='inherit' component={Link} href='/students/dashboard'>
              我的课程
            </Button>
          )}
          {userRole === "teacher" && (
            <Button color='inherit' component={Link} href='/teachers/dashboard'>
              我的课程
            </Button>
          )}
          {isAuthenticated ? (
            <Button color='inherit' onClick={handleLogout}>
              注销
            </Button>
          ) : (
            <Button color='inherit' component={Link} href='/login'>
              登录
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <main className='p-4'>{children}</main>
    </>
  );
};

export default Layout;