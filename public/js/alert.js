//12-18

export const hideAlert = () => {
  const el = document.querySelector(".alert");
  if (el) el.parentElement.removeChild(el);
};

// type is 'success" or "error"
export const showAlert = (type, msg, time = 5) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${msg}</>`;
  document
    .getElementsByTagName("body")[0]
    .insertAdjacentHTML("afterbegin", markup);

  window.setTimeout(hideAlert, time * 1000);
};
