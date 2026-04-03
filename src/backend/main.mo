import Text "mo:core/Text";
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Type definitions
  type UserRole = AccessControl.UserRole;

  type UserProfile = {
    username : Text;
    email : Text;
  };

  type SOSReport = {
    userId : Principal;
    message : Text;
    latitude : Float;
    longitude : Float;
    timestamp : Int;
    resolved : Bool;
    response : ?Text;
  };

  type Feedback = {
    userId : Principal;
    rating : Nat;
    comment : Text;
    timestamp : Int;
  };

  type CommuteAlert = {
    userId : Principal;
    sourceStation : Text;
    destinationStation : Text;
    departureTime : Text;
    daysOfWeek : [Nat];
  };

  type Incident = {
    userId : Principal;
    stationName : Text;
    incidentType : Text;
    description : Text;
    timestamp : Int;
    latitude : Float;
    longitude : Float;
  };

  type DelayPrediction = {
    rainfall : Float;
    temperature : Float;
    peakHour : Bool;
    trainType : Text;
    line : Text;
    distance : Float;
    timeOfDay : Nat;
    dayOfWeek : Nat;
    predictedDelayMinutes : Float;
    confidence : Float;
    explanation : Text;
    userId : Principal;
    timestamp : Int;
  };

  type TPSIScore = {
    line : Text;
    score : Nat;
    trend : Text;
    timestamp : Int;
  };

  type Journey = {
    userId : Principal;
    source : Text;
    destination : Text;
    trainType : Text;
    scheduledDeparture : Text;
    predictedDelay : Float;
    actualDelay : Float;
    timestamp : Int;
  };

  type WeatherData = {
    rainfall : Float;
    temperature : Float;
    humidity : Float;
    condition : Text;
    timestamp : Int;
  };

  type Train = {
    trainNumber : Nat;
    destination : Text;
    platform : Nat;
    eta : Text;
    delay : Float;
    trainType : Text;
  };

  type NetworkStatus = {
    status : Text;
    reason : Text;
    timestamp : Int;
  };

  type Analytics = {
    totalUsers : Nat;
    totalSOSReports : Nat;
    openSOSReports : Nat;
    resolvedSOSReports : Nat;
    totalIncidents : Nat;
    totalFeedback : Nat;
    averageRating : Float;
    averageDelayPrediction : Float;
  };

  // Comparison modules
  module SOSReport {
    public func compare(r1 : SOSReport, r2 : SOSReport) : Order.Order {
      Int.compare(r1.timestamp, r2.timestamp);
    };
  };

  module Journey {
    public func compare(j1 : Journey, j2 : Journey) : Order.Order {
      Int.compare(j2.timestamp, j1.timestamp);
    };
  };

  module Incident {
    public func compare(i1 : Incident, i2 : Incident) : Order.Order {
      Int.compare(i2.timestamp, i1.timestamp);
    };
  };

  module DelayPrediction {
    public func compare(p1 : DelayPrediction, p2 : DelayPrediction) : Order.Order {
      Int.compare(p2.timestamp, p1.timestamp);
    };
  };

  // Persistent data structures
  let userProfiles = Map.empty<Principal, UserProfile>();
  let sosReports = Map.empty<Nat, SOSReport>();
  let feedbacks = Map.empty<Nat, Feedback>();
  let commuteAlerts = Map.empty<Nat, CommuteAlert>();
  let incidents = Map.empty<Nat, Incident>();
  let predictions = Map.empty<Nat, DelayPrediction>();
  let tpsiScores = Map.empty<Text, TPSIScore>();
  let journeys = Map.empty<Nat, Journey>();
  var weatherCache : ?WeatherData = null;
  var networkStatus : ?NetworkStatus = null;
  var nextId = 0;

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // SOS Emergency System
  public shared ({ caller }) func submitSOS(message : Text, latitude : Float, longitude : Float) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit SOS reports");
    };
    let id = nextId;
    nextId += 1;
    let report : SOSReport = {
      userId = caller;
      message;
      latitude;
      longitude;
      timestamp = Time.now();
      resolved = false;
      response = null;
    };
    sosReports.add(id, report);
    id;
  };

  public query ({ caller }) func getMySOSReports() : async [SOSReport] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access SOS reports");
    };
    sosReports.values().toArray().filter(func(r) { r.userId == caller });
  };

  public shared ({ caller }) func resolveSOS(reportId : Nat, response : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can resolve SOS reports");
    };
    switch (sosReports.get(reportId)) {
      case (null) { Runtime.trap("SOS report not found") };
      case (?report) {
        let updatedReport : SOSReport = {
          userId = report.userId;
          message = report.message;
          latitude = report.latitude;
          longitude = report.longitude;
          timestamp = report.timestamp;
          resolved = true;
          response = ?response;
        };
        sosReports.add(reportId, updatedReport);
      };
    };
  };

  public shared ({ caller }) func deleteSOS(reportId : Nat) : async () {
    switch (sosReports.get(reportId)) {
      case (null) { Runtime.trap("SOS report does not exist") };
      case (?report) {
        if ((not AccessControl.isAdmin(accessControlState, caller)) and (report.userId != caller)) {
          Runtime.trap("Unauthorized: Cannot delete another user's SOS report");
        };
        sosReports.remove(reportId);
      };
    };
  };

  // Feedback System
  public shared ({ caller }) func submitFeedback(rating : Nat, comment : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit feedback");
    };
    let id = nextId;
    nextId += 1;
    let feedback : Feedback = {
      userId = caller;
      rating : Nat = if (rating > 5) { 5 } else { rating };
      comment;
      timestamp = Time.now();
    };
    feedbacks.add(id, feedback);
    id;
  };

  public query ({ caller }) func getFeedbackStats() : async { averageRating : Float; count : Nat } {
    let count = feedbacks.size();
    if (count == 0) {
      return { averageRating = 0.0; count = 0 };
    };
    var sum = 0.0;
    for ((_, f) in feedbacks.entries()) {
      sum += f.rating.toFloat();
    };
    { averageRating = sum / count.toFloat(); count };
  };

  // Commute Alerts
  public shared ({ caller }) func saveCommuteAlert(source : Text, destination : Text, departureTime : Text, daysOfWeek : [Nat]) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save commute alerts");
    };
    let id = nextId;
    nextId += 1;
    let alert : CommuteAlert = {
      userId = caller;
      sourceStation = source;
      destinationStation = destination;
      departureTime;
      daysOfWeek;
    };
    commuteAlerts.add(id, alert);
    id;
  };

  public shared ({ caller }) func deleteCommuteAlert(alertId : Nat) : async () {
    switch (commuteAlerts.get(alertId)) {
      case (null) { Runtime.trap("Commute alert does not exist") };
      case (?alert) {
        if ((not AccessControl.isAdmin(accessControlState, caller)) and (alert.userId != caller)) {
          Runtime.trap("Unauthorized: Cannot delete another user's commute alert");
        };
        commuteAlerts.remove(alertId);
      };
    };
  };

  public query ({ caller }) func getCommuteAlert(alertId : Nat) : async CommuteAlert {
    switch (commuteAlerts.get(alertId)) {
      case (null) { Runtime.trap("Commute alert does not exist") };
      case (?alert) {
        if ((not AccessControl.isAdmin(accessControlState, caller)) and (alert.userId != caller)) {
          Runtime.trap("Unauthorized: Cannot view another user's commute alert");
        };
        alert;
      };
    };
  };

  // Community Incidents
  public shared ({ caller }) func submitIncident(stationName : Text, incidentType : Text, description : Text, latitude : Float, longitude : Float) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit incidents");
    };
    let id = nextId;
    nextId += 1;
    let incident : Incident = {
      userId = caller;
      stationName;
      incidentType;
      description;
      timestamp = Time.now();
      latitude;
      longitude;
    };
    incidents.add(id, incident);
    id;
  };

  public query ({ caller }) func getRecentIncidents() : async [Incident] {
    let sortedIncidents = incidents.values().toArray().sort();
    sortedIncidents.sliceToArray(0, if (sortedIncidents.size() < 50) { sortedIncidents.size() } else { 50 });
  };

  public shared ({ caller }) func deleteIncident(incidentId : Nat) : async () {
    switch (incidents.get(incidentId)) {
      case (null) { Runtime.trap("Incident does not exist") };
      case (?incident) {
        if ((not AccessControl.isAdmin(accessControlState, caller)) and (incident.userId != caller)) {
          Runtime.trap("Unauthorized: Cannot delete another user's incident");
        };
        incidents.remove(incidentId);
      };
    };
  };

  public query ({ caller }) func getIncident(incidentId : Nat) : async Incident {
    switch (incidents.get(incidentId)) {
      case (null) { Runtime.trap("Incident does not exist") };
      case (?incident) { incident };
    };
  };

  // ML Delay Prediction
  public shared ({ caller }) func storeDelayPrediction(input : {
    rainfall : Float;
    temperature : Float;
    peakHour : Bool;
    trainType : Text;
    line : Text;
    distance : Float;
    timeOfDay : Nat;
    dayOfWeek : Nat;
    predictedDelayMinutes : Float;
    confidence : Float;
    explanation : Text;
  }) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can store delay predictions");
    };
    let id = nextId;
    nextId += 1;
    let prediction : DelayPrediction = {
      rainfall = input.rainfall;
      temperature = input.temperature;
      peakHour = input.peakHour;
      trainType = input.trainType;
      line = input.line;
      distance = input.distance;
      timeOfDay = input.timeOfDay;
      dayOfWeek = input.dayOfWeek;
      predictedDelayMinutes = input.predictedDelayMinutes;
      confidence = input.confidence;
      explanation = input.explanation;
      userId = caller;
      timestamp = Time.now();
    };
    predictions.add(id, prediction);
    id;
  };

  public query ({ caller }) func getMyDelayPredictions() : async [DelayPrediction] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access delay predictions");
    };
    let userPredictions = List.empty<DelayPrediction>();
    for ((_, p) in predictions.entries()) {
      if (Principal.equal(p.userId, caller)) {
        userPredictions.add(p);
      };
    };
    let sorted = userPredictions.toArray().sort();
    sorted.sliceToArray(0, if (sorted.size() < 20) { sorted.size() } else { 20 });
  };

  // TPSI (Train Performance Score Index)
  public shared ({ caller }) func updateTPSIScore(line : Text, score : Nat, trend : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can update TPSI scores");
    };

    let tpsiScore : TPSIScore = {
      line;
      score;
      trend;
      timestamp = Time.now();
    };

    tpsiScores.add(line, tpsiScore);
  };

  public query ({ caller }) func getTPSIScore(line : Text) : async ?TPSIScore {
    tpsiScores.get(line);
  };

  // Journey History
  public shared ({ caller }) func saveJourney(source : Text, destination : Text, trainType : Text, scheduledDeparture : Text, predictedDelay : Float, actualDelay : Float) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save journeys");
    };
    let id = nextId;
    nextId += 1;
    let journey : Journey = {
      userId = caller;
      source;
      destination;
      trainType;
      scheduledDeparture;
      predictedDelay;
      actualDelay;
      timestamp = Time.now();
    };
    journeys.add(id, journey);
    id;
  };

  public query ({ caller }) func getMyJourneyHistory() : async [Journey] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access journey history");
    };
    let userJourneys = List.empty<Journey>();
    for ((_, j) in journeys.entries()) {
      if (Principal.equal(j.userId, caller)) {
        userJourneys.add(j);
      };
    };
    let sorted = userJourneys.toArray().sort();
    sorted.sliceToArray(0, if (sorted.size() < 20) { sorted.size() } else { 20 });
  };

  // Weather Cache
  public shared ({ caller }) func updateWeatherCache(data : WeatherData) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can update weather cache");
    };
    weatherCache := ?data;
  };

  public query ({ caller }) func getWeatherCache() : async ?WeatherData {
    weatherCache;
  };

  // Live Train Simulation
  public shared ({ caller }) func updateNetworkStatus(status : Text, reason : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can update network status");
    };
    networkStatus := ?{
      status;
      reason;
      timestamp = Time.now();
    };
  };

  public query ({ caller }) func getNetworkStatus() : async ?NetworkStatus {
    networkStatus;
  };

  public query ({ caller }) func getAllTrains() : async [Train] {
    [
      {
        trainNumber = 101;
        destination = "Churchgate";
        platform = 1;
        eta = "2 min";
        delay = 3.0;
        trainType = "Fast";
      },
      {
        trainNumber = 102;
        destination = "Borivali";
        platform = 2;
        eta = "5 min";
        delay = 6.0;
        trainType = "Slow";
      },
      {
        trainNumber = 103;
        destination = "Virar";
        platform = 3;
        eta = "8 min";
        delay = 1.0;
        trainType = "Fast";
      },
    ];
  };

  // Admin Analytics
  public query ({ caller }) func getAnalyticsSummary() : async Analytics {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can access analytics");
    };
    let totalUsers = userProfiles.size();
    let totalSOSReports = sosReports.size();
    var openSOS = 0;
    for ((_, r) in sosReports.entries()) {
      if (not r.resolved) { openSOS += 1 };
    };

    let totalIncidents = incidents.size();
    let totalFeedback = feedbacks.size();

    var sumRating = 0.0;
    for ((_, f) in feedbacks.entries()) {
      sumRating += f.rating.toFloat();
    };

    let averageRating = if (totalFeedback == 0) {
      0.0;
    } else {
      sumRating / totalFeedback.toFloat();
    };

    var sumDelay = 0.0;
    for ((_, p) in predictions.entries()) {
      sumDelay += p.predictedDelayMinutes;
    };

    let averageDelayPrediction = if (predictions.size() == 0) {
      0.0;
    } else {
      sumDelay / predictions.size().toFloat();
    };

    {
      totalUsers;
      totalSOSReports;
      openSOSReports = openSOS;
      resolvedSOSReports = totalSOSReports - openSOS;
      totalIncidents;
      totalFeedback;
      averageRating;
      averageDelayPrediction;
    };
  };
};
