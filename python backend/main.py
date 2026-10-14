from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form
)
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

from fastapi.responses import FileResponse
from pathlib import Path
from sqlalchemy.orm import Session



from uuid import uuid4

import shutil

import models as model
import scheme as schema

from database import (
    engine,
    SessionLocal
)

from auth import (
    hash_password,
    verify_password
)


# =====================================================
# DATABASE
# =====================================================

model.Base.metadata.create_all(
    bind=engine
)


# =====================================================
# FASTAPI
# =====================================================

app = FastAPI(
    title="Em học tiếng dân tộc API",
    description=(
        "Backend website dạy tiếng dân tộc "
        "cho trẻ em miền núi"
    ),
    version="2.0.0"
)

# =====================================================
# FRONTEND
# =====================================================

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "front end"

print("📁 FRONTEND_DIR =", FRONTEND_DIR)
print("📄 index.html =", FRONTEND_DIR / "index.html")
print("📄 index tồn tại =", (FRONTEND_DIR / "index.html").exists())


app.mount(
    "/static",
    StaticFiles(directory=str(FRONTEND_DIR)),
    name="static"
)


@app.get("/")
def serve_frontend():
    return FileResponse(
        FRONTEND_DIR / "index.html"
    )
@app.get("/index.html")
def index_page():
    return FileResponse(FRONTEND_DIR / "index.html")

@app.get("/login.html")
def login_page():
    return FileResponse(
        FRONTEND_DIR / "login.html"
    )


@app.get("/register.html")
def register_page():
    return FileResponse(
        FRONTEND_DIR / "register.html"
    )


@app.get("/teacher.html")
def teacher_page():
    return FileResponse(
        FRONTEND_DIR / "teacher.html"
    )
# =====================================================
# CORS
# =====================================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# =====================================================
# UPLOAD FOLDER
# =====================================================

BASE_DIR = Path(__file__).resolve().parent

UPLOAD_DIR = BASE_DIR / "uploads"

AUDIO_DIR = UPLOAD_DIR / "audio"

IMAGE_DIR = UPLOAD_DIR / "images"


AUDIO_DIR.mkdir(
    parents=True,
    exist_ok=True
)

IMAGE_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# =====================================================
# CHO FRONTEND TRUY CẬP FILE
# =====================================================

app.mount(

    "/uploads",

    StaticFiles(
        directory=str(UPLOAD_DIR)
    ),

    name="uploads"
)


# =====================================================
# DATABASE SESSION
# =====================================================

def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()


# =====================================================
# HOME
# =====================================================


# =====================================================
# ĐĂNG KÝ GIÁO VIÊN
# =====================================================

@app.post(
    "/api/teachers/register"
)
def register_teacher(

    teacher: schema.TeacherRegister,

    db: Session = Depends(get_db)

):

    existing_teacher = (

        db.query(model.Teacher)

        .filter(
            model.Teacher.email
            == teacher.email
        )

        .first()
    )


    if existing_teacher:

        raise HTTPException(

            status_code=400,

            detail=
            "Email này đã được đăng ký."
        )


    hashed_password = hash_password(
        teacher.password
    )


    new_teacher = model.Teacher(

        name=teacher.name,

        email=teacher.email,

        password=hashed_password,

        school=teacher.school
    )


    db.add(new_teacher)

    db.commit()

    db.refresh(new_teacher)

    return {

        "message":
        "Đăng ký thành công!",

        "teacher": {

            "id":
            new_teacher.id,

            "name":
            new_teacher.name,

            "email":
            new_teacher.email,

            "school":
            new_teacher.school
        }
    }


# =====================================================
# ĐĂNG NHẬP
# =====================================================

@app.post(
    "/api/teachers/login"
)
def login_teacher(

    teacher: schema.TeacherLogin,

    db: Session = Depends(get_db)

):

    found_teacher = (

        db.query(model.Teacher)

        .filter(
            model.Teacher.email
            == teacher.email
        )

        .first()
    )


    if not found_teacher:

        raise HTTPException(

            status_code=401,

            detail=
            "Email hoặc mật khẩu không đúng."
        )


    if not verify_password(

        teacher.password,

        found_teacher.password

    ):

        raise HTTPException(

            status_code=401,

            detail=
            "Email hoặc mật khẩu không đúng."
        )

    return {

        "message":
        "Đăng nhập thành công!",

        "teacher": {

            "id":
            found_teacher.id,

            "name":
            found_teacher.name,

            "email":
            found_teacher.email,

            "school":
            found_teacher.school
        }
    }


# =====================================================
# DANH SÁCH GIÁO VIÊN
# =====================================================

@app.get(
    "/api/teachers"
)
def get_teachers(

    db: Session = Depends(get_db)

):

    teachers = (

        db.query(model.Teacher)

        .all()
    )


    return [

        {

            "id":
            teacher.id,

            "name":
            teacher.name,

            "email":
            teacher.email,

            "school":
            teacher.school

        }

        for teacher in teachers

    ]


# =====================================================
# ĐĂNG TỪ VỰNG
# =====================================================

