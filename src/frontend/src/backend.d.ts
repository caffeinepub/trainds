import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TPSIScore {
    trend: string;
    line: string;
    score: bigint;
    timestamp: bigint;
}
export interface NetworkStatus {
    status: string;
    timestamp: bigint;
    reason: string;
}
export interface Journey {
    destination: string;
    source: string;
    userId: Principal;
    actualDelay: number;
    trainType: string;
    timestamp: bigint;
    predictedDelay: number;
    scheduledDeparture: string;
}
export interface Analytics {
    totalSOSReports: bigint;
    averageDelayPrediction: number;
    averageRating: number;
    totalFeedback: bigint;
    totalUsers: bigint;
    openSOSReports: bigint;
    totalIncidents: bigint;
    resolvedSOSReports: bigint;
}
export interface Incident {
    latitude: number;
    userId: Principal;
    description: string;
    longitude: number;
    timestamp: bigint;
    stationName: string;
    incidentType: string;
}
export interface WeatherData {
    temperature: number;
    humidity: number;
    timestamp: bigint;
    rainfall: number;
    condition: string;
}
export interface SOSReport {
    latitude: number;
    resolved: boolean;
    userId: Principal;
    longitude: number;
    message: string;
    response?: string;
    timestamp: bigint;
}
export interface Train {
    eta: string;
    destination: string;
    trainNumber: bigint;
    trainType: string;
    platform: bigint;
    delay: number;
}
export interface DelayPrediction {
    peakHour: boolean;
    temperature: number;
    userId: Principal;
    dayOfWeek: bigint;
    line: string;
    explanation: string;
    predictedDelayMinutes: number;
    trainType: string;
    distance: number;
    timestamp: bigint;
    confidence: number;
    rainfall: number;
    timeOfDay: bigint;
}
export interface UserProfile {
    username: string;
    email: string;
}
export interface CommuteAlert {
    departureTime: string;
    userId: Principal;
    daysOfWeek: Array<bigint>;
    sourceStation: string;
    destinationStation: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteCommuteAlert(alertId: bigint): Promise<void>;
    deleteIncident(incidentId: bigint): Promise<void>;
    deleteSOS(reportId: bigint): Promise<void>;
    getAllTrains(): Promise<Array<Train>>;
    getAnalyticsSummary(): Promise<Analytics>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommuteAlert(alertId: bigint): Promise<CommuteAlert>;
    getFeedbackStats(): Promise<{
        count: bigint;
        averageRating: number;
    }>;
    getIncident(incidentId: bigint): Promise<Incident>;
    getMyDelayPredictions(): Promise<Array<DelayPrediction>>;
    getMyJourneyHistory(): Promise<Array<Journey>>;
    getMySOSReports(): Promise<Array<SOSReport>>;
    getNetworkStatus(): Promise<NetworkStatus | null>;
    getRecentIncidents(): Promise<Array<Incident>>;
    getTPSIScore(line: string): Promise<TPSIScore | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWeatherCache(): Promise<WeatherData | null>;
    isCallerAdmin(): Promise<boolean>;
    resolveSOS(reportId: bigint, response: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveCommuteAlert(source: string, destination: string, departureTime: string, daysOfWeek: Array<bigint>): Promise<bigint>;
    saveJourney(source: string, destination: string, trainType: string, scheduledDeparture: string, predictedDelay: number, actualDelay: number): Promise<bigint>;
    storeDelayPrediction(input: {
        peakHour: boolean;
        temperature: number;
        dayOfWeek: bigint;
        line: string;
        explanation: string;
        predictedDelayMinutes: number;
        trainType: string;
        distance: number;
        confidence: number;
        rainfall: number;
        timeOfDay: bigint;
    }): Promise<bigint>;
    submitFeedback(rating: bigint, comment: string): Promise<bigint>;
    submitIncident(stationName: string, incidentType: string, description: string, latitude: number, longitude: number): Promise<bigint>;
    submitSOS(message: string, latitude: number, longitude: number): Promise<bigint>;
    updateNetworkStatus(status: string, reason: string): Promise<void>;
    updateTPSIScore(line: string, score: bigint, trend: string): Promise<void>;
    updateWeatherCache(data: WeatherData): Promise<void>;
}
