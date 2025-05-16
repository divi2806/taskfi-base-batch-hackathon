
export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`;
};

export const formatTokenAmount = (amount: number): string => {
  return amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

export const calculateInsightValue = (tokens: number): number => {
  // Simple conversion rate: 1 token = $5 of insight value
  return tokens * 5;
};

export const calculateLevel = (xp: number): number => {
  // Simple level calculation: Each level requires progressively more XP
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

export const calculateLevelProgress = (xp: number): number => {
  // Calculate progress to the next level (0-100%)
  const currentLevel = calculateLevel(xp);
  const currentLevelMinXP = Math.pow(currentLevel - 1, 2) * 100;
  const nextLevelMinXP = Math.pow(currentLevel, 2) * 100;
  return ((xp - currentLevelMinXP) / (nextLevelMinXP - currentLevelMinXP)) * 100;
};

export const getRandomToken = (length = 8): string => {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
};

export const getUserStage = (level: number): "Spark" | "Glow" | "Blaze" | "Nova" | "Orbit" => {
  if (level <= 3) return "Spark";
  if (level <= 7) return "Glow";
  if (level <= 12) return "Blaze";
  if (level <= 18) return "Nova";
  return "Orbit";
};

export const getStageColor = (stage: string): string => {
  switch (stage) {
    case "Spark": return "text-blue-400";
    case "Glow": return "text-green-400";
    case "Blaze": return "text-orange-400";
    case "Nova": return "text-purple-400";
    case "Orbit": return "text-yellow-400";
    default: return "text-gray-400";
  }
};

export const getStageEmoji = (stage: string): string => {
  switch (stage) {
    case "Spark": return "✨";
    case "Glow": return "🌟";
    case "Blaze": return "🔥";
    case "Nova": return "💫";
    case "Orbit": return "🌌";
    default: return "⭐";
  }
};
