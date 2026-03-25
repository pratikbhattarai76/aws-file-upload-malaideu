const dropzone = document.querySelector("[data-dropzone]");
const fileInput = document.querySelector("[data-file-input]");
const fileLabel = document.querySelector("[data-file-label]");

if (dropzone && fileInput && fileLabel) {
  const updateLabel = () => {
    const [file] = fileInput.files || [];
    fileLabel.textContent = file ? file.name : "No file selected";
  };

  ["dragenter", "dragover"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.add("is-dragover");
    });
  });

  ["dragleave", "dragend", "drop"].forEach((eventName) => {
    dropzone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropzone.classList.remove("is-dragover");
    });
  });

  dropzone.addEventListener("drop", (event) => {
    const files = event.dataTransfer?.files;

    if (files?.length) {
      fileInput.files = files;
      updateLabel();
    }
  });

  fileInput.addEventListener("change", updateLabel);
}
