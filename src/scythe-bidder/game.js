import { bid } from "./moves";

const mats = [
  "Industrial",
  "Engineering",
  "Militant",
  "Patriotic",
  "Innovative",
  "Mechanical",
  "Agricultural",
];

const factions = [
  "Togawa",
  "Crimea",
  "Saxony",
  "Polania",
  "Albion",
  "Nordic",
  "Rusviet",
];

const endIf = (G, ctx) => {
  let endGame = true;
  for (const combination of G.combinations) {
    if (combination.currentHolder === "") endGame = false;
  }
  if (endGame === true) return G.combinations;
};

const checkBannedCombos = (faction, mat) =>
  (faction === "Rusviet" && mat === "Industrial") ||
  (faction === "Crimea" && mat === "Patriotic");

/*
  orderCombos() takes in an array of faction/player mat combinations
  and returns them in  the order in which they will play. 
  The player mat with the lowest starting priority (represented 
  here by their index in the 'mats' array) goes first, then the 
  other combinations follow in clockwise order determined by the 
  placement of their faction on the board relative to
  the first player.
*/

const orderCombos = (combinations) => {
  const matToIdx = {};
  mats.forEach((mat, idx) => {
    matToIdx[mat] = idx;
  });
  const firstCombo = combinations.reduce((firstSoFar, currentCombo) => {
    if (
      firstSoFar === null ||
      matToIdx[currentCombo.mat] < matToIdx[firstSoFar.mat]
    ) {
      return currentCombo;
    }
    return firstSoFar;
  }, null);

  // Find the index of the faction that will go first
  const startingIdx = factions.findIndex(
    (faction) => faction === firstCombo.faction
  );

  const combosByFaction = {};
  combinations.forEach((combo) => {
    combosByFaction[combo.faction] = combo;
  });

  // Iterate through factions starting with the one that goes first,
  // adding any combinations that are in play to the result
  const orderedCombos = [];
  for (let i = 0; i < factions.length; i++) {
    const currentFaction = factions[(startingIdx + i) % factions.length];
    if (combosByFaction[currentFaction]) {
      orderedCombos.push(combosByFaction[currentFaction]);
    }
  }
  return orderedCombos;
};

const setup = (ctx) => {
  let gameCombinations = [];
  let randomizedMats = ctx.random.Shuffle(mats);
  let randomizedFactions = ctx.random.Shuffle(factions);
  for (let j = 0; j < ctx.numPlayers; j++) {
    const mat = randomizedMats[j];
    const faction = randomizedFactions[j];
    if (j < 6) {
      if (checkBannedCombos(faction, mat)) {
        const temp = randomizedMats[j];
        randomizedMats[j] = randomizedMats[j + 1];
        randomizedMats[j + 1] = temp;
        j = j - 1;
      } else {
        const combination = { mat, faction, currentBid: -1, currentHolder: "" };
        gameCombinations.push(combination);
      }
    }
  }
  return {
    combinations: orderCombos(gameCombinations),
    players: {},
    endGame: false,
    gameLogger: ["Auction start!"],
  };
};

const getNextPlayer = (playerId, numPlayers) => (playerId + 1) % numPlayers;

const hasMat = (playerId, combinations, playOrder) => {
  const player = playOrder[playerId];
  for (const c of combinations) {
    if (parseInt(c.currentHolder.id) === parseInt(player)) {
      return true;
    }
  }
  return false;
};

const turn = {
  order: {
    first: (G, ctx) => 0,
    next: (G, ctx) => {
      let nextPlayerPos = getNextPlayer(ctx.playOrderPos, ctx.numPlayers);
      while (hasMat(nextPlayerPos, G.combinations, ctx.playOrder)) {
        nextPlayerPos = getNextPlayer(nextPlayerPos, ctx.numPlayers);
      }
      return nextPlayerPos;
    },
    playOrder: (G, ctx) => ctx.random.Shuffle(ctx.playOrder),
  },
};

const ScytheBidderGame = {
  name: "scythe-bidder",
  setup,
  moves: {
    bid,
  },
  endIf,
  turn,
};

export default ScytheBidderGame;
