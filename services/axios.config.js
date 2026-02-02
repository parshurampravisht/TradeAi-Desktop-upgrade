
import axios from "axios";
import { environment } from "../environments/environment";

export const axiosInstance = axios.create({
  baseURL: environment.brokerPlaceUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export const axiosAWSInstance = axios.create({
  baseURL: environment.awsbrokerBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

export const axiosAuthInstance = axios.create({
  baseURL: environment.authBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((conf) => {
  const { url, method } = conf;

  const skipToken =
    (url === "/auth" || "/auth/login" || "/auth/resend_email") &&
    method === "post";

  if (!skipToken) {
    const token = localStorage.getItem("access_token");

    conf.headers = {
      ...conf.headers,
      Authorization: `${token}`,
    };
  }
  return conf;
});

axiosAuthInstance.interceptors.request.use((conf) => {
  const { url, method } = conf;
  const skipToken =
    (conf?.data?.requestFrom === "main-app-signup-screen" ||
      url === "/auth/login" ||
      url === "/auth/resend_email") &&
    method === "post";

  if (!skipToken) {
    const token = localStorage.getItem("access_token");
    conf.headers = {
      ...conf.headers,
      Authorization: `${token}`,
    };
  }
  return conf;
});

axiosInstance.interceptors.response.use(
  (conf) => {
    const {
      config: { url },
      data: { data },
    } = conf;
    if (url === "/auth/login") {
      localStorage.setItem("access_token", data.access_token);
    }
    return conf;
  },
  (err) => {
    if (err?.response?.status === 401) {
      window.alert("Session expired, Please login again.");
      localStorage.clear();
      // window.location.href = "/login";
    }
    return err;
  }
);

axiosAuthInstance.interceptors.response.use(
  (conf) => {
    const {
      config: { url },
      data: { data, token },
    } = conf;
    if (url === "/auth/login") {
      localStorage.setItem("access_token", token);
    }
    return conf;
  },
  (err) => {
    if (err?.response?.status === 401) {
      window.alert("Session expired, Please login again.");
      localStorage.clear();
      // window.location.href = "/login";
    }
    return err;
  }
);

export const fetchInstance = async (apiEndPoint) => {
  return await fetch(`${environment.brokerPlaceUrl}${apiEndPoint}`);
};
