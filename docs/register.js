const API_URL = window.location.origin;


// =====================================================
// LẤY FORM
// =====================================================

const form = document.getElementById("registerForm");
const message = document.getElementById("message");


// =====================================================
// ĐĂNG KÝ
// =====================================================

form.addEventListener("submit", async function (event) {

    event.preventDefault();


    // =================================================
    // LẤY DỮ LIỆU
    // =================================================

    const name = document
        .getElementById("name")
        .value
        .trim();

    const email = document
        .getElementById("email")
        .value
        .trim();

    const school = document
        .getElementById("school")
        .value
        .trim();

    const password =
        document.getElementById("password").value;

    const confirmPassword =
        document.getElementById("confirmPassword").value;


    // =================================================
    // KIỂM TRA
    // =================================================

    if (!name || !email || !password || !confirmPassword) {

        message.textContent =
            "❌ Vui lòng nhập đầy đủ thông tin.";

        return;
    }


    if (password.length < 6) {

        message.textContent =
            "❌ Mật khẩu phải có ít nhất 6 ký tự.";

        return;
    }


    if (password !== confirmPassword) {

        message.textContent =
            "❌ Mật khẩu nhập lại không khớp.";

        return;
    }


    // =================================================
    // KHÓA NÚT
    // =================================================

    const button =
        form.querySelector("button");

    button.disabled = true;

    button.textContent =
        "Đang đăng ký...";

    message.textContent =
        "⏳ Đang tạo tài khoản...";


    // =================================================
    // GỌI API
    // =================================================

    try {

        console.log(
            "🌐 API:",
            API_URL
        );

        console.log(
            "📤 Đang gửi đăng ký:",
            {
                name,
                email,
                school
            }
        );


        const response = await fetch(
            `${API_URL}/api/teachers/register`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password,
                    school: school
                })
            }
        );


        console.log(
            "📡 Status:",
            response.status
        );


        // =================================================
        // ĐỌC RESPONSE
        // =================================================

        const text =
            await response.text();

        console.log(
            "📦 Response:",
            text
        );


        let data = {};

        try {

            data = JSON.parse(text);

        } catch {

            console.log(
                "Response không phải JSON"
            );

        }


        // =================================================
        // THÀNH CÔNG
        // =================================================

        if (response.ok) {

            message.textContent =
                "✅ Đăng ký thành công!";


            form.reset();


            console.log(
                "🎉 Đăng ký thành công!"
            );


            // Chuyển sang login
            setTimeout(function () {

                window.location.href =
                    "./login.html";

            }, 1000);


        } else {

            console.error(
                "❌ Đăng ký thất bại:",
                data
            );


            message.textContent =
                "❌ " +
                (
                    data.detail ||
                    "Đăng ký thất bại."
                );
        }


    } catch (error) {

        console.error(
            "🔥 Lỗi:",
            error
        );


        message.textContent =
            "❌ Không thể kết nối Backend.";

    } finally {

        button.disabled = false;

        button.textContent =
            "Đăng ký";
    }

});