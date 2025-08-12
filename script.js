const video = document.getElementById('video');
const statusDiv = document.getElementById('status');

// Memuat model face-api.js
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('models'),
    faceapi.nets.tinyYolov2.loadFromUri('models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('models'),
    faceapi.nets.ageGenderNet.loadFromUri('models')
]).then(startVideo);

// Memulai video
function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => video.srcObject = stream)
        .catch(err => console.error(err));
}

let detectionInterval = null;
let isPopupActive = false;

video.addEventListener('play', async () => {
    try {
        const labeledDescriptors = await loadLabeledImages();
        if (!labeledDescriptors || labeledDescriptors.length === 0) {
            statusDiv.innerHTML = "Data wajah tidak ditemukan. Silakan daftar terlebih dahulu.";
            console.error("Tidak ada data wajah untuk FaceMatcher.");
            return;
        }
        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6);

        function startDetection() {
            detectionInterval = setInterval(async () => {
                if (isPopupActive) return; // Stop deteksi saat popup aktif
                try {
                    const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
                        .withFaceLandmarks()
                        .withFaceDescriptors()
                        .withAgeAndGender();

                    if (detections.length > 0) {
                        const detection = detections[0];
                        const bestMatch = faceMatcher.findBestMatch(detection.descriptor);

                        const gender = detection.gender === 'male' ? 'Laki-laki' : 'Perempuan';
                        const age = Math.round(detection.age);

                        if (bestMatch.label !== 'unknown') {
                            statusDiv.innerHTML = `
                                <strong>Nama:</strong> ${bestMatch.label} <br>
                                <strong>Jenis Kelamin:</strong> ${gender} <br>
                                <strong>Perkiraan Umur:</strong> ${age} tahun
                            `;
                            sendAttendance(bestMatch.label);

                            // Capture foto dari video
                            const canvas = document.createElement('canvas');
                            canvas.width = video.videoWidth;
                            canvas.height = video.videoHeight;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                            const imageData = canvas.toDataURL('image/png');

                            // Tampilkan popup dan hentikan interval
                            isPopupActive = true;
                            showPopup({
                                name: bestMatch.label,
                                gender: gender,
                                age: age,
                                imageData: imageData
                            });
                        }
                    }
                } catch (err) {
                    console.error("Interval error:", err);
                    statusDiv.innerHTML = "Terjadi error saat deteksi wajah: " + err.message;
                }
            }, 2000);
        }

        startDetection();

        // Modifikasi showPopup agar interval berjalan kembali setelah popup ditutup
        window.showPopup = function({ name, gender, age, imageData }) {
            const popup = document.createElement('div');
            popup.style.position = 'fixed';
            popup.style.top = '0';
            popup.style.left = '0';
            popup.style.width = '100vw';
            popup.style.height = '100vh';
            popup.style.background = 'rgba(0,0,0,0.5)';
            popup.style.display = 'flex';
            popup.style.alignItems = 'center';
            popup.style.justifyContent = 'center';
            popup.style.zIndex = '9999';

            popup.innerHTML = `
                <div style="background:#fff;padding:32px 24px;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.18);text-align:center;max-width:350px;">
                    <h3 style="color:#007bff;margin-bottom:16px;">Data Absensi</h3>
                    <img src="${imageData}" alt="Foto Wajah" style="width:120px;height:120px;border-radius:50%;object-fit:cover;margin-bottom:16px;">
                    <div style="font-size:1.1em;margin-bottom:8px;"><strong>Nama:</strong> ${name}</div>
                    <div style="margin-bottom:8px;"><strong>Jenis Kelamin:</strong> ${gender}</div>
                    <div style="margin-bottom:16px;"><strong>Perkiraan Umur:</strong> ${age} tahun</div>
                    <button id="closePopup" style="padding:8px 24px;background:#007bff;color:#fff;border:none;border-radius:6px;font-weight:500;cursor:pointer;">Tutup</button>
                </div>
            `;
            document.body.appendChild(popup);
            document.getElementById('closePopup').onclick = () => {
                popup.remove();
                isPopupActive = false; // Aktifkan kembali deteksi
            };
        };
    } catch (err) {
        console.error("Play event error:", err);
        statusDiv.innerHTML = "Terjadi error saat inisialisasi: " + err.message;
    }
}
);

// Memuat gambar yang telah diberi label
async function loadLabeledImages() {
    try {
        const res = await fetch('get_users.php');
        const users = await res.json();
        return Promise.all(users.map(async user => {
            try {
                const img = await faceapi.fetchImage(user.image_path);
                const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
                if (!detections) throw new Error('No face detected');
                return new faceapi.LabeledFaceDescriptors(user.name, [detections.descriptor]);
            } catch (err) {
                console.error(`Gagal memuat/deskripsi gambar untuk user ${user.name}: ${err.message}`);
                return null;
            }
        })).then(arr => arr.filter(x => x));
    } catch (err) {
        console.error("Load labeled images error:", err);
        statusDiv.innerHTML = "Gagal memuat data wajah: " + err.message;
        return [];
    }
}

function sendAttendance(name) {
    fetch('save_attendance.php', {
        method: 'POST',
        body: new URLSearchParams({ name })
    });
}

function showPopup({ name, gender, age, imageData }) {
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.top = '0';
    popup.style.left = '0';
    popup.style.width = '100vw';
    popup.style.height = '100vh';
    popup.style.background = 'rgba(0,0,0,0.5)';
    popup.style.display = 'flex';
    popup.style.alignItems = 'center';
    popup.style.justifyContent = 'center';
    popup.style.zIndex = '9999';

    popup.innerHTML = `
        <div style="background:#fff;padding:32px 24px;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.18);text-align:center;max-width:350px;">
            <h3 style="color:#007bff;margin-bottom:16px;">Data Absensi</h3>
            <img src="${imageData}" alt="Foto Wajah" style="width:120px;height:120px;border-radius:50%;object-fit:cover;margin-bottom:16px;">
            <div style="font-size:1.1em;margin-bottom:8px;"><strong>Nama:</strong> ${name}</div>
            <div style="margin-bottom:8px;"><strong>Jenis Kelamin:</strong> ${gender}</div>
            <div style="margin-bottom:16px;"><strong>Perkiraan Umur:</strong> ${age} tahun</div>
            <button id="closePopup" style="padding:8px 24px;background:#007bff;color:#fff;border:none;border-radius:6px;font-weight:500;cursor:pointer;">Tutup</button>
        </div>
    `;
    document.body.appendChild(popup);
    document.getElementById('closePopup').onclick = () => {
        popup.remove();
        isPopupActive = false; // Aktifkan kembali deteksi
    };
}