export interface Player {
  id: string;
  name: string;
  number: number;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  x?: number; // 0-100 position on tactical pitch
  y?: number; // 0-100 position on tactical pitch
  isCaptain?: boolean;
  photoUrl?: string;
}

export type TimerPeriod = '1ST' | '2ND' | 'OT1' | 'OT2' | 'PEN' | 'FT';

export interface MatchSettings {
  homeTeam: string;
  awayTeam: string;
  homeTeamShort: string;
  awayTeamShort: string;
  homeLogo: string;
  awayLogo: string;
  leagueName: string;
  location: string;
  referee: string;
  kickoffTime: string;
  competitionLogo: string;
  season: string;
  homeColor?: string;
  awayColor?: string;
}

export interface GoalEvent {
  id: string;
  team: 'home' | 'away';
  scorer: string;
  minute: number;
}

export interface ScoreboardState {
  homeScore: number;
  awayScore: number;
  goals?: GoalEvent[];
}

export interface TimerState {
  timeSeconds: number;
  isRunning: boolean;
  period: TimerPeriod;
  injuryTimeMinutes: number;
  customStatus?: string | null;
}

export interface LineupState {
  homeCoach: string;
  awayCoach: string;
  homeCoachPhotoUrl?: string;
  awayCoachPhotoUrl?: string;
  homeFormation: string;
  awayFormation: string;
  homeStartingXI: Player[];
  awayStartingXI: Player[];
  homeSubs: Player[];
  awaySubs: Player[];
  activeLineupView: 'home' | 'away' | 'vs' | null;
  rosterSize?: number;
}

export interface SubstitutionGraphic {
  team: 'home' | 'away';
  playerIn: string;
  playerOut: string;
  minute: number;
}

export interface GoalGraphic {
  team: 'home' | 'away';
  scorer: string;
  assist: string;
  minute: number;
  goalNumber: number;
}

export interface CardGraphic {
  team: 'home' | 'away';
  player: string;
  cardType: 'yellow' | 'red';
  minute: number;
}

export interface VARGraphic {
  type: 'CHECK' | 'GOAL_REVIEW' | 'PENALTY_REVIEW' | 'OFFSIDE_REVIEW' | 'DECISION_CONFIRMED';
  customMessage: string;
}

export interface LowerThirdGraphic {
  type: 'player' | 'coach' | 'commentator' | 'official' | 'custom';
  title: string;
  subtitle: string;
  animationType: 'slide-left' | 'slide-right' | 'fade' | 'reveal-3d';
}

export interface MatchStats {
  possessionHome: number; // Away is calculated as 100 - possessionHome
  shotsHome: number;
  shotsAway: number;
  shotsOnTargetHome: number;
  shotsOnTargetAway: number;
  cornersHome: number;
  cornersAway: number;
  foulsHome: number;
  foulsAway: number;
  yellowCardsHome: number;
  yellowCardsAway: number;
  redCardsHome: number;
  redCardsAway: number;
  xGHome: number;
  xGAway: number;
  activeStatsView: boolean;
}

export interface PenaltyShootoutState {
  active: boolean;
  homeAttempts: ('goal' | 'miss' | null)[];
  awayAttempts: ('goal' | 'miss' | null)[];
  winner: 'home' | 'away' | null;
}

export interface SponsorGraphic {
  type: 'banner' | 'logo-rotation' | 'card' | 'video' | null;
  logoUrl: string;
  sponsorName: string;
  promoText: string;
}

export interface SocialGraphic {
  platform: 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'custom' | null;
  handle: string;
  promoText: string;
}

export interface BroadcastState {
  settings: MatchSettings;
  scoreboard: ScoreboardState;
  timer: TimerState;
  lineups: LineupState;
  stats: MatchStats;
  penaltyShootout: PenaltyShootoutState;
  
  // Overlay graphics triggers
  activeSubstitution: SubstitutionGraphic | null;
  activeGoal: GoalGraphic | null;
  activeCard: CardGraphic | null;
  activeVAR: VARGraphic | null;
  activeLowerThird: LowerThirdGraphic | null;
  activeSponsor: SponsorGraphic | null;
  activeSocial: SocialGraphic | null;
  
  // Global control triggers
  activeReplay: boolean;
  hideAllGraphics: boolean;
  hideScoreboard?: boolean;
  hideClassicScoreboard?: boolean;
  hideWorldcupScoreboard?: boolean;
  hideTimer?: boolean;
  scoreboardStyle?: 'classic' | 'worldcup';
  classicSponsorText?: string;
  classicSponsorVisible?: boolean;
  classicRoundText?: string;
  classicRoundVisible?: boolean;
  activeWinnerAnnounce?: {
    winner: 'home' | 'away' | 'draw' | null;
    customTitle?: string;
  } | null;
  activeWelcome?: boolean;
  activeTicker?: {
    active: boolean;
    text: string;
    speed?: 'slow' | 'medium' | 'fast';
    theme?: 'classic' | 'breaking' | 'sponsor';
  } | null;
  updatedAt?: number;
  replayTriggeredAt?: number;
}

// Socket communication protocol
export type BroadcastEvent =
  | { type: 'STATE_UPDATE'; state: BroadcastState }
  | { type: 'TRIGGER_REPLAY' }
  | { type: 'CLEAR_OVERLAYS' };
