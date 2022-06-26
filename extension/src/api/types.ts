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

export type AddParticipantRequest = {
    email: string;
}


export type SessionInfo = {
    id: number;
    title: string;
    startTime: string;
    stopTime: string;
    duration: number;
}

export type SessionParticipantInfo = {
    id: number;
    status: string;
    email: string;
    session_id: number;
    session: SessionInfo
}
