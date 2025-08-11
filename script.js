// const video = document.getElementById('video');
// const statusDiv = document.getElementById('status');

// Promise.all([
//     faceapi.nets.tinyFaceDetector.loadFromUri('models'),
//     faceapi.nets.faceLandmark68Net.loadFromUri('models'),
//     faceapi.nets.faceRecognitionNet.loadFromUri('models'),
//     faceapi.nets.ageGenderNet.loadFromUri('models')
// ]).then(startVideo);

// function startVideo() {
//     navigator.mediaDevices.getUserMedia({ video: {} })
//         .then(stream => video.srcObject = stream)
//         .catch(err => console.error(err));
// }

// video.addEventListener('play', async () => {
//     const labeledDescriptors = await loadLabeledImages();
//     const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

//     setInterval(async () => {
//         const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
//             .withFaceLandmarks()
//             .withFaceDescriptors()
//             .withAgeAndGender();

//         if (detections.length > 0) {
//             const bestMatch = faceMatcher.findBestMatch(detections[0].descriptor);
//             if (bestMatch.label !== 'unknown') {
//                 const gender = detections[0].gender === 'male' ? 'Laki-laki' : 'Perempuan';
//                 statusDiv.innerHTML = `Halo ${bestMatch.label}, Jenis Kelamin: ${gender}`;
//                 sendAttendance(bestMatch.label);
//             } else {
//                 statusDiv.innerHTML = `Wajah belum terdaftar. <a href="register.html">Daftar sekarang</a>`;
//             }
//         }
//     }, 2000);
// });

// async function loadLabeledImages() {
//     const res = await fetch('get_users.php');
//     const users = await res.json();
//     return Promise.all(users.map(async user => {
//         const img = await faceapi.fetchImage(user.image_path);
//         const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
//         return new faceapi.LabeledFaceDescriptors(user.name, [detections.descriptor]);
//     }));
// }

// function sendAttendance(name) {
//     fetch('save_attendance.php', {
//         method: 'POST',
//         body: new URLSearchParams({ name })
//     });
// }

const video = document.getElementById('video');
const statusDiv = document.getElementById('status');

async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        video.srcObject = stream;
    } catch (err) {
        statusDiv.textContent = 'Gagal mengakses kamera: ' + err;
    }
}

async function loadModels() {
    statusDiv.textContent = 'Memuat model...';
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    statusDiv.textContent = 'Model siap!';
}

video.addEventListener('play', async () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
    }, 100);
});

setupCamera();
loadModels();