import {
  PositionBias,
  SignalStatus,
  SignalType,
  type TradeSignal,
  TradeType,
  Variant_futures_stock_options,
} from "../backend.d";

export interface DemoSignalInput {
  symbol: string;
  basePrice: number;
  contractType: Variant_futures_stock_options;
}

const STRATEGY_NAMES = [
  "ChartPattern",
  "SMC",
  "ICT",
  "CBT",
  "NewsSentiment",
  "TechnicalIndicators",
  "OptionsData",
];

const STRATEGY_COLORS: Record<string, string> = {
  ChartPattern: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  SMC: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  ICT: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
  CBT: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  NewsSentiment: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  TechnicalIndicators: "text-pink-400 bg-pink-400/10 border-pink-400/20",
  OptionsData: "text-orange-400 bg-orange-400/10 border-orange-400/20",
};

export { STRATEGY_NAMES, STRATEGY_COLORS };

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function fmtPrice(price: number): string {
  return price.toFixed(2);
}

export function generateDemoSignals(): Omit<
  TradeSignal,
  "createdBy" | "timestamp"
>[] {
  const instruments: DemoSignalInput[] = [
    {
      symbol: "NIFTY50",
      basePrice: 22347.5,
      contractType: Variant_futures_stock_options.futures,
    },
    {
      symbol: "BANKNIFTY",
      basePrice: 47892.0,
      contractType: Variant_futures_stock_options.futures,
    },
    {
      symbol: "RELIANCE",
      basePrice: 2918.45,
      contractType: Variant_futures_stock_options.options,
    },
    {
      symbol: "HDFCBANK",
      basePrice: 1683.2,
      contractType: Variant_futures_stock_options.options,
    },
    {
      symbol: "TCS",
      basePrice: 3812.75,
      contractType: Variant_futures_stock_options.options,
    },
    {
      symbol: "INFY",
      basePrice: 1547.9,
      contractType: Variant_futures_stock_options.options,
    },
    {
      symbol: "SENSEX",
      basePrice: 73542.3,
      contractType: Variant_futures_stock_options.futures,
    },
    {
      symbol: "INDIAVIX",
      basePrice: 13.45,
      contractType: Variant_futures_stock_options.futures,
    },
    {
      symbol: "SBIN",
      basePrice: 812.6,
      contractType: Variant_futures_stock_options.options,
    },
    {
      symbol: "WIPRO",
      basePrice: 487.3,
      contractType: Variant_futures_stock_options.options,
    },
  ];

  const noTradeReasons = [
    "Conflicting signals: RSI overbought while SMC shows bullish Order Block. Wait for resolution.",
    "VIX elevated above 18 — avoid intraday positions during high volatility",
    "PCR near 0.85, options data shows indecision — no clear directional bias",
    "Earnings announcement in 2 days — news risk too high for technical setups",
    "Fair Value Gap not yet tested — ICT Kill Zone window not active",
    "Multiple indicators in conflict: MACD bearish while EMA 50 shows support — unclear bias",
  ];

  const signals: Omit<TradeSignal, "createdBy" | "timestamp">[] = [];

  for (const inst of instruments) {
    const rand = Math.random();
    let signalType: SignalType;
    if (rand < 0.35) signalType = SignalType.buy;
    else if (rand < 0.65) signalType = SignalType.sell;
    else signalType = SignalType.noTrade;

    if (signalType === SignalType.noTrade) {
      const confirmedCount = Math.floor(Math.random() * 2) + 1;
      const strategies = pickRandom(STRATEGY_NAMES, confirmedCount);
      const confidence = Math.floor(Math.random() * 16) + 55; // 55-70
      const noTradeReason =
        noTradeReasons[Math.floor(Math.random() * noTradeReasons.length)];

      signals.push({
        symbol: inst.symbol,
        signalType: SignalType.noTrade,
        entryPrice: fmtPrice(inst.basePrice),
        stopLoss: fmtPrice(inst.basePrice * 0.98),
        target1: fmtPrice(inst.basePrice * 1.015),
        target2: fmtPrice(inst.basePrice * 1.025),
        target3: fmtPrice(inst.basePrice * 1.04),
        riskRewardRatio: "0:0",
        rewardPotential: "0",
        tradeType: TradeType.intraday,
        confidenceScore: BigInt(confidence),
        strategiesConfirmed: strategies,
        reasoningBreakdown: `No trade zone active. ${noTradeReason}`,
        noTradeReason,
        signalStatus: SignalStatus.active,
        positionBias: PositionBias.neutral,
        contractType: inst.contractType,
        leverage: BigInt(1),
        positionSize: BigInt(0),
        riskPerTrade: BigInt(0),
      });
      continue;
    }

    const isBuy = signalType === SignalType.buy;
    const confirmedCount = Math.floor(Math.random() * 4) + 3; // 3-6
    const strategies = pickRandom(STRATEGY_NAMES, confirmedCount);
    const confidence = Math.floor(Math.random() * 25) + 72; // 72-96
    const leverage = Math.floor(Math.random() * 4) + 2; // 2-5x
    const tradeTypes = [
      TradeType.intraday,
      TradeType.swing,
      TradeType.scalping,
    ];
    const tradeType = tradeTypes[Math.floor(Math.random() * tradeTypes.length)];
    const positionBias = isBuy ? PositionBias.bullish : PositionBias.bearish;

    const entry = inst.basePrice * (1 + (Math.random() * 0.003 - 0.0015));
    const slPct = isBuy ? 1 - 0.012 : 1 + 0.012;
    const t1Pct = isBuy ? 1 + 0.018 : 1 - 0.018;
    const t2Pct = isBuy ? 1 + 0.03 : 1 - 0.03;
    const t3Pct = isBuy ? 1 + 0.045 : 1 - 0.045;

    const sl = entry * slPct;
    const t1 = entry * t1Pct;
    const t2 = entry * t2Pct;
    const t3 = entry * t3Pct;
    const risk = Math.abs(entry - sl);
    const reward = Math.abs(t1 - entry);
    const rr = (reward / risk).toFixed(1);

    const reasonings = isBuy
      ? [
          `Bullish confluence detected. ${strategies.includes("SMC") ? "SMC Order Block identified at key support zone. " : ""}${strategies.includes("ICT") ? "ICT Bullish Fair Value Gap unmitigated. " : ""}${strategies.includes("ChartPattern") ? "Ascending triangle breakout with volume confirmation. " : ""}${strategies.includes("TechnicalIndicators") ? "RSI recovering from oversold, MACD golden cross forming. " : ""}${strategies.includes("OptionsData") ? "PCR > 1.2 indicating bullish sentiment, max pain above current price. " : ""}Target T3 valid for swing traders.`,
        ]
      : [
          `Bearish confluence detected. ${strategies.includes("SMC") ? "SMC Bearish Order Block at supply zone. " : ""}${strategies.includes("ICT") ? "ICT Sell-side liquidity pool above, sweep likely. " : ""}${strategies.includes("ChartPattern") ? "Head & Shoulders pattern completed with neckline breakdown. " : ""}${strategies.includes("TechnicalIndicators") ? "RSI divergence at overbought zone, VWAP rejection. " : ""}${strategies.includes("OptionsData") ? "High call OI at resistance, IV surge suggesting distribution. " : ""}Institutional selling pressure confirmed.`,
        ];

    signals.push({
      symbol: inst.symbol,
      signalType,
      entryPrice: fmtPrice(entry),
      stopLoss: fmtPrice(sl),
      target1: fmtPrice(t1),
      target2: fmtPrice(t2),
      target3: fmtPrice(t3),
      riskRewardRatio: `1:${rr}`,
      rewardPotential: fmtPrice(reward),
      tradeType,
      confidenceScore: BigInt(confidence),
      strategiesConfirmed: strategies,
      reasoningBreakdown: reasonings[0],
      noTradeReason: undefined,
      signalStatus: SignalStatus.active,
      positionBias,
      contractType: inst.contractType,
      leverage: BigInt(leverage),
      positionSize: BigInt(Math.floor(inst.basePrice * 0.1)),
      riskPerTrade: BigInt(Math.floor(risk * 10)),
    });
  }

  return signals;
}

export function getSignalColor(type: SignalType): string {
  if (type === SignalType.buy) return "buy";
  if (type === SignalType.sell) return "sell";
  return "notrade";
}

export function getConfidenceColor(score: number): string {
  if (score >= 85) return "text-emerald-400";
  if (score >= 75) return "text-primary";
  if (score >= 65) return "text-amber-400";
  return "text-muted-foreground";
}
