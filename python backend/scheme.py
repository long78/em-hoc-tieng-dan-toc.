from pydantic import BaseModel


# =====================================================
# ĐĂNG KÝ GIÁO VIÊN
# =====================================================

class TeacherRegister(BaseModel):

    name: str
    email: str
    password: str
    school: str | None = None


# =====================================================
# ĐĂNG NHẬP
# =====================================================

class TeacherLogin(BaseModel):

    email: str
    password: str


# =====================================================
# TRẢ VỀ TỪ VỰNG
# =====================================================

class VocabularyResponse(BaseModel):

    id: int

    ethnic_word: str

    pronunciation: str

    vietnamese_meaning: str

    audio: str | None = None

    image: str | None = None

    teacher_id: int