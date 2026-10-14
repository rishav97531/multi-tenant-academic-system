

import { useEffect, useMemo, useState } from 'react'




const navigation = [
  { name: 'Dashboard', icon: 'layout-dashboard' },
  { name: 'Students', icon: 'users' },
  { name: 'Faculty', icon: 'graduation-cap' },
  { name: 'Courses', icon: 'book-open' },
  { name: 'Departments', icon: 'building-2' },
  { name: 'Attendance', icon: 'calendar-check' },
  { name: 'Examinations', icon: 'clipboard-check' },
]



const stats = [
  {
    label: 'Total Students',
    value: 'students',
    note: 'Students registered in your college',
    icon: 'users',
    color: 'blue',
  },
  {
    label: 'Faculty Members',
    value: '—',
    note: 'Faculty records',
    icon: 'graduation-cap',
    color: 'violet',
  },
  {
    label: 'Courses',
    value: '—',
    note: 'Available courses',
    icon: 'book-open',
    color: 'amber',
  },
  {
    label: 'Attendance Rate',
    value: '—',
    note: 'Overall attendance',
    icon: 'calendar-check',
    color: 'emerald',
  },
]

const icons = {
  'layout-dashboard': <><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  'graduation-cap': <><path d="m22 10-10-5-10 5 10 5 10-5Z" /><path d="M6 12v5c4 3 8 3 12 0v-5M22 10v6" /></>,
  'book-open': <><path d="M12 7v14" /><path d="M3 18V5a1 1 0 0 1 1-1h4a4 4 0 0 1 4 4 4 4 0 0 1 4-4h4a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-5a3 3 0 0 0-3 2 3 3 0 0 0-3-2H4a1 1 0 0 1-1-1Z" /></>,
  'calendar-check': <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18m-13 5 2 2 4-4" /></>,
  'clipboard-check': <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1M9 13l2 2 4-4" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  close: <path d="m18 6-12 12M6 6l12 12" />,
  menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
  arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
  database: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5M3 12c0 1.7 4 3 9 3s9-1.3 9-3" /></>,
}

function Icon({ name, size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {icons[name] || icons.database}
    </svg>
  )
}

const API_BASE_URL = 'http://127.0.0.1:8000'

async function fetchStudents(token) {
  const response = await fetch(`${API_BASE_URL}/api/students`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },




  })

  if (!response.ok) {
    throw new Error(`Could not load students (${response.status})`)
  }

  return response.json()
}


async function fetchFaculty(token) {
  const response = await fetch('http://127.0.0.1:8000/api/faculty', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Could not load faculty (${response.status})`)
  }

  return response.json()
}


async function fetchCourses(token) {
  console.log('Courses token:', token)
  const response = await fetch('http://127.0.0.1:8000/api/courses', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Could not load courses (${response.status})`)
  }

  return response.json()
}

async function fetchDepartments(token) {
  const response = await fetch('http://127.0.0.1:8000/api/departments', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to load departments')
  }

  return response.json()
}



function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePage, setActivePage] = useState('Dashboard')
  const [accessToken, setAccessToken] = useState(
  localStorage.getItem('access_token') || ''
)



useEffect(() => {
  if (!accessToken) return

  fetchDepartments(accessToken)
    .then((data) => {
      console.log('Departments API data:', data)
      setDepartments(data)
    })
    .catch((error) => {
      console.error('Load departments error:', error)
    })
}, [accessToken])


const handleLogout = () => {
  localStorage.removeItem('access_token')
  setAccessToken('')
  setActivePage('Dashboard')
}

const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [search, setSearch] = useState('')
  const [students, setStudents] = useState([])
  const [faculty, setFaculty] = useState([])
  const [departments, setDepartments] = useState([])

const [courses, setCourses] = useState([])
const [attendance, setAttendance] = useState([])
const [courseForm, setCourseForm] = useState({
  department_id: '',
  course_name: '',
  course_code: '',
  credits: '3',
  semester: '1',
})

  useEffect(() => {
  if (!accessToken) return

  fetchStudents(accessToken)
    .then((data) => {
      setStudents(
        data.map((student) => ({
          ...student,
          id: student.student_id,
          status: 'Active',
        }))
      )
    })
    .catch((error) => {
      console.error('Load students error:', error)
    })
}, [accessToken])




useEffect(() => {
  if (!accessToken) return

  fetchFaculty(accessToken)
    .then((data) => {

      console.log('Faculty API data:', data)
      setFaculty(
        data.map((member) => ({
          ...member,
          id: member.faculty_id,
          status: 'Active',
        }))
      )
    })
    .catch((error) => {
      console.error('Load faculty error:', error)
    })
}, [accessToken])


useEffect(() => {
  if (!accessToken) return

  fetchCourses(accessToken)
    .then((data) => {
      console.log('Courses API data:', data)
      setCourses(data)
    })
    .catch((error) => console.error('Load courses error:', error))
}, [accessToken])



async function fetchAttendance(token) {
  const response = await fetch('http://127.0.0.1:8000/api/attendance', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to load attendance')
  }

  return response.json()
}

async function addAttendance(event) {
  event.preventDefault()

  const token = localStorage.getItem('access_token')
  const formData = new FormData(event.currentTarget)

  const payload = {
    student_id: Number(formData.get('student_id')),
    course_id: Number(formData.get('course_id')),
    attendance_date: formData.get('attendance_date'),
    status: formData.get('status'),
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/api/attendance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(JSON.stringify(errorData))
    }

    const savedRecord = await response.json()

    setAttendance((previous) => [...previous, savedRecord])
    setShowForm(false)
    alert('Attendance saved successfully!')
  } catch (error) {
    console.error('Save attendance error:', error)
    alert(`Could not save attendance: ${error.message}`)
  }
}



  const [showForm, setShowForm] = useState(false)


useEffect(() => {
  if (!accessToken) return

  fetchAttendance(accessToken)
    .then((data) => {
      console.log('Attendance API data:', data)
      setAttendance(data)
    })
    .catch((error) => {
      console.error('Load attendance error:', error)
    })
}, [accessToken])




const [facultyForm, setFacultyForm] = useState({
  name: '',
  email: '',
  phone: '',
  designation: '',
})

  const [form, setForm] = useState({
  name: '',
  email: '',
  phone: '',
  admission_year: String(new Date().getFullYear()),
  semester: '1',
  course_id: '',
})

  const filteredStudents = useMemo(() => {
    return students.filter((student) =>
      `${student.name} ${student.email} ${student.course}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  }, [students, search])

const filteredFaculty = useMemo(() => {
  return faculty.filter((member) =>
    `${member.name} ${member.email} ${member.designation} ${member.phone || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )
}, [faculty, search])


async function handleLogin(event) {
  event.preventDefault()

  try {
    const response = await fetch('http://127.0.0.1:8000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginForm),
    })

    const data = await response.json()
    console.log('Login response status:', response.status)
console.log('Login response data:', data)
    if (!response.ok) {
      throw new Error(
        typeof data.detail === 'string'
          ? data.detail
          : JSON.stringify(data.detail || 'Login failed')
      )
    }

    localStorage.setItem('access_token', data.access_token)
    setAccessToken(data.access_token)
  } catch (error) {
    alert(`Login failed: ${error.message}`)
  }
}



async function addStudent(event) {
  event.preventDefault()

  try {
    const response = await fetch('http://127.0.0.1:8000/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        // We'll add your login token here if your API requires it.
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        admission_year: Number(form.admission_year),
        semester: Number(form.semester),
        course_id: form.course_id ? Number(form.course_id) : null,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        errorData.detail
          ? JSON.stringify(errorData.detail)
          : 'Failed to add student'
      )
    }

    const savedStudent = await response.json()

    setStudents((previous) => [
      ...previous,
      {
        ...savedStudent,
        id: savedStudent.student_id,
        status: 'Active',
      },
    ])

    setForm({
      name: '',
      email: '',
      phone: '',
      admission_year: String(new Date().getFullYear()),
      semester: '1',
      course_id: '',
    })

    setShowForm(false)
    setActivePage('Students')
    alert('Student saved successfully!')

  } catch (error) {
    console.error('Add student error:', error)
    alert(`Could not save student: ${error.message}`)
  }
}


async function addCourse(event) {
  event.preventDefault()

  try {
    const response = await fetch('http://127.0.0.1:8000/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify({
        department_id: Number(courseForm.department_id),
        course_name: courseForm.course_name,
        course_code: courseForm.course_code,
        credits: Number(courseForm.credits),
        semester: Number(courseForm.semester),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(
        errorData.detail
          ? JSON.stringify(errorData.detail)
          : 'Failed to add course'
      )
    }

    const savedCourse = await response.json()

    setCourses((previous) => [...previous, savedCourse])

    setCourseForm({
      department_id: '',
      course_name: '',
      course_code: '',
      credits: '3',
      semester: '1',
    })

    setShowForm(false)
    setActivePage('Courses')
    alert('Course saved successfully!')
  } catch (error) {
    console.error('Add course error:', error)
    alert(`Could not save course: ${error.message}`)
  }
}



  const isDashboard = activePage === 'Dashboard'
  console.log('Current activePage:', activePage)
  if (!accessToken) {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white">
      {/* Left: Login form */}
      <div className="flex items-center justify-center px-8 py-12 sm:px-14">
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-2xl text-white">
              🎓
            </div>
            <span className="text-3xl font-extrabold text-slate-900">
              Acadex<span className="text-blue-600">.</span>
            </span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Welcome back
          </h1>
          <p className="mt-3 mb-8 text-slate-500">
            Sign in to your academic workspace
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email address
              </label>
              <input
                type="email"
                required
                autoComplete="username"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm({ ...loginForm, email: event.target.value })
                }
                placeholder="you@college.edu"
                className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm({ ...loginForm, password: event.target.value })
                }
                placeholder="Enter your password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 py-4 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
            >
              Sign in to Acadex →
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4 text-xs font-semibold tracking-widest text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            SECURE INSTITUTION ACCESS
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="mt-10 text-center text-sm text-slate-400">
            Multi-Tenant Academic Management System
          </p>
        </div>
      </div>

      {/* Right: Academic technology illustration */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 p-12 text-white md:flex md:flex-col md:items-center md:justify-center">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative z-10 max-w-lg">
          <span className="rounded-full border border-blue-300/30 bg-white/10 px-4 py-2 text-sm text-blue-200">
            YOUR CAMPUS. ONE WORKSPACE.
          </span>

          <h2 className="mt-8 text-4xl font-bold leading-tight">
            Smarter management.
            <span className="block text-cyan-300">Better learning.</span>
          </h2>

          <p className="mt-4 leading-7 text-blue-100/80">
            Manage student records, faculty, courses and attendance through
            one connected academic platform.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              ['01', 'Student records', 'Organized academic data'],
              ['02', 'Faculty & courses', 'Connected departments'],
              ['03', 'Attendance', 'Clear academic tracking'],
              ['04', 'Secure access', 'Tenant-aware workspace'],
            ].map(([number, title, description]) => (
              <div
                key={number}
                className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-sm"
              >
                <span className="text-sm font-bold text-cyan-300">
                  {number}
                </span>
                <h3 className="mt-3 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-blue-100/65">
                  {description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3 text-sm text-blue-200/70">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Academic management, connected.
          </div>
        </div>
      </div>
    </div>
  )
}

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white transition-transform duration-200 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-200`}
      >
        <div className="flex h-[76px] items-center gap-3 border-b border-slate-100 px-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <Icon name="graduation-cap" size={23} />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900">
              Acadex<span className="text-blue-600">.</span>
            </h1>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Academic portal
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto rounded-lg p-1 text-slate-400 md:hidden"
            aria-label="Close navigation"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const active = activePage === item.name
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setActivePage(item.name)
                    setSidebarOpen(false)
                  }}
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                      : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <Icon name={item.icon} size={19} />
                  <span>{item.name}</span>
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white" />}
                </button>
              )
            })}


<button
  onClick={handleLogout}
  className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
>
  <span>↪</span>
  <span>Logout</span>
</button>

          </nav>
        </div>



      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 md:hidden"
              aria-label="Open navigation"
            >
              <Icon name="menu" />
            </button>
            <div>
              <p className="text-xs text-slate-400">
                Academic Portal <span className="mx-1">/</span>
                <span className="font-medium text-slate-600">{activePage}</span>
              </p>
              <h2 className="mt-1 text-sm font-bold text-slate-800 md:text-base">
                Institution workspace
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              aria-label="Notifications"
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50"
            >
              <Icon name="bell" size={19} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-blue-600 ring-2 ring-white" />
            </button>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 ring-2 ring-blue-50">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">Administrator</p>
                <p className="text-[11px] text-slate-400">Institution portal</p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] p-4 md:p-8">
          <section className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                MANAGEMENT OVERVIEW
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-[30px]">
                {isDashboard ? 'Dashboard Overview' : activePage}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {isDashboard
                  ? 'Monitor and manage your academic records from one place.'
                  : `View and manage ${activePage.toLowerCase()} records.`}
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-500 shadow-sm">
              <Icon name="calendar-check" size={16} className="text-blue-600" />
              Academic year <span className="font-bold text-slate-800">2026–27</span>
            </div>
          </section>

          {isDashboard && (
            <>
              <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {stats.map((card) => {
                  const palette = {
                    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
                    violet: 'bg-violet-50 text-violet-700 ring-violet-100',
                    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
                    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
                  }[card.color]

                  return (
                    <div
                      key={card.label}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium text-slate-500">{card.label}</p>
                        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ring-1 ${palette}`}>
                          <Icon name={card.icon} size={20} />
                        </span>
                      </div>
                      <p className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">
                        {card.value === 'students' ? students.length : card.value}
                      </p>
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        {card.note}
                      </div>
                    </div>
                  )
                })}
              </section>

              <section className="relative mb-7 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 p-6 text-white shadow-lg shadow-blue-100 md:p-8">
                <div className="pointer-events-none absolute -right-8 -top-20 h-64 w-64 rounded-full border-[35px] border-white/10" />
                <div className="pointer-events-none absolute right-40 top-24 h-28 w-28 rounded-full bg-white/5" />
                <div className="relative max-w-2xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-blue-50">
                    <Icon name="database" size={14} />
                    Academic information system
                  </span>
                  <h3 className="mt-5 max-w-xl text-2xl font-bold leading-tight md:text-3xl">
                    All your academic records, in one place.
                  </h3>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-blue-100">
                    Manage student information and organize institutional records through a structured management interface.
                  </p>
                  <button
                    onClick={() => setActivePage('Students')}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-blue-700 shadow-sm transition hover:bg-blue-50"
                  >
                    View student records <Icon name="chevron" size={17} />
                  </button>
                </div>
              </section>
            </>
          )}

{activePage === 'Faculty' && showForm && (
  <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h3 className="mb-5 text-lg font-bold text-slate-900">
      Add New Faculty Member
    </h3>

    <form
      onSubmit={async (event) => {
        event.preventDefault()

        try {
          const response = await fetch('http://127.0.0.1:8000/api/faculty', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              ...facultyForm,
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.detail || 'Could not add faculty')
          }

          const refreshedFaculty = await fetchFaculty(accessToken)
          setFaculty(
            refreshedFaculty.map((member) => ({
              ...member,
              id: member.faculty_id,
              status: 'Active',
            }))
          )

          setFacultyForm({
            name: '',
            email: '',
            phone: '',
            designation: '',
          })
          setShowForm(false)
          alert('Faculty member added successfully!')
        } catch (error) {
          console.error('Add faculty error:', error)
          alert(error.message)
        }
      }}
      className="grid gap-4 md:grid-cols-2"
    >
      <input
        required
        placeholder="Full name"
        value={facultyForm.name}
        onChange={(event) =>
          setFacultyForm({ ...facultyForm, name: event.target.value })
        }
        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
      />

      <input
        required
        type="email"
        placeholder="Email address"
        value={facultyForm.email}
        onChange={(event) =>
          setFacultyForm({ ...facultyForm, email: event.target.value })
        }
        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
      />

      <input
        placeholder="Phone number"
        value={facultyForm.phone}
        onChange={(event) =>
          setFacultyForm({ ...facultyForm, phone: event.target.value })
        }
        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
      />

      <input
        required
        placeholder="Designation (e.g. Assistant Professor)"
        value={facultyForm.designation}
        onChange={(event) =>
          setFacultyForm({ ...facultyForm, designation: event.target.value })
        }
        className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-400"
      />

      <div className="flex gap-3 md:col-span-2">
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Save Faculty
        </button>

        <button
          type="button"
         onClick={() => setShowForm(false)}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  </section>
)}


          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 md:px-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">
  {activePage === 'Faculty' ? 'Faculty Records' : 'Student Records'}
</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Search and review academic information.
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-100 transition hover:bg-blue-700"
              >


<Icon name="plus" size={17} />
{activePage === 'Faculty'
  ? 'Add Faculty'
  : activePage === 'Courses'
    ? 'Add Course'
    : activePage === 'Attendance'
      ? 'Add Attendance'
      : activePage === 'Departments'
  ? 'Add Department'
      : 'Add Student'}

              </button>
            </div>

            <div className="p-5 md:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-sm">
                  <Icon name="search" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Search name, email or course..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-50"
                  />
                </div>
                <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-500">

{(
  activePage === 'Departments'
    ? departments.length
    : activePage === 'Faculty'
      ? filteredFaculty.length
      : activePage === 'Courses'
        ? courses.length
        : activePage === 'Attendance'
          ? attendance.length
          : filteredStudents.length
)} records

                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">


<thead>
  <tr className="border-y border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
    {activePage === 'Faculty' ? (
      <>
        <th className="px-4 py-4">Faculty details</th>
        <th className="px-4 py-4">Phone</th>
        <th className="px-4 py-4">Designation</th>
        <th className="px-4 py-4">Status</th>
      </>
    ) : activePage === 'Departments' ? (
      <>
        <th className="px-4 py-4">Department ID</th>
        <th className="px-4 py-4">Department Name</th>
        <th className="px-4 py-4">Tenant ID</th>
      </>
    ) : activePage === 'Courses' ? (
      <>
        <th className="px-4 py-4">Course Name / Code</th>
        <th className="px-4 py-4">Department ID</th>
        <th className="px-4 py-4">Credits</th>
        <th className="px-4 py-4">Semester</th>
      </>
    ) : activePage === 'Attendance' ? (
      <>
        <th className="px-4 py-4">Attendance ID</th>
        <th className="px-4 py-4">Student ID</th>
        <th className="px-4 py-4">Course ID</th>
        <th className="px-4 py-4">Date</th>
        <th className="px-4 py-4">Status</th>
      </>
    ) : (
      <>
        <th className="px-4 py-4">Student details</th>
        <th className="px-4 py-4">Course</th>
        <th className="px-4 py-4">Semester</th>
        <th className="px-4 py-4">Status</th>
      </>
    )}
  </tr>
</thead>



<tbody className="divide-y divide-slate-100">
  {activePage === 'Faculty' ? (
    filteredFaculty.map((member) => (
      <tr key={member.id} className="transition hover:bg-blue-50/40">
        <td className="px-4 py-4">
          <div>
            <p className="font-semibold text-slate-800">{member.name}</p>
            <p className="mt-1 text-xs text-slate-500">{member.email}</p>
          </div>
        </td>
        <td className="px-4 py-4 text-slate-600">{member.phone || '—'}</td>
        <td className="px-4 py-4 text-slate-600">{member.designation}</td>
        <td className="px-4 py-4">
          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            Active
          </span>
        </td>
      </tr>
    ))

  ) : activePage === 'Departments' ? (
    departments
      .filter((department) =>
        `${department.department_id} ${department.department_name} ${department.tenant_id}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .map((department) => (
        <tr
          key={department.department_id}
          className="transition hover:bg-blue-50/40"
        >
          <td className="px-4 py-4 text-slate-600">
            {department.department_id}
          </td>
          <td className="px-4 py-4 font-semibold text-slate-800">
            {department.department_name}
          </td>
          <td className="px-4 py-4 text-slate-600">
            {department.tenant_id}
          </td>
        </tr>
      ))


  ) : activePage === 'Courses' ? (
    courses
      .filter((course) =>
        `${course.course_name} ${course.course_code}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .map((course) => (
        <tr key={course.course_id} className="transition hover:bg-blue-50/40">
          <td className="px-4 py-4">
            <p className="font-semibold text-slate-800">{course.course_name}</p>
            <p className="mt-1 text-xs text-slate-500">{course.course_code}</p>
          </td>
          <td className="px-4 py-4 text-slate-600">{course.department_id}</td>
          <td className="px-4 py-4 text-slate-600">{course.credits}</td>
          <td className="px-4 py-4 text-slate-600">Semester {course.semester}</td>
        </tr>
      ))
) : activePage === 'Attendance' ? (
  attendance
    .filter((record) =>
      `${record.student_id} ${record.course_id} ${record.status} ${record.attendance_date}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .map((record) => (
      <tr key={record.attendance_id} className="transition hover:bg-blue-50/40">
        <td className="px-4 py-4 text-slate-600">{record.attendance_id}</td>
        <td className="px-4 py-4 text-slate-600">{record.student_id}</td>
        <td className="px-4 py-4 text-slate-600">{record.course_id}</td>
        <td className="px-4 py-4 text-slate-600">{record.attendance_date}</td>
        <td className="px-4 py-4">
          <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            record.status === 'Present'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-700'
          }`}>
            {record.status}
          </span>
        </td>
      </tr>
    ))
) : (
    filteredStudents.map((student) => (
      <tr key={student.id} className="transition hover:bg-blue-50/40">
        <td className="px-4 py-4">
          <div>
            <p className="font-semibold text-slate-800">{student.name}</p>
            <p className="mt-1 text-xs text-slate-500">{student.email}</p>
          </div>
        </td>
        <td className="px-4 py-4 text-slate-600">{student.course}</td>
        <td className="px-4 py-4">Semester {student.semester}</td>
        <td className="px-4 py-4">{student.status}</td>
      </tr>
    ))
  )}

  {(

activePage === 'Faculty'
  ? filteredFaculty.length === 0
  : activePage === 'Courses'
    ? courses.filter((course) =>
        `${course.course_name} ${course.course_code}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ).length === 0
    : activePage === 'Attendance'
      ? attendance.filter((record) =>
          `${record.student_id} ${record.course_id} ${record.status} ${record.attendance_date}`
            .toLowerCase()
            .includes(search.toLowerCase())
        ).length === 0
      : filteredStudents.length === 0

  ) && (
    <tr>
      <td colSpan={4} className="px-4 py-14 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Icon name="search" size={22} />
        </div>
        <p className="font-semibold text-slate-700">No records found</p>
        <p className="mt-1 text-xs text-slate-400">
          Try another search term.
        </p>
      </td>
    </tr>
  )}
</tbody>

                </table>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400">
                <span>
  Showing {activePage === 'Faculty' ? filteredFaculty.length : filteredStudents.length}
  {' '}of{' '}
  {activePage === 'Faculty' ? faculty.length : students.length}
  {' '}preview records
</span>
                <span className="flex items-center gap-1.5">
                  <Icon name="database" size={14} />
                  Database connection pending
                </span>
              </div>
            </div>
          </section>

          <footer className="py-6 text-center text-xs text-slate-400">
            Acadex Academic Management System · DBMS College Project
          </footer>
        </div>
      </main>

      {showForm && !['Faculty', 'Courses', 'Attendance'].includes(activePage) && activePage !== 'Departments' && (


        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowForm(false)
          }}
        >
          <form
            onSubmit={addStudent}
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Student</h3>
                <p className="mt-1 text-xs text-slate-500">Enter the student's academic details.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                aria-label="Close form"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-6">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-600">Full name</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter student's full name"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-600">Email address</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="student@example.com"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </label>

<label className="block">
  <span className="mb-2 block text-xs font-semibold text-slate-600">
    Course
  </span>
  <select
    required
    value={form.course_id}
    onChange={(e) =>
      setForm({ ...form, course_id: e.target.value })
    }
    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
  >
    <option value="">Select a course</option>
    {courses.map((course) => (
      <option key={course.course_id} value={course.course_id}>
        {course.course_name} ({course.course_code})
      </option>
    ))}
  </select>
</label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-600">Semester</span>
                <select
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                    <option key={semester} value={semester}>Semester {semester}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                Save Student
              </button>
            </div>
          </form>
        </div>
      )}


{showForm && activePage === 'Attendance' && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
    <form
      onSubmit={addAttendance}
      className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Add Attendance</h3>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="rounded-xl border border-slate-200 px-3 py-2"
        >
          Close
        </button>
      </div>

      <label className="mb-4 block">
        <span className="mb-2 block text-sm font-medium">Student ID</span>
        <input
          name="student_id"
          type="number"
          min="1"
          required
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          placeholder="e.g. 3"
        />
      </label>

      <label className="mb-4 block">
        <span className="mb-2 block text-sm font-medium">Course ID</span>
        <input
          name="course_id"
          type="number"
          min="1"
          required
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
          placeholder="e.g. 5"
        />
      </label>

      <label className="mb-4 block">
        <span className="mb-2 block text-sm font-medium">Attendance Date</span>
        <input
          name="attendance_date"
          type="date"
          required
          defaultValue={new Date().toISOString().slice(0, 10)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3"
        />
      </label>

      <label className="mb-6 block">
        <span className="mb-2 block text-sm font-medium">Status</span>
        <select
          name="status"
          required
          defaultValue="Present"
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
        >
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
        </select>
      </label>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="rounded-xl border border-slate-200 px-4 py-3"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white"
        >
          Save Attendance
        </button>
      </div>
    </form>
  </div>
)}

{showForm && activePage === 'Departments' && (
  <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h3 className="mb-4 text-lg font-bold text-slate-800">
      Add New Department
    </h3>

    <form

onSubmit={async (event) => {
  event.preventDefault()

  const token = localStorage.getItem('access_token')
  const formData = new FormData(event.currentTarget)

  try {
    const response = await fetch('http://127.0.0.1:8000/api/departments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        department_name: formData.get('department_name'),
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(JSON.stringify(errorData))
    }

    const savedDepartment = await response.json()

    setDepartments((previous) => [...previous, savedDepartment])
    setShowForm(false)
    alert('Department saved successfully!')
  } catch (error) {
    console.error('Save department error:', error)
    alert(`Could not save department: ${error.message}`)
  }
}}

      className="grid grid-cols-1 gap-4 md:grid-cols-2"
    >
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-600">
          Department Name
        </label>
        <input
          name="department_name"
          type="text"
          placeholder="e.g. Computer Science Engineering"
          required
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex items-end gap-3">
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Save Department
        </button>

        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
)}



{showForm && activePage === 'Courses' && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
    <form
      onSubmit={addCourse}
      className="w-full max-w-lg space-y-4 rounded-2xl bg-white p-6 shadow-xl"
    >
      <div>
        <h3 className="text-xl font-bold text-slate-900">Add New Course</h3>
        <p className="mt-1 text-sm text-slate-500">
          Enter the course details below.
        </p>
      </div>

      <input
        className="w-full rounded-xl border border-slate-200 p-3"
        placeholder="Course name"
        value={courseForm.course_name}
        onChange={(e) =>
          setCourseForm({ ...courseForm, course_name: e.target.value })
        }
        required
      />

      <input
        className="w-full rounded-xl border border-slate-200 p-3"
        placeholder="Course code (e.g. CS301)"
        value={courseForm.course_code}
        onChange={(e) =>
          setCourseForm({ ...courseForm, course_code: e.target.value })
        }
        required
      />

      <input
        type="number"
        min="1"
        className="w-full rounded-xl border border-slate-200 p-3"
        placeholder="Department ID"
        value={courseForm.department_id}
        onChange={(e) =>
          setCourseForm({ ...courseForm, department_id: e.target.value })
        }
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <input
          type="number"
          min="1"
          className="w-full rounded-xl border border-slate-200 p-3"
          placeholder="Credits"
          value={courseForm.credits}
          onChange={(e) =>
            setCourseForm({ ...courseForm, credits: e.target.value })
          }
          required
        />

        <input
          type="number"
          min="1"
          className="w-full rounded-xl border border-slate-200 p-3"
          placeholder="Semester"
          value={courseForm.semester}
          onChange={(e) =>
            setCourseForm({ ...courseForm, semester: e.target.value })
          }
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-slate-600"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-5 py-2 font-semibold text-white"
        >
          Save Course
        </button>
      </div>
    </form>
  </div>
)}

    </div>
  )
}

export default App
