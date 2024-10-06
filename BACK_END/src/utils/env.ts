import {config} from "dotenv"
config();

export const FRONTEND_URL_CANDIDATE_HOME = process.env.FRONTEND_URL_CANDIDATE_HOME || '';
export const FRONTEND_URL_RECRUITER_HOME = process.env.FRONTEND_URL_RECRUITER_HOME || '';
export const FRONTEND_URL_HR_MANAGER_HOME = process.env.FRONTEND_URL_HR_MANAGER_HOME || '';
export const FRONTEND_URL_ADMIN_HOME = process.env.FRONTEND_URL_ADMIN_HOME || '';
