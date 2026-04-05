import Map "mo:core/Map";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Blob "mo:core/Blob";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Set "mo:core/Set";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Timer "mo:core/Timer";
import Char "mo:core/Char";
import Time "mo:core/Time";
import Queue "mo:core/Queue";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  ////////////////////////////
  // TYPES
  ////////////////////////////
  public type UserProfile = {
    username : Text;
    email : Text;
    phoneNumber : ?Text;
    telegramId : ?Text;
    referralCode : ?Text;
    verified : Bool;
  };

  public type SignalType = {
    #buy;
    #sell;
    #noTrade;
  };

  public type TradeType = {
    #intraday;
    #swing;
    #scalping;
  };

  public type PositionBias = {
    #bullish;
    #bearish;
    #neutral;
  };

  public type SignalStatus = {
    #active;
    #triggered;
    #expired;
    #cancelled;
  };

  public type ValidationResult = {
    #valid;
    #conflict;
    #noTrade;
  };

  public type TradeOutcome = {
    #win;
    #loss;
    #breakeven;
    #noTrade;
  };

  public type SignalId = Nat;
  public type StrategyName = Text;

  public type TradeSignal = {
    symbol : Text;
    signalType : SignalType;
    entryPrice : Text;
    stopLoss : Text;
    target1 : Text;
    target2 : ?Text;
    target3 : ?Text;
    riskRewardRatio : Text;
    tradeType : TradeType;
    confidenceScore : Nat;
    positionBias : PositionBias;
    strategiesConfirmed : [StrategyName];
    reasoningBreakdown : Text;
    noTradeReason : ?Text;
    timestamp : Int;
    signalStatus : SignalStatus;
    positionSize : Nat;
    riskPerTrade : Nat;
    rewardPotential : Text;
    contractType : {
      #futures;
      #options;
      #stock;
    };
    leverage : Nat;
    createdBy : Principal;
  };

  public type StrategyAnalysis = {
    strategyName : StrategyName;
    agreement : Bool;
    confidence : Nat;
    bias : PositionBias;
    details : Text;
  };

  public type WatchlistItem = {
    symbol : Text;
    addedBy : Principal;
    timestamp : Int;
  };

  public type RiskSettings = {
    capitalAmount : Nat;
    riskPercentage : Nat;
    maxLotSize : Nat;
    maxDailyLoss : Nat;
    riskRewardTarget : Text;
    drawdownLimit : Nat;
    maxOpenTrades : Nat;
  };

  public type BacktestResult = {
    strategyName : Text;
    symbol : Text;
    startDate : Int;
    endDate : Int;
    totalTrades : Nat;
    winningTrades : Nat;
    losingTrades : Nat;
    winRate : Text;
    totalROI : Text;
    maxDrawdown : Text;
    sharpeRatio : Text;
    timestamp : Int;
  };

  public type PlatformMetric = {
    totalSignals : Nat;
    activeSignals : Nat;
    triggeredSignals : Nat;
    winningSignals : Nat;
    losingSignals : Nat;
    overallWinRate : Text;
    accuracy : Text;
  };

  public type StrategyWeight = Nat; // 0-100
  public type SignalThreshold = Nat;

  public type AlertPreference = {
    enableWebNotifications : Bool;
    minimumConfidenceForAlert : Nat;
  };

  public type SignalFeedback = {
    outcome : TradeOutcome;
    actualEntry : Text;
    actualExit : Text;
    notes : Text;
    timestamp : Int;
    submittedBy : Principal;
  };

  public type AlertType = {
    #signal;
    #priceTarget;
    #risk;
  };

  public type Alert = {
    content : Text;
    alertType : AlertType;
    recipient : Principal;
    timestamp : Int;
    triggeredSignalId : ?SignalId;
    isRead : Bool;
  };

  public type NewsArticle = {
    title : Text;
    content : Text;
    source : Text;
    timestamp : Int;
    impact : {
      #high;
      #medium;
      #low;
    };
  };

  public type TradeReview = {
    id : Nat;
    reviewer : Principal;
    tradeSignalId : SignalId;
    feedback : Text;
    timestamp : Int;
    score : Nat;
  };

  public type Notification = {
    id : Nat;
    content : Text;
    recipient : Principal;
    createdAt : Int;
    read : Bool;
    notificationType : {
      #signal;
      #priceTarget;
      #risk;
      #news;
      #performance;
    };
  };

  public type NotificationConfig = {
    editBy : Principal;
    user : Principal;
    notificationType : {
      #signal;
      #priceTarget;
      #risk;
      #news;
    };
    method : {
      #web;
      #email;
      #push;
      #sms;
      #inApp;
    };
    frequency : {
      #immediate;
      #daily;
      #weekly;
      #monthly;
    };
    isActive : Bool;
  };

  public type PerformanceRecord = {
    id : Nat;
    user : Principal;
    strategyName : Text;
    signalType : SignalType;
    subsequentPerformance : Text;
    actualReturn : Text;
    timestamp : Int;
  };

  public type Stats = {
    signalCount : Nat;
    activeUsers : Nat;
    avgConfidenceScore : Nat;
    totalVolume : Text;
  };

  public type TradingPerformance = {
    id : Nat;
    symbol : Text;
    entryPrice : Text;
    exitPrice : Text;
    profitLoss : Text;
    points : Nat;
    capital : Nat;
    returnPercentage : Text;
    positionSize : Nat;
    riskRewardRatio : Text;
    duration : Nat;
    stopLossHit : Bool;
    timestamp : Int;
    finalCapital : Nat;
    recordedBy : Principal;
  };

  ////////////////////////////
  // ACTOR STATE
  ////////////////////////////
  var nextSignalId = 0;
  var nextReviewId = 0;
  var nextPerformanceId = 0;
  var nextNotificationId = 0;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let riskSettings = Map.empty<Principal, RiskSettings>();
  let tradeSignals = Map.empty<Nat, TradeSignal>();
  let strategyAnalyses = Map.empty<Nat, StrategyAnalysis>();
  let userWatchlists = Map.empty<Principal, List.List<Text>>();
  let feedbacks = Map.empty<Nat, List.List<SignalFeedback>>();
  let backtestResults = Map.empty<Nat, List.List<BacktestResult>>();
  let platformMetrics = Map.empty<Int, PlatformMetric>();
  let strategyWeights = Map.empty<Text, Nat>();
  let signalThresholds = Map.empty<Text, Nat>();
  let userAlertPreferences = Map.empty<Principal, AlertPreference>();
  let userPreferences = Map.empty<Principal, AlertPreference>();
  let alerts = Map.empty<Principal, List.List<Alert>>();
  let adminPanel = Map.empty<Principal, Text>();
  var platformId = 0;
  let newsArticles = Map.empty<Principal, List.List<NewsArticle>>();
  let tradeReviews = Map.empty<Principal, List.List<TradeReview>>();
  let userNotifications = Map.empty<Principal, List.List<Notification>>();
  let notificationConfigs = Map.empty<Principal, NotificationConfig>();
  let userStats = Map.empty<Principal, Stats>();
  let testimonials = Map.empty<Principal, Text>();
  let tradingPerformances = Map.empty<Nat, TradingPerformance>();

  ////////////////////////////
  // MODULES & UTILITIES
  ////////////////////////////

  module TradeSignal {
    public func compare(tradeSignal1 : TradeSignal, tradeSignal2 : TradeSignal) : Order.Order {
      Nat.compare(tradeSignal1.positionSize, tradeSignal2.positionSize);
    };
  };

  func getWatchlistInternal(user : Principal) : List.List<Text> {
    switch (userWatchlists.get(user)) {
      case (null) { List.empty<Text>() };
      case (?items) { items };
    };
  };

  module AlertPreference {
    public func compare(pref1 : AlertPreference, pref2 : AlertPreference) : Order.Order {
      Nat.compare(pref1.minimumConfidenceForAlert, pref2.minimumConfidenceForAlert);
    };
  };

  module RiskSettings {
    public func compare(risk1 : RiskSettings, risk2 : RiskSettings) : Order.Order {
      Nat.compare(risk1.capitalAmount, risk2.capitalAmount);
    };
  };

  // Access control setup
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  ////////////////////////////
  // USER PROFILE MANAGEMENT
  ////////////////////////////

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  ////////////////////////////
  // SIGNAL MANAGEMENT
  ////////////////////////////

  public shared ({ caller }) func createTradeSignal(signal : TradeSignal) : async SignalId {
    // Authorization: Only users and admins can create trade signals
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create trade signals");
    };
    let signalId = nextSignalId;
    nextSignalId += 1;
    let signalWithOwner = {
      signal with createdBy = caller;
    };
    tradeSignals.add(signalId, signalWithOwner);
    signalId;
  };

  public query ({ caller }) func getTradeSignal(signalId : SignalId) : async ?TradeSignal {
    // Public read access - anyone can view signals
    tradeSignals.get(signalId);
  };

  public shared ({ caller }) func updateSignalStatus_(signalId : SignalId, signalStatus : SignalStatus) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update signal status");
    };
    let res = tradeSignals.get(signalId);
    switch (res) {
      case (null) { Runtime.trap("TradeSignal with id " # signalId.toText() # " does not exist") };
      case (?signal) {
        // Verify ownership or admin
        if (signal.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own signals");
        };
        let updated = { signal with signalStatus };
        tradeSignals.add(signalId, updated);
      };
    };
  };

  public shared ({ caller }) func deleteTradeSignal(signalId : SignalId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete trade signals");
    };
    switch (tradeSignals.get(signalId)) {
      case (null) {
        Runtime.trap("TradeSignal with id " # signalId.toText() # " does not exist");
      };
      case (?signal) {
        // Verify ownership or admin
        if (signal.createdBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only delete your own signals");
        };
        tradeSignals.remove(signalId);
      };
    };
  };

  public shared ({ caller }) func calculateMaxLotSize(capitalAmount : Nat, riskPercentage : Nat, lotSizePerRisk : Nat) : async Nat {
    // Utility function - requires user authentication
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can calculate lot sizes");
    };
    let riskAmount = capitalAmount * riskPercentage / 100;
    let maxLots = riskAmount / lotSizePerRisk;
    maxLots;
  };

  public query ({ caller }) func getSignalsByStatus(signalStatus : SignalStatus) : async [TradeSignal] {
    // Public read access
    let signals = List.empty<TradeSignal>();
    for ((_, signal) in tradeSignals.entries()) {
      if (signal.signalStatus == signalStatus) { signals.add(signal) };
    };
    signals.toArray().sort();
  };

  ////////////////////////////
  // STRATEGY ANALYSIS
  ////////////////////////////

  public shared ({ caller }) func analyzeStrategy(strategyAnalysis : StrategyAnalysis) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add strategy analysis");
    };
    let newId = nextSignalId;
    strategyAnalyses.add(newId, strategyAnalysis);
  };

  public query ({ caller }) func checkAgreement(strategies : [StrategyAnalysis]) : async Bool {
    // Public utility function
    for (strategy in strategies.values()) {
      if (not strategy.agreement) { return false };
    };
    true;
  };

  ////////////////////////////
  // WATCHLIST OPERATIONS
  ////////////////////////////

  public shared ({ caller }) func addToWatchlist(symbol : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can manage watchlists");
    };
    let user = caller;
    let oldEntries = switch (userWatchlists.get(user)) {
      case (null) { List.empty<Text>() };
      case (?list) { list };
    };
    let newList = List.empty<Text>();
    let temp = symbol # Time.now().toText();
    newList.add(temp);
    for (item in oldEntries.values()) { newList.add(item) };
    userWatchlists.add(user, newList);
  };

  public shared ({ caller }) func removeFromWatchlistProcess(symbol : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can manage watchlists");
    };
    let remaining = getWatchlistInternal(caller).filter(func(i) { i != symbol });
    userWatchlists.add(caller, remaining);
  };

  public query ({ caller }) func getWatchlist() : async [Text] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view watchlists");
    };
    getWatchlistInternal(caller).toArray();
  };

  public query ({ caller }) func isPatternPresent(text : Text, pattern : Text) : async Bool {
    let textSize = text.size();
    let patternSize = pattern.size();
    if (patternSize > textSize) {
      return false;
    };

    let textChars = text.toArray();
    let patternChars = pattern.toArray();

    for (i in Nat.range(0, textSize - patternSize + 1)) {
      var match = true;
      for (j in Nat.range(0, patternSize)) {
        if (textChars[i + j] != patternChars[j]) {
          match := false;
          break;
        };
      };
      if (match) { return true };
    };
    false;
  };

  ////////////////////////////
  // RISK MANAGEMENT
  ////////////////////////////

  public shared ({ caller }) func setRiskSettings(settings : RiskSettings) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update risk settings");
    };
    riskSettings.add(caller, settings);
  };

  public query ({ caller }) func getRiskSettings() : async RiskSettings {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view risk settings");
    };
    switch (riskSettings.get(caller)) {
      case (null) { Runtime.trap("RiskSettings does not exist") };
      case (?settings) { settings };
    };
  };

  public query ({ caller }) func getMarketRisk(riskLevel : Nat) : async Text {
    // Public utility function
    if (riskLevel >= 80) {
      "HIGH RISK! Market conditions are highly volatile. Trade with extreme caution or wait for safer setups.";
    } else if (riskLevel >= 50) {
      "MODERATE RISK. Conditions require selective trades with decreased position sizes for proper risk management.";
    } else {
      "LOW RISK. Market is stable, providing higher quality trading opportunities.";
    };
  };

  public shared ({ caller }) func updateRiskProfile(settings : RiskSettings) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update risk profiles");
    };
    riskSettings.add(caller, settings);
  };

  ////////////////////////////
  // PERFORMANCE TRACKING
  ////////////////////////////

  public shared ({ caller }) func recordPerformance(performance : TradingPerformance) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can record performance");
    };
    let newId = nextSignalId;
    let performanceWithOwner = {
      performance with recordedBy = caller;
    };
    tradingPerformances.add(newId, performanceWithOwner);
  };

  public query ({ caller }) func getOverallPerformance() : async [TradingPerformance] {
    // Public read access for overall performance
    let performanceList = List.empty<TradingPerformance>();
    for ((_, performance) in tradingPerformances.entries()) {
      performanceList.add(performance);
    };
    performanceList.toArray();
  };

  ////////////////////////////
  // ALERTS & NOTIFICATIONS
  ////////////////////////////

  public shared ({ caller }) func setAlertPreference(preference : AlertPreference) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update alert preferences");
    };
    userAlertPreferences.add(caller, preference);
  };

  public query ({ caller }) func getAlertPreference() : async AlertPreference {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view alert preferences");
    };
    switch (userAlertPreferences.get(caller)) {
      case (null) { Runtime.trap("Alert preferences not found!") };
      case (?preference) { preference };
    };
  };

  public shared ({ caller }) func setNotificationConfig(notificationConfig : NotificationConfig) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update notification config");
    };
    notificationConfigs.add(caller, notificationConfig);
  };

  public shared ({ caller }) func sendTradeNotification(symbol : Text, price : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can send notifications");
    };
    let content = "Price Alert for " # symbol # ": " # price.toText();
    let notification = {
      content;
      alertType = #priceTarget;
      recipient = caller;
      timestamp = Time.now();
      triggeredSignalId = null;
      isRead = false;
    };
    let oldEntries = switch (alerts.get(caller)) {
      case (null) { List.empty<Alert>() };
      case (?entries) { entries };
    };
    let newEntries = List.empty<Alert>();
    newEntries.add(notification);
    for (oldEntry in oldEntries.values()) {
      newEntries.add(oldEntry);
    };
    alerts.add(caller, newEntries);
  };

  ////////////////////////////
  // FEEDBACK
  ////////////////////////////

  public shared ({ caller }) func recordFeedback(signalId : SignalId, signalFeedback : SignalFeedback) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can record feedback");
    };
    let feedbackWithOwner = {
      signalFeedback with submittedBy = caller;
    };
    let oldEntries = switch (feedbacks.get(signalId)) {
      case (null) { List.empty<SignalFeedback>() };
      case (?list) { list };
    };
    let newEntries = List.empty<SignalFeedback>();
    newEntries.add(feedbackWithOwner);
    for (oldEntry in oldEntries.values()) {
      newEntries.add(oldEntry);
    };
    feedbacks.add(signalId, newEntries);
  };

  public query ({ caller }) func getFeedback(signalId : SignalId) : async [SignalFeedback] {
    // Public read access for feedback
    let feedbackList = switch (feedbacks.get(signalId)) {
      case (null) { List.empty<SignalFeedback>() };
      case (?entries) { entries };
    };
    feedbackList.toArray();
  };

  public shared ({ caller }) func updateFeedback(signalId : SignalId, signalFeedback : SignalFeedback) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update feedback");
    };
    let feedbackWithOwner = {
      signalFeedback with submittedBy = caller;
    };
    let entries = switch (feedbacks.get(signalId)) {
      case (null) { List.empty<SignalFeedback>() };
      case (?oldEntries) { oldEntries };
    };
    entries.add(feedbackWithOwner);
    feedbacks.add(signalId, entries);
  };

  public shared ({ caller }) func addBacktestResult(backtestResult : BacktestResult) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add backtest results");
    };
    let newId = nextSignalId;
    let backtestList = switch (backtestResults.get(newId)) {
      case (null) { List.empty<BacktestResult>() };
      case (?list) { list };
    };
    backtestList.add(backtestResult);
    backtestResults.add(newId, backtestList);
  };

  ////////////////////////////
  // ADMIN PANEL
  ////////////////////////////

  public shared ({ caller }) func setStrategyWeight(strategyName : Text, weight : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can set strategy weights");
    };
    strategyWeights.add(strategyName, weight);
  };

  public query ({ caller }) func getStrategyWeight(strategyName : Text) : async ?Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view strategy weights");
    };
    strategyWeights.get(strategyName);
  };

  public query ({ caller }) func getAllStrategyWeights() : async [(Text, Nat)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view strategy weights");
    };
    strategyWeights.entries().toArray();
  };

  public shared ({ caller }) func setSignalThreshold(thresholdName : Text, value : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can set signal thresholds");
    };
    signalThresholds.add(thresholdName, value);
  };

  public query ({ caller }) func getSignalThreshold(thresholdName : Text) : async ?Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view signal thresholds");
    };
    signalThresholds.get(thresholdName);
  };

  public query ({ caller }) func getAllSignalThresholds() : async [(Text, Nat)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view signal thresholds");
    };
    signalThresholds.entries().toArray();
  };

  public query ({ caller }) func getSystemStats() : async {
    totalUsers : Nat;
    totalSignals : Nat;
    activeSignals : Nat;
  } {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can view system stats");
    };
    let totalUsers = userProfiles.size();
    let totalSignals = tradeSignals.size();
    var activeSignals = 0;
    for ((_, signal) in tradeSignals.entries()) {
      switch (signal.signalStatus) {
        case (#active) { activeSignals += 1 };
        case (_) {};
      };
    };
    {
      totalUsers;
      totalSignals;
      activeSignals;
    };
  };

  ////////////////////////////
  // PLATFORM METRICS
  ////////////////////////////

  public shared ({ caller }) func updatePlatformMetrics(metrics : PlatformMetric) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can update platform metrics");
    };
    platformMetrics.add(Time.now(), metrics);
  };

  public query ({ caller }) func getPlatformMetrics() : async ?PlatformMetric {
    // Public read access for platform metrics
    let entries = platformMetrics.entries().toArray();
    if (entries.size() == 0) {
      return null;
    };
    let sorted = entries.sort(func(a : (Int, PlatformMetric), b : (Int, PlatformMetric)) : Order.Order {
      Int.compare(b.0, a.0);
    });
    ?sorted[0].1;
  };
};
