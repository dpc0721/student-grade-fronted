import * as React from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";
import createEmotionCache from "../createEmotionCache";
import { CacheProvider, EmotionCache } from "@emotion/react";
import "../styles/globals.css";
import Layout from "../components/Layout";
import { AuthProvider, useAuth } from "../context/AuthContext";

// 创建 MUI 主题
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
});

// 客户端 Emotion 缓存
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

const AuthChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuth();

  React.useEffect(() => {
    if (initialized && !isAuthenticated && router.pathname !== "/login") {
      router.push("/login");
    }
  }, [isAuthenticated, initialized, router]);

  // 在还未初始化时，可以返回 null 或一个 loading 组件
  if (!initialized) {
    return null;
  }

  return <>{children}</>;
};

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <CacheProvider value={emotionCache}>
      <Head children={undefined}>{/* { } */}</Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <AuthChecker>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </AuthChecker>
        </AuthProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}
