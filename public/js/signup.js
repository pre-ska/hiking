//ext
import axios from "axios";
import { showAlert } from "./alert";

export const signup = async (name, email, password, passwordConfirm) => {
  if (password !== passwordConfirm) {
    const tg = document.getElementsByClassName("overlaySpin")[0];
    tg.parentNode.removeChild(tg);
    document.getElementById("signupBtn").style.display = "none";
    return showAlert("error", "Passwords don't match");
  }

  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/signup",
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    // console.log("login.js #1", res.data);
    if (res.data.status === "success") {
      showAlert("success", "Account created successfully");
      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (error) {
    const tg = document.getElementsByClassName("overlaySpin")[0];
    tg.parentNode.removeChild(tg);
    document.getElementById("signupBtn").style.display = "block";
    showAlert("error", error.response.data.message);
  }
};

// //12-19
// export const logout = async () => {
//   try {
//     const res = await axios({
//       method: "GET",
//       url: "/api/v1/users/logout",
//     });

//     if (res.data.status === "success") location.reload(true);
//   } catch (error) {
//     showAlert("error", "Error logging out! Try again.");
//   }
// };
