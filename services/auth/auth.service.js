import { axiosAuthInstance, axiosInstance } from "../axios.config";
import { auth, FOBasket } from "../serviceEndpoints";

export const signup = async (payload) => {
  try {
    const response = await axiosAuthInstance.post(auth.signup, payload);
    if (response?.data?.error === true) {
      // window.alert(response?.data?.message)
    }
    return response?.data;
  } catch (error) {
    return error;
    // window.alert("Something went wrong");
  }
};

export const login = async (payload) => {
  try {
    const response = await axiosAuthInstance.post(auth.login, payload);
    return response?.data;
  } catch (error) {
    return error;
  }
};
export const updateDetails = async (payload) => {
  try {
    const response = await axiosAuthInstance.put(auth.signup, payload);
    if (response?.data?.error === true) {
      // window.alert(response?.data?.message)

      return null;
    } else {
      return response?.data;
    }
  } catch (error) {
    window.alert("Something went wrong");
    return error;
  }
};

export const deleteUser = async (payload) => {
  try {
    const response = await axiosAuthInstance.delete(auth.auth, {
      data: payload,
    });
    if (response?.data?.error === true) {
      // window.alert(response?.data?.message)
    }
    return response?.data;
  } catch (error) {
    // window.alert("Something went wrong");
    return error;
  }
};

export const resendEmail = async (payload) => {
  try {
    const response = await axiosAuthInstance.post(auth.resend_email, payload);
    if (response?.data?.error === true) {
      // window.alert(response?.data?.message)
    }
    return response?.data;
  } catch (error) {
    return error;
    // window.alert("Something went wrong");
  }
};

export const forgotPassword = async (payload) => {
  try {
    const response = await axiosAuthInstance.post(
      auth.forgot_password,
      payload
    );
    if (response?.data?.error === true) {
      // window.alert(response?.data?.message);
      return null;
    } else {
      return response?.data;
    }
  } catch (error) {
    // window.alert("Something went wrong");
    return error;
  }
};

export const getDealers = async () => {
  try {
    const response = await axiosAuthInstance.post(auth.dealers);
    if (response?.data?.error === true) {
      // window.alert(response?.data?.message);
      return null;
    } else {
      return response?.data;
    }
  } catch (error) {
    // window.alert("Something went wrong");
    return error;
  }
};

export const updateDealer = async (payload) => {
  try {
    const response = await axiosAuthInstance.put(auth.update_dealer, payload);
    if (response?.data?.error === true) {
      //  window.alert(response?.data?.message);
      return null;
    } else {
      return response?.data;
    }
  } catch (error) {
    // window.alert("Something went wrong");
    return error;
  }
};

export const deleteDealers = async (userID) => {
  try {
    const response = await axiosAuthInstance.delete(
      `${auth.delete_dealer}?user_id=${userID}`
    );
    if (response?.data?.error === true) {
      // window.alert(response?.data?.message);
      return null;
    } else {
      return response?.data;
    }
  } catch (error) {
    // window.alert("Something went wrong");
    return error;
  }
};

/* export const login = async (
    payload
  ) => {
    const isMobile = !isNaN(parseInt(payload.username[0]));
  
    const reqPayload: ILoginRequest = {
      ...payload,
      ...(isMobile && { idc_prefix: 91, region: 'IN' }),
    };
  
    const response = await axiosInstance.post(
      auth.login,
      reqPayload
    );
  
    response.data.access_token &&
      localStorage.setItem('login_token', response.data.access_token);
    response.data.user_id &&
      localStorage.setItem('user_id', response.data.user_id.toString());
    if (response?.data?.role) {
      localStorage.setItem('role', response?.data?.role);
      getUserData(response?.data?.role === 'ROLE_BUDDY');
    }
    return response;
  }; */

export const SubscribeWebhookDetail = async (baseAuthURL, id) => {
  try {
    const response = await axiosInstance.get(
      `${FOBasket.webhookSubscribe}${baseAuthURL}/${id}/`
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};

export const userValidateSession = async () => {
  try {
    const response = await axiosAuthInstance.post(
      `${auth.validate_user_session}`
    );
    return response?.data;
  } catch (error) {
    return error;
  }
};
