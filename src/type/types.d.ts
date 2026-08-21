

export interface CreateUser {
  name: string;
  email: string;
  password?: string;
  role?: "ADMIN" | "INSTRUCTOR" | "STUDENT";
  bio?: string | null;
}

export interface CreateTopic {
  name: string;
  description?: string | null;
}

export interface CreateCourse {
  title: string;
  description?: string | null;
  topicId: string;
  instructorId: string;
  price: number;
}

export interface LessonData {
  courseId: string;
  title: string;
  type: "VIDEO" | "NOTES";
  content?: string | null;
  videoUrl?: string | null;
  position?: number | null; 
}

export interface ItemData {
  courseId: string;
  price: number;
}

export interface CreatePurchaseRepoInput {
  userId: string;
  totalAmount: number;
  items: ItemData[];
}
