// src/types/JobPosting.ts

interface Location {
    _id: string;
    city: string;
    country: string;
    district: string;
    __v: number;
  }
  
  interface Unit {
    _id: string;
    name: string;
    __v: number;
    banner: string;
    image: string;
    locations: Location[];
    introduction: string;
  }
  
  interface Career {
    _id: string;
    name: string;
    __v: number;
  }
  
  interface Account {
    _id: string;
    googleId: string;
    email: string;
    name: string;
    role: string;
    image: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    cvs: string[];
  }
  
  interface InterviewManager {
    _id: string;
    googleId: string;
    email: string;
    name: string;
    role: string;
    image: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
    cvs: string[];
  }
  
  interface JobPosting {
    _id: string;
    title: string;
    introduction: string;
    description: string;
    minSalary: number;
    maxSalary: number;
    numberPerson: number;
    unit: Unit;
    career: Career;
    account: Account;
    address: string;
    expiredDate: string;
    isDelete: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
    isFullTime: boolean;
    type: string;
    location: Location;
    status: string;
    interviewManager: InterviewManager;
    rejectReason: string;
  }
  
  export default JobPosting;
  