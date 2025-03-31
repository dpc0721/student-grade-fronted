// src/api/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL: "http://113.44.44.244:8099/api", // 替换为您的后端 API 基础 URL
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
