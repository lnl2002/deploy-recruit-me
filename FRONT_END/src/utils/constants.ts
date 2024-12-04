export const statusObject = [
  {
    key: "active",
    color: "success",
  },
  {
    key: "pause",
    color: "danger",
  },
];

export const asyncState = {
  loading: "loading",
  success: "success",
  error: "error",
};

export const inputSlots = {
  label: "text-textSecondary mb-3",
  base: "bg-black flex gap-5",
  input: "placeholder:text-textTertiary text-xl",
  description: "text-textTertiary",
};

//nav header
export enum Role {
  Common,
  Recruiter,
  Interviewer,
}
export const navLinks = [
  {
    id: 1,
    name: "Home",
    path: "/",
    expandable: false,
    loginRequired: false,
    expand: [],
  },
  {
    id: 2,
    name: "My Application",
    path: "/my-applications",
    expandable: false,
    loginRequired: true,
    expand: [],
  },
  {
    id: 3,
    name: "About Us",
    path: "/about-us",
    expandable: false,
    loginRequired: false,
    expand: [],
  },
];

export const hrNavLinks = [
  {
    id: 1,
    name: "Home",
    path: "/",
    expandable: false,
    loginRequired: false,
    expand: [],
  },
  {
    id: 2,
    name: "My Jobs",
    path: "/recruiter/list-job",
    expandable: true,
    loginRequired: true,
    expand: [
      {
        id: 1,
        name: "All My Jobs",
        path: "/recruiter/list-job",
        expandable: false,
        loginRequired: true,
      },
      {
        id: 2,
        name: "New Jobs",
        path: "/recruiter/list-job",
        expandable: false,
        loginRequired: true,
      },
      {
        id: 3,
        name: "Approved Jobs",
        path: "/recruiter/list-job",
        expandable: false,
        loginRequired: true,
      },
      {
        id: 4,
        name: "Completed Jobs",
        path: "/recruiter/list-job",
        expandable: false,
        loginRequired: true,
      },
      {
        id: 5,
        name: "Expired Jobs",
        path: "/recruiter/list-job",
        expandable: false,
        loginRequired: true,
      },
      {
        id: 6,
        name: "Deleted Jobs",
        path: "/recruiter/list-job",
        expandable: false,
        loginRequired: true,
      },
    ],
  },
  {
    id: 3,
    name: "Contact Us",
    path: "/contact-us",
    expandable: false,
    loginRequired: false,
    expand: [],
  },
];

export const interviewerNavLink = [
  {
    id: 1,
    name: "Home",
    path: "/",
    expandable: false,
    loginRequired: false,
    expand: [],
  },
  {
    id: 2,
    name: "Candidate Listing",
    path: "/interview-manager/candidate-list",
    expandable: true,
    loginRequired: true,
    expand: [
      {
        id: 1,
        name: "Waiting Interview",
        path: "/interview-manager/candidate-list",
        expandable: false,
        loginRequired: true,
      },
      {
        id: 2,
        name: "Interviewed Candidates",
        path: "/interview-manager/candidate-list",
        expandable: false,
        loginRequired: true,
      },
    ],
  },
  {
    id: 3,
    name: "Interview Schedule",
    path: "/interview-manager/interview-schedule",
    expandable: false,
    loginRequired: false,
    expand: [],
  },
  {
    id: 4,
    name: "Contact Us",
    path: "/contact-us",
    expandable: false,
    loginRequired: false,
    expand: [],
  },
];
