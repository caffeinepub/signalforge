# SignalForge — F&O Trading Signal Platform

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Full-stack AI-powered F&O trading signal platform on ICP (Motoko backend + React frontend)
- Multi-strategy confluence signal engine with 7 analysis methodologies
- Trade signal output with entry, SL, T1/T2/T3, RRR, confidence score, reasoning
- Cross-validation engine (minimum 3-4 strategy alignment required)
- No Trade Zone filter for unclear market conditions
- Clean trading dashboard with tabbed signal sections
- TradingView widget integration for charts
- Color-coded signals (Buy=Green, Sell=Red, Neutral=Yellow, No Trade=Gray)
- Watchlist management per user
- Backtesting module with performance metrics
- Risk management settings (lot size, capital)
- Admin panel for strategy weightage and signal thresholds
- Alert system via web push notifications
- AI/ML performance tracking (win rate, accuracy, feedback loop simulation)
- Authorization (login/roles: user, admin)
- HTTP outcalls for market data and news feeds

### Modify
N/A — new project

### Remove
N/A — new project

## Implementation Plan

### Backend (Motoko)
1. Authorization integration (user/admin roles)
2. Signal store: CRUD for generated trade signals
   - Fields: symbol, signalType (BUY/SELL/NO_TRADE), entryPrice, sl, t1/t2/t3, rrr, tradeType, confidenceScore, strategies[], reasoningBreakdown, timestamp, status
3. Signal engine logic:
   - Per-strategy confidence scoring (ChartPattern, SMC, ICT, CBT, News, TechIndicators, OptionsData)
   - Confluence validator: requires >=3 strategies aligned, no major conflicts
   - No Trade Zone logic: marks signal as NO_TRADE when confluence < 3 or conflict detected
4. Watchlist store: user-specific symbol watchlists
5. Risk settings store: per-user lot size, capital, risk %
6. Backtesting records store: historical signal performance
7. Performance metrics: win rate, loss rate, total signals, accuracy
8. Admin functions: update strategy weights, set confidence thresholds
9. HTTP outcalls: fetch mock market data and news sentiment (simulated external API)

### Frontend (React + Tailwind)
1. Auth screens (login/register)
2. Main Dashboard:
   - Header with market indices ticker
   - Left sidebar: watchlist + navigation
   - Main area: tabbed signal sections
     - All High-Confidence Signals (combined)
     - Chart Pattern Signals
     - SMC Signals
     - ICT Signals
     - News-Based Signals
     - No Trade Zone
3. Signal card component: full details with color coding and strategy breakdown
4. TradingView widget embedded for chart analysis
5. Backtesting page with metrics visualization
6. Risk Management settings page
7. Admin Panel (admin role only): weights config, threshold sliders, system stats
8. Web push notification UI for alerts
9. Performance tracker: win rate gauge, accuracy charts
