
// =====================================================
// EM HỌC TIẾNG DÂN TỘC
// FUNCTION.JS
// =====================================================


// =====================================================
// 1. API
// =====================================================

const API_URL = window.location.origin;


// =====================================================
// 2. POPUP ĐĂNG NHẬP
// =====================================================

const teacherLogin =
    document.querySelector(".teacher-login");

const loginPopup =
    document.querySelector(".login-popup");

const closeLogin =
    document.querySelector(".login-popup .close");


// =====================================================
// 3. KIỂM TRA GIÁO VIÊN
// =====================================================

function updateTeacherButton() {

    const teacher =
    sessionStorage.getItem("teacher");

    if (!teacherLogin) {
        return;
    }


    // ===============================
    // ĐÃ ĐĂNG NHẬP
    // ===============================

    if (teacher) {

        try {

            const teacherData =
                JSON.parse(teacher);


            teacherLogin.textContent =
                "👩‍🏫 " +
                teacherData.name;


            // Bấm nút giáo viên
            // → đi tới trang teacher.html

            teacherLogin.onclick =
                function () {

                    window.location.href =
                        "teacher.html";

                };


        } catch (error) {

            console.error(
                "Lỗi đọc thông tin giáo viên:",
                error
            );

       sessionStorage.removeItem("teacher");
        }


    }

    // ===============================
    // CHƯA ĐĂNG NHẬP
    // ===============================

    else {

        teacherLogin.textContent =
            "👩‍🏫 Giáo viên";


        teacherLogin.onclick =
            function () {

                if (loginPopup) {

                    loginPopup.classList.add(
                        "active"
                    );

                }

            };

    }

}


// Chạy ngay khi mở trang
updateTeacherButton();


// =====================================================
// 4. ĐÓNG POPUP
// =====================================================

if (closeLogin) {

    closeLogin.addEventListener(
        "click",
        function () {

            loginPopup.classList.remove(
                "active"
            );

        }
    );

}


// =====================================================
// 5. CLICK RA NGOÀI POPUP
// =====================================================

if (loginPopup) {

    loginPopup.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                loginPopup
            ) {

                loginPopup.classList.remove(
                    "active"
                );

            }

        }
    );

}


// =====================================================
// 6. LOGIN
// =====================================================

const loginButton =
    document.querySelector(".login-button");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("password");

const loginMessage =
    document.getElementById("loginMessage");


if (loginButton) {

    loginButton.addEventListener(
        "click",
        async function () {


            const email =
                loginEmail.value.trim();


            const password =
                loginPassword.value;


            // ===============================
            // KIỂM TRA INPUT
            // ===============================

            if (
                !email ||
                !password
            ) {

                loginMessage.textContent =
                    "Vui lòng nhập đầy đủ email và mật khẩu.";

                return;

            }


            loginMessage.textContent =
                "Đang đăng nhập...";


            // ===============================
            // GỌI FASTAPI
            // ===============================

            try {

                const response =
                    await fetch(
                        API_URL +
                        "/api/teachers/login",
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    email:
                                        email,

                                    password:
                                        password

                                })

                        }
                    );


                const data =
                    await response.json();



                // ===============================
                // ĐĂNG NHẬP THÀNH CÔNG
                // ===============================
if (response.ok) {

    loginMessage.textContent =
        "✅ Đăng nhập thành công!";


    // =====================================
    // LƯU GIÁO VIÊN
    // =====================================

    sessionStorage.setItem(
        "teacher",
        JSON.stringify(
            data.teacher
        )
    );


                    // Cập nhật nút giáo viên
                    updateTeacherButton();


                    // Sau 1 giây chuyển sang
                    // trang giáo viên

                    setTimeout(
                        function () {

                            loginPopup.classList.remove(
                                "active"
                            );


                            window.location.href =
                                "teacher.html";

                        },
                        1000
                    );


                }


                // ===============================
                // ĐĂNG NHẬP THẤT BẠI
                // ===============================

                else {

                    loginMessage.textContent =
                        "❌ " +
                        (
                            data.detail ||
                            "Đăng nhập thất bại."
                        );

                }


            }

            catch (error) {

                console.error(error);


                loginMessage.textContent =
                    "❌ Không thể kết nối với Backend.";

            }

        }
    );

}


