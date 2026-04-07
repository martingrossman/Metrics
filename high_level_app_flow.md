```mermaid
flowchart TD

  subgraph Inputs
    A1[Theme toggle]
    A2[Preset buttons]
    A3[Custom data upload/reset]
    A4[Desktop sliders and percent inputs]
    A5[Mobile sliders and percent inputs]
    A6[Linked/direct toggle]
    A7[Resize]
  end

  subgraph Event_Handlers
    B1[cycleTheme]
    B2[applyPreset]
    B3[loadCustomData / resetCustomData]
    B4[applyTPRValue / applyFPRValue]
    B5[applyThresholdValue / applyBalanceValue]
    B6[runGuardedRenderUpdate]
    B7[syncManualRatesFromThreshold when leaving linked mode]
  end

  subgraph State_Updates
    C1[state.mu_neg / std_neg / mu_pos / std_pos]
    C2[state.N / bal / threshold]
    C3[state.manual_tpr / manual_fpr]
    C4[state.linkedMode]
    C5[state.customData / customCounts]
    C6[activePresetKey / theme / UI sync state]
  end

  subgraph Mode_Logic
    D1{customData loaded?}
    D2[Custom-data mode<br/>rates from threshold over empirical data]
    D3{linkedMode?}
    D4[Linked mode<br/>TPR/FPR derived from threshold + distributions]
    D5[Direct mode<br/>manual TPR/FPR used directly]
    D6[getActiveRates]
    D7[getDatasetStats]
    D8[updateModeUI<br/>locks/unlocks controls<br/>syncs desktop/mobile toggles]
  end

  subgraph Render
    E1[render]
    E2[updateValueDisplays]
    E3[sync desktop/mobile controls]
    E4[updateControlSummaries]
    E5[updateMobileSummary]
    E6[syncMobileDockOffset]
  end

  subgraph Charts_and_Displays
    F1[renderDistPlot]
    F2[renderTopView]
    F3[renderROCPlot]
    F4[renderCM]
    F5[renderMetrics<br/>includes generateROC + computeAUC]
    F6[renderMosaic]
  end

  A1 --> B1
  A2 --> B2
  A3 --> B3
  A4 --> B4
  A4 --> B5
  A4 --> B6
  A5 --> B4
  A5 --> B5
  A5 --> B6
  A6 --> B7
  A6 --> B6
  A7 --> E1

  B1 --> C6
  B2 --> C1
  B2 --> C2
  B2 --> C3
  B2 --> C4
  B2 --> C5
  B2 --> C6
  B3 --> C4
  B3 --> C5
  B3 --> C2
  B3 --> C3
  B4 --> C2
  B4 --> C3
  B5 --> C2
  B6 --> C1
  B6 --> C2
  B6 --> C3
  B7 --> C3
  B7 --> C4

  C1 --> D6
  C2 --> D6
  C3 --> D6
  C4 --> D3
  C5 --> D1
  C1 --> D7
  C2 --> D7
  C5 --> D7
  C4 --> D8
  C5 --> D8

  D1 -->|Yes| D2
  D1 -->|No| D3
  D3 -->|Yes| D4
  D3 -->|No| D5
  D2 --> D6
  D4 --> D6
  D5 --> D6
  D6 --> E1
  D7 --> E1
  D8 --> E1

  E1 --> E2
  E1 --> E3
  E1 --> E4
  E1 --> E5
  E1 --> E6
  E1 --> F1
  E1 --> F2
  E1 --> F3
  E1 --> F4
  E1 --> F5
  E1 --> F6