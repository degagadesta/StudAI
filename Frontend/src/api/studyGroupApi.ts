import { api } from "./client";

export interface StudyGroupMember {
  id: string;
  studentId: string;
  role: "ADMIN" | "MEMBER";
  joinedAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
}

export interface StudyGroup {
  id: string;
  name: string;
  subject: string | null;
  curriculumCourseId: string | null;
  inviteCode: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  members?: StudyGroupMember[];
  _count?: {
    members?: number;
    messages?: number;
    sharedNotes?: number;
  };
}

export interface StudyGroupMessage {
  id: string;
  studyGroupId: string;
  senderId: string;
  content: string;
  type: "TEXT" | "NOTE_SHARE" | "FLASHCARD_SHARE";
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface SharedStudyNote {
  id: string;
  sharedAt: string;
  note: {
    id: string;
    title?: string | null;
    content?: string | null;
    curriculumCourse?: {
      course?: {
        title?: string;
      };
    } | null;
  };
  sharedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface MyStudyNote {
  id: string;
  content: string;
  updatedAt: string;
  curriculumCourse: {
    courseCode: string;
    course: {
      title: string;
    };
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function getMyStudyGroups(): Promise<StudyGroup[]> {
  const response = await api.get<ApiResponse<StudyGroup[]>>(
    "/student/study-groups",
  );
  return response.data.data;
}

export async function createStudyGroup(payload: {
  name: string;
  subject?: string;
  curriculumCourseId?: string;
}): Promise<StudyGroup> {
  const response = await api.post<ApiResponse<StudyGroup>>(
    "/student/study-groups",
    payload,
  );
  return response.data.data;
}

export async function joinStudyGroup(inviteCode: string): Promise<StudyGroup> {
  const response = await api.post<ApiResponse<StudyGroup>>(
    "/student/study-groups/join",
    { inviteCode },
  );
  return response.data.data;
}

export async function getStudyGroup(groupId: string): Promise<StudyGroup> {
  const response = await api.get<ApiResponse<StudyGroup>>(
    `/student/study-groups/${groupId}`,
  );
  return response.data.data;
}

export async function leaveStudyGroup(groupId: string): Promise<void> {
  await api.post(`/student/study-groups/${groupId}/leave`);
}

export async function deleteStudyGroup(groupId: string): Promise<void> {
  await api.delete(`/student/study-groups/${groupId}`);
}

export async function updateStudyGroupMemberRole(
  groupId: string,
  memberId: string,
  role: "ADMIN" | "MEMBER",
): Promise<void> {
  await api.patch(
    `/student/study-groups/${groupId}/members/${memberId}/role`,
    { role },
  );
}

export async function removeStudyGroupMember(
  groupId: string,
  memberId: string,
): Promise<void> {
  await api.delete(
    `/student/study-groups/${groupId}/members/${memberId}`,
  );
}

export async function getStudyGroupMessages(
  groupId: string,
  page = 1,
  limit = 50,
): Promise<StudyGroupMessage[]> {
  const response = await api.get<ApiResponse<StudyGroupMessage[]>>(
    `/student/study-groups/${groupId}/messages`,
    { params: { page, limit } },
  );
  return response.data.data;
}

export async function getSharedStudyNotes(
  groupId: string,
): Promise<SharedStudyNote[]> {
  const response = await api.get<ApiResponse<SharedStudyNote[]>>(
    `/student/study-groups/${groupId}/notes`,
  );
  return response.data.data;
}

export async function getMyStudyNotes(): Promise<MyStudyNote[]> {
  const response = await api.get<ApiResponse<MyStudyNote[]>>(
    "/student/study-groups/my-notes",
  );
  return response.data.data;
}

export async function shareStudyNote(
  groupId: string,
  noteId: string,
): Promise<SharedStudyNote> {
  const response = await api.post<ApiResponse<SharedStudyNote>>(
    `/student/study-groups/${groupId}/notes`,
    { noteId },
  );
  return response.data.data;
}

export async function updateStudyGroup(
  groupId: string,
  payload: { name?: string; subject?: string; curriculumCourseId?: string | null },
): Promise<StudyGroup> {
  const response = await api.patch<ApiResponse<StudyGroup>>(
    `/student/study-groups/${groupId}`,
    payload,
  );
  return response.data.data;
}
