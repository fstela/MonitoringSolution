export type CreateSessionRequest = {
    title: string;
    startTime: number;
    endTime: number;
    duration: number;
}

export type CreateSessionResponse = {
    teacherToken: string;
}

export type SessionParticipant = {
    id: string;
    studentToken: string;
    status: string;
    email: string;
}