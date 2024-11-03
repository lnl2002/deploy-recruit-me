import { config } from "dotenv";
config();
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
export const FRONTEND_URL_CANDIDATE_HOME = process.env.NEXT_PUBLIC_CANDIDATE_HOME || '';
export const FRONTEND_URL_RECRUITER_HOME = process.env.NEXT_PUBLIC_RECRUITER_HOME || '';
export const FRONTEND_URL_INTERVIEW_MANAGER_HOME = process.env.NEXT_PUBLIC_INTERVIEW_MANAGER_HOME || '';
export const FRONTEND_URL_ADMIN_HOME = process.env.NEXT_PUBLIC_ADMIN_HOME || '';
