export type CreateSessionRequest = {
    title: string;
    startTime: number;
    endTime: number;
    duration: number;
}

export type CreateSessionResponse = {
    teacherToken: string;
    jwt: string;
}

export type SessionParticipant = {
    id: number;
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
    allowedUrls: string[]
}

export type SessionParticipantInfo = {
    id: number;
    status: string;
    email: string;
    session_id: number;
    session: SessionInfo
}

export type AuthRequest = {
    token: string;
    type: "student" | "teacher"
}

export type AuthResponse = {
    jwt: string;
}

export type SessionMonitoringData = {
    graph: SessionMonitoringGraphPoint[],
    participants: SessionMonitoringParticipant[]
}
export type SessionMonitoringGraphPoint = {
    date: number;
    value: number
}
export type SessionMonitoringParticipant = {
    id: number,
    email: string,
    startedTime: number,
    a: number,
    v: number,
    b: number,
    k: number
}

export type SessionParticipantMonitoring = {
    id: number,
    a: number,
    v: number,
    b: number,
    k: number,
    loggedKeys: string[],
    browserData: string[],
    url: string,
    date: number
}