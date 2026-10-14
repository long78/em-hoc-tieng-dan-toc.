
// =====================================================
// EM HỌC TIẾNG DÂN TỘC
// TEACHER.JS
// =====================================================


// =====================================================
// API
// =====================================================

const API_URL = window.location.origin;


// =====================================================
// LẤY GIÁO VIÊN ĐANG ĐĂNG NHẬP
// =====================================================

const teacherJSON =
    sessionStorage.getItem("teacher");


if (!teacherJSON) {

    alert(
        "Vui lòng đăng nhập giáo viên trước."
    );

    window.location.href =
        "login.html";

    throw new Error(
        "Chưa đăng nhập giáo viên."
    );

}


// Chuyển JSON thành object
const teacher =
    JSON.parse(teacherJSON);


// =====================================================
// KIỂM TRA ID GIÁO VIÊN
// =====================================================

console.log(
    "===== GIÁO VIÊN ====="
);

console.log(
    "ID:",
    teacher.id
);

console.log(
    "Tên:",
    teacher.name
);

console.log(
    "Email:",
    teacher.email
);

console.log(
    "Trường:",
    teacher.school
);


if (!teacher.id) {

    alert(
        "❌ Không tìm thấy ID giáo viên.\n\n" +
        "Vui lòng đăng nhập lại."
    );

    sessionStorage.removeItem("teacher");

    window.location.href =
        "login.html";

    throw new Error(
        "Không có teacher.id"
    );

}


// =====================================================
// HIỂN THỊ THÔNG TIN GIÁO VIÊN
// =====================================================

document.getElementById(
    "teacherName"
).textContent =
    teacher.name || "Giáo viên";


document.getElementById(
    "teacherEmail"
).textContent =
    teacher.email || "";


document.getElementById(
    "teacherSchool"
).textContent =
    teacher.school ||
    "Chưa cập nhật trường";


// =====================================================
// FORM
// =====================================================

const form =
    document.getElementById(
        "vocabularyForm"
    );


const message =
    document.getElementById(
        "message"
    );


const submitButton =
    document.getElementById(
        "submitButton"
    );


// =====================================================
// ĐĂNG TỪ VỰNG
// =====================================================

form.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // =============================================
        // LẤY DỮ LIỆU
        // =============================================

        const ethnicWord =
            document.getElementById(
                "ethnicWord"
            ).value.trim();


        const pronunciation =
            document.getElementById(
                "pronunciation"
            ).value.trim();


        const vietnameseMeaning =
            document.getElementById(
                "vietnameseMeaning"
            ).value.trim();


        const audioFile =
            document.getElementById(
                "audioFile"
            ).files[0];


        const imageFile =
            document.getElementById(
                "imageFile"
            ).files[0];


        // =============================================
        // KIỂM TRA
        // =============================================

        if (
            !ethnicWord ||
            !pronunciation ||
            !vietnameseMeaning
        ) {

            message.textContent =
                "❌ Vui lòng nhập đầy đủ thông tin.";

            return;

        }


        // =============================================
        // TRẠNG THÁI
        // =============================================

        message.textContent =
            "⏳ Đang đăng từ vựng...";


        submitButton.disabled =
            true;


        submitButton.textContent =
            "⏳ Đang lưu...";


        // =============================================
        // TẠO FORM DATA
        // =============================================

        const formData =
            new FormData();


        formData.append(
            "ethnic_word",
            ethnicWord
        );


        formData.append(
            "pronunciation",
            pronunciation
        );


        formData.append(
            "vietnamese_meaning",
            vietnameseMeaning
        );


        // =============================================
        // ID GIÁO VIÊN
        // =============================================

        formData.append(
            "teacher_id",
            teacher.id
        );


        // =============================================
        // AUDIO
        // Backend nhận: audio_file
        // =============================================

        if (audioFile) {

            formData.append(
                "audio_file",
                audioFile
            );

        }


        // =============================================
        // IMAGE
        // Backend nhận: image_file
        // =============================================

        if (imageFile) {

            formData.append(
                "image_file",
                imageFile
            );

        }


        // =============================================
        // GỬI API
        // =============================================

        try {
            const response = await fetch(
                `${API_URL}/api/vocabulary`,
                {
                    method: "POST",
                    body: formData
                }
            );

            // ĐỌC RESPONSE MỘT LẦN
            let data = {};

            try {
                data = await response.json();
            } catch (error) {
                console.log("Backend không trả JSON.");
            }

            // KIỂM TRA KẾT QUẢ
            if (!response.ok) {
                const detail = data.detail || `Lỗi HTTP ${response.status}`;

                throw new Error(
                    typeof detail === "string"
                        ? detail
                        : JSON.stringify(detail)
                );
            }

            // THÀNH CÔNG
            console.log("Đăng từ vựng thành công:", data);

            message.textContent = "✅ Đăng từ thành công!";
            alert("Đăng từ vựng thành công!");

            // XÓA FORM
            form.reset();

            // TẢI LẠI DANH SÁCH
            await loadMyVocabulary();

        } catch (error) {
            console.error("Lỗi gửi từ vựng:", error);

            message.textContent =
                "❌ Không thể đăng từ vựng: " + error.message;

        } finally {
            // MỞ KHÓA NÚT
            submitButton.disabled = false;

            submitButton.textContent =
                "📖 Đăng vào cuốn sách";
        }

    }
);


