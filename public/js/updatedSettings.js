//12-23
import axios from "axios";
import { showAlert } from "./alert";

// type is either password or data 12-24 refacturing
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === "password"
        ? "http://localhost:3000/api/v1/users/updateMyPassword"
        : "http://localhost:3000/api/v1/users/updateMe";

    const res = await axios({
      method: "PATCH",
      url,
      data,
    });

    if (res.data.status === "success") {
      showAlert("success", `${type.toUpperCase()} updated successfully`);
    }
  } catch (error) {
    showAlert("error", error.response.data.message);
  }
};