// =====================================================
// 7. CUỐN SÁCH TỪ VỰNG
// =====================================================


// Danh sách từ lấy từ DATABASE
let vocabulary = [];


// Danh sách sau khi SEARCH
let filteredVocabulary = [];


// Trang hiện tại
let currentBookPage = 0;


// Mỗi lần mở sách hiển thị 2 từ
// 1 từ trang trái
// 1 từ trang phải

const WORDS_PER_PAGE = 2;


// =====================================================
// 8. LOAD TỪ VỰNG TỪ DATABASE
// =====================================================

async function loadVocabulary() {


    const leftTitle =
        document.getElementById(
            "leftTitle"
        );

    const rightTitle =
        document.getElementById(
            "rightTitle"
        );


    // Nếu HTML không có sách
    // thì dừng

    if (
        !leftTitle ||
        !rightTitle
    ) {

        return;

    }


    try {

        const response =
            await fetch(
                API_URL +
                "/api/vocabulary"
            );


        if (!response.ok) {

            throw new Error(
                "Không thể tải từ vựng"
            );

        }


        const data = await response.json();
        vocabulary = Array.isArray(data) ? data : [];


        // Ban đầu hiển thị toàn bộ
        filteredVocabulary =
            [...vocabulary];


        // Quay về trang đầu
        currentBookPage = 0;


        renderBook();


    }

    catch (error) {

        console.error(
            "Lỗi load vocabulary:",
            error
        );


        leftTitle.textContent =
            "Không thể tải dữ liệu";


        rightTitle.textContent =
            "Kiểm tra Backend";


        const leftWords =
            document.getElementById(
                "leftWords"
            );


        if (leftWords) {

            leftWords.innerHTML = `

                <div class="error-box">

                    ❌ Không thể kết nối
                    với FastAPI.

                    <br><br>

                    Hãy kiểm tra Backend:

                    <br>

                    <b>
                        http://127.0.0.1:8000
                    </b>

                </div>

            `;

        }

    }

}


// =====================================================
// 9. TẠO 1 Ô TỪ VỰNG
// =====================================================

function createVocabularyHTML(word) {


    if (!word) {

        return `

            <div class="empty-word">

                🌸 Chưa có từ vựng

            </div>

        `;

    }


    // Đường dẫn audio
    let audioURL = "";


    if (word.audio) {

        audioURL =
            API_URL +
            "/" +
            word.audio;

    }


    return `

        <div
            class="book-word"
            data-search="
                ${
                    (
                        word.ethnic_word +
                        " " +
                        word.pronunciation +
                        " " +
                        word.vietnamese_meaning
                    ).toLowerCase()
                }
            "
        >

            <!-- ========================= -->
            <!-- CHỮ DÂN TỘC -->
            <!-- ========================= -->

            <div class="book-word-ethnic">

                ${word.ethnic_word}

            </div>


            <!-- ========================= -->
            <!-- PHIÊN ÂM -->
            <!-- ========================= -->

            <div class="book-word-pronunciation">

                /${word.pronunciation}/

            </div>


            <!-- ========================= -->
            <!-- NGHĨA TIẾNG KINH -->
            <!-- ========================= -->

            <div class="book-word-meaning">

                ${word.vietnamese_meaning}

            </div>


            <!-- ========================= -->
            <!-- AUDIO -->
            <!-- ========================= -->

            ${
                word.audio
                ?

                `

                    <button
                        class="word-audio"
                        type="button"
                        onclick="
                            playVocabularyAudio(
                                ${word.id}
                            )
                        "
                    >

                        🔊 Nghe cách đọc

                    </button>

                `

                :

                `

                    <div class="no-audio">

                        🔇 Chưa có âm thanh

                    </div>

                `
            }

        </div>

    `;

}


// =====================================================
// 10. PHÁT AUDIO TỪ DATABASE
// =====================================================

