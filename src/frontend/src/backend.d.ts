import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type SignalId = bigint;
export interface BacktestResult {
    totalTrades: bigint;
    endDate: bigint;
    losingTrades: bigint;
    sharpeRatio: string;
    totalROI: string;
    timestamp: bigint;
    winningTrades: bigint;
    winRate: string;
    strategyName: string;
    maxDrawdown: string;
    symbol: string;
    startDate: bigint;
}
export interface RiskSettings {
    riskRewardTarget: string;
    drawdownLimit: bigint;
    maxLotSize: bigint;
    maxOpenTrades: bigint;
    riskPercentage: bigint;
    maxDailyLoss: bigint;
    capitalAmount: bigint;
}
export interface TradingPerformance {
    id: bigint;
    duration: bigint;
    returnPercentage: string;
    finalCapital: bigint;
    profitLoss: string;
    recordedBy: Principal;
    positionSize: bigint;
    capital: bigint;
    timestamp: bigint;
    entryPrice: string;
    stopLossHit: boolean;
    exitPrice: string;
    riskRewardRatio: string;
    symbol: string;
    points: bigint;
}
export interface TradeSignal {
    leverage: bigint;
    tradeType: TradeType;
    riskPerTrade: bigint;
    reasoningBreakdown: string;
    noTradeReason?: string;
    createdBy: Principal;
    contractType: Variant_futures_stock_options;
    strategiesConfirmed: Array<StrategyName>;
    positionBias: PositionBias;
    positionSize: bigint;
    confidenceScore: bigint;
    target1: string;
    target2?: string;
    target3?: string;
    rewardPotential: string;
    stopLoss: string;
    timestamp: bigint;
    entryPrice: string;
    signalStatus: SignalStatus;
    riskRewardRatio: string;
    symbol: string;
    signalType: SignalType;
}
export interface SignalFeedback {
    submittedBy: Principal;
    actualExit: string;
    notes: string;
    timestamp: bigint;
    outcome: TradeOutcome;
    actualEntry: string;
}
export interface PlatformMetric {
    triggeredSignals: bigint;
    winningSignals: bigint;
    losingSignals: bigint;
    overallWinRate: string;
    totalSignals: bigint;
    activeSignals: bigint;
    accuracy: string;
}
export interface AlertPreference {
    minimumConfidenceForAlert: bigint;
    enableWebNotifications: boolean;
}
export interface NotificationConfig {
    method: Variant_sms_web_push_email_inApp;
    editBy: Principal;
    notificationType: Variant_news_risk_signal_priceTarget;
    user: Principal;
    isActive: boolean;
    frequency: Variant_monthly_immediate_daily_weekly;
}
export interface StrategyAnalysis {
    bias: PositionBias;
    agreement: boolean;
    details: string;
    confidence: bigint;
    strategyName: StrategyName;
}
export type StrategyName = string;
export interface UserProfile {
    verified: boolean;
    referralCode?: string;
    username: string;
    email: string;
    phoneNumber?: string;
    telegramId?: string;
}
export enum PositionBias {
    bullish = "bullish",
    bearish = "bearish",
    neutral = "neutral"
}
export enum SignalStatus {
    active = "active",
    cancelled = "cancelled",
    expired = "expired",
    triggered = "triggered"
}
export enum SignalType {
    buy = "buy",
    sell = "sell",
    noTrade = "noTrade"
}
export enum TradeOutcome {
    win = "win",
    loss = "loss",
    breakeven = "breakeven",
    noTrade = "noTrade"
}
export enum TradeType {
    scalping = "scalping",
    swing = "swing",
    intraday = "intraday"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_futures_stock_options {
    futures = "futures",
    stock = "stock",
    options = "options"
}
export enum Variant_monthly_immediate_daily_weekly {
    monthly = "monthly",
    immediate = "immediate",
    daily = "daily",
    weekly = "weekly"
}
export enum Variant_news_risk_signal_priceTarget {
    news = "news",
    risk = "risk",
    signal = "signal",
    priceTarget = "priceTarget"
}
export enum Variant_sms_web_push_email_inApp {
    sms = "sms",
    web = "web",
    push = "push",
    email = "email",
    inApp = "inApp"
}
export interface backendInterface {
    addBacktestResult(backtestResult: BacktestResult): Promise<void>;
    addToWatchlist(symbol: string): Promise<void>;
    analyzeStrategy(strategyAnalysis: StrategyAnalysis): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    calculateMaxLotSize(capitalAmount: bigint, riskPercentage: bigint, lotSizePerRisk: bigint): Promise<bigint>;
    checkAgreement(strategies: Array<StrategyAnalysis>): Promise<boolean>;
    createTradeSignal(signal: TradeSignal): Promise<SignalId>;
    deleteTradeSignal(signalId: SignalId): Promise<void>;
    getAlertPreference(): Promise<AlertPreference>;
    getAllSignalThresholds(): Promise<Array<[string, bigint]>>;
    getAllStrategyWeights(): Promise<Array<[string, bigint]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFeedback(signalId: SignalId): Promise<Array<SignalFeedback>>;
    getMarketRisk(riskLevel: bigint): Promise<string>;
    getOverallPerformance(): Promise<Array<TradingPerformance>>;
    getPlatformMetrics(): Promise<PlatformMetric | null>;
    getRiskSettings(): Promise<RiskSettings>;
    getSignalThreshold(thresholdName: string): Promise<bigint | null>;
    getSignalsByStatus(signalStatus: SignalStatus): Promise<Array<TradeSignal>>;
    getStrategyWeight(strategyName: string): Promise<bigint | null>;
    getSystemStats(): Promise<{
        totalUsers: bigint;
        totalSignals: bigint;
        activeSignals: bigint;
    }>;
    getTradeSignal(signalId: SignalId): Promise<TradeSignal | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWatchlist(): Promise<Array<string>>;
    isCallerAdmin(): Promise<boolean>;
    isPatternPresent(text: string, pattern: string): Promise<boolean>;
    recordFeedback(signalId: SignalId, signalFeedback: SignalFeedback): Promise<void>;
    recordPerformance(performance: TradingPerformance): Promise<void>;
    removeFromWatchlistProcess(symbol: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendTradeNotification(symbol: string, price: bigint): Promise<void>;
    setAlertPreference(preference: AlertPreference): Promise<void>;
    setNotificationConfig(notificationConfig: NotificationConfig): Promise<void>;
    setRiskSettings(settings: RiskSettings): Promise<void>;
    setSignalThreshold(thresholdName: string, value: bigint): Promise<void>;
    setStrategyWeight(strategyName: string, weight: bigint): Promise<void>;
    updateFeedback(signalId: SignalId, signalFeedback: SignalFeedback): Promise<void>;
    updatePlatformMetrics(metrics: PlatformMetric): Promise<void>;
    updateRiskProfile(settings: RiskSettings): Promise<void>;
    updateSignalStatus(signalId: SignalId, signalStatus: SignalStatus): Promise<void>;
}