// =====================================================
// LOAD TỪ CỦA GIÁO VIÊN
// =====================================================

async function loadMyVocabulary() {

    const container =
        document.getElementById(
            "myVocabularyList"
        );


    container.innerHTML =
        "<p>⏳ Đang tải...</p>";


    try {

        const response =
            await fetch(

                API_URL +
                "/api/teachers/" +
                teacher.id +
                "/vocabulary"

            );


        if (!response.ok) {

            throw new Error(
                "Không thể tải dữ liệu."
            );

        }


        const words =
            await response.json();


        // =============================================
        // KHÔNG CÓ TỪ
        // =============================================

        if (
            !words ||
            words.length === 0
        ) {

            container.innerHTML = `

                <div class="empty-vocabulary">

                    <h3>
                        📖 Chưa có từ nào
                    </h3>

                    <p>
                        Hãy đăng từ đầu tiên
                        vào cuốn sách.
                    </p>

                </div>

            `;

            return;

        }


        // =============================================
        // HIỂN THỊ
        // =============================================

        container.innerHTML =
            words.map(

                function (word) {

                    return `

                        <div
                            class="vocabulary-card"
                        >

                            ${
                                word.image
                                ?
                                `
                                    <img
                                        src="${API_URL}/${word.image}"
                                        class="vocabulary-image"
                                        alt="${escapeHTML(
                                            word.vietnamese_meaning
                                        )}"
                                    >
                                `
                                :
                                ""
                            }


                            <h3>
                                ${escapeHTML(
                                    word.ethnic_word
                                )}
                            </h3>


                            <div
                                class="pronunciation"
                            >
                                /${escapeHTML(
                                    word.pronunciation
                                )}/
                            </div>


                            <div
                                class="meaning"
                            >
                                ${escapeHTML(
                                    word.vietnamese_meaning
                                )}
                            </div>


                            ${
                                word.audio
                                ?
                                `

                                    <button
                                        class="audio-button"
                                        type="button"
                                        onclick="
                                            playAudio(
                                                '${word.audio}'
                                            )
                                        "
                                    >
                                        🔊 Nghe cách đọc
                                    </button>

                                `
                                :
                                `

                                    <span>
                                        🔇 Chưa có âm thanh
                                    </span>

                                `
                            }


                        </div>

                    `;

                }

            ).join("");


    } catch (error) {

        console.error(
            "Lỗi load vocabulary:",
            error
        );


        container.innerHTML = `

            <p>
                ❌ Không thể tải dữ liệu.
            </p>

        `;

    }

}


// =====================================================
// PLAY AUDIO
// =====================================================

function playAudio(audioPath) {

    if (!audioPath) {

        console.error(
            "Không có đường dẫn audio."
        );

        return;

    }


    const audio =
        new Audio(
            API_URL +
            "/" +
            audioPath
        );


    audio.play().catch(

        function (error) {

            console.error(
                "Không thể phát audio:",
                error
            );

        }

    );

}


// Cho HTML gọi được hàm
window.playAudio =
    playAudio;


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHTML(text) {

    if (!text) {

        return "";

    }


    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// =====================================================
// ĐĂNG XUẤT
// =====================================================

const logoutButton =
    document.getElementById(
        "logoutButton"
    );


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function () {

            sessionStorage.removeItem(
                "teacher"
            );


            window.location.href =
                "index.html";

        }
    );

}


// =====================================================
// START
// =====================================================

loadMyVocabulary();
