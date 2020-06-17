//12-18
import "@babel/polyfill";
import { displayMap } from "./mapBox";
import { login, logout } from "./login";

//get elements
const mapBox = document.getElementById("map");
const loginForm = document.getElementsByClassName("form")[0];
const logoutButton = document.getElementsByClassName("nav__el--logout")[0];

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
