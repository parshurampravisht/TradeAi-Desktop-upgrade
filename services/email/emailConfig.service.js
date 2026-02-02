import { axiosInstance } from "../axios.config";
import { EmailConfig } from "../serviceEndpoints";

export const getEmailSMTP = async (payload) => {
  try {
    const response = await axiosInstance.get(EmailConfig.getEmailSMTP);
    return response;
  } catch (error) {
    return error;
  }
};

export const setupEmailSMTP = async (payload) => {
  try {
    const response = await axiosInstance.post(
      EmailConfig.getEmailSMTP,
      payload
    );
    return response;
  } catch (error) {
    return error;
  }
};

export const getEmailTemplate = async (payload) => {
  try {
    const response = await axiosInstance.get(EmailConfig.getEmailTemplate);
    return response;
  } catch (error) {
    return error;
  }
};

export const setupEmailTemplate = async (payload) => {
  try {
    const response = await axiosInstance.post(
      EmailConfig.setupEmailTemplate,
      payload
    );
    return response;
  } catch (error) {
    return error;
  }
};
