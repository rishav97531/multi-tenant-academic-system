
from sqlalchemy import Column, Integer, String, Date, Numeric, ForeignKey, Enum
from database import Base



class Tenant(Base):
    __tablename__ = "tenants"

    tenant_id = Column(Integer, primary_key=True, index=True)
    institution_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    phone = Column(String(20))
    address = Column(String(255))

    status = Column(
        Enum("PENDING", "ACTIVE", "SUSPENDED"),
        nullable=False,
        default="ACTIVE"
    )



class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.tenant_id"), nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(
        Enum("TENANT_ADMIN", "FACULTY", "STUDENT"),
        nullable=False
    )


class Student(Base):
    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.tenant_id"), nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    phone = Column(String(20))
    admission_year = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)
    course_id = Column(
    Integer,
    ForeignKey("courses.course_id"),
    nullable=True
)


class Faculty(Base):
    __tablename__ = "faculty"

    faculty_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.tenant_id"), nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    phone = Column(String(20))
    designation = Column(String(100), nullable=False)


class Department(Base):
    __tablename__ = "departments"

    department_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.tenant_id"), nullable=False)
    department_name = Column(String(100), nullable=False)


class Course(Base):
    __tablename__ = "courses"

    course_id = Column(Integer, primary_key=True, index=True)
    department_id = Column(
        Integer,
        ForeignKey("departments.department_id"),
        nullable=False
    )
    course_name = Column(String(150), nullable=False)
    course_code = Column(String(30), nullable=False)
    credits = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)


class Enrollment(Base):
    __tablename__ = "enrollments"

    enrollment_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(
        Integer,
        ForeignKey("students.student_id"),
        nullable=False
    )
    course_id = Column(
        Integer,
        ForeignKey("courses.course_id"),
        nullable=False
    )
    enrollment_date = Column(Date, nullable=False)
    academic_year = Column(String(20), nullable=False)


class Attendance(Base):
    __tablename__ = "attendance"

    attendance_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(
        Integer,
        ForeignKey("students.student_id"),
        nullable=False
    )
    course_id = Column(
        Integer,
        ForeignKey("courses.course_id"),
        nullable=False
    )
    attendance_date = Column(Date, nullable=False)
    status = Column(
        Enum("Present", "Absent"),
        nullable=False
    )


class Exam(Base):
    __tablename__ = "exams"

    exam_id = Column(Integer, primary_key=True, index=True)
    course_id = Column(
        Integer,
        ForeignKey("courses.course_id"),
        nullable=False
    )
    exam_name = Column(String(100), nullable=False)
    exam_date = Column(Date, nullable=False)
    total_marks = Column(Integer, nullable=False)


class Marks(Base):
    __tablename__ = "marks"

    marks_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(
        Integer,
        ForeignKey("students.student_id"),
        nullable=False
    )
    exam_id = Column(
        Integer,
        ForeignKey("exams.exam_id"),
        nullable=False
    )
    marks_obtained = Column(Numeric(5, 2), nullable=False)








"""from sqlalchemy import Column, Integer, String
from database import Base


class Tenant(Base):
    __tablename__ = "tenants"

    tenant_id = Column(Integer, primary_key=True, index=True)
    institution_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    phone = Column(String(20))
    address = Column(String(255))

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)

class Student(Base):
    __tablename__ = "students"

    student_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    phone = Column(String(20))
    admission_year = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)


class Faculty(Base):
    __tablename__ = "faculty"

    faculty_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    phone = Column(String(20))
    designation = Column(String(100), nullable=False)

class Department(Base):
    __tablename__ = "departments"

    department_id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, nullable=False)
    department_name = Column(String(100), nullable=False)


class Course(Base):
    __tablename__ = "courses"

    course_id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, nullable=False)
    course_name = Column(String(150), nullable=False)
    course_code = Column(String(30), nullable=False)
    credits = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)

class Enrollment(Base):
    __tablename__ = "enrollments"

    enrollment_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False)
    course_id = Column(Integer, nullable=False)
    enrollment_date = Column(String(20), nullable=False)
    academic_year = Column(String(20), nullable=False)


class Attendance(Base):
    __tablename__ = "attendance"

    attendance_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False)
    course_id = Column(Integer, nullable=False)
    attendance_date = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False)

class Exam(Base):
    __tablename__ = "exams"

    exam_id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, nullable=False)
    exam_name = Column(String(100), nullable=False)
    exam_date = Column(String(20), nullable=False)
    total_marks = Column(Integer, nullable=False)


class Marks(Base):
    __tablename__ = "marks"

    marks_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False)
    exam_id = Column(Integer, nullable=False)
    marks_obtained = Column(Integer, nullable=False)"""