function playVocabularyAudio(
    audioPath
) {
    if (!audioPath) return;

    const audioURL =
        API_URL +
        "/" +
        audioPath;


    const audio =
        new Audio(audioURL);


    audio.play().catch(
        function (error) {

            console.error(
                "Không thể phát audio:",
                error
            );

        }
    );

}


// =====================================================
// 11. RENDER CUỐN SÁCH
// =====================================================

function renderBook() {


    const leftTitle =
        document.getElementById(
            "leftTitle"
        );

    const rightTitle =
        document.getElementById(
            "rightTitle"
        );


    const leftDescription =
        document.getElementById(
            "leftDescription"
        );


    const rightDescription =
        document.getElementById(
            "rightDescription"
        );


    const leftWords =
        document.getElementById(
            "leftWords"
        );


    const rightWords =
        document.getElementById(
            "rightWords"
        );


    const leftPageNumber =
        document.getElementById(
            "leftPageNumber"
        );


    const rightPageNumber =
        document.getElementById(
            "rightPageNumber"
        );


    const bookPageInfo =
        document.getElementById(
            "bookPageInfo"
        );


    // Nếu HTML chưa có sách
    if (
        !leftTitle ||
        !rightTitle ||
        !leftWords ||
        !rightWords
    ) {

        return;

    }


    // =================================================
    // KHÔNG CÓ TỪ VỰNG
    // =================================================

    if (
        filteredVocabulary.length === 0
    ) {

        leftTitle.textContent =
            "Cuốn sách còn trống";


        rightTitle.textContent =
            "Hãy thêm từ mới";


        leftDescription.textContent =
            "Chưa có dữ liệu trong database.";


        rightDescription.textContent =
            "Giáo viên có thể thêm từ vựng mới.";


        leftWords.innerHTML = `

            <div class="empty-word">

                🌱 Chưa có từ vựng

            </div>

        `;


        rightWords.innerHTML = `

            <div class="empty-word">

                👩‍🏫 Hãy đăng nhập giáo viên

            </div>

        `;


        leftPageNumber.textContent =
            "1";


        rightPageNumber.textContent =
            "2";


        bookPageInfo.textContent =
            "Chưa có từ";


        updateBookButtons();


        return;

    }


    // =================================================
    // XÁC ĐỊNH 2 TỪ TRÊN 2 TRANG
    // =================================================

    const leftIndex =
        currentBookPage *
        WORDS_PER_PAGE;


    const rightIndex =
        leftIndex + 1;


    const leftWord =
        filteredVocabulary[
            leftIndex
        ];


    const rightWord =
        filteredVocabulary[
            rightIndex
        ];


    // =================================================
    // TRANG TRÁI
    // =================================================

    if (leftWord) {

        leftTitle.textContent =
            "Từ vựng";


        leftDescription.textContent =
            "Từ thứ " +
            (leftIndex + 1);


        leftWords.innerHTML =
            createVocabularyHTML(
                leftWord
            );


    }

    else {

        leftTitle.textContent =
            "Trang trống";


        leftDescription.textContent =
            "";


        leftWords.innerHTML = `

            <div class="empty-word">

                🌸 Trang trống

            </div>

        `;

    }


    // =================================================
    // TRANG PHẢI
    // =================================================

    if (rightWord) {

        rightTitle.textContent =
            "Từ vựng";


        rightDescription.textContent =
            "Từ thứ " +
            (rightIndex + 1);


        rightWords.innerHTML =
            createVocabularyHTML(
                rightWord
            );

    }

    else {

        rightTitle.textContent =
            "Trang mới";


        rightDescription.textContent =
            "Đang chờ từ vựng tiếp theo.";


        rightWords.innerHTML = `

            <div class="empty-word">

                📚 Đang cập nhật...

            </div>

        `;

    }


    // =================================================
    // SỐ TRANG
    // =================================================

    leftPageNumber.textContent =
        leftIndex + 1;


    if (rightWord) {

        rightPageNumber.textContent =
            rightIndex + 1;

    }

    else {

        rightPageNumber.textContent =
            "";

    }


    // =================================================
    // THÔNG TIN TRANG
    // =================================================

    const totalPages =
        Math.ceil(
            filteredVocabulary.length /
            WORDS_PER_PAGE
        );


    bookPageInfo.textContent =
        "Trang " +
        (currentBookPage + 1) +
        " / " +
        totalPages;


    updateBookButtons();

}


// =====================================================
// 12. TRANG TIẾP THEO
// =====================================================

function nextBookPage() {


    const maxPage =
        Math.ceil(
            filteredVocabulary.length /
            WORDS_PER_PAGE
        ) - 1;


    if (
        currentBookPage <
        maxPage
    ) {

        animateBook();


        currentBookPage++;


        renderBook();

    }

}


// =====================================================
// 13. TRANG TRƯỚC
// =====================================================

function previousBookPage() {


    if (
        currentBookPage > 0
    ) {

        animateBook();


        currentBookPage--;


        renderBook();

    }

}


// =====================================================
// 14. HIỆU ỨNG LẬT TRANG
// =====================================================

function animateBook() {


    const pages =
        document.querySelectorAll(
            ".book-page"
        );


    pages.forEach(
        function (page) {


            page.classList.remove(
                "page-changing"
            );


            // ép trình duyệt render lại
            void page.offsetWidth;


            page.classList.add(
                "page-changing"
            );

        }
    );

}


// =====================================================
// 15. CẬP NHẬT NÚT TRANG
// =====================================================

function updateBookButtons() {


    const maxPage =
        Math.ceil(
            filteredVocabulary.length /
            WORDS_PER_PAGE
        ) - 1;


    const prev =
        document.getElementById(
            "prevPage"
        );


    const next =
        document.getElementById(
            "nextPage"
        );


    const prevBottom =
        document.getElementById(
            "prevPageBottom"
        );


    const nextBottom =
        document.getElementById(
            "nextPageBottom"
        );


    // Nút TRƯỚC

    if (prev) {

        prev.disabled =
            currentBookPage <= 0;

    }


    if (prevBottom) {

        prevBottom.disabled =
            currentBookPage <= 0;

    }


    // Nút TIẾP

    if (next) {

        next.disabled =
            currentBookPage >= maxPage;

    }


    if (nextBottom) {

        nextBottom.disabled =
            currentBookPage >= maxPage;

    }

}


// =====================================================
// 16. GẮN NÚT TRANG
// =====================================================

const prevPage =
    document.getElementById(
        "prevPage"
    );


const nextPage =
    document.getElementById(
        "nextPage"
    );


const prevPageBottom =
    document.getElementById(
        "prevPageBottom"
    );


const nextPageBottom =
    document.getElementById(
        "nextPageBottom"
    );


if (prevPage) {

    prevPage.addEventListener(
        "click",
        previousBookPage
    );

}


if (nextPage) {

    nextPage.addEventListener(
        "click",
        nextBookPage
    );

}


if (prevPageBottom) {

    prevPageBottom.addEventListener(
        "click",
        previousBookPage
    );

}


if (nextPageBottom) {

    nextPageBottom.addEventListener(
        "click",
        nextBookPage
    );

}


// =====================================================
// 17. TÌM KIẾM TRONG CUỐN SÁCH
// =====================================================

const searchInput =
    document.getElementById(
        "searchInput"
    );


if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {


            const keyword =
                searchInput.value
                    .toLowerCase()
                    .trim();


            // Lọc trực tiếp từ DATABASE
            // đã load vào vocabulary

            filteredVocabulary =
                vocabulary.filter(
                    function (word) {


                        const searchText =
                            (
                                word.ethnic_word +
                                " " +
                                word.pronunciation +
                                " " +
                                word.vietnamese_meaning
                            )
                            .toLowerCase();


                        return searchText.includes(
                            keyword
                        );

                    }
                );


            // Quay về trang đầu
            currentBookPage = 0;


            renderBook();

        }
    );

}


// =====================================================
// 18. START
// =====================================================

// Khi mở index.html
// → lấy từ database
// → render vào sách

loadVocabulary();

