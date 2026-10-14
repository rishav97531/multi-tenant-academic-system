from pydantic import BaseModel, EmailStr
from datetime import date


class TenantCreate(BaseModel):
    institution_name: str
    email: EmailStr
    phone: str | None = None
    address: str | None = None



class TenantResponse(BaseModel):
    tenant_id: int
    institution_name: str
    email: EmailStr
    phone: str | None = None
    address: str | None = None
    status: str

    class Config:
        from_attributes = True



class StudentCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    admission_year: int
    semester: int
    course_id: int | None = None


class StudentResponse(BaseModel):
    student_id: int
    tenant_id: int
    name: str
    email: EmailStr
    phone: str | None = None
    admission_year: int
    semester: int
    course_id: int | None = None

    class Config:
        from_attributes = True

class FacultyCreate(BaseModel):
    tenant_id: int
    name: str
    email: EmailStr
    phone: str | None = None
    designation: str


class FacultyResponse(BaseModel):
    faculty_id: int
    tenant_id: int
    name: str
    email: EmailStr
    phone: str | None = None
    designation: str

    class Config:
        from_attributes = True


class DepartmentCreate(BaseModel):
    department_name: str



class DepartmentResponse(BaseModel):
    department_id: int
    tenant_id: int
    department_name: str

    class Config:
        from_attributes = True


class CourseCreate(BaseModel):
    department_id: int
    course_name: str
    course_code: str
    credits: int
    semester: int


class CourseResponse(BaseModel):
    course_id: int
    department_id: int
    course_name: str
    course_code: str
    credits: int
    semester: int

    class Config:
        from_attributes = True

class EnrollmentCreate(BaseModel):
    student_id: int
    course_id: int
    enrollment_date: str
    academic_year: str


class EnrollmentResponse(BaseModel):
    enrollment_id: int
    student_id: int
    course_id: int
    enrollment_date: str
    academic_year: str

    class Config:
        from_attributes = True

class AttendanceCreate(BaseModel):
    student_id: int
    course_id: int
    attendance_date: date
    status: str


class AttendanceResponse(BaseModel):
    attendance_id: int
    student_id: int
    course_id: int
    attendance_date: date
    status: str

    class Config:
        from_attributes = True

class ExamCreate(BaseModel):
    course_id: int
    exam_name: str
    exam_date: str
    total_marks: int


class ExamResponse(BaseModel):
    exam_id: int
    course_id: int
    exam_name: str
    exam_date: str
    total_marks: int

    class Config:
        from_attributes = True

class MarksCreate(BaseModel):
    student_id: int
    exam_id: int
    marks_obtained: float


class MarksResponse(BaseModel):
    marks_id: int
    student_id: int
    exam_id: int
    marks_obtained: float

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    tenant_id: int
    name: str
    email: EmailStr
    password: str
    role: str


class UserResponse(BaseModel):
    user_id: int
    tenant_id: int
    name: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str