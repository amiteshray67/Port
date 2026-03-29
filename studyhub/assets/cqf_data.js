// ── STUDY PLAN DATA ────────────────────────────────────────────────────
const SP = [
  {week:'Week 1',label:'Pre-Course — Math Foundations',days:[
    {day:'Mon',task:'<strong>Calculus Primer:</strong> Read lecture, work through chain rule, integration, Taylor series.',res:[{t:'📄 Lecture',c:'pdf',p:'pre',l:'p1'},{t:'📝 Exercises',c:'ex',p:'pre',l:'p1'},{t:'✅ Solutions',c:'sol',p:'pre',l:'p1'}]},
    {day:'Tue',task:'<strong>Linear Algebra:</strong> Matrix multiplication, covariance matrices, eigenvalues.',res:[{t:'📄 Lecture',c:'pdf',p:'pre',l:'p2'},{t:'📝 Exercises',c:'ex',p:'pre',l:'p2'},{t:'✅ Solutions',c:'sol',p:'pre',l:'p2'}]},
    {day:'Wed',task:'<strong>Probability & Statistics:</strong> Normal distribution, conditional expectation, law of total expectation.',res:[{t:'📄 Lecture',c:'pdf',p:'pre',l:'p3'},{t:'📝 Exercises',c:'ex',p:'pre',l:'p3'},{t:'✅ Solutions',c:'sol',p:'pre',l:'p3'}]},
    {day:'Thu',task:'<strong>Differential Equations:</strong> ODEs, PDEs, heat equation. Understand separation of variables.',res:[{t:'📄 Lecture',c:'pdf',p:'pre',l:'p4'},{t:'📝 Exercises',c:'ex',p:'pre',l:'p4'},{t:'✅ Solutions',c:'sol',p:'pre',l:'p4'}]},
    {day:'Fri',task:'<strong>Pre-Module Test:</strong> Attempt self-test. Identifies weak areas before starting M1.',res:[{t:'📄 Test',c:'pdf',p:'pre',l:'p5'}]},
    {day:'Sat',task:'Consolidate. Redo weakest topic exercises without notes. Write key formulas from memory.'},
  ]},
  {week:'Week 2',label:'Module 1 — Stochastic Calculus',days:[
    {day:'Mon',task:'<strong>M1 L1:</strong> GBM, Wiener process, log-returns. Understand dS=μSdt+σSdW and its solution.',res:[{t:'📄 Annotated',c:'pdf',p:'m1',l:'m1l1'},{t:'📝 Exercises',c:'ex',p:'m1',l:'m1l1'}]},
    {day:'Tue',task:'<strong>M1 L2:</strong> Fokker-Planck, transition density, heat equation connection.',res:[{t:'📄 Annotated',c:'pdf',p:'m1',l:'m1l2'},{t:'📝 Exercises',c:'ex',p:'m1',l:'m1l2'},{t:'✅ Solutions',c:'sol',p:'m1',l:'m1l2'}]},
    {day:'Wed',task:'<strong>M1 L3-L4:</strong> Ito\'s Lemma. Derive d(ln S) under GBM. Practice (dW)²=dt rule.',res:[{t:'📄 L3',c:'pdf',p:'m1',l:'m1l3'},{t:'📄 L4',c:'pdf',p:'m1',l:'m1l4'},{t:'📝 Exercises L3',c:'ex',p:'m1',l:'m1l3'}]},
    {day:'Thu',task:'<strong>M1 L5-L6:</strong> Products and strategies. Binomial model: derive p* from no-arbitrage.',res:[{t:'📄 L5',c:'pdf',p:'m1',l:'m1l5'},{t:'📄 L6',c:'pdf',p:'m1',l:'m1l6'},{t:'📝 Exercises',c:'ex',p:'m1',l:'m1l6'}]},
    {day:'Fri',task:'<strong>M1 L7-L8:</strong> Martingale theory. Girsanov. Change of measure. Market price of risk θ=(μ-r)/σ.',res:[{t:'📄 L7',c:'pdf',p:'m1',l:'m1l7'},{t:'📄 L8',c:'pdf',p:'m1',l:'m1l8'},{t:'📝 Exercises',c:'ex',p:'m1',l:'m1l7'}]},
    {day:'Sat',task:'<strong>M1 L9 Workshop + Exam:</strong> Attempt all workshop problems. Try past M1 exam.',res:[{t:'📄 Workshop',c:'pdf',p:'m1',l:'m1l9'},{t:'📄 Exam',c:'pdf',p:'m1',l:'m1ex'}]},
  ]},
  {week:'Week 3',label:'Module 2 — Risk & Portfolio Theory',days:[
    {day:'Mon',task:'<strong>M2 L1-L2:</strong> Markowitz mean-variance, efficient frontier, Lagrangian optimisation.',res:[{t:'📄 L1',c:'pdf',p:'m2',l:'m2l1'},{t:'📄 L2',c:'pdf',p:'m2',l:'m2l2'},{t:'📝 Exercises',c:'ex',p:'m2',l:'m2l1'}]},
    {day:'Tue',task:'<strong>M2 L3-L4:</strong> Basel III capital requirements. Risk-weighted assets. Leverage ratio.',res:[{t:'📄 L3',c:'pdf',p:'m2',l:'m2l3'},{t:'📄 L4',c:'pdf',p:'m2',l:'m2l4'}]},
    {day:'Wed',task:'<strong>M2 L5:</strong> VaR methods — historical, parametric, MC. Expected Shortfall. Compare coherence.',res:[{t:'📄 Lecture',c:'pdf',p:'m2',l:'m2l5'},{t:'📝 VaR Exercises',c:'ex',p:'m2',l:'m2l5'},{t:'✅ Solutions',c:'sol',p:'m2',l:'m2l5'}]},
    {day:'Thu',task:'<strong>M2 L6:</strong> Stylised facts of returns. Why fat tails and vol clustering matter.',res:[{t:'📄 Lecture',c:'pdf',p:'m2',l:'m2l6'}]},
    {day:'Fri',task:'<strong>M2 L7:</strong> GARCH(1,1). Fit by hand: understand ω, α, β. Compute long-run variance.',res:[{t:'📄 Lecture',c:'pdf',p:'m2',l:'m2l7'}]},
    {day:'Sat',task:'<strong>M2 Exam:</strong> Attempt Module 2 assignment under timed conditions. Check against solution.',res:[{t:'📄 Exam',c:'pdf',p:'m2',l:'m2ex'},{t:'✅ Solution',c:'sol',p:'m2',l:'m2ex'}]},
  ]},
  {week:'Week 4',label:'Module 3 — Black-Scholes',days:[
    {day:'Mon',task:'<strong>M3 L1:</strong> BS derivation — delta hedge argument → BS PDE. Memorise the formula.',res:[{t:'📄 Annotated',c:'pdf',p:'m3',l:'m3l1'},{t:'📝 Exercises',c:'ex',p:'m3',l:'m3l1'},{t:'✅ Solutions',c:'sol',p:'m3',l:'m3l1'}]},
    {day:'Tue',task:'<strong>M3 L2-L3:</strong> Martingale pricing, Feynman-Kac. When to use PDE vs expectation approach.',res:[{t:'📄 L2',c:'pdf',p:'m3',l:'m3l2'},{t:'📄 L3',c:'pdf',p:'m3',l:'m3l3'}]},
    {day:'Wed',task:'<strong>M3 L4:</strong> Implied vol, vol surface, skew. Dupire local vol formula.',res:[{t:'📄 Annotated',c:'pdf',p:'m3',l:'m3l4'},{t:'📝 Exercises',c:'ex',p:'m3',l:'m3l4'}]},
    {day:'Thu',task:'<strong>M3 L9:</strong> Greeks — derive Delta=N(d₁), Gamma, Vega, Theta. BS PDE = Theta-Gamma identity.',res:[{t:'📄 Annotated',c:'pdf',p:'m3',l:'m3l9'}]},
    {day:'Fri',task:'Price a European call manually using BS formula. Verify via put-call parity. Calculate all Greeks.',res:[]},
    {day:'Sat',task:'M3 Mini Quiz in this app. Target 70%+.',res:[]},
  ]},
  {week:'Week 5',label:'Module 3 — Exotics & Numerics',days:[
    {day:'Mon',task:'<strong>M3 L5:</strong> Finite difference methods. Set up explicit scheme on a grid by hand.',res:[{t:'📄 Annotated',c:'pdf',p:'m3',l:'m3l5'}]},
    {day:'Tue',task:'<strong>M3 L6:</strong> Exotics — barrier, asian, lookback, digital. Understand each payoff.',res:[{t:'📄 Annotated',c:'pdf',p:'m3',l:'m3l6'}]},
    {day:'Wed',task:'<strong>M3 L7:</strong> Monte Carlo. Simulate GBM paths. Price European call. Antithetic variates.',res:[{t:'📄 Annotated',c:'pdf',p:'m3',l:'m3l7'}]},
    {day:'Thu',task:'<strong>M3 L10-L11:</strong> Market-based vol modelling. Advanced vol (Heston overview).',res:[{t:'📄 L10',c:'pdf',p:'m3',l:'m3l10'},{t:'📄 L11',c:'pdf',p:'m3',l:'m3l11'}]},
    {day:'Fri',task:'<strong>M3 Workshop + Exam:</strong> Work all L12 workshop problems. Attempt Module 3 assignment.',res:[{t:'📄 Workshop',c:'pdf',p:'m3',l:'m3l12'},{t:'📄 Exam',c:'pdf',p:'m3',l:'m3ex'},{t:'✅ Solution',c:'sol',p:'m3',l:'m3ex'}]},
    {day:'Sat',task:'Full Module 3 Mock Exam in app. Review weakest Greeks/exotics concepts.',res:[]},
  ]},
  {week:'Week 6',label:'Module 4 — Fixed Income & Rates',days:[
    {day:'Mon',task:'<strong>M4 L1:</strong> Bond pricing, duration, convexity. Price a bond, compute D* by hand.',res:[{t:'📄 Annotated',c:'pdf',p:'m4',l:'m4l1'},{t:'📝 Exercises',c:'ex',p:'m4',l:'m4l1'},{t:'✅ Solutions',c:'sol',p:'m4',l:'m4l1'}]},
    {day:'Tue',task:'<strong>M4 L2:</strong> Vasicek and CIR. Derive affine bond price structure. Feller condition for CIR.',res:[{t:'📄 Lecture',c:'pdf',p:'m4',l:'m4l2'},{t:'📝 Exercises',c:'ex',p:'m4',l:'m4l2'}]},
    {day:'Wed',task:'<strong>M4 L3-L4:</strong> Calibration. Probabilistic methods. Forward measure and T-forward pricing.',res:[{t:'📄 L3',c:'pdf',p:'m4',l:'m4l3'},{t:'📄 L4',c:'pdf',p:'m4',l:'m4l4'}]},
    {day:'Thu',task:'<strong>M4 L5:</strong> HJM framework. Drift restriction. Show Ho-Lee is a special case.',res:[{t:'📄 Lecture',c:'pdf',p:'m4',l:'m4l5'},{t:'📝 Exercises',c:'ex',p:'m4',l:'m4l5'}]},
    {day:'Fri',task:'<strong>M4 L7-L8:</strong> SABR model. LMM structure. Why LMM replaced Black\'s cap model.',res:[{t:'📄 SABR',c:'pdf',p:'m4',l:'m4l7'},{t:'📄 LMM',c:'pdf',p:'m4',l:'m4l8'}]},
    {day:'Sat',task:'<strong>M4 Exam:</strong> Attempt Module 4 exam. Focus on duration, Vasicek, HJM questions.',res:[{t:'📄 Exam',c:'pdf',p:'m4',l:'m4ex'},{t:'✅ Solution',c:'sol',p:'m4',l:'m4ex'}]},
  ]},
  {week:'Week 7',label:'Module 5 — Credit Risk',days:[
    {day:'Mon',task:'<strong>M5 L1:</strong> Merton model — equity as call on firm assets. Distance-to-Default.',res:[{t:'📄 Whiteboard',c:'pdf',p:'m5',l:'m5l1'}]},
    {day:'Tue',task:'<strong>M5 L2:</strong> CDS mechanics and bootstrapping. Hazard rates from CDS spreads.',res:[{t:'📄 CDS Notes',c:'pdf',p:'m5',l:'m5l2'},{t:'📄 Hazard Rates',c:'ex',p:'m5',l:'m5l2'}]},
    {day:'Wed',task:'<strong>M5 L3:</strong> Intensity/reduced-form models. Poisson default arrival. Survival probability.',res:[{t:'📄 Annotated',c:'pdf',p:'m5',l:'m5l3'}]},
    {day:'Thu',task:'<strong>M5 L4-L5:</strong> CVA, DVA, FVA. Expected exposure. Discounted PD. Full xVA framework.',res:[{t:'📄 xVA Theory',c:'pdf',p:'m5',l:'m5l4'},{t:'📄 xVA Impl.',c:'pdf',p:'m5',l:'m5l5'}]},
    {day:'Fri',task:'<strong>M5 L6-L7:</strong> CDOs, Gaussian copula, tranche pricing, correlation sensitivity.',res:[{t:'📄 CDOs',c:'pdf',p:'m5',l:'m5l6'},{t:'📝 Exercises',c:'ex',p:'m5',l:'m5l6'},{t:'📄 Correlation',c:'pdf',p:'m5',l:'m5l7'}]},
    {day:'Sat',task:'<strong>M5 Exam:</strong> CDS bootstrapping assignment. Work through it step by step.',res:[{t:'📄 Exam',c:'pdf',p:'m5',l:'m5ex'},{t:'✅ Solution',c:'sol',p:'m5',l:'m5ex'}]},
  ]},
  {week:'Week 8',label:'Revision & Full Mock Exams',days:[
    {day:'Mon',task:'Full Mock — M1 & M2 in this app under timed conditions. Note all wrong answers.',res:[]},
    {day:'Tue',task:'Full Mock — M3 & M4. Review Black-Scholes, Greeks, duration, Vasicek.',res:[]},
    {day:'Wed',task:'Full Mock — M5. Credit risk questions. Practice CVA calculation from scratch.',res:[]},
    {day:'Thu',task:'<strong>Formula Revision:</strong> Write every formula in the cheat sheet from memory. Check accuracy.',res:[]},
    {day:'Fri',task:'<strong>Module 6 Electives:</strong> Heston model, Black-Litterman, variance swaps.',res:[{t:'📄 Adv Portfolio',c:'pdf',p:'m6',l:'m6l1'},{t:'📄 Adv Vol',c:'pdf',p:'m6',l:'m6l2'}]},
    {day:'Sat',task:'Final review. Any remaining gaps. Re-read annotated PDFs for weakest module.',res:[]},
  ]},
];

// ── QUIZ DATA ──────────────────────────────────────────────────────────
const QD = {
  m1:[
    {q:'What is the Ito correction term ½b²∂²f/∂S² and why does it exist?',opts:['A drift adjustment for dividends','Second-order correction because (dW)²=dt ≠ 0','A risk-premium for holding the asset','The Fokker-Planck forcing term'],ans:1,exp:'In ordinary calculus (dx)²→0 and second-order terms vanish. In stochastic calculus, (dW)²=dt is finite and non-negligible — this forces us to keep the second-order Taylor term, giving rise to the Ito correction. Without it, all of stochastic calculus collapses to ordinary calculus.'},
    {q:'Under the risk-neutral measure Q, what is the drift of the stock price S?',opts:['μ (the real-world drift)','Zero','r (the risk-free rate)','σ (the volatility)'],ans:2,exp:'Girsanov\'s theorem changes the drift from μ to r by absorbing the market price of risk θ=(μ-r)/σ into the Brownian motion. Under Q, all assets grow at the risk-free rate r. This is the entire basis of no-arbitrage pricing.'},
    {q:'The quadratic variation of W(t) on [0,T] is:',opts:['T²','0','T','σ²T'],ans:2,exp:'[W,W]_T = T. Brownian motion accumulates quadratic variation at exactly rate 1 per unit time. This is the mathematical statement of (dW)²=dt. It is what makes Brownian motion "rough" and different from smooth differentiable paths.'},
    {q:'In the CRR binomial model, the risk-neutral probability p* equals:',opts:['(e^{rΔt}-d)/(u-d)','(u-e^{rΔt})/(u-d)','(μΔt-d)/(u-d)','1/2 always'],ans:0,exp:'p*=(e^{rΔt}-d)/(u-d) is chosen so that E^Q[S_{t+Δt}]=S_t·e^{rΔt} — the discounted stock is a martingale under Q. This is the discrete analog of changing the measure from P to Q.'},
    {q:'Girsanov\'s theorem says W̃_t = W_t + θt is a Q-Brownian motion. What is θ?',opts:['The Sharpe ratio (μ-r)/σ','The volatility σ','The interest rate r','The risk-neutral drift'],ans:0,exp:'θ=(μ-r)/σ is the market price of risk — how much excess return the market offers per unit of risk. Girsanov uses this to reweight probabilities: under Q, W̃ is standard BM, removing the drift from the SDE and replacing it with r.'},
  ],
  m2:[
    {q:'Why does diversification reduce portfolio variance below the weighted average of individual variances?',opts:['By concentrating in low-variance assets','Because off-diagonal covariance terms can be negative or zero','Because we weight by 1/N','Because longer horizon reduces variance'],ans:1,exp:'σ²_p=wᵀΣw includes cross-terms 2wᵢwⱼCov(Rᵢ,Rⱼ). When ρᵢⱼ<1 (especially negative), these cross-terms reduce total variance below the weighted average. With ρ=1 (perfect correlation), there is zero diversification benefit.'},
    {q:'For a portfolio with μ=0, σ=$1M, what is the 99% 1-day parametric VaR?',opts:['$1.0M','$1.65M','$2.33M','$3.0M'],ans:2,exp:'VaR_{99%} = 0 + 2.326×$1M ≈ $2.33M. The z-score for 1% tail is 2.326. For 95% it\'s 1.645. Memorise these. Note: this assumes normality — actual VaR will be higher due to fat tails.'},
    {q:'GARCH(1,1) has ω=0.00001, α=0.09, β=0.90. What is the long-run daily variance?',opts:['0.00001','0.001','0.0001','0.01'],ans:1,exp:'σ̄²=ω/(1-α-β)=0.00001/(1-0.09-0.90)=0.00001/0.01=0.001. Long-run vol=√0.001≈3.16% per day. Note α+β=0.99 means very high persistence — shocks take a very long time to decay.'},
    {q:'Which property does Expected Shortfall (CVaR) satisfy that VaR does not?',opts:['Positive homogeneity','Sub-additivity (diversification always reduces risk)','Translation invariance','Monotonicity'],ans:1,exp:'VaR fails sub-additivity: VaR(A+B) can exceed VaR(A)+VaR(B), meaning VaR perversely penalises diversification. ES satisfies all four coherence axioms. This is why Basel IV moved to ES as the regulatory risk measure.'},
    {q:'If you double a portfolio\'s size (same weights), what happens to the Sharpe ratio?',opts:['Doubles','Halves','Unchanged','Depends on correlation'],ans:2,exp:'Sharpe=(E[R]-r_f)/σ. Doubling size scales both numerator and denominator proportionally, leaving the ratio unchanged. Sharpe ratio is scale-invariant — it measures risk-adjusted return per unit of risk, independent of position size.'},
  ],
  m3:[
    {q:'In the Black-Scholes formula C=SN(d₁)-Ke^{-rT}N(d₂), what does N(d₂) represent?',opts:['The call\'s delta','The risk-neutral probability that S_T > K','The real-world exercise probability','The vega of the option'],ans:1,exp:'N(d₂)=P^Q(S_T>K) — risk-neutral probability of the call finishing in-the-money. The term Ke^{-rT}N(d₂) is the discounted expected strike payment. N(d₁) is the call\'s delta and equals the exercise probability under the stock numeraire (different measure).'},
    {q:'Gamma is highest for a European call when:',opts:['The option is deep in-the-money','Near expiry and at-the-money','The option is deep out-of-the-money','When interest rates are high'],ans:1,exp:'Γ=N\'(d₁)/(Sσ√T). Near expiry (√T→0), gamma spikes sharply for ATM options — a tiny price move flips the option from worthless to valuable. For deep ITM/OTM options, delta is relatively flat, so gamma is near zero.'},
    {q:'A long straddle profits when:',opts:['Stock stays near the strike','Stock makes a large move either direction','Volatility decreases','Time passes quickly'],ans:1,exp:'Long straddle = long call + long put at same K,T. Cost = C+P. Profit if |S_T-K| > C+P. It\'s a pure volatility bet — you need large moves to overcome the combined premium. You\'re long gamma and long vega, paying theta daily.'},
    {q:'The Crank-Nicolson finite difference scheme is preferred over explicit because:',opts:['It\'s faster','It\'s unconditionally stable and second-order accurate in both Δt and ΔS','It requires no matrix inversion','It always gives exact BS prices'],ans:1,exp:'Explicit scheme (forward Euler) is conditionally stable only: requires Δt < (ΔS)²/σ²S² (Courant condition). Crank-Nicolson averages explicit and implicit → unconditionally stable + 2nd-order accuracy in both dimensions. Trade-off: solves a tridiagonal system at each time step.'},
    {q:'From the BS PDE rearranged: Θ + ½σ²S²Γ + rSΔ - rV = 0. What does this tell us?',opts:['Theta and gamma are always equal','A delta-hedged position earns risk-free rate; long gamma costs theta','The PDE only holds at expiry','Theta is always negative for short options'],ans:1,exp:'Rearranging: Θ = -½σ²S²Γ - rSΔ + rV. For a delta-hedged portfolio, the second and third terms cancel after applying dΠ=rΠ dt. The key message: long gamma (Γ>0) means you pay theta (Θ<0). This is the fundamental options tradeoff — convexity costs time value.'},
  ],
  m4:[
    {q:'What is the HJM drift restriction and why must it hold?',opts:['It sets forward rates equal to the short rate','No-arbitrage condition: the drift of f(t,T) is fully determined by its vol structure','It ensures mean reversion of rates','It calibrates the model to cap prices'],ans:1,exp:'μ(t,T)=σ(t,T)·∫ₜᵀσ(t,s)ds. This is the no-arbitrage condition for forward rates: once you specify the vol structure σ(t,T), the drift is completely determined. You have no freedom to choose the drift independently — any other drift would create arbitrage.'},
    {q:'In Vasicek dr=κ(θ-r)dt+σdW, what is the long-run expected rate?',opts:['r₀ (today\'s rate)','κ','θ','σ/κ'],ans:2,exp:'E[r(t)]=θ+(r₀-θ)e^{-κt}→θ as t→∞. The process mean-reverts to θ at speed κ. If κ is large, rates snap back to θ quickly. If r₀=θ, the rate stays there in expectation. θ is the unconditional mean of the short rate.'},
    {q:'Why do practitioners prefer Hull-White over Vasicek?',opts:['Hull-White prevents negative rates','Hull-White\'s time-varying θ(t) fits the initial yield curve exactly','Hull-White is simpler to implement','Hull-White gives higher derivative prices'],ans:1,exp:'Vasicek has constant θ — it produces a model yield curve that generally doesn\'t match today\'s observed market curve. Hull-White extends this with θ(t) calibrated to fit the initial term structure exactly. For derivatives pricing, you must match the current curve — otherwise you\'re pricing against the wrong initial condition.'},
    {q:'A bond has modified duration D*=6 and price P=$100. If yield rises by 50bps (0.005), the price change is approximately:',opts:['-$30','-$3','-$0.30','−$6'],ans:1,exp:'ΔP ≈ -D*·P·Δy = -6·100·0.005 = -$3. The bond loses $3 in value. Duration is a linear approximation — for larger moves, convexity matters: ΔP ≈ -D*PΔy + ½C·P·(Δy)². Longer duration = more interest rate sensitivity.'},
    {q:'What ensures that short rates stay positive in the CIR model?',opts:['The drift term κ(θ-r)','The Feller condition: 2κθ > σ²','The square root diffusion σ√r','CIR rates are always positive by construction'],ans:1,exp:'The Feller condition 2κθ>σ² guarantees the rate can never reach zero (it reflects back). Economically: the mean-reversion pull κθ>0 at r=0 must overcome the diffusion noise. If the condition fails (2κθ≤σ²), the process can touch zero and rates can become negative.'},
  ],
  m5:[
    {q:'In Merton\'s model, why is equity analogous to a call option?',opts:['Shareholders can force the firm to buy back equity','Equity payoff = max(V-D,0): unlimited upside, minimum zero','Debt is always risk-free','The firm has a put option to default'],ans:1,exp:'At maturity T: if assets V>debt D, equity = V-D (shareholders keep surplus). If V<D, shareholders walk away (limited liability) and equity = 0. Payoff max(V-D,0) is exactly a European call on V with strike D. This enables all of Black-Scholes theory to be applied to credit risk.'},
    {q:'A 5-year CDS has a spread of 300bps. With recovery R=40%, the approximate hazard rate λ is:',opts:['3%','5%','1.8%','0.3%'],ans:1,exp:'Quick approximation: s≈λ(1-R) → λ≈s/(1-R)=0.03/0.6=5% per year. This is a first-order approximation (ignores discounting and survival probability in the denominator). A 5% annual hazard rate means ~5% probability of defaulting in any given year (for flat hazard curves).'},
    {q:'What is CVA and what drives it?',opts:['Currency Vol Adjustment — for FX derivatives','Credit Valuation Adjustment — price reduction for counterparty default risk','Capital Value Allocation — a Basel buffer','Collateral Variation Amount — daily margin'],ans:1,exp:'CVA=(1-R)·Σ DF(tᵢ)·EE(tᵢ)·PD(tᵢ). Driven by: Expected Exposure EE (how much you\'re owed if counterparty defaults), Probability of Default PD (from CDS/hazard rates), Recovery Rate R, and discount factors DF. Post-2008 mandatory capital charge for CVA changed how banks price all OTC derivatives.'},
    {q:'In a CDO, which tranche GAINS value as default correlation increases?',opts:['Equity tranche','Mezzanine tranche','Senior tranche','All tranches equally'],ans:2,exp:'Higher correlation → defaults cluster (all-or-nothing world). Senior tranche: either few defaults happen (great, senior untouched) or catastrophic defaults (already priced in). Higher correlation makes the catastrophic scenario more likely but also makes the moderate scenarios less likely — net effect benefits senior. Equity tranche loses: with high correlation, you might get wiped out entirely.'},
    {q:'What is the key modelling difference between structural and reduced-form credit models?',opts:['Structural models price bonds; reduced-form price CDS','Structural: default predictable from firm value; Reduced-form: default is a surprise Poisson arrival','Reduced-form always assumes constant hazard rates','Structural models require no market calibration'],ans:1,exp:'In Merton-style structural models, you monitor asset value V — default is predictable (in principle) when V approaches D. Under reduced-form (intensity) models, default arrives as a surprise Poisson event regardless of current information. Reduced-form is more tractable for pricing because you don\'t need unobservable firm asset values.'},
  ],
};

// ── MINDMAP ──────────────────────────────────────────────────────────────
const MM_DATA = {
  center: {label:'CQF', color:'#e3b341', r:28},
  modules: [
    {key:'pre', label:'Pre-Course', color:'#8b949e', angle:-90, topics:['Calculus','Linear Algebra','Probability','Diff. Equations']},
    {key:'m1',  label:'Module 1', color:'#58a6ff', angle:-30, topics:['GBM / Wiener','Ito\'s Lemma','PDEs','Binomial Model','Martingales','Girsanov Thm']},
    {key:'m2',  label:'Module 2', color:'#3fb950', angle:30, topics:['Markowitz','Sharpe / CAPM','VaR & CVaR','Basel III','GARCH']},
    {key:'m3',  label:'Module 3', color:'#e3b341', angle:90, topics:['Black-Scholes','The Greeks','Exotic Options','Monte Carlo','Vol Surface','Finite Diff.']},
    {key:'m4',  label:'Module 4', color:'#bc8cff', angle:150, topics:['Duration','Vasicek / CIR','Hull-White','HJM','SABR','LMM']},
    {key:'m5',  label:'Module 5', color:'#f85149', angle:210, topics:['Merton Model','CDS / Hazard λ','Intensity Models','CVA / DVA','CDOs','Copulas']},
    {key:'m6',  label:'Module 6', color:'#f0883e', angle:270, topics:['Heston Model','Var Swaps','Black-Litterman','Risk Parity','Rough Vol']},
  ]
};