@app.post(
    "/api/vocabulary"
)
async def create_vocabulary(

    ethnic_word: str = Form(...),

    pronunciation: str = Form(...),

    vietnamese_meaning: str = Form(...),

    teacher_id: int = Form(...),

    audio_file: UploadFile | None =
    File(None),

    image_file: UploadFile | None =
    File(None),

    db: Session = Depends(get_db)

):

    # =================================================
    # KIỂM TRA GIÁO VIÊN
    # =================================================

    teacher = (

        db.query(model.Teacher)

        .filter(
            model.Teacher.id
            == teacher_id
        )

        .first()
    )


    if not teacher:

        raise HTTPException(

            status_code=404,

             detail=
            "Không tìm thấy giáo viên."
        )
        


    # =================================================
    # AUDIO
    # =================================================

    audio_path = None


    if audio_file:

        extension = Path(
            audio_file.filename
        ).suffix.lower()


        allowed_audio = [

            ".mp3",

            ".wav",

            ".ogg",

            ".m4a",

            ".webm"

        ]


        if extension not in allowed_audio:

            raise HTTPException(

                status_code=400,

                detail=
                "File âm thanh không hợp lệ."
            )


        filename = (

            str(uuid4())

            + extension

        )


        save_path = (
            AUDIO_DIR
            / filename
        )


        with open(
            save_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(

                audio_file.file,

                buffer
            )


        audio_path = (

            "uploads/audio/"
            + filename
        )


    # =================================================
    # IMAGE
    # =================================================

    image_path = None


    if image_file:

        extension = Path(
            image_file.filename
        ).suffix.lower()


        allowed_images = [

            ".jpg",

            ".jpeg",

            ".png",

            ".webp"

        ]


        if extension not in allowed_images:

            raise HTTPException(

                status_code=400,

                detail=
                "File hình ảnh không hợp lệ."
            )


        filename = (

            str(uuid4())

            + extension

        )


        save_path = (
            IMAGE_DIR
            / filename
        )


        with open(
            save_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(

                image_file.file,

                buffer
            )


        image_path = (

            "uploads/images/"
            + filename
        )


    # =================================================
    # LƯU DATABASE
    # =================================================

    new_word = model.Vocabulary(

        ethnic_word=
        ethnic_word.strip(),

        pronunciation=
        pronunciation.strip(),

        vietnamese_meaning=
        vietnamese_meaning.strip(),

        audio=
        audio_path,

        image=
        image_path,

        teacher_id=
        teacher_id
    )


    db.add(new_word)

    db.commit()

    db.refresh(new_word)


    return {

        "message":
        "Đăng từ vựng thành công!",

        "vocabulary": {

            "id":
            new_word.id,

            "ethnic_word":
            new_word.ethnic_word,

            "pronunciation":
            new_word.pronunciation,

            "vietnamese_meaning":
            new_word.vietnamese_meaning,

            "audio":
            new_word.audio,

            "image":
            new_word.image,

            "teacher_id":
            new_word.teacher_id
        }

    }


# =====================================================
# LẤY TẤT CẢ TỪ VỰNG
# =====================================================

@app.get(
    "/api/vocabulary"
)
def get_vocabulary(

    db: Session = Depends(get_db)

):

    words = (

        db.query(model.Vocabulary)

        .order_by(
            model.Vocabulary.id.asc()
        )

        .all()
    )


    return [

        {

            "id":
            word.id,

            "ethnic_word":
            word.ethnic_word,

            "pronunciation":
            word.pronunciation,

            "vietnamese_meaning":
            word.vietnamese_meaning,

            "audio":
            word.audio,

            "image":
            word.image,

            "teacher_id":
            word.teacher_id

        }

        for word in words

    ]


# =====================================================
# LẤY 1 TỪ
# =====================================================

@app.get(
    "/api/vocabulary/{vocabulary_id}"
)
def get_one_vocabulary(

    vocabulary_id: int,

    db: Session = Depends(get_db)

):

    word = (

        db.query(model.Vocabulary)

        .filter(
            model.Vocabulary.id
            == vocabulary_id
        )

        .first()
    )


    if not word:

        raise HTTPException(

            status_code=404,

            detail=
            "Không tìm thấy từ vựng."
        )


    return {

        "id":
        word.id,

        "ethnic_word":
        word.ethnic_word,

        "pronunciation":
        word.pronunciation,

        "vietnamese_meaning":
        word.vietnamese_meaning,

        "audio":
        word.audio,

        "image":
        word.image,

        "teacher_id":
        word.teacher_id
    }


# =====================================================
# TỪ VỰNG CỦA MỘT GIÁO VIÊN
# =====================================================

@app.get(
    "/api/teachers/{teacher_id}/vocabulary"
)
def get_teacher_vocabulary(

    teacher_id: int,

    db: Session = Depends(get_db)

):

    words = (

        db.query(model.Vocabulary)

        .filter(
            model.Vocabulary.teacher_id
            == teacher_id
        )

        .order_by(
            model.Vocabulary.id.desc()
        )

        .all()
    )


    return [

        {

            "id":
            word.id,

            "ethnic_word":
            word.ethnic_word,

            "pronunciation":
            word.pronunciation,

            "vietnamese_meaning":
            word.vietnamese_meaning,

            "audio":
            word.audio,

            "image":
            word.image,

            "teacher_id":
            word.teacher_id

        }

        for word in words

    ]


# =====================================================
# XÓA TỪ
# =====================================================

@app.delete(
    "/api/vocabulary/{vocabulary_id}"
)
def delete_vocabulary(

    vocabulary_id: int,

    db: Session = Depends(get_db)

):

    word = (

        db.query(model.Vocabulary)

        .filter(
            model.Vocabulary.id
            == vocabulary_id
        )

        .first()
    )


    if not word:

        raise HTTPException(

            status_code=404,

            detail=
            "Không tìm thấy từ vựng."
        )


    db.delete(word)

    db.commit()


    return {

        "message":
        "Đã xóa từ vựng."

    }


@app.get("/login.html")
def login_page():
    return FileResponse(FRONTEND_DIR / "login.html")


@app.get("/register.html")
def register_page():
    return FileResponse(FRONTEND_DIR / "register.html")


@app.get("/teacher.html")
def teacher_page():
    return FileResponse(FRONTEND_DIR / "teacher.html")