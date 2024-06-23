const ROOTS = {
  AUTH: '/auth',
  ERROR: '/error',
  SMSEDU: '/smsedu',
};

export const paths = {
  auth: {
    login: `${ROOTS.AUTH}/login`,
  },
  smsedu: {
    root: ROOTS.SMSEDU,
    class: {
      root: `${ROOTS.SMSEDU}/class`,
      list: `${ROOTS.SMSEDU}/class/list`,
    },
    subject: {
      root: `${ROOTS.SMSEDU}/subject`,
      list: `${ROOTS.SMSEDU}/subject/list`,
    },
    teacher: {
      root: `${ROOTS.SMSEDU}/teacher`,
      list: `${ROOTS.SMSEDU}/teacher/list`,
    },
    assignment: {
      root: `${ROOTS.SMSEDU}/assignment`,
      teacherLeader: `${ROOTS.SMSEDU}/assignment/teacher-leader`,
      subject: `${ROOTS.SMSEDU}/assignment/subject`,
    },
    timetable: {
      root: `${ROOTS.SMSEDU}/timetable`,
      edit: `${ROOTS.SMSEDU}/timetable/edit`,
      view: `${ROOTS.SMSEDU}/timetable/view`,
    },
  },
  error: {
    root: ROOTS.ERROR,
    notFound: `${ROOTS.ERROR}/404`,
    forbidden: `${ROOTS.ERROR}/401`,
  },
};
