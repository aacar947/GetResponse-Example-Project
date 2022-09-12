let animationEnded = false;
const body = document.querySelector("body");
const mainForm = document.querySelector(".main-form");
const country = document.getElementById("country");
const selected = document.querySelector("option.selected");

window.addEventListener("load", () => {
  body.classList.add("body-loaded");
});
mainForm.addEventListener("submit", (e) => {
  if (!animationEnded) {
    e.preventDefault();
    mainForm.classList.add("onsubmit");
    animationEnded = true;
    mainForm.submit();
  }
});

// get city options from server
async function getCountryOptions() {
  const res = await fetch("/countrys", { method: "GET" });
  const data = await res.json();
  return await data;
}

getCountryOptions()
  .then((res) => {
    Object.values(res).forEach((e, i) => {
      if (e == selected.value) {
        country[i + 1] = new Option(e, e, true, true);
      } else {
        country[i + 1] = new Option(e, e, false, false);
      }
    });
  })
  .catch((err) => console.log(err));

console.log(selected);
