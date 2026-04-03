import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CommuteAlert,
  Incident,
  Journey,
  SOSReport,
  UserProfile,
  WeatherData,
} from "../backend.d";
import { useActor } from "./useActor";

// User Profile
export function useCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 5 * 60 * 1000,
  });
}

// Weather
export function useWeatherCache() {
  const { actor, isFetching } = useActor();
  return useQuery<WeatherData | null>({
    queryKey: ["weatherCache"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getWeatherCache();
    },
    enabled: !!actor && !isFetching,
    staleTime: 10 * 60 * 1000,
  });
}

export function useUpdateWeatherCache() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: WeatherData) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateWeatherCache(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weatherCache"] });
    },
  });
}

// Live Trains
export function useAllTrains() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allTrains"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTrains();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30 * 1000,
  });
}

export function useNetworkStatus() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["networkStatus"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getNetworkStatus();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30 * 1000,
  });
}

export function useUpdateNetworkStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      status,
      reason,
    }: { status: string; reason: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateNetworkStatus(status, reason);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["networkStatus"] });
    },
  });
}

// TPSI
export function useTPSIScore(line: string) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["tpsiScore", line],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTPSIScore(line);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateTPSIScore() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      line,
      score,
      trend,
    }: { line: string; score: bigint; trend: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateTPSIScore(line, score, trend);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tpsiScore"] });
    },
  });
}

// SOS
export function useMySOSReports() {
  const { actor, isFetching } = useActor();
  return useQuery<SOSReport[]>({
    queryKey: ["mySOSReports"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMySOSReports();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitSOS() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      message,
      latitude,
      longitude,
    }: { message: string; latitude: number; longitude: number }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitSOS(message, latitude, longitude);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mySOSReports"] });
    },
  });
}

export function useResolveSOS() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      reportId,
      response,
    }: { reportId: bigint; response: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.resolveSOS(reportId, response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mySOSReports"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useDeleteSOS() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reportId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteSOS(reportId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mySOSReports"] });
    },
  });
}

// Incidents
export function useRecentIncidents() {
  const { actor, isFetching } = useActor();
  return useQuery<Incident[]>({
    queryKey: ["recentIncidents"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecentIncidents();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitIncident() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      stationName,
      incidentType,
      description,
      latitude,
      longitude,
    }: {
      stationName: string;
      incidentType: string;
      description: string;
      latitude: number;
      longitude: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitIncident(
        stationName,
        incidentType,
        description,
        latitude,
        longitude,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentIncidents"] });
    },
  });
}

export function useDeleteIncident() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (incidentId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteIncident(incidentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recentIncidents"] });
    },
  });
}

// Feedback
export function useFeedbackStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["feedbackStats"],
    queryFn: async () => {
      if (!actor) return { count: BigInt(0), averageRating: 0 };
      return actor.getFeedbackStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSubmitFeedback() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      rating,
      comment,
    }: { rating: bigint; comment: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitFeedback(rating, comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedbackStats"] });
    },
  });
}

// Commute Alerts
export function useSaveCommuteAlert() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      source,
      destination,
      departureTime,
      daysOfWeek,
    }: {
      source: string;
      destination: string;
      departureTime: string;
      daysOfWeek: bigint[];
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCommuteAlert(
        source,
        destination,
        departureTime,
        daysOfWeek,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commuteAlerts"] });
    },
  });
}

export function useDeleteCommuteAlert() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (alertId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteCommuteAlert(alertId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commuteAlerts"] });
    },
  });
}

// Journey
export function useJourneyHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<Journey[]>({
    queryKey: ["journeyHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyJourneyHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveJourney() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      source,
      destination,
      trainType,
      scheduledDeparture,
      predictedDelay,
      actualDelay,
    }: {
      source: string;
      destination: string;
      trainType: string;
      scheduledDeparture: string;
      predictedDelay: number;
      actualDelay: number;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveJourney(
        source,
        destination,
        trainType,
        scheduledDeparture,
        predictedDelay,
        actualDelay,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journeyHistory"] });
    },
  });
}

// Delay Predictions
export function useStoreDelayPrediction() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (input: {
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
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.storeDelayPrediction(input);
    },
  });
}

// Analytics (admin)
export function useAnalyticsSummary() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAnalyticsSummary();
    },
    enabled: !!actor && !isFetching,
  });
}
