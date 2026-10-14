from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


# =====================================================
# GIÁO VIÊN
# =====================================================

class Teacher(Base):

    __tablename__ = "teachers"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String,
        nullable=False
    )

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    password = Column(
        String,
        nullable=False
    )

    school = Column(
        String,
        nullable=True
    )


# =====================================================
# TỪ VỰNG
# =====================================================

class Vocabulary(Base):

    __tablename__ = "vocabulary"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # Chữ dân tộc
    ethnic_word = Column(
        String,
        nullable=False
    )

    # Phiên âm
    pronunciation = Column(
        String,
        nullable=False
    )

    # Nghĩa tiếng Kinh
    vietnamese_meaning = Column(
        String,
        nullable=False
    )

    # Đường dẫn file âm thanh
    audio = Column(
        String,
        nullable=True
    )

    # Đường dẫn hình ảnh
    image = Column(
        String,
        nullable=True
    )

    # Giáo viên đăng từ này
    teacher_id = Column(
        Integer,
        ForeignKey("teachers.id"),
        nullable=False
    )