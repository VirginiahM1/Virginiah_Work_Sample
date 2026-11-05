
const projectGrid = document.getElementById("projectGrid");

/* ========================================
   LOAD PROJECT INFORMATION
======================================== */

async function loadProjects() {
    try {
        const response = await fetch("projects.json");

        if (!response.ok) {
            throw new Error("Unable to load project information.");
        }

        const projects = await response.json();

        displayProjects(projects);

    } catch (error) {
        console.error("Project loading error:", error);

        projectGrid.innerHTML = `
            <p class="loading-message">
                Unable to load work samples. Please refresh the page and try again.
            </p>
        `;
    }
}


/* ========================================
   DISPLAY PROJECT CARDS
======================================== */

function displayProjects(projects) {
    projectGrid.innerHTML = "";

    projects.forEach(project => {

        const card = document.createElement("article");
        card.className = "project-card";

        /* Project information */

        const content = document.createElement("div");
        content.className = "project-content";

        content.innerHTML = `
            <span class="project-category">${project.category}</span>

            <h3 class="project-title">${project.title}</h3>

            <p class="project-description">
                ${project.description}
            </p>
        `;

        /* Project screenshots */

        const previewContainer = document.createElement("div");
        previewContainer.className = "project-previews";

        const previews = project.previews || (
            project.image
                ? [{ image: project.image, caption: "Project Preview" }]
                : []
        );

        previews.forEach(preview => {

            const previewItem = document.createElement("div");
            previewItem.className = "project-preview";

            const heading = document.createElement("h4");
            heading.className = "preview-heading";
            heading.textContent = preview.caption;

            const imageButton = document.createElement("button");
            imageButton.className = "preview-image-button";
            imageButton.type = "button";
            imageButton.setAttribute(
                "aria-label",
                `Enlarge ${preview.caption}`
            );

            const image = document.createElement("img");
            image.src = preview.image;
            image.alt = `${project.title} — ${preview.caption}`;
            image.className = "project-image";
            image.loading = "lazy";

            imageButton.appendChild(image);

            imageButton.addEventListener("click", () => {
                openImageViewer(preview.image, preview.caption);
            });

            previewItem.appendChild(heading);
            previewItem.appendChild(imageButton);

            previewContainer.appendChild(previewItem);
        });

        /* Project files and download options */

        const filesContainer = document.createElement("div");
        filesContainer.className = "project-files";

        const filesHeading = document.createElement("h4");
        filesHeading.className = "files-heading";
        filesHeading.textContent = "Available Project Files";

        filesContainer.appendChild(filesHeading);

        (project.files || []).forEach(file => {

            const fileGroup = document.createElement("div");
            fileGroup.className = "file-group";

            const fileName = document.createElement("p");
            fileName.className = "file-name";
            fileName.textContent = file.name;

            fileGroup.appendChild(fileName);

            const actions = document.createElement("div");
            actions.className = "project-actions";

            /* PDF viewing option */

            if (file.viewPath) {

                const viewLink = document.createElement("a");

                viewLink.href = file.viewPath;
                viewLink.target = "_blank";
                viewLink.rel = "noopener noreferrer";
                viewLink.className = "file-link view-link";
                viewLink.textContent = "View PDF";

                actions.appendChild(viewLink);
            }

           /* Download options */

(file.downloads || []).forEach(download => {

    const downloadLink = document.createElement("a");

    downloadLink.href = download.path;

    const fileName = download.path.split("/").pop();

    downloadLink.setAttribute("download", fileName);

    downloadLink.className = "file-link download-link";
    downloadLink.textContent = download.label;

    actions.appendChild(downloadLink);
});

            fileGroup.appendChild(actions);
            filesContainer.appendChild(fileGroup);
        });

        /* Assemble project card */

        content.appendChild(previewContainer);
        content.appendChild(filesContainer);

        card.appendChild(content);

        projectGrid.appendChild(card);
    });
}


/* ========================================
   IMAGE VIEWER / LIGHTBOX
======================================== */

let currentZoom = 1;

function createImageViewer() {

    const viewer = document.createElement("div");

    viewer.id = "imageViewer";
    viewer.className = "image-viewer";

    viewer.setAttribute("aria-hidden", "true");

    viewer.innerHTML = `
        <div class="viewer-content">

            <div class="viewer-toolbar">

                <p class="viewer-caption" id="viewerCaption">
                    Image Preview
                </p>

                <div class="viewer-controls">

                    <button type="button" id="zoomOut" aria-label="Zoom out">
                        −
                    </button>

                    <button type="button" id="zoomReset" aria-label="Reset zoom">
                        Reset
                    </button>

                    <button type="button" id="zoomIn" aria-label="Zoom in">
                        +
                    </button>

                    <button type="button" id="closeViewer" aria-label="Close image viewer">
                        ×
                    </button>

                </div>

            </div>

            <div class="viewer-image-area" id="viewerImageArea">

                <img id="viewerImage" src="" alt="Enlarged project preview">

            </div>

            <p class="viewer-instruction">
                Use the zoom controls to examine the screenshot.
            </p>

        </div>
    `;

    document.body.appendChild(viewer);

    return viewer;
}

const imageViewer = createImageViewer();

const viewerImage = document.getElementById("viewerImage");
const viewerCaption = document.getElementById("viewerCaption");
const viewerImageArea = document.getElementById("viewerImageArea");


function openImageViewer(imagePath, caption) {

    currentZoom = 1;

    viewerImage.src = imagePath;
    viewerImage.alt = caption;

    viewerCaption.textContent = caption;

    updateImageZoom();

    imageViewer.classList.add("active");
    imageViewer.setAttribute("aria-hidden", "false");

    document.body.classList.add("viewer-open");

    document.getElementById("closeViewer").focus();
}


function closeImageViewer() {

    imageViewer.classList.remove("active");
    imageViewer.setAttribute("aria-hidden", "true");

    document.body.classList.remove("viewer-open");

    viewerImage.src = "";

    currentZoom = 1;
}


function updateImageZoom() {

    viewerImage.style.transform = `scale(${currentZoom})`;

    viewerImageArea.style.overflow =
        currentZoom > 1 ? "auto" : "auto";
}


/* Zoom controls */

document.getElementById("zoomIn").addEventListener("click", () => {

    currentZoom = Math.min(currentZoom + 0.25, 3);

    updateImageZoom();
});


document.getElementById("zoomOut").addEventListener("click", () => {

    currentZoom = Math.max(currentZoom - 0.25, 0.5);

    updateImageZoom();
});


document.getElementById("zoomReset").addEventListener("click", () => {

    currentZoom = 1;

    updateImageZoom();

    viewerImageArea.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth"
    });
});


/* Close viewer */

document.getElementById("closeViewer").addEventListener("click", closeImageViewer);


imageViewer.addEventListener("click", event => {

    if (event.target === imageViewer) {
        closeImageViewer();
    }
});


document.addEventListener("keydown", event => {

    if (event.key === "Escape" && imageViewer.classList.contains("active")) {
        closeImageViewer();
    }
});


/* ========================================
   START WEBSITE
======================================== */

loadProjects();
