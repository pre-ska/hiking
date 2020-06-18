//12-18
import "@babel/polyfill";
import { displayMap } from "./mapBox";
import { login, logout } from "./login";
import { updateSettings } from "./updatedSettings";

//get elements
const mapBox = document.getElementById("map");
const loginForm = document.getElementsByClassName("form--login")[0];
const logoutButton = document.getElementsByClassName("nav__el--logout")[0];
const userDataForm = document.getElementsByClassName("form-user-data")[0]; //12-23
const userPasswordForm = document.getElementsByClassName(
  "form-user-password"
)[0]; //12-23

//delegation
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });
}

if (logoutButton) logoutButton.addEventListener("click", logout);

if (userDataForm) {
  userDataForm.addEventListener("submit", (e) => {
    e.preventDefault();
    //13-6 refactoring da podržava img upload preko form data
    const form = new FormData(); //13-6
    form.append("name", document.getElementById("name").value);
    form.append("email", document.getElementById("email").value);
    form.append("photo", document.getElementById("photo").files[0]);

    // const email = document.getElementById("email").value;
    // const name = document.getElementById("name").value;
    // updateSettings({email, name}, "data");
    updateSettings(form, "data");
  });
}

if (userPasswordForm) {
  userPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const buttonSP = document.getElementById("btn--save-password");
    buttonSP.textContent = "Updating...";
    // buttonSP.setAttribute("disabled", true);
    buttonSP.setAttribute("style", "background-color: #A3A8A4");
    const passwordCurrent = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;
    await updateSettings(
      { password, passwordCurrent, passwordConfirm },
      "password"
    );

    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";

    buttonSP.textContent = "Save password";
    // buttonSP.setAttribute("disabled", false);
    buttonSP.setAttribute("style", "background-color: none");
  });
}