// ── NOTEBOOKLM PROMPT ────────────────────────────────────────────────────
const NLM_PROMPT = `SYSTEM ROLE
You are my dedicated CQF (Certificate in Quantitative Finance) study tutor. I am a beginner working through the January 2016 CQF curriculum. I have uploaded lecture PDFs from all 6 modules. Your job is to help me deeply understand the material through structured explanations, visual summaries, practice questions, and concept maps.

HOW TO RESPOND TO MY QUESTIONS
When I ask you to explain a topic, always structure your response as:
  1. PLAIN ENGLISH SUMMARY (2-3 sentences, no jargon)
  2. THE CORE INTUITION (why does this concept exist? what problem does it solve?)
  3. THE MATHEMATICS (step-by-step derivation or formula breakdown)
  4. A WORKED EXAMPLE (numerical, with all steps shown)
  5. CONNECTIONS TO OTHER TOPICS (how does this link to what I've already learned?)
  6. COMMON EXAM TRAPS (what do students typically get wrong?)

CONCEPT SUMMARIES
When I say "summarise [topic]", produce:
- A 5-bullet-point overview of the key ideas
- The 3 most important formulas, each explained in plain English
- A simple analogy that a non-mathematician would understand
- One exam-style question with full solution

MINDMAPS
When I say "mindmap [module or topic]", generate a text-based hierarchical mindmap:
  CQF — Module X
  ├── Core Concept 1
  │   ├── Sub-idea A (formula or key fact)
  │   ├── Sub-idea B
  │   └── Link to → [other concept]
  ├── Core Concept 2
  ...

INFOGRAPHICS (text-based)
When I say "infographic [topic]", create a structured text diagram:
  ┌─────────────────────────────────────────┐
  │  TOPIC NAME                             │
  ├─────────────────────────────────────────┤
  │ What it is:  [plain English]            │
  │ Formula:     [key equation]             │
  │ Parameters:  [what each symbol means]   │
  │ Used for:    [applications]             │
  │ Analogy:     [intuitive comparison]     │
  └─────────────────────────────────────────┘

PRACTICE QUESTIONS
When I say "quiz me on [topic]", give me:
- 3 multiple-choice questions (exam style, 4 options each)
- 1 derivation question (show all working)
- 1 interpretation question (explain in words what the result means)
Always reveal answers only after I attempt them.

FORMULA DRILLS
When I say "formula drill", test me on: randomly pick 5 formulas from the module we're studying. Show me the name and context, ask me to write the formula from memory, then reveal the correct version and explain any differences.

PROGRESS TRACKING
Keep track of which topics I've said I understand (I'll say "mark [topic] as done"). At the end of each session, give me a summary of what I've covered and what still needs work.

MY CURRENT FOCUS
Start with Module 1 — Building Blocks of Quant Finance. The most important topics in order are:
  1. Geometric Brownian Motion (GBM) and its solution
  2. Ito's Lemma and the quadratic variation rules (dW)²=dt
  3. The change-of-measure technique (Girsanov's theorem)
  4. Martingales and risk-neutral pricing V(t)=e^{-r(T-t)}·E^Q[Payoff|ℱ_t]
  5. The Binomial model and its convergence to Black-Scholes

MY LEARNING STYLE
- I need intuition before mathematics. Always explain why before how.
- Use simple analogies (physics, everyday finance) to anchor abstract ideas.
- Show numerical examples with actual numbers (S=100, K=105, r=5%, σ=20%, T=1).
- Point out when something is "one of the most important results in the CQF" — I want to know what to prioritise.
- If I make a conceptual mistake, correct me gently and explain the right way to think about it.

BEGIN
Start by giving me a structured overview of Module 1 in mindmap format, then ask me which topic I'd like to dive into first.`;

