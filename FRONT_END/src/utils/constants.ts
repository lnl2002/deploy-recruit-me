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
}


//nav header
export enum Role {
  Common,
  Recruiter,
}
export const navLinks = [
  { id: 1, name: "Home", path: "/", expandable: false, loginRequired: false },
  {
    id: 2,
    name: "My Application",
    path: "/my-applications",
    expandable: false,
    loginRequired: true,
  },
  {
    id: 3,
    name: "About Us",
    path: "/about-us",
    expandable: false,
    loginRequired: false,
  },
];

export const hrNavLinks = [
  { id: 1, name: "Home", path: "/", expandable: false, loginRequired: false },
  {
    id: 2,
    name: "My Jobs",
    path: "/recruiter/list-job",
    expandable: true,
    loginRequired: true,
  },
  {
    id: 3,
    name: "Contact Us",
    path: "/contact-us",
    expandable: false,
    loginRequired: false,
  },
];
