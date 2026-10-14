const API_URL = window.location.origin;


const loginButton =
    document.getElementById(
        "loginButton"
    );


const emailInput =
    document.getElementById(
        "email"
    );


const passwordInput =
    document.getElementById(
        "password"
    );


const message =
    document.getElementById(
        "message"
    );


loginButton.addEventListener(
    "click",
    async function () {

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        if (!email || !password) {

            message.textContent =
                "Vui lòng nhập đầy đủ thông tin.";

            return;

        }


        message.textContent =
            "Đang đăng nhập...";


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

                        body: JSON.stringify({
                            email: email,
                            password: password
                        })
                    }
                );


            const data =
                await response.json();


            if (response.ok) {

    // Lưu thông tin giáo viên
    sessionStorage.setItem(
        "teacher",
        JSON.stringify(data.teacher)
    );

    message.textContent =
        "✅ Đăng nhập thành công!";


                setTimeout(
                    function () {

                        window.location.href =
                            "index.html";

                    },
                    1000
                );


            } else {

                message.textContent =
                    "❌ " +
                    (
                        data.detail ||
                        "Đăng nhập thất bại."
                    );

            }


        } catch (error) {

            console.error(error);

            message.textContent =
                "❌ Không thể kết nối Backend.";

        }

    }
);