const { ipcRenderer } = require('electron')

ipcRenderer.on('login-reply', (event, arg) => {
  document.querySelector('.auth-container').classList.add('hidden');
  document.querySelector('.code-container').textContent = arg.code;
  document.querySelector('.username').textContent = arg.user.username;
});

ipcRenderer.on('sign-up-reply', (event, arg) => {
  console.log(arg)
});

ipcRenderer.on('error-reply', (event, arg) => {
  console.error(`Error: ${arg}`);
});

ipcRenderer.on('authentication-reply', (event, arg) => {
  if (arg.isAuthenticated) {
    document.querySelector('.auth-container').classList.add('hidden');
    document.querySelector('.code-container').textContent = arg.code;
    document.querySelector('.username').textContent = arg.user.username;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send('authentication');

  let $_loginForm = document.querySelector('.login-form');
  let $_signUpForm = document.querySelector('.sign-up-form');

  $_loginForm.addEventListener('submit', e => {
    e.preventDefault();

    ipcRenderer.send('login', serializeForm($_loginForm));
  });

  $_signUpForm.addEventListener('submit', e => {
    e.preventDefault();

    ipcRenderer.send('sign-up', serializeForm($_signUpForm));
  });
});

function serializeForm(form) {
  const formEntries = new FormData(form).entries();
  const json = Object.assign(...Array.from(formEntries, ([x,y]) => ({[x]:y})));

  return json;
}
