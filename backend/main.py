import os
from datetime import datetime, timedelta, timezone

from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from passlib.exc import UnknownHashError

from database import engine, SessionLocal
from models import Tenant, Student, Faculty, Department, Course,Enrollment, Attendance,Exam,Marks,User
from schemas import (
    TenantCreate,
    TenantResponse,
    StudentCreate,
    StudentResponse,
    FacultyCreate,
    FacultyResponse,
    DepartmentCreate,
    DepartmentResponse,
    CourseCreate,
    CourseResponse,
    EnrollmentCreate,
    EnrollmentResponse,
    AttendanceResponse,
    AttendanceCreate,
    ExamCreate,
    ExamResponse,
    MarksCreate,
    MarksResponse,
    UserCreate,
    UserResponse,
    LoginRequest
)

load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY is missing from the environment or .env file")

JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)

security = HTTPBearer()

def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)




def get_password_hash(password):
    return pwd_context.hash(password)


def verify_password(plain_password, hashed_password):
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except UnknownHashError:
        return False


app = FastAPI(
    title="Academic Management System",
    description="Multi-Tenant Academic Management System API",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5176"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Get the authenticated user from the JWT


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        user_id = payload.get("user_id")
        tenant_id = payload.get("tenant_id")
        role = payload.get("role")

        if user_id is None or tenant_id is None or role is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        return {
            "user_id": user_id,
            "tenant_id": tenant_id,
            "role": role
        }

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


"""@app.get("/")
def home():
    return {
        "message": "Academic Management System API is running 🚀"
    }"""
@app.get("/")
def root(
    current_user: dict = Depends(get_current_user)
):
    return {
        "message": "Academic Management System API",
        "user_id": current_user["user_id"],
        "tenant_id": current_user["tenant_id"],
        "role": current_user["role"]
    }


@app.get("/test-db")
def test_db():
    try:
        with engine.connect():
            return {
                "status": "success",
                "message": "MySQL database connected successfully 🚀"
            }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }


"""@app.get("/api/tenants", response_model=list[TenantResponse])
def get_tenants(db: Session = Depends(get_db)):
    tenants = db.query(Tenant).all()                                This currently returns all institutions to anyone who can call the endpoint. ❌

    return tenants"""
@app.get("/api/tenants", response_model=TenantResponse)
def get_tenant(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    tenant = db.query(Tenant).filter(
        Tenant.tenant_id == current_user["tenant_id"]
    ).first()

    if not tenant:
        raise HTTPException(
            status_code=404,
            detail="Tenant not found"
        )

    return tenant



@app.post("/api/tenants", response_model=TenantResponse)
def create_tenant(
    tenant: TenantCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "SUPER_ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Only super administrators can create institutions"
        )

    new_tenant = Tenant(
        institution_name=tenant.institution_name,
        email=tenant.email,
        phone=tenant.phone,
        address=tenant.address
    )

    db.add(new_tenant)
    db.commit()
    db.refresh(new_tenant)

    return new_tenant



@app.post("/api/students", response_model=StudentResponse)
def create_student(
    student: StudentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    new_student = Student(
        tenant_id=current_user["tenant_id"],
        name=student.name,
        email=student.email,
        phone=student.phone,
        admission_year=student.admission_year,
        semester=student.semester
    )

    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    return new_student


"""@app.get("/api/students", response_model=list[StudentResponse])
def get_students(db: Session = Depends(get_db)):
    students = db.query(Student).all()

    return students"""
@app.get("/api/students", response_model=list[StudentResponse])
def get_students(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Student).filter(
        Student.tenant_id == current_user["tenant_id"]
    ).all()


@app.put("/api/students/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: int,
    student: StudentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    existing_student = db.query(Student).filter(
        Student.student_id == student_id,
        Student.tenant_id == current_user["tenant_id"]
    ).first()

    if not existing_student:
        raise HTTPException(
            status_code=404,
            detail="Student not found in your institution"
        )

    existing_student.name = student.name
    existing_student.email = student.email
    existing_student.phone = student.phone
    existing_student.admission_year = student.admission_year
    existing_student.semester = student.semester

    db.commit()
    db.refresh(existing_student)

    return existing_student



@app.delete("/api/students/{student_id}")
def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    existing_student = db.query(Student).filter(
        Student.student_id == student_id,
        Student.tenant_id == current_user["tenant_id"]
    ).first()

    if not existing_student:
        raise HTTPException(
            status_code=404,
            detail="Student not found in your institution"
        )

    db.delete(existing_student)
    db.commit()

    return {
        "message": "Student deleted successfully",
        "student_id": student_id
    }



"""@app.post("/api/faculty", response_model=FacultyResponse)
def create_faculty(
    faculty: FacultyCreate,
    db: Session = Depends(get_db)
):
    new_faculty = Faculty(
        tenant_id=faculty.tenant_id,
        name=faculty.name,
        email=faculty.email,
        phone=faculty.phone,
        designation=faculty.designation
    )

    db.add(new_faculty)
    db.commit()
    db.refresh(new_faculty)

    return new_faculty"""

@app.post("/api/faculty", response_model=FacultyResponse)
def create_faculty(
    faculty: FacultyCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    new_faculty = Faculty(
        tenant_id=current_user["tenant_id"],
        name=faculty.name,
        email=faculty.email,
        phone=faculty.phone,
        designation=faculty.designation
    )

    db.add(new_faculty)
    db.commit()
    db.refresh(new_faculty)

    return new_faculty

@app.put("/api/faculty/{faculty_id}", response_model=FacultyResponse)
def update_faculty(
    faculty_id: int,
    faculty: FacultyCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    existing_faculty = db.query(Faculty).filter(
        Faculty.faculty_id == faculty_id,
        Faculty.tenant_id == current_user["tenant_id"]
    ).first()

    if not existing_faculty:
        raise HTTPException(
            status_code=404,
            detail="Faculty not found in your institution"
        )

    existing_faculty.name = faculty.name
    existing_faculty.email = faculty.email
    existing_faculty.phone = faculty.phone
    existing_faculty.designation = faculty.designation

    db.commit()
    db.refresh(existing_faculty)

    return existing_faculty

@app.delete("/api/faculty/{faculty_id}")
def delete_faculty(
    faculty_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    faculty = db.query(Faculty).filter(
        Faculty.faculty_id == faculty_id,
        Faculty.tenant_id == current_user["tenant_id"]
    ).first()

    if not faculty:
        raise HTTPException(
            status_code=404,
            detail="Faculty not found in your institution"
        )

    db.delete(faculty)
    db.commit()

    return {
        "message": "Faculty deleted successfully",
        "faculty_id": faculty_id
    }




"""@app.get("/api/faculty", response_model=list[FacultyResponse])
def get_faculty(db: Session = Depends(get_db)):
    faculty = db.query(Faculty).all()

    return faculty"""
@app.get("/api/faculty", response_model=list[FacultyResponse])
def get_faculty(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Faculty).filter(
        Faculty.tenant_id == current_user["tenant_id"]
    ).all()


@app.post("/api/departments", response_model=DepartmentResponse)
def create_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    new_department = Department(
        tenant_id=current_user["tenant_id"],
        department_name=department.department_name
    )

    db.add(new_department)
    db.commit()
    db.refresh(new_department)

    return new_department

@app.put("/api/departments/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: int,
    department: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    existing_department = db.query(Department).filter(
        Department.department_id == department_id,
        Department.tenant_id == current_user["tenant_id"]
    ).first()

    if not existing_department:
        raise HTTPException(
            status_code=404,
            detail="Department not found in your institution"
        )

    existing_department.department_name = department.department_name

    db.commit()
    db.refresh(existing_department)

    return existing_department


@app.delete("/api/departments/{department_id}")
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    department = db.query(Department).filter(
        Department.department_id == department_id,
        Department.tenant_id == current_user["tenant_id"]
    ).first()

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found in your institution"
        )

    db.delete(department)
    db.commit()

    return {
        "message": "Department deleted successfully",
        "department_id": department_id
    }




"""@app.get("/api/departments", response_model=list[DepartmentResponse])
def get_departments(db: Session = Depends(get_db)):
    departments = db.query(Department).all()

    return departments"""
@app.get("/api/departments", response_model=list[DepartmentResponse])
def get_departments(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Department).filter(
        Department.tenant_id == current_user["tenant_id"]
    ).all()


@app.post("/api/courses", response_model=CourseResponse)
def create_course(
    course: CourseCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    department = db.query(Department).filter(
        Department.department_id == course.department_id,
        Department.tenant_id == current_user["tenant_id"]
    ).first()

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found in your institution"
        )

    new_course = Course(
        department_id=course.department_id,
        course_name=course.course_name,
        course_code=course.course_code,
        credits=course.credits,
        semester=course.semester
    )

    db.add(new_course)
    db.commit()
    db.refresh(new_course)

    return new_course

@app.put("/api/courses/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: int,
    course: CourseCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    existing_course = db.query(Course).join(
        Department,
        Course.department_id == Department.department_id
    ).filter(
        Course.course_id == course_id,
        Department.tenant_id == current_user["tenant_id"]
    ).first()

    if not existing_course:
        raise HTTPException(
            status_code=404,
            detail="Course not found in your institution"
        )

    department = db.query(Department).filter(
        Department.department_id == course.department_id,
        Department.tenant_id == current_user["tenant_id"]
    ).first()

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found in your institution"
        )

    existing_course.department_id = course.department_id
    existing_course.course_name = course.course_name
    existing_course.course_code = course.course_code
    existing_course.credits = course.credits
    existing_course.semester = course.semester

    db.commit()
    db.refresh(existing_course)

    return existing_course


@app.delete("/api/courses/{course_id}")
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    course = db.query(Course).join(
        Department,
        Course.department_id == Department.department_id
    ).filter(
        Course.course_id == course_id,
        Department.tenant_id == current_user["tenant_id"]
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found in your institution"
        )

    db.delete(course)
    db.commit()

    return {
        "message": "Course deleted successfully",
        "course_id": course_id
    }




"""@app.get("/api/courses", response_model=list[CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).all()

    return courses"""
@app.get("/api/courses", response_model=list[CourseResponse])
def get_courses(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Course).join(
        Department,
        Course.department_id == Department.department_id
    ).filter(
        Department.tenant_id == current_user["tenant_id"]
    ).all()


@app.post("/api/enrollments", response_model=EnrollmentResponse)
def create_enrollment(
    enrollment: EnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    student = db.query(Student).filter(
        Student.student_id == enrollment.student_id,
        Student.tenant_id == current_user["tenant_id"]
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found in your institution"
        )

    course = db.query(Course).join(
        Department,
        Course.department_id == Department.department_id
    ).filter(
        Course.course_id == enrollment.course_id,
        Department.tenant_id == current_user["tenant_id"]
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found in your institution"
        )

    new_enrollment = Enrollment(
        student_id=enrollment.student_id,
        course_id=enrollment.course_id,
        enrollment_date=enrollment.enrollment_date,
        academic_year=enrollment.academic_year
    )

    db.add(new_enrollment)
    db.commit()
    db.refresh(new_enrollment)

    return new_enrollment

@app.put("/api/enrollments/{enrollment_id}", response_model=EnrollmentResponse)
def update_enrollment(
    enrollment_id: int,
    enrollment: EnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    existing_enrollment = db.query(Enrollment).join(
        Student,
        Enrollment.student_id == Student.student_id
    ).filter(
        Enrollment.enrollment_id == enrollment_id,
        Student.tenant_id == current_user["tenant_id"]
    ).first()

    if not existing_enrollment:
        raise HTTPException(
            status_code=404,
            detail="Enrollment not found in your institution"
        )

    student = db.query(Student).filter(
        Student.student_id == enrollment.student_id,
        Student.tenant_id == current_user["tenant_id"]
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found in your institution"
        )

    course = db.query(Course).join(
        Department,
        Course.department_id == Department.department_id
    ).filter(
        Course.course_id == enrollment.course_id,
        Department.tenant_id == current_user["tenant_id"]
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found in your institution"
        )

    existing_enrollment.student_id = enrollment.student_id
    existing_enrollment.course_id = enrollment.course_id
    existing_enrollment.enrollment_date = enrollment.enrollment_date
    existing_enrollment.academic_year = enrollment.academic_year

    db.commit()
    db.refresh(existing_enrollment)

    return existing_enrollment


@app.delete("/api/enrollments/{enrollment_id}")
def delete_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    enrollment = db.query(Enrollment).join(
        Student,
        Enrollment.student_id == Student.student_id
    ).filter(
        Enrollment.enrollment_id == enrollment_id,
        Student.tenant_id == current_user["tenant_id"]
    ).first()

    if not enrollment:
        raise HTTPException(
            status_code=404,
            detail="Enrollment not found in your institution"
        )

    db.delete(enrollment)
    db.commit()

    return {
        "message": "Enrollment deleted successfully",
        "enrollment_id": enrollment_id
    }




"""@app.get("/api/enrollments", response_model=list[EnrollmentResponse])
def get_enrollments(db: Session = Depends(get_db)):
    enrollments = db.query(Enrollment).all()

    return enrollments"""
@app.get("/api/enrollments", response_model=list[EnrollmentResponse])
def get_enrollments(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Enrollment).join(
        Student,
        Enrollment.student_id == Student.student_id
    ).filter(
        Student.tenant_id == current_user["tenant_id"]
    ).all()


@app.post("/api/attendance", response_model=AttendanceResponse)
def create_attendance(
    attendance: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    student = db.query(Student).filter(
        Student.student_id == attendance.student_id,
        Student.tenant_id == current_user["tenant_id"]
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found in your institution"
        )

    course = db.query(Course).join(
        Department,
        Course.department_id == Department.department_id
    ).filter(
        Course.course_id == attendance.course_id,
        Department.tenant_id == current_user["tenant_id"]
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found in your institution"
        )

    new_attendance = Attendance(
        student_id=attendance.student_id,
        course_id=attendance.course_id,
        attendance_date=attendance.attendance_date,
        status=attendance.status
    )

    db.add(new_attendance)
    db.commit()
    db.refresh(new_attendance)

    return new_attendance

@app.put("/api/attendance/{attendance_id}", response_model=AttendanceResponse)
def update_attendance(
    attendance_id: int,
    attendance: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    existing_attendance = db.query(Attendance).join(
        Student,
        Attendance.student_id == Student.student_id
    ).filter(
        Attendance.attendance_id == attendance_id,
        Student.tenant_id == current_user["tenant_id"]
    ).first()

    if not existing_attendance:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found in your institution"
        )

    student = db.query(Student).filter(
        Student.student_id == attendance.student_id,
        Student.tenant_id == current_user["tenant_id"]
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found in your institution"
        )

    course = db.query(Course).join(
        Department,
        Course.department_id == Department.department_id
    ).filter(
        Course.course_id == attendance.course_id,
        Department.tenant_id == current_user["tenant_id"]
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found in your institution"
        )

    existing_attendance.student_id = attendance.student_id
    existing_attendance.course_id = attendance.course_id
    existing_attendance.attendance_date = attendance.attendance_date
    existing_attendance.status = attendance.status

    db.commit()
    db.refresh(existing_attendance)

    return existing_attendance


@app.delete("/api/attendance/{attendance_id}")
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    attendance = db.query(Attendance).join(
        Student,
        Attendance.student_id == Student.student_id
    ).filter(
        Attendance.attendance_id == attendance_id,
        Student.tenant_id == current_user["tenant_id"]
    ).first()

    if not attendance:
        raise HTTPException(
            status_code=404,
            detail="Attendance record not found in your institution"
        )

    db.delete(attendance)
    db.commit()

    return {
        "message": "Attendance deleted successfully",
        "attendance_id": attendance_id
    }




"""@app.get("/api/attendance", response_model=list[AttendanceResponse])
def get_attendance(db: Session = Depends(get_db)):
    attendance = db.query(Attendance).all()

    return attendance"""
@app.get("/api/attendance", response_model=list[AttendanceResponse])
def get_attendance(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Attendance).join(
        Student,
        Attendance.student_id == Student.student_id
    ).filter(
        Student.tenant_id == current_user["tenant_id"]
    ).all()


@app.post("/api/exams", response_model=ExamResponse)
def create_exam(
    exam: ExamCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    course = db.query(Course).join(
        Department,
        Course.department_id == Department.department_id
    ).filter(
        Course.course_id == exam.course_id,
        Department.tenant_id == current_user["tenant_id"]
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found in your institution"
        )

    new_exam = Exam(
        course_id=exam.course_id,
        exam_name=exam.exam_name,
        exam_date=exam.exam_date,
        total_marks=exam.total_marks
    )

    db.add(new_exam)
    db.commit()
    db.refresh(new_exam)

    return new_exam


@app.put("/api/exams/{exam_id}", response_model=ExamResponse)
def update_exam(
    exam_id: int,
    exam: ExamCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    existing_exam = db.query(Exam).join(
        Course,
        Exam.course_id == Course.course_id
    ).join(
        Department,
        Course.department_id == Department.department_id
    ).filter(
        Exam.exam_id == exam_id,
        Department.tenant_id == current_user["tenant_id"]
    ).first()

    if not existing_exam:
        raise HTTPException(
            status_code=404,
            detail="Exam not found in your institution"
        )

    course = db.query(Course).join(
        Department,
        Course.department_id == Department.department_id
    ).filter(
        Course.course_id == exam.course_id,
        Department.tenant_id == current_user["tenant_id"]
    ).first()

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found in your institution"
        )

    existing_exam.course_id = exam.course_id
    existing_exam.exam_name = exam.exam_name
    existing_exam.exam_date = exam.exam_date
    existing_exam.total_marks = exam.total_marks

    db.commit()
    db.refresh(existing_exam)

    return existing_exam


@app.delete("/api/exams/{exam_id}")
def delete_exam(
    exam_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    exam = db.query(Exam).join(
        Course,
        Exam.course_id == Course.course_id
    ).join(
        Department,
        Course.department_id == Department.department_id
    ).filter(
        Exam.exam_id == exam_id,
        Department.tenant_id == current_user["tenant_id"]
    ).first()

    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Exam not found in your institution"
        )

    db.delete(exam)
    db.commit()

    return {
        "message": "Exam deleted successfully",
        "exam_id": exam_id
    }



"""@app.get("/api/exams", response_model=list[ExamResponse])
def get_exams(db: Session = Depends(get_db)):
    exams = db.query(Exam).all()

    return exams"""
@app.get("/api/exams", response_model=list[ExamResponse])
def get_exams(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Exam).join(
        Course,
        Exam.course_id == Course.course_id
    ).join(
        Department,
        Course.department_id == Department.department_id
    ).filter(
        Department.tenant_id == current_user["tenant_id"]
    ).all()


@app.post("/api/marks", response_model=MarksResponse)
def create_marks(
    marks: MarksCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    student = db.query(Student).filter(
        Student.student_id == marks.student_id,
        Student.tenant_id == current_user["tenant_id"]
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found in your institution"
        )

    exam = db.query(Exam).join(
        Course,
        Exam.course_id == Course.course_id
    ).join(
        Department,
        Course.department_id == Department.department_id
    ).filter(
        Exam.exam_id == marks.exam_id,
        Department.tenant_id == current_user["tenant_id"]
    ).first()

    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Exam not found in your institution"
        )

    new_marks = Marks(
        student_id=marks.student_id,
        exam_id=marks.exam_id,
        marks_obtained=marks.marks_obtained
    )

    db.add(new_marks)
    db.commit()
    db.refresh(new_marks)

    return new_marks


@app.put("/api/marks/{marks_id}", response_model=MarksResponse)
def update_marks(
    marks_id: int,
    marks: MarksCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    existing_marks = db.query(Marks).join(
        Student,
        Marks.student_id == Student.student_id
    ).filter(
        Marks.marks_id == marks_id,
        Student.tenant_id == current_user["tenant_id"]
    ).first()

    if not existing_marks:
        raise HTTPException(
            status_code=404,
            detail="Marks record not found in your institution"
        )

    student = db.query(Student).filter(
        Student.student_id == marks.student_id,
        Student.tenant_id == current_user["tenant_id"]
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found in your institution"
        )

    exam = db.query(Exam).join(
        Course,
        Exam.course_id == Course.course_id
    ).join(
        Department,
        Course.department_id == Department.department_id
    ).filter(
        Exam.exam_id == marks.exam_id,
        Department.tenant_id == current_user["tenant_id"]
    ).first()

    if not exam:
        raise HTTPException(
            status_code=404,
            detail="Exam not found in your institution"
        )

    if marks.marks_obtained < 0 or marks.marks_obtained > exam.total_marks:
        raise HTTPException(
            status_code=400,
            detail=f"Marks must be between 0 and {exam.total_marks}"
        )

    existing_marks.student_id = marks.student_id
    existing_marks.exam_id = marks.exam_id
    existing_marks.marks_obtained = marks.marks_obtained

    db.commit()
    db.refresh(existing_marks)

    return existing_marks



@app.delete("/api/marks/{marks_id}")
def delete_marks(
    marks_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    marks = db.query(Marks).join(
        Student,
        Marks.student_id == Student.student_id
    ).filter(
        Marks.marks_id == marks_id,
        Student.tenant_id == current_user["tenant_id"]
    ).first()

    if not marks:
        raise HTTPException(
            status_code=404,
            detail="Marks record not found in your institution"
        )

    db.delete(marks)
    db.commit()

    return {
        "message": "Marks deleted successfully",
        "marks_id": marks_id
    }




"""@app.get("/api/marks", response_model=list[MarksResponse])
def get_marks(db: Session = Depends(get_db)):
    marks = db.query(Marks).all()

    return marks"""
@app.get("/api/marks", response_model=list[MarksResponse])
def get_marks(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return db.query(Marks).join(
        Student,
        Marks.student_id == Student.student_id
    ).filter(
        Student.tenant_id == current_user["tenant_id"]
    ).all()


@app.post("/api/users", response_model=UserResponse)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "TENANT_ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Only tenant administrators can create users"
        )

    new_user = User(
        tenant_id=current_user["tenant_id"],
        name=user.name,
        email=user.email,
        password=pwd_context.hash(user.password),
        role=user.role
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@app.put("/api/users/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "TENANT_ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Only tenant administrators can update users"
        )

    existing_user = db.query(User).filter(
        User.user_id == user_id,
        User.tenant_id == current_user["tenant_id"]
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=404,
            detail="User not found in your institution"
        )

    existing_user.name = user.name
    existing_user.email = user.email
    existing_user.role = user.role

    # Update the password only if a new password is supplied
    if user.password:
        existing_user.password = pwd_context.hash(user.password)

    db.commit()
    db.refresh(existing_user)

    return existing_user


@app.delete("/api/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "TENANT_ADMIN":
        raise HTTPException(
            status_code=403,
            detail="Only tenant administrators can delete users"
        )

    if user_id == current_user["user_id"]:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own account"
        )

    user = db.query(User).filter(
        User.user_id == user_id,
        User.tenant_id == current_user["tenant_id"]
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found in your institution"
        )

    db.delete(user)
    db.commit()

    return {
        "message": "User deleted successfully",
        "user_id": user_id
    }




@app.get("/api/users", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()

    return users


@app.post("/api/login")
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == login_data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        login_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Check whether the user's college exists and is active
    tenant = db.query(Tenant).filter(
        Tenant.tenant_id == user.tenant_id
    ).first()

    if not tenant or tenant.status != "ACTIVE":
        raise HTTPException(
            status_code=403,
            detail="Your institution is not active. Please contact the platform administrator."
        )

    access_token = create_access_token({
        "user_id": user.user_id,
        "tenant_id": user.tenant_id,
        "role": user.role
    })

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.user_id,
        "tenant_id": user.tenant_id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }

"""@app.post("/api/login")
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == login_data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        login_data.password,
        user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "user_id": user.user_id,
        "tenant_id": user.tenant_id,
        "name": user.name,
        "email": user.email,
        "role": user.role
    }"""

"""from fastapi import FastAPI
from database import engine

app = FastAPI(
    title="Academic Management System",
    description="Multi-Tenant Academic Management System API",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "message": "Academic Management System API is running 🚀"
    }


@app.get("/test-db")
def test_db():
    try:
        with engine.connect() as connection:
            return {
                "status": "success",
                "message": "MySQL database connected successfully 🚀"
            }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }
    """





"""from fastapi import FastAPI

app = FastAPI(
    title="Academic Management System",
    description="Multi-Tenant Academic Management System API",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "message": "Academic Management System API is running 🚀"
    } """
