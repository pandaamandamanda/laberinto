(() => {
  'use strict';

  const DIRECTIONS = Object.freeze({
    up: { symbol: '↑', label: 'Arriba', delta: { row: -1, col: 0 } },
    down: { symbol: '↓', label: 'Abajo', delta: { row: 1, col: 0 } },
    left: { symbol: '←', label: 'Izquierda', delta: { row: 0, col: -1 } },
    right: { symbol: '→', label: 'Derecha', delta: { row: 0, col: 1 } },
    loop3: { symbol: '↻×3', label: 'Repetir tres veces' },
  });

  const ALPHABET = Object.freeze([...'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ']);
  const SPANISH_LETTER_NAMES = Object.freeze({
    A: 'a',
    B: 'be',
    C: 'ce',
    D: 'de',
    E: 'e',
    F: 'efe',
    G: 'ge',
    H: 'hache',
    I: 'i',
    J: 'jota',
    K: 'ka',
    L: 'ele',
    M: 'eme',
    N: 'ene',
    Ñ: 'eñe',
    O: 'o',
    P: 'pe',
    Q: 'cu',
    R: 'erre',
    S: 'ese',
    T: 'te',
    U: 'u',
    V: 'uve',
    W: 'uve doble',
    X: 'equis',
    Y: 'ye',
    Z: 'zeta',
  });
  const LETTER_AUDIO_BASE_PATH = 'assets/audio';
  const LETTER_AUDIO_EXTENSION = 'mp3';
  const LETTER_AUDIO_FILENAMES = Object.freeze({
    // Use ASCII-safe filenames to avoid URL encoding issues with ñ/# in browsers and static servers.
    Ñ: 'ny.mp3',
  });
  const COLLECTED_LETTER_REPEAT_AUDIO_PATH = `${LETTER_AUDIO_BASE_PATH}/repite.${LETTER_AUDIO_EXTENSION}`;
  const COLLECTED_LETTER_CONFETTI_AUDIO_PATH = `${LETTER_AUDIO_BASE_PATH}/confeti.${LETTER_AUDIO_EXTENSION}`;
  const COLLECTED_LETTER_REPEAT_DELAY_MS = 1000;
  const COLLECTED_LETTER_POST_LETTER_DELAY_MULTIPLIER = 0.8;
  const USE_SPEECH_SYNTHESIS_FALLBACK = false;

  const LETTER_PALETTE = Object.freeze(['#8f3fc3', '#d96b1f', '#1684ba', '#459542', '#d64f94']);

  const BASIC_COMMANDS = Object.freeze(['up', 'down', 'left', 'right']);
  const COMMAND_ORDER = Object.freeze(['up', 'left', 'right', 'down', 'loop3']);
  const MIN_ITEM_ROUTE_GAP = 3;
  const RUN_DELAY_MS = 360;
  const PANDA_STAND_DELAY_MS = 130;
  const PANDA_MOVE_DELAY_MS = 340;
  const PANDA_SIT_DELAY_MS = 120;
  const TERRAIN_TYPES = Object.freeze({
    fence: { className: 'cell--fence', label: 'valla', emoji: '' },
    trees: { className: 'cell--trees', label: 'bosque', emoji: '' },
    mountain: { className: 'cell--meadow', label: 'pradera', emoji: '' },
    river: { className: 'cell--meadow', label: 'pradera', emoji: '' },
    meadow: { className: 'cell--meadow', label: 'pradera', emoji: '' },
  });

  const BOARD_MODES = Object.freeze({
    wide: { rows: 7, cols: 17, label: '17×7' },
    tall: { rows: 17, cols: 7, label: '7×17' },
  });

  const PATH_LENGTH_MIN_MULTIPLIER = 2.5;
  const PATH_LENGTH_MAX_MULTIPLIER = 2.7;

  const PLAYER_OPTIONS = Object.freeze([
    'AMANDA', 'ALLISON', 'ALMA', 'ÁLVARO', 'ANA', 'BERTA', 'CARLA', 'DIANA',
    'JON', 'JORGE', 'LIAM', 'MACARENA', 'MARCOS', 'MARIO', 'NALA', 'OLIVIA',
    'PAUL', 'SANTI', 'SERGIO', 'SOL', 'VALERIA', 'VEGA', 'ABECEDARIO',
  ]);
  const DEFAULT_PLAYER_OPTION = 'AMANDA';
  const CUSTOM_PLAYER_OPTION = '__CUSTOM_PLAYER__';
  const CUSTOM_PLAYER_LABEL = 'PERSONALIZADO';
  const CUSTOM_PLAYER_MAX_LETTERS = 15;
  const CUSTOM_PLAYER_ALLOWED_LETTERS = /[^A-ZÁÉÍÓÚÜÑ]/gu;

  const DECORATION_LIBRARY = Object.freeze({
    large: Object.freeze([
      { id: 'horse-family', file: 'horse-family.png', width: 3, height: 2, weight: 4 },
      { id: 'horse-family-right', file: 'horse-family-right.png', width: 3, height: 2, weight: 3 },
      { id: 'sheep-family', file: 'sheep-family.png', width: 3, height: 2, weight: 5 },
      { id: 'sheep-family-top', file: 'sheep-family-top.png', width: 3, height: 2, weight: 4 },
      { id: 'goat-pair', file: 'goat-pair.png', width: 2, height: 2, weight: 3 },
      { id: 'goat-family', file: 'goat-family.png', width: 2, height: 2, weight: 3 },
      { id: 'big-tree', file: 'big-tree.png', width: 2, height: 2, weight: 4 },
      { id: 'orchard', file: 'orchard.png', width: 2, height: 2, weight: 3 },
    ]),
    medium: Object.freeze([
      { id: 'hay-bales', file: 'hay-bales.png', width: 2, height: 1, weight: 4 },
      { id: 'duck-pair', file: 'duck-pair.png', width: 2, height: 1, weight: 3 },
      { id: 'fence-left', file: 'fence-left.png', width: 2, height: 1, weight: 5 },
      { id: 'fence-right', file: 'fence-right.png', width: 2, height: 1, weight: 4 },
      { id: 'tall-pine', file: 'tall-pine.png', width: 1, height: 2, weight: 5 },
      { id: 'tree-small', file: 'tree-small.png', width: 1, height: 2, weight: 4 },
      { id: 'bush-flowers', file: 'bush-flowers.png', width: 1, height: 1, weight: 4 },
    ]),
    small: Object.freeze([
      { id: 'bird-pair', file: 'bird-pair.png', width: 1, height: 1, weight: 5 },
      { id: 'bird-small', file: 'bird-small.png', width: 1, height: 1, weight: 4 },
      { id: 'chicken', file: 'chicken.png', width: 1, height: 1, weight: 3 },
      { id: 'flowers-blue', file: 'flowers-blue.png', width: 1, height: 1, weight: 6 },
      { id: 'flowers-pink', file: 'flowers-pink.png', width: 1, height: 1, weight: 6 },
      { id: 'small-bush', file: 'small-bush.png', width: 1, height: 1, weight: 4 },
      { id: 'stump', file: 'stump.png', width: 1, height: 1, weight: 3 },
    ]),
  });


  const elements = {
    board: document.querySelector('#board'),
    rowAxis: document.querySelector('#row-axis'),
    columnAxis: document.querySelector('#column-axis'),
    levelTabs: document.querySelector('#level-tabs'),
    inventory: document.querySelector('#inventory'),
    programList: document.querySelector('#program-list'),
    programCount: document.querySelector('#program-count'),
    progress: document.querySelector('#progress'),
    solutionText: document.querySelector('#solution-text'),
    status: document.querySelector('#game-status'),
    header: document.querySelector('.site-header'),
    layout: document.querySelector('.layout'),
    gamePanel: document.querySelector('.game-panel'),
    controlsPanel: document.querySelector('.controls-panel'),
    syllablePanel: document.querySelector('#syllable-panel'),
    syllableTableWrap: document.querySelector('#syllable-table-wrap'),
    boardWrap: document.querySelector('.board-wrap'),
    pathOverlay: null,
    foregroundOverlay: null,
    axisColumns: document.querySelector('.axis--columns'),
    objectiveLetters: document.querySelector('#objective-letters'),
    footerLevel: document.querySelector('#footer-level'),
    footerLevelName: document.querySelector('#footer-level-name'),
    footerLetters: document.querySelector('#footer-letters'),
    footerSteps: document.querySelector('#footer-steps'),
    footerBest: document.querySelector('#footer-best'),
    runButton: document.querySelector('#run-button'),
    undoButton: document.querySelector('#undo-button'),
    resetButton: document.querySelector('#reset-button'),
    moreCommandsButton: document.querySelector('#more-commands-button'),
    profileSelect: document.querySelector('#profile-select'),
    customPlayerForm: document.querySelector('#custom-player-form'),
    customPlayerInput: document.querySelector('#custom-player-input'),
    customPlayerButton: document.querySelector('#custom-player-button'),
  };

  let currentSelection = DEFAULT_PLAYER_OPTION;
  let customPlayerName = '';
  let levelsByMode = buildLevelsByMode();
  let state = createInitialState(0, getPreferredBoardMode());
  let layoutFitFrame = 0;
  let pandaActorElement = null;
  let boardConfettiElement = null;
  let collectedLetterOverlayElement = null;
  let successMessageOverlayElement = null;
  let activeSyllableVowel = '';
  let speechVoiceLoadPromise = null;
  let speechRequestId = 0;
  let syllableAudioContext = null;
  let syllableAudioSource = null;
  let letterAudioElement = null;
  let letterAudioCancelPlayback = null;
  const syllableAudioCache = new Map();



  function shuffleInPlace(items) {
    for (let index = items.length - 1; index > 0; index -= 1) {
      const targetIndex = Math.floor(Math.random() * (index + 1));
      [items[index], items[targetIndex]] = [items[targetIndex], items[index]];
    }

    return items;
  }

  function randomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickRandomLetters(count) {
    return shuffleInPlace([...ALPHABET])
      .slice(0, count)
      .sort((left, right) => left.localeCompare(right, 'es'));
  }

  function getRandomInteger(min, max) {
    const safeMin = Math.ceil(min);
    const safeMax = Math.floor(max);
    return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
  }

  function isInsideGrid(row, col, rows, cols) {
    return row >= 1 && row <= rows && col >= 1 && col <= cols;
  }

  function getPathNeighbors(cell, rows, cols) {
    return shuffleInPlace([
      { row: cell.row - 1, col: cell.col },
      { row: cell.row + 1, col: cell.col },
      { row: cell.row, col: cell.col - 1 },
      { row: cell.row, col: cell.col + 1 },
    ]).filter((nextCell) => isInsideGrid(nextCell.row, nextCell.col, rows, cols));
  }

  function calculatePathLengthBounds(letterCount) {
    const count = Math.max(1, Number(letterCount) || 1);
    // Strict integer bounds: path cells must be > 2.5 × letters and < 2.7 × letters.
    const minLength = Math.max(3, Math.floor(count * PATH_LENGTH_MIN_MULTIPLIER) + 1);
    const strictMaxLength = Math.ceil(count * PATH_LENGTH_MAX_MULTIPLIER) - 1;

    return {
      minLength,
      // Some counts, such as 4 letters (>10 and <10.8), have no possible integer value.
      // In that case the game keeps the shortest playable path instead of generating an invalid maze.
      maxLength: Math.max(minLength, strictMaxLength),
    };
  }

  function calculateMinimumRouteLength(letterCount) {
    return calculatePathLengthBounds(letterCount).minLength;
  }

  function getRandomGridCell(rows, cols) {
    return {
      row: randomInteger(1, rows),
      col: randomInteger(1, cols),
    };
  }

  function buildRandomPath({ rows, cols, minLength, maxLength, start = getRandomGridCell(rows, cols) }) {
    const targetLength = Math.min(rows * cols, getRandomInteger(minLength, Math.max(minLength, maxLength)));
    const route = [{ ...start }];
    const used = new Set([coordinateKey(start.row, start.col)]);
    const maxAttempts = rows * cols * 40;

    let attempts = 0;

    while (route.length < targetLength && attempts < maxAttempts) {
      attempts += 1;

      const current = route[route.length - 1];
      const candidates = getPathNeighbors(current, rows, cols)
        .filter((nextCell) => !used.has(coordinateKey(nextCell.row, nextCell.col)));

      if (candidates.length === 0) {
        if (route.length <= 1) break;

        const removed = route.pop();
        used.delete(coordinateKey(removed.row, removed.col));
        continue;
      }

      const nextCell = candidates[0];
      route.push(nextCell);
      used.add(coordinateKey(nextCell.row, nextCell.col));
    }

    return route;
  }

  function buildFallbackSnakePath(rows, cols, start = getRandomGridCell(rows, cols)) {
    const route = [];

    for (let row = 1; row <= rows; row += 1) {
      if (row % 2 === 1) {
        for (let col = 1; col <= cols; col += 1) route.push({ row, col });
      } else {
        for (let col = cols; col >= 1; col -= 1) route.push({ row, col });
      }
    }

    const startIndex = route.findIndex((cell) => cell.row === start.row && cell.col === start.col);
    if (startIndex <= 0) return route;

    const forwardRoute = route.slice(startIndex);
    const backwardRoute = route.slice(0, startIndex + 1).reverse();

    return forwardRoute.length >= backwardRoute.length ? forwardRoute : backwardRoute;
  }

  function buildValidRandomPath(rows, cols, letterCount) {
    const { minLength, maxLength } = calculatePathLengthBounds(letterCount);
    const safeMaxLength = Math.min(rows * cols, maxLength);

    for (let attempt = 0; attempt < 80; attempt += 1) {
      const route = buildRandomPath({
        rows,
        cols,
        minLength,
        maxLength: safeMaxLength,
        start: getRandomGridCell(rows, cols),
      });

      if (route.length >= minLength && route.length <= safeMaxLength) return route;
    }

    return buildFallbackSnakePath(rows, cols, getRandomGridCell(rows, cols))
      .slice(0, safeMaxLength);
  }

  function buildLetterRouteIndices(routeLength, letterCount, minGap = 1, maxGap = 4) {
    if (letterCount <= 0 || routeLength <= 2) return [];

    const lastAllowedIndex = Math.max(1, routeLength - 2);
    const indices = [];
    let cursor = getRandomInteger(1, Math.min(3, lastAllowedIndex));

    indices.push(cursor);

    for (let index = 1; index < letterCount; index += 1) {
      const lettersRemaining = letterCount - index - 1;
      const minNeededAfter = lettersRemaining * minGap;
      const maxStep = Math.min(maxGap, lastAllowedIndex - cursor - minNeededAfter);
      const safeMaxStep = Math.max(minGap, maxStep);

      cursor += getRandomInteger(minGap, safeMaxStep);
      indices.push(Math.min(cursor, lastAllowedIndex));
    }

    return indices;
  }

  function sanitizeDisplayedWord(value) {
    return String(value ?? DEFAULT_PLAYER_OPTION).trim().toLocaleUpperCase('es-ES');
  }

  function sanitizeCustomPlayerName(value) {
    return String(value ?? '')
      .normalize('NFC')
      .trim()
      .toLocaleUpperCase('es-ES')
      .replace(CUSTOM_PLAYER_ALLOWED_LETTERS, '')
      .slice(0, CUSTOM_PLAYER_MAX_LETTERS);
  }

  function isPredefinedPlayerOption(selection) {
    return PLAYER_OPTIONS.includes(sanitizeDisplayedWord(selection));
  }

  function getProfileSelectValue(selection = currentSelection) {
    return isPredefinedPlayerOption(selection) ? sanitizeDisplayedWord(selection) : CUSTOM_PLAYER_OPTION;
  }

  function normalizeSelectedLetter(letter) {
    if (letter === 'Ñ') return 'Ñ';
    return letter.normalize('NFD').replace(/[̀-ͯ]/g, '');
  }

  function getSelectedWord() {
    return sanitizeDisplayedWord(currentSelection);
  }

  function getTargetLettersForSelection(selection = currentSelection) {
    const word = sanitizeDisplayedWord(selection);

    if (word === 'ABECEDARIO') return [...ALPHABET];

    return [...word]
      .map(normalizeSelectedLetter)
      .filter((letter) => ALPHABET.includes(letter));
  }

  function getProfileLabel(selection = currentSelection) {
    return sanitizeDisplayedWord(selection);
  }

  function buildLevelsByMode() {
    return Object.freeze(Object.fromEntries(
      Object.entries(BOARD_MODES).map(([mode, config]) => [
        mode,
        Object.freeze(createGeneratedLevels({ ...config, mode, targetLetters: getTargetLettersForSelection() }).map(prepareLevel)),
      ]),
    ));
  }

  function getRandomBasicCommand(allowedCommands = BASIC_COMMANDS) {
    const availableCommands = allowedCommands.filter((command) => isBasicCommand(command));
    const commandPool = availableCommands.length > 0 ? availableCommands : BASIC_COMMANDS;
    return commandPool[randomInteger(0, commandPool.length - 1)];
  }

  function getLevelProfile(levelIndex, mode, letterCount) {
    const levelNumber = levelIndex + 1;
    const isWide = mode === 'wide';

    if (levelNumber === 1) {
      return {
        levelNumber,
        letterCount,
        allowedCommands: isWide ? ['right', 'down', 'up'] : ['down', 'right', 'left'],
        requiredDirections: isWide ? ['right', 'down', 'up'] : ['down', 'right', 'left'],
        routeLength: Math.max(12, (letterCount * 2) + 10),
        includeKey: false,
        includeLoop: false,
        extraCommands: 0,
        branchLevel: 0,
      };
    }

    if (levelNumber <= 3) {
      const allowedCommands = isWide ? ['right', 'down', 'up'] : ['down', 'right', 'left'];
      return {
        levelNumber,
        letterCount,
        allowedCommands,
        requiredDirections: allowedCommands,
        routeLength: Math.max(15, (letterCount * 2) + (levelNumber * 3)),
        includeKey: false,
        includeLoop: false,
        extraCommands: 1,
        branchLevel: 1,
      };
    }

    return {
      levelNumber,
      letterCount,
      allowedCommands: [...BASIC_COMMANDS],
      requiredDirections: [...BASIC_COMMANDS],
      routeLength: Math.max(18, (letterCount * 2) + 18 + (levelNumber * 2)),
      includeKey: levelNumber > 4,
      includeLoop: levelNumber > 4,
      extraCommands: Math.min(3, 1 + Math.floor(levelNumber / 3)),
      branchLevel: Math.min(2, Math.floor(levelNumber / 4)),
    };
  }

  function addHelpfulDistractors(
    requiredCommands,
    { includeLoop = false, allowedCommands = BASIC_COMMANDS, extraCount = null } = {},
  ) {
    const reward = [...requiredCommands];
    const normalizedExtraCount = extraCount ?? Math.max(1, Math.min(2, Math.ceil(requiredCommands.length / 4)));

    for (let index = 0; index < normalizedExtraCount; index += 1) {
      reward.push(getRandomBasicCommand(allowedCommands));
    }

    if (includeLoop && !reward.includes('loop3')) reward.push('loop3');

    return reward;
  }

  function letterItem(id, row, col, order, letter, reward) {
    return {
      id,
      row,
      col,
      type: 'letter',
      order: Number(order),
      icon: letter,
      label: '',
      name: `Letra ${letter}`,
      reward,
    };
  }

  function keyItem(id, row, col, reward) {
    return {
      id,
      row,
      col,
      type: 'key',
      icon: '🔑',
      label: '',
      name: 'Llave',
      reward,
    };
  }

  function expandRouteStops(stops) {
    const route = [];

    stops.forEach((stop, index) => {
      if (index === 0) {
        route.push({ ...stop });
        return;
      }

      const previous = route[route.length - 1];
      const rowStep = Math.sign(stop.row - previous.row);
      const colStep = Math.sign(stop.col - previous.col);
      const steps = Math.max(Math.abs(stop.row - previous.row), Math.abs(stop.col - previous.col));

      for (let stepIndex = 1; stepIndex <= steps; stepIndex += 1) {
        route.push({
          row: previous.row + (rowStep * stepIndex),
          col: previous.col + (colStep * stepIndex),
        });
      }
    });

    return route;
  }

  function findRouteIndex(route, row, col) {
    return route.findIndex((cell) => cell.row === row && cell.col === col);
  }

  function canPlaceHouseFootprintAt(row, col, rows, cols) {
    return row >= 2 && row <= rows && col >= 1 && col < cols;
  }

  function getHouseFootprintCells(home, rows, cols) {
    if (!home || !canPlaceHouseFootprintAt(home.row, home.col, rows, cols)) return [];

    return [
      { row: home.row - 1, col: home.col },
      { row: home.row - 1, col: home.col + 1 },
      { row: home.row, col: home.col },
      { row: home.row, col: home.col + 1 },
    ].filter((cell) => isInsideGrid(cell.row, cell.col, rows, cols));
  }

  function getBlockedHouseFootprintKeys(home, rows, cols) {
    const entranceKey = home ? coordinateKey(home.row, home.col) : '';

    return new Set(
      getHouseFootprintCells(home, rows, cols)
        .map((cell) => coordinateKey(cell.row, cell.col))
        .filter((key) => key !== entranceKey),
    );
  }

  function routeAvoidsBlockedHouseFootprint(route, rows, cols) {
    if (!Array.isArray(route) || route.length === 0) return false;

    const home = route[route.length - 1];
    const blockedHouseKeys = getBlockedHouseFootprintKeys(home, rows, cols);

    if (blockedHouseKeys.size === 0) return false;

    return route.every((cell, index) => (
      index === route.length - 1 || !blockedHouseKeys.has(coordinateKey(cell.row, cell.col))
    ));
  }

  function findHouseSafeRouteSlice(route, rows, cols, minimumLength, maximumLength = route?.length ?? 0) {
    if (!Array.isArray(route)) return null;

    const lastCandidateIndex = Math.min(route.length - 1, Math.max(0, maximumLength - 1));

    for (let lastIndex = lastCandidateIndex; lastIndex >= Math.max(0, minimumLength - 1); lastIndex -= 1) {
      const candidate = route.slice(0, lastIndex + 1);
      const home = candidate[candidate.length - 1];

      if (
        home
        && canPlaceHouseFootprintAt(home.row, home.col, rows, cols)
        && routeAvoidsBlockedHouseFootprint(candidate, rows, cols)
      ) {
        return candidate;
      }
    }

    return null;
  }

  function buildHouseSafeFallbackRoute(rows, cols) {
    if (rows < 4 || cols < 3) {
      return buildFallbackSnakePath(rows, cols, { row: 1, col: 1 });
    }

    const route = [];
    const appendCell = (row, col) => {
      const previous = route[route.length - 1];
      if (previous?.row === row && previous?.col === col) return;
      if (!isInsideGrid(row, col, rows, cols)) return;
      route.push({ row, col });
    };

    for (let row = 1; row <= rows - 3; row += 1) {
      if (row % 2 === 1) {
        for (let col = 1; col <= cols; col += 1) appendCell(row, col);
      } else {
        for (let col = cols; col >= 1; col -= 1) appendCell(row, col);
      }
    }

    const rowBeforeHouseTop = rows - 2;
    const houseTopRow = rows - 1;
    const homeRow = rows;
    const houseEntryCol = cols - 1;
    const approachCol = Math.max(1, houseEntryCol - 1);

    for (let col = 1; col <= approachCol; col += 1) appendCell(rowBeforeHouseTop, col);
    appendCell(houseTopRow, approachCol);
    for (let col = approachCol - 1; col >= 1; col -= 1) appendCell(houseTopRow, col);
    appendCell(homeRow, 1);
    for (let col = 2; col <= houseEntryCol; col += 1) appendCell(homeRow, col);

    return route;
  }

  function buildValidRandomPathWithHouseHome(rows, cols, letterCount) {
    const { minLength, maxLength } = calculatePathLengthBounds(letterCount);
    const safeMinLength = Math.min(rows * cols, minLength);
    const safeMaxLength = Math.min(rows * cols, maxLength);
    let fallbackRoute = null;

    for (let attempt = 0; attempt < 32; attempt += 1) {
      const route = buildRandomPath({
        rows,
        cols,
        minLength: safeMinLength,
        maxLength: safeMaxLength,
        start: getRandomGridCell(rows, cols),
      });
      const safeRoute = findHouseSafeRouteSlice(route, rows, cols, safeMinLength, safeMaxLength);
      const home = route[route.length - 1];

      if (!fallbackRoute && home && canPlaceHouseFootprintAt(home.row, home.col, rows, cols)) {
        fallbackRoute = route.slice(0, safeMaxLength);
      }
      if (safeRoute) return safeRoute;
    }

    const fallbackSnakeRoute = buildFallbackSnakePath(rows, cols, getRandomGridCell(rows, cols));
    const deterministicFallbackRoute = buildHouseSafeFallbackRoute(rows, cols);
    const safeFallbackRoute = findHouseSafeRouteSlice(fallbackSnakeRoute, rows, cols, safeMinLength, safeMaxLength)
      ?? findHouseSafeRouteSlice(deterministicFallbackRoute, rows, cols, safeMinLength, safeMaxLength)
      ?? findHouseSafeRouteSlice(fallbackRoute, rows, cols, safeMinLength, safeMaxLength);

    return safeFallbackRoute
      ?? deterministicFallbackRoute.slice(0, safeMaxLength)
      ?? fallbackRoute
      ?? buildValidRandomPath(rows, cols, letterCount);
  }

  function createReferenceLevel({ rows, cols, mode, targetLetters }) {
    const route = buildValidRandomPathWithHouseHome(rows, cols, targetLetters.length);
    const letterRouteIndices = chooseLetterRouteIndices(route.length, targetLetters.length, route.length - 2);

    const items = targetLetters.map((letter, index) => {
      const routeIndex = Math.min(letterRouteIndices[index] ?? 1, route.length - 2);
      const nextRouteIndex = Math.min(letterRouteIndices[index + 1] ?? (route.length - 1), route.length - 1);
      const position = route[routeIndex] ?? route[Math.max(1, route.length - 2)] ?? route[0];
      const requiredReward = getRouteCommands(route, routeIndex, nextRouteIndex);

      return {
        ...letterItem(
          `word-letter-${index + 1}`,
          position.row,
          position.col,
          index + 1,
          letter,
          addHelpfulDistractors(requiredReward, {
            allowedCommands: BASIC_COMMANDS,
            extraCount: index === 0 ? 0 : 1,
          }),
        ),
        solutionReward: requiredReward,
      };
    });

    const initialCommands = getRouteCommands(route, 0, letterRouteIndices[0] ?? (route.length - 1));
    const solutionCommands = [
      ...initialCommands,
      ...items.flatMap((item) => item.solutionReward),
    ];

    return {
      title: `Nivel 1: ${getProfileLabel()}`,
      letterCount: targetLetters.length,
      rows,
      cols,
      mode,
      allowedCommands: [...BASIC_COMMANDS],
      start: route[0],
      home: route[route.length - 1],
      initialCommands,
      referenceRoute: route,
      path: createMazePath(route, rows, cols, 0, calculatePathLengthBounds(targetLetters.length).maxLength),
      water: [],
      items,
      solution: solutionCommands.map((command) => DIRECTIONS[command].symbol).join(' · '),
    };
  }

  function createGeneratedLevels({ rows, cols, mode, targetLetters }) {
    const levelCount = Math.max(1, targetLetters.length);

    return Array.from({ length: levelCount }, (_, levelIndex) => {
      if (mode === 'wide' && levelIndex === 0) {
        return createReferenceLevel({ rows, cols, mode, targetLetters });
      }

      const profile = getLevelProfile(levelIndex, mode, targetLetters.length);
      const { letterCount } = profile;
      const route = buildValidRandomPathWithHouseHome(rows, cols, letterCount);
      const keyRouteIndex = profile.includeKey ? route.length - 2 : route.length - 1;
      const letterRouteIndices = chooseLetterRouteIndices(route.length, letterCount, keyRouteIndex);
      const items = targetLetters.map((letter, index) => {
        const routeIndex = letterRouteIndices[index];
        const nextRouteIndex = letterRouteIndices[index + 1] ?? keyRouteIndex;
        const position = route[Math.min(routeIndex, route.length - 2)] ?? route[route.length - 2] ?? route[0];
        const requiredReward = getRouteCommands(route, Math.min(routeIndex, route.length - 2), nextRouteIndex);

        return {
          ...letterItem(
            `n${profile.levelNumber}-letter-${index + 1}`,
            position.row,
            position.col,
            index + 1,
            letter,
            addHelpfulDistractors(requiredReward, {
              includeLoop: profile.includeLoop,
              allowedCommands: profile.allowedCommands,
              extraCount: profile.extraCommands,
            }),
          ),
          solutionReward: requiredReward,
        };
      });
      const start = route[0];
      const home = route[route.length - 1];
      let key = null;

      if (profile.includeKey) {
        const keyPosition = route[keyRouteIndex];
        const requiredKeyReward = getRouteCommands(route, keyRouteIndex, route.length - 1);
        key = {
          ...keyItem(
            `n${profile.levelNumber}-key`,
            keyPosition.row,
            keyPosition.col,
            addHelpfulDistractors(requiredKeyReward, {
              allowedCommands: profile.allowedCommands,
              extraCount: profile.extraCommands,
            }),
          ),
          solutionReward: requiredKeyReward,
        };
      }

      const firstLetterIndex = letterRouteIndices[0] ?? keyRouteIndex;
      const requiredInitialCommands = getRouteCommands(route, 0, firstLetterIndex);
      const initialCommands = addHelpfulDistractors(requiredInitialCommands, {
        allowedCommands: profile.allowedCommands,
        extraCount: profile.extraCommands,
      });
      const levelItems = key ? [...items, key] : items;
      const solutionCommands = [
        ...requiredInitialCommands,
        ...items.flatMap((item) => item.solutionReward),
        ...(key?.solutionReward ?? []),
      ];

      return {
        title: `Nivel ${profile.levelNumber}: ${getProfileLabel()}`,
        letterCount,
        rows,
        cols,
        mode,
        allowedCommands: profile.allowedCommands,
        start,
        home,
        initialCommands,
        referenceRoute: route,
        path: createMazePath(route, rows, cols, profile.branchLevel, calculatePathLengthBounds(letterCount).maxLength),
        water: [],
        items: levelItems,
        solution: solutionCommands.map((command) => DIRECTIONS[command].symbol).join(' · '),
      };
    });
  }

  function buildRandomRoute(profile, levelIndex, rows, cols) {
    const maxRouteLength = Math.max(8, (rows * cols) - 10);
    const targetLength = clamp(profile.routeLength, 6, maxRouteLength);

    for (let attempt = 0; attempt < 900; attempt += 1) {
      const route = buildRandomWalkRoute(
        rows,
        cols,
        targetLength,
        levelIndex + attempt,
        profile.allowedCommands,
      );

      if (
        route
        && route.length >= targetLength
        && routeUsesRequiredDirections(route, profile.requiredDirections)
      ) {
        return route.slice(0, targetLength);
      }
    }

    const fallbackRoute = buildConstrainedFallbackRoute(
      rows,
      cols,
      levelIndex,
      profile.allowedCommands,
      targetLength,
    );

    return fallbackRoute.slice(0, targetLength);
  }

  function getRouteStart(rows, cols, allowedCommands = BASIC_COMMANDS) {
    const canMoveUp = allowedCommands.includes('up');
    const canMoveDown = allowedCommands.includes('down');
    const canMoveLeft = allowedCommands.includes('left');
    const canMoveRight = allowedCommands.includes('right');

    let row = randomInteger(2, Math.max(2, rows - 1));
    let col = randomInteger(2, Math.max(2, cols - 1));

    if (canMoveDown && !canMoveUp) row = 2;
    if (canMoveUp && !canMoveDown) row = rows - 1;
    if (canMoveRight && !canMoveLeft) col = 2;
    if (canMoveLeft && !canMoveRight) col = cols - 1;

    return {
      row: clamp(row, 1, rows),
      col: clamp(col, 1, cols),
    };
  }

  function buildRandomWalkRoute(rows, cols, targetLength, salt, allowedCommands = BASIC_COMMANDS) {
    const routeCommands = allowedCommands.filter((command) => isBasicCommand(command));
    const commandPool = routeCommands.length > 0 ? routeCommands : BASIC_COMMANDS;
    const start = getRouteStart(rows, cols, commandPool);
    const route = [start];
    const visited = new Set([coordinateKey(start.row, start.col)]);
    const directionCounts = Object.fromEntries(commandPool.map((command) => [command, 0]));
    const centerRow = (rows + 1) / 2;
    const centerCol = (cols + 1) / 2;

    while (route.length < targetLength) {
      const current = route[route.length - 1];
      const candidates = shuffleInPlace(commandPool.map((command) => {
        const next = stepFromCommand(current.row, current.col, command);
        return { command, ...next };
      }))
        .filter((candidate) => (
          candidate.row >= 1
          && candidate.row <= rows
          && candidate.col >= 1
          && candidate.col <= cols
          && !visited.has(coordinateKey(candidate.row, candidate.col))
        ))
        .sort((left, right) => {
          const directionScore = (directionCounts[left.command] ?? 0) - (directionCounts[right.command] ?? 0);
          if (directionScore !== 0) return directionScore;

          const leftCenterDistance = Math.abs(left.row - centerRow) + Math.abs(left.col - centerCol);
          const rightCenterDistance = Math.abs(right.row - centerRow) + Math.abs(right.col - centerCol);
          return ((salt + route.length) % 2 === 0)
            ? rightCenterDistance - leftCenterDistance
            : leftCenterDistance - rightCenterDistance;
        });

      if (candidates.length === 0) return null;

      const next = candidates[Math.random() < 0.72 ? 0 : randomInteger(0, candidates.length - 1)];
      route.push({ row: next.row, col: next.col });
      visited.add(coordinateKey(next.row, next.col));
      directionCounts[next.command] = (directionCounts[next.command] ?? 0) + 1;
    }

    return route;
  }

  function buildConstrainedFallbackRoute(rows, cols, levelIndex, allowedCommands, targetLength) {
    const commandPool = allowedCommands.filter((command) => isBasicCommand(command));
    const start = getRouteStart(rows, cols, commandPool);
    const route = [start];
    const visited = new Set([coordinateKey(start.row, start.col)]);
    const directionCounts = Object.fromEntries(commandPool.map((command) => [command, 0]));

    while (route.length < targetLength) {
      const current = route[route.length - 1];
      const candidates = commandPool.map((command) => {
        const next = stepFromCommand(current.row, current.col, command);
        return { command, ...next };
      })
        .filter((candidate) => (
          candidate.row >= 1
          && candidate.row <= rows
          && candidate.col >= 1
          && candidate.col <= cols
          && !visited.has(coordinateKey(candidate.row, candidate.col))
        ))
        .sort((left, right) => (directionCounts[left.command] ?? 0) - (directionCounts[right.command] ?? 0));

      if (candidates.length === 0) break;

      const next = candidates[(route.length + levelIndex) % candidates.length];
      route.push({ row: next.row, col: next.col });
      visited.add(coordinateKey(next.row, next.col));
      directionCounts[next.command] = (directionCounts[next.command] ?? 0) + 1;
    }

    if (route.length >= Math.min(targetLength, 6)) return route;

    return buildFallbackRoute(rows, cols, levelIndex);
  }

  function buildFallbackRoute(rows, cols, levelIndex = 0) {
    const route = [];
    const visited = new Set();
    const push = (row, col) => {
      const key = coordinateKey(row, col);
      if (!visited.has(key)) {
        route.push({ row, col });
        visited.add(key);
      }
    };

    let top = 1;
    let bottom = rows;
    let left = 1;
    let right = cols;

    while (top <= bottom && left <= right) {
      for (let col = left; col <= right; col += 1) push(top, col);
      top += 1;

      for (let row = top; row <= bottom; row += 1) push(row, right);
      right -= 1;

      if (top <= bottom) {
        for (let col = right; col >= left; col -= 1) push(bottom, col);
        bottom -= 1;
      }

      if (left <= right) {
        for (let row = bottom; row >= top; row -= 1) push(row, left);
        left += 1;
      }
    }

    return levelIndex % 2 === 0 ? route : route.reverse();
  }

  function routeUsesRequiredDirections(route, requiredDirections = BASIC_COMMANDS) {
    const usedCommands = new Set();

    for (let index = 0; index < route.length - 1; index += 1) {
      usedCommands.add(getMoveCommand(route[index], route[index + 1]));
    }

    return requiredDirections.every((command) => usedCommands.has(command));
  }

  function chooseLetterRouteIndices(routeLength, letterCount, keyRouteIndex = routeLength - 2) {
    const usableRouteLength = Math.max(0, Math.min(routeLength, keyRouteIndex + 2));
    return buildLetterRouteIndices(usableRouteLength, letterCount, 1, 4);
  }

  function getRouteCommands(route, fromIndex, toIndex) {
    const commands = [];

    for (let index = fromIndex; index < toIndex; index += 1) {
      commands.push(getMoveCommand(route[index], route[index + 1]));
    }

    return commands;
  }

  function routeToSegments(route) {
    const segments = [];

    for (let index = 0; index < route.length - 1; index += 1) {
      const current = route[index];
      const next = route[index + 1];
      segments.push([
        [current.row, current.col],
        [next.row, next.col],
      ]);
    }

    return segments;
  }

  function getMoveCommand(from, to) {
    const rowDelta = to.row - from.row;
    const colDelta = to.col - from.col;

    if (rowDelta === -1 && colDelta === 0) return 'up';
    if (rowDelta === 1 && colDelta === 0) return 'down';
    if (rowDelta === 0 && colDelta === -1) return 'left';
    if (rowDelta === 0 && colDelta === 1) return 'right';

    throw new Error(`Movimiento no válido: ${from.row},${from.col} → ${to.row},${to.col}`);
  }



  function coordinateKey(row, col) {
    return `${row},${col}`;
  }

  function createPath(segments) {
    const cells = new Set();

    segments.forEach(([[startRow, startCol], [endRow, endCol]]) => {
      const rowStep = Math.sign(endRow - startRow);
      const colStep = Math.sign(endCol - startCol);
      const steps = Math.max(Math.abs(endRow - startRow), Math.abs(endCol - startCol));

      for (let index = 0; index <= steps; index += 1) {
        cells.add(coordinateKey(startRow + rowStep * index, startCol + colStep * index));
      }
    });

    return cells;
  }

  function stepFromCommand(row, col, command) {
    const delta = DIRECTIONS[command]?.delta;
    return { row: row + delta.row, col: col + delta.col };
  }

  function commandsBetweenCells(from, to) {
    const commands = [];
    if (from.row === to.row) {
      const command = to.col > from.col ? 'right' : 'left';
      for (let col = from.col; col !== to.col; col += (command === 'right' ? 1 : -1)) {
        commands.push(command);
      }
      return commands;
    }

    const command = to.row > from.row ? 'down' : 'up';
    for (let row = from.row; row !== to.row; row += (command === 'down' ? 1 : -1)) {
      commands.push(command);
    }
    return commands;
  }

  function getRouteNeighborCommands(route, index) {
    const commands = new Set();
    if (index > 0) {
      commandsBetweenCells(route[index], route[index - 1]).forEach((command) => commands.add(command));
    }
    if (index < route.length - 1) {
      commandsBetweenCells(route[index], route[index + 1]).forEach((command) => commands.add(command));
    }
    return commands;
  }

  function isGoodBranchCell(row, col, openCells, rows, cols, allowedNeighborKeys = new Set()) {
    if (row < 1 || row > rows || col < 1 || col > cols) return false;
    const key = coordinateKey(row, col);
    if (openCells.has(key)) return false;

    const touchingNeighbors = orthogonalNeighbors(row, col, rows, cols)
      .filter(([nextRow, nextCol]) => openCells.has(coordinateKey(nextRow, nextCol)));

    if (touchingNeighbors.length === 0) return true;

    return touchingNeighbors.every(([nextRow, nextCol]) => allowedNeighborKeys.has(coordinateKey(nextRow, nextCol)));
  }

  function perpendicularCommands(command) {
    return command === 'left' || command === 'right'
      ? ['up', 'down']
      : ['left', 'right'];
  }

  function tryBuildBranch(route, anchorIndex, openCells, rows, cols) {
    const anchor = route[anchorIndex];
    const blockedDirections = getRouteNeighborCommands(route, anchorIndex);
    const preferredDirections = shuffleInPlace(BASIC_COMMANDS.filter((command) => !blockedDirections.has(command)));
    const directions = preferredDirections.length > 0
      ? preferredDirections
      : shuffleInPlace([...BASIC_COMMANDS]);

    for (const startingCommand of directions) {
      const branch = [];
      let current = anchor;
      let command = startingCommand;
      let turned = false;
      const lengthTarget = randomInteger(2, 4);

      for (let stepIndex = 0; stepIndex < lengthTarget; stepIndex += 1) {
        const next = stepFromCommand(current.row, current.col, command);
        const allowedNeighbors = new Set([coordinateKey(current.row, current.col)]);

        if (!isGoodBranchCell(next.row, next.col, openCells, rows, cols, allowedNeighbors)) {
          break;
        }

        branch.push(next);
        current = next;

        if (!turned && stepIndex >= 0 && Math.random() < 0.42) {
          const turnOptions = shuffleInPlace(perpendicularCommands(command));
          const viableTurn = turnOptions.find((turnCommand) => {
            const probe = stepFromCommand(current.row, current.col, turnCommand);
            return isGoodBranchCell(
              probe.row,
              probe.col,
              openCells,
              rows,
              cols,
              new Set([coordinateKey(current.row, current.col)]),
            );
          });

          if (viableTurn) {
            command = viableTurn;
            turned = true;
          }
        }
      }

      if (branch.length >= 2) return branch;
    }

    return [];
  }

  function createMazePath(route, rows, cols, branchLevel = 1, maxOpenCells = Number.POSITIVE_INFINITY) {
    const openCells = createPath(routeToSegments(route));
    const home = Array.isArray(route) && route.length > 0 ? route[route.length - 1] : null;
    const blockedHouseKeys = getBlockedHouseFootprintKeys(home, rows, cols);

    blockedHouseKeys.forEach((key) => openCells.delete(key));

    const availableExtraCells = Math.max(0, Math.floor(maxOpenCells) - openCells.size);
    if (branchLevel <= 0 || availableExtraCells <= 0) return openCells;

    const branchRatio = branchLevel === 1 ? 0.14 : 0.32;
    const coverageLimit = branchLevel === 1 ? 0.18 : 0.5;
    const targetExtraCells = clamp(
      Math.round(route.length * branchRatio),
      branchLevel === 1 ? 2 : 5,
      Math.min(availableExtraCells, Math.max(2, Math.floor((rows * cols - route.length) * coverageLimit))),
    );
    let addedCells = 0;
    let attempts = 0;

    while (addedCells < targetExtraCells && attempts < targetExtraCells * 18) {
      const anchorIndex = randomInteger(1, Math.max(1, route.length - 3));
      const branch = tryBuildBranch(route, anchorIndex, openCells, rows, cols);
      const touchesHouseFootprint = branch.some(({ row, col }) => blockedHouseKeys.has(coordinateKey(row, col)));

      if (branch.length > 0 && !touchesHouseFootprint) {
        const cellsToAdd = branch.filter(({ row, col }) => !openCells.has(coordinateKey(row, col)));
        const remainingCells = Math.max(0, Math.floor(maxOpenCells) - openCells.size);
        if (cellsToAdd.length <= remainingCells) {
          cellsToAdd.forEach(({ row, col }) => openCells.add(coordinateKey(row, col)));
          addedCells += cellsToAdd.length;
        }
      }
      attempts += 1;
    }

    return openCells;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function orthogonalNeighbors(row, col, rows, cols) {
    return [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1],
    ].filter(([nextRow, nextCol]) => nextRow >= 1 && nextRow <= rows && nextCol >= 1 && nextCol <= cols);
  }

  function minDistanceToOpenCells(row, col, openCells, rows, cols) {
    let bestDistance = rows + cols;

    openCells.forEach((key) => {
      const [openRow, openCol] = key.split(',').map(Number);
      const distance = Math.abs(openRow - row) + Math.abs(openCol - col);
      if (distance < bestDistance) bestDistance = distance;
    });

    return bestDistance;
  }

  function buildRiverData() {
    return {
      scenicRiverCells: new Set(),
      blockedRiverCells: new Set(),
      bridgeCells: new Set(),
    };
  }

  function trimOpenCellsToPathLengthBounds(openCells, level, items) {
    const { maxLength } = calculatePathLengthBounds(level.letterCount);
    if (openCells.size <= maxLength) return;

    const protectedKeys = new Set([
      ...(level.referenceRoute ?? []).map((cell) => coordinateKey(cell.row, cell.col)),
      coordinateKey(level.start.row, level.start.col),
      coordinateKey(level.home.row, level.home.col),
      ...items.map((item) => coordinateKey(item.row, item.col)),
    ]);

    for (const key of [...openCells]) {
      if (openCells.size <= maxLength) return;
      if (!protectedKeys.has(key)) openCells.delete(key);
    }
  }

  function buildTerrainMap(rows, cols, openCells, levelIndex, riverData) {
    const blockedCells = [];
    const distanceMap = new Map();
    const pathTopByCol = new Map();

    openCells.forEach((key) => {
      const [row, col] = key.split(',').map(Number);
      const currentTop = pathTopByCol.get(col);
      if (currentTop == null || row < currentTop) pathTopByCol.set(col, row);
    });

    for (let row = 1; row <= rows; row += 1) {
      for (let col = 1; col <= cols; col += 1) {
        const key = coordinateKey(row, col);
        if (openCells.has(key)) continue;
        blockedCells.push({ row, col, key });
      }
    }

    blockedCells.forEach(({ row, col, key }) => {
      distanceMap.set(key, minDistanceToOpenCells(row, col, openCells, rows, cols));
    });

    const terrainMap = new Map();

    blockedCells.forEach(({ row, col, key }) => {
      const distanceToPath = distanceMap.get(key) ?? 0;
      const hasPathNeighbor = orthogonalNeighbors(row, col, rows, cols)
        .some(([nextRow, nextCol]) => openCells.has(coordinateKey(nextRow, nextCol)));
      const pathTopInColumn = pathTopByCol.get(col) ?? (rows + 1);

      let type = 'meadow';
      const score = stableCellScore(row, col, levelIndex + rows + cols);

      if (hasPathNeighbor || distanceToPath <= 1) {
        type = 'fence';
      } else if (score % 10 < 6 || row === rows || col === 1 || col === cols) {
        type = 'trees';
      }

      const descriptor = TERRAIN_TYPES[type];
      terrainMap.set(key, {
        ...descriptor,
        type,
      });
    });

    return terrainMap;
  }

  function prepareLevel(level, levelIndex) {
    const rows = level.rows;
    const cols = level.cols;
    const water = new Set(level.water);
    const openCells = new Set(level.path);

    const items = level.items.map((item) => {
      if (item.type !== 'letter') return item;

      const letter = String(item.icon).toUpperCase();
      return {
        ...item,
        icon: letter,
        name: `Letra ${letter}`,
      };
    });

    openCells.add(coordinateKey(level.start.row, level.start.col));
    openCells.add(coordinateKey(level.home.row, level.home.col));
    items.forEach((item) => openCells.add(coordinateKey(item.row, item.col)));
    water.forEach((cell) => openCells.delete(cell));
    trimOpenCellsToPathLengthBounds(openCells, level, items);

    const riverData = buildRiverData(rows, cols, levelIndex, openCells, water);
    const terrainMap = buildTerrainMap(rows, cols, openCells, levelIndex, riverData);

    const preparedLevel = {
      ...level,
      rows,
      cols,
      items,
      water,
      path: new Set(openCells),
      openCells,
      terrainMap,
      riverCells: riverData.blockedRiverCells,
      scenicRiverCells: riverData.scenicRiverCells,
      bridgeCells: riverData.bridgeCells,
      houseFootprintCells: new Set(
        getHouseFootprintCells(level.home, rows, cols)
          .map((cell) => coordinateKey(cell.row, cell.col)),
      ),
    };

    preparedLevel.decorations = generateBoardDecorations(preparedLevel, levelIndex);
    preparedLevel.decorationAnchors = new Map(preparedLevel.decorations.map((decoration) => [
      coordinateKey(decoration.row, decoration.col),
      decoration,
    ]));

    return Object.freeze(preparedLevel);
  }

  function buildPandaMarkup() {
    return `
      <div class="panda-character panda-character--illustrated" aria-hidden="true">
        <span class="panda-shadow"></span>
        <img class="panda-illustration" src="assets/images/panda-amanda-unisex.png" alt="" decoding="async" />
      </div>
    `;
  }

  function ensureBoardConfetti() {
    if (boardConfettiElement && boardConfettiElement.isConnected) return boardConfettiElement;

    boardConfettiElement = document.createElement('div');
    boardConfettiElement.className = 'board-confetti';
    boardConfettiElement.setAttribute('aria-hidden', 'true');

    for (let index = 0; index < 140; index += 1) {
      const piece = document.createElement('span');
      piece.style.setProperty('--x', `${((index * 7.1) + ((index % 5) * 3.7)) % 100}%`);
      piece.style.setProperty('--delay', `${(index % 28) * 0.06}s`);
      piece.style.setProperty('--duration', `${2.8 + ((index * 5) % 14) * 0.14}s`);
      piece.style.setProperty('--drift', `${((index % 2 === 0 ? 1 : -1) * (10 + (index % 9) * 5))}px`);
      piece.style.setProperty('--size', `${6 + (index % 5) * 2}px`);
      piece.style.setProperty('--color', `hsl(${(index * 29) % 360}deg 88% 60%)`);
      boardConfettiElement.append(piece);
    }

    elements.boardWrap.append(boardConfettiElement);
    return boardConfettiElement;
  }

  function renderCelebrationEffects() {
    const confetti = ensureBoardConfetti();

    if (state.celebration) {
      if (!confetti.classList.contains('is-visible')) {
        confetti.classList.remove('is-visible');
        void confetti.offsetWidth;
      }

      confetti.classList.add('is-visible');
      return;
    }

    confetti.classList.remove('is-visible');
  }

  function ensureCollectedLetterOverlay() {
    if (collectedLetterOverlayElement && collectedLetterOverlayElement.isConnected) return collectedLetterOverlayElement;

    collectedLetterOverlayElement = document.createElement('div');
    collectedLetterOverlayElement.className = 'collected-letter-overlay';
    collectedLetterOverlayElement.setAttribute('aria-hidden', 'true');
    collectedLetterOverlayElement.hidden = true;
    elements.boardWrap.append(collectedLetterOverlayElement);

    return collectedLetterOverlayElement;
  }

  function positionCollectedLetterOverlay() {
    if (!collectedLetterOverlayElement || collectedLetterOverlayElement.hidden) return;

    const boardRect = elements.board.getBoundingClientRect();
    const wrapRect = elements.boardWrap.getBoundingClientRect();
    collectedLetterOverlayElement.style.left = `${(boardRect.left - wrapRect.left) + (boardRect.width / 2)}px`;
    collectedLetterOverlayElement.style.top = `${(boardRect.top - wrapRect.top) + (boardRect.height / 2)}px`;
  }

  function showCollectedLetterOverlay(letter, requestId) {
    const overlay = ensureCollectedLetterOverlay();

    overlay.textContent = String(letter ?? '').trim().toUpperCase();
    overlay.dataset.requestId = String(requestId);
    positionCollectedLetterOverlay();
    overlay.hidden = false;
    positionCollectedLetterOverlay();
    overlay.classList.remove('is-visible');
    void overlay.offsetWidth;
    overlay.classList.add('is-visible');
  }

  function hideCollectedLetterOverlay(requestId) {
    const overlay = collectedLetterOverlayElement;
    if (!overlay || overlay.dataset.requestId !== String(requestId)) return;

    overlay.classList.remove('is-visible');
    overlay.hidden = true;
    delete overlay.dataset.requestId;
  }

  function getSuccessMessageText() {
    return `CONSEGUIDO ${getProfileLabel()}`;
  }

  function ensureSuccessMessageOverlay() {
    if (successMessageOverlayElement && successMessageOverlayElement.isConnected) return successMessageOverlayElement;

    successMessageOverlayElement = document.createElement('div');
    successMessageOverlayElement.className = 'success-message-overlay';
    successMessageOverlayElement.setAttribute('role', 'status');
    successMessageOverlayElement.setAttribute('aria-live', 'polite');
    successMessageOverlayElement.hidden = true;
    successMessageOverlayElement.textContent = getSuccessMessageText();
    elements.boardWrap.append(successMessageOverlayElement);

    return successMessageOverlayElement;
  }

  function renderSuccessMessageOverlay() {
    const overlay = ensureSuccessMessageOverlay();

    overlay.textContent = getSuccessMessageText();
    overlay.hidden = !state.hasWon;
    overlay.classList.toggle('is-visible', state.hasWon);
  }

  function ensurePandaActor() {
    if (pandaActorElement && pandaActorElement.isConnected) return pandaActorElement;

    pandaActorElement = document.createElement('div');
    pandaActorElement.className = 'panda-actor panda-actor--instant';
    pandaActorElement.innerHTML = buildPandaMarkup();

    elements.boardWrap.append(pandaActorElement);
    return pandaActorElement;
  }

  function renderPandaActor({ animate = false } = {}) {
    const actor = ensurePandaActor();
    const boardRect = elements.board.getBoundingClientRect();
    const wrapRect = elements.boardWrap.getBoundingClientRect();
    const cellWidth = boardRect.width / currentLevel().cols;
    const cellHeight = boardRect.height / currentLevel().rows;
    const left = (boardRect.left - wrapRect.left) + ((state.panda.col - 0.5) * cellWidth);
    const top = (boardRect.top - wrapRect.top) + ((state.panda.row - 0.5) * cellHeight);

    actor.classList.toggle('panda-actor--instant', !animate);
    actor.classList.toggle('is-celebrating', state.celebration);
    actor.dataset.pose = state.actorPose;
    actor.dataset.facing = state.actorFacing;
    const actorWidth = Math.min(Math.max(30, cellWidth * 0.74), cellWidth * 0.92);
    const actorHeight = Math.min(Math.max(34, cellHeight * 0.82), cellHeight * 0.92);

    actor.style.width = `${actorWidth}px`;
    actor.style.height = `${actorHeight}px`;
    actor.style.left = `${left}px`;
    actor.style.top = `${top}px`;

    renderCelebrationEffects();
    renderSuccessMessageOverlay();
  }

  function updateActorFacing(command) {
    if (command === 'left') state.actorFacing = 'left';
    if (command === 'right') state.actorFacing = 'right';
  }

  async function animatePandaMove(command, nextRow, nextCol) {
    updateActorFacing(command);
    state.actorPose = 'stand';
    renderPandaActor();
    await delay(PANDA_STAND_DELAY_MS);

    state.actorPose = 'walk';
    renderPandaActor();

    state.panda = { row: nextRow, col: nextCol };
    renderBoard();
    renderPandaActor({ animate: true });
    await delay(PANDA_MOVE_DELAY_MS);

    await collectCurrentItem();
    validateWinCondition();
    state.actorPose = state.hasWon ? 'victory' : 'sit';
    state.celebration = state.hasWon;

    renderBoard();
    renderPandaActor();
    renderInventory();
    renderStatusFooter();
    renderControls();
    renderPandaActor();
    await delay(state.hasWon ? 260 : PANDA_SIT_DELAY_MS);
  }

  function getPreferredBoardMode() {
    const viewportWidth = window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight;
    const isPortrait = viewportHeight >= viewportWidth;
    return (isPortrait && viewportWidth <= 1024) || viewportWidth <= 560 ? 'tall' : 'wide';
  }

  function availableLevels(mode = state?.boardMode ?? getPreferredBoardMode()) {
    return levelsByMode[mode] ?? levelsByMode.wide;
  }

  function syncBoardModeWithViewport() {
    const nextMode = getPreferredBoardMode();
    if (state.boardMode === nextMode) {
      document.documentElement.dataset.boardMode = nextMode;
      return false;
    }

    const levelIndex = Math.min(state.levelIndex, availableLevels(nextMode).length - 1);
    state = createInitialState(levelIndex, nextMode);
    setStatus(nextMode === 'tall' ? 'Tablero vertical 7×17 activado' : 'Tablero horizontal 17×7 activado');
    render();
    return true;
  }

  function currentLevel() {
    return availableLevels()[state.levelIndex];
  }

  function createInitialState(levelIndex, boardMode = getPreferredBoardMode()) {
    const levels = availableLevels(boardMode);
    const safeLevelIndex = Math.min(Math.max(levelIndex, 0), levels.length - 1);
    const level = levels[safeLevelIndex];

    return {
      levelIndex: safeLevelIndex,
      boardMode,
      panda: { ...level.start },
      inventory: buildInventory(level.initialCommands),
      program: [],
      collected: new Set(),
      collectedLetterIds: [],
      steps: 0,
      isRunning: false,
      hasWon: false,
      currentProgramIndex: -1,
      actorPose: 'sit',
      actorFacing: 'right',
      celebration: false,
    };
  }

  function buildInventory(commands) {
    return commands.reduce((inventory, command) => {
      inventory[command] = (inventory[command] ?? 0) + 1;
      return inventory;
    }, {});
  }

  function isBasicCommand(command) {
    return BASIC_COMMANDS.includes(command);
  }

  function expandProgramCommands(program) {
    const loopIndex = program.indexOf('loop3');

    if (loopIndex === -1) {
      return program.filter(isBasicCommand);
    }

    const beforeLoop = program.slice(0, loopIndex).filter(isBasicCommand);
    const loopBody = program.slice(loopIndex + 1).filter(isBasicCommand);
    const expandedLoopBody = [];

    for (let repeat = 0; repeat < 3; repeat += 1) {
      expandedLoopBody.push(...loopBody);
    }

    return [...beforeLoop, ...expandedLoopBody];
  }

  function getLetterItems(level = currentLevel()) {
    return level.items
      .filter((item) => item.type === 'letter')
      .sort((left, right) => left.order - right.order);
  }

  function hasCollectedAllLetters(level = currentLevel()) {
    return getLetterItems(level).every((item) => state.collected.has(item.id));
  }

  function getNextRequiredLetter(level = currentLevel()) {
    return getLetterItems(level).find((item) => !state.collected.has(item.id)) ?? null;
  }

  function isItemVisible(item) {
    if (!item) return false;
    if (state.collected.has(item.id)) return true;
    if (item.type === 'letter') return getNextRequiredLetter()?.id === item.id;
    if (item.type === 'key') return hasCollectedAllLetters();
    return true;
  }

  function getItemAt(row, col) {
    return currentLevel().items.find((item) => (
      item.row === row
      && item.col === col
      && isItemVisible(item)
    )) ?? null;
  }

  function getTerrainAt(row, col) {
    return currentLevel().terrainMap.get(coordinateKey(row, col)) ?? TERRAIN_TYPES.meadow;
  }

  function isInsideBoard(row, col) {
    const level = currentLevel();
    return row >= 1 && row <= level.rows && col >= 1 && col <= level.cols;
  }

  function isBlocked(row, col) {
    const level = currentLevel();
    const key = coordinateKey(row, col);
    return level.water.has(key) || !level.openCells.has(key);
  }

  function addCommandsToInventory(commands) {
    commands.forEach((command) => {
      state.inventory[command] = (state.inventory[command] ?? 0) + 1;
    });
  }

  function setStatus(message, type = 'default') {
    elements.status.textContent = message;
    elements.status.classList.toggle('is-success', type === 'success');
    elements.status.classList.toggle('is-error', type === 'error');
  }

  function render() {
    renderLevelTabs();
    renderAxes();
    renderBoardScene();
    renderBoard();
    renderPandaActor();
    renderInventory();
    renderProgram();
    renderObjectiveLetters();
    renderStatusFooter();
    renderSyllableTable();
    renderControls();
    renderSolution();
    requestLayoutFit();
  }

  function renderLevelTabs() {
    if (!elements.levelTabs) return;

    const fragment = document.createDocumentFragment();

    availableLevels().forEach((level, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'level-button';
      button.dataset.levelIndex = String(index);
      button.textContent = String(index + 1);
      button.setAttribute('aria-label', `${level.title}. ${level.letterCount} ${level.letterCount === 1 ? 'letra' : 'letras'}`);
      button.title = level.title;
      button.disabled = state.isRunning;
      if (index === state.levelIndex) button.classList.add('is-active');
      fragment.append(button);
    });

    elements.levelTabs.replaceChildren(fragment);
  }

  function renderAxes() {
    const level = currentLevel();
    renderAxis(elements.rowAxis, level.rows);
    renderAxis(elements.columnAxis, level.cols);

    document.documentElement.dataset.boardMode = level.mode;
    document.documentElement.style.setProperty('--board-cols', String(level.cols));
    document.documentElement.style.setProperty('--board-rows', String(level.rows));
    elements.board.setAttribute('aria-label', `Laberinto de ${level.cols} columnas por ${level.rows} filas`);
  }

  function encodeSvgDataUri(svgMarkup) {
    return `url("data:image/svg+xml,${encodeURIComponent(svgMarkup)}")`;
  }

  function stableCellScore(row, col, salt = 0) {
    return Math.abs(((row * 73856093) ^ (col * 19349663) ^ (salt * 83492791)) >>> 0);
  }

  function weightedPick(items, score) {
    const totalWeight = items.reduce((sum, item) => sum + (item.weight ?? 1), 0);
    let cursor = score % Math.max(1, totalWeight);

    for (const item of items) {
      cursor -= item.weight ?? 1;
      if (cursor < 0) return item;
    }

    return items[0];
  }

  function canUseDecorationCell(level, occupied, row, col) {
    const key = coordinateKey(row, col);
    if (level.openCells.has(key) || occupied.has(key)) return false;
    if (level.houseFootprintCells?.has(key)) return false;
    if (level.riverCells?.has(key) || level.scenicRiverCells?.has(key) || level.bridgeCells?.has(key)) return false;
    return true;
  }

  function canPlaceDecoration(level, occupied, row, col, width, height) {
    if (row + height - 1 > level.rows || col + width - 1 > level.cols) return false;

    for (let rowIndex = row; rowIndex < row + height; rowIndex += 1) {
      for (let colIndex = col; colIndex < col + width; colIndex += 1) {
        if (!canUseDecorationCell(level, occupied, rowIndex, colIndex)) return false;
      }
    }

    return true;
  }

  function reserveDecorationArea(occupied, row, col, width, height) {
    for (let rowIndex = row; rowIndex < row + height; rowIndex += 1) {
      for (let colIndex = col; colIndex < col + width; colIndex += 1) {
        occupied.add(coordinateKey(rowIndex, colIndex));
      }
    }
  }

  function generateBoardDecorations(level, levelIndex) {
    const occupied = new Set(level.houseFootprintCells ?? []);
    const placements = [];
    const area = level.rows * level.cols;

    const tierPlan = [
      { name: 'large', chance: 54, maxCount: Math.max(3, Math.floor(area / 38)) },
      { name: 'medium', chance: 52, maxCount: Math.max(6, Math.floor(area / 18)) },
      { name: 'small', chance: 62, maxCount: Math.max(10, Math.floor(area / 10)) },
    ];

    tierPlan.forEach((tier, tierIndex) => {
      let count = 0;
      const candidates = [];

      for (let row = 1; row <= level.rows; row += 1) {
        for (let col = 1; col <= level.cols; col += 1) {
          const score = stableCellScore(
            row,
            col,
            ((levelIndex + 1) * 131) + ((tierIndex + 1) * 557) + level.letterCount,
          );

          candidates.push({ row, col, score });
        }
      }

      candidates.sort((left, right) => {
        const leftScore = (left.score * 2654435761) % 9973;
        const rightScore = (right.score * 2654435761) % 9973;
        return leftScore - rightScore;
      });

      for (const { row, col, score } of candidates) {
        if (count >= tier.maxCount) break;
        if ((score % 100) >= tier.chance) continue;

        const options = DECORATION_LIBRARY[tier.name]
          .filter((option) => canPlaceDecoration(level, occupied, row, col, option.width, option.height));

        if (!options.length) continue;

        const choice = weightedPick(options, score);
        reserveDecorationArea(occupied, row, col, choice.width, choice.height);

        placements.push({
          ...choice,
          row,
          col,
          size: tier.name,
          offsetX: ((score % 7) - 3) * 0.8,
          offsetY: ((score % 5) - 2) * 0.6,
        });

        count += 1;
      }
    });

    return placements;
  }

  function svgUse(id, x, y, scale = 1, opacity = 1) {
    return `<use href="#${id}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale.toFixed(2)})" opacity="${opacity}" />`;
  }

  function buildReferenceSceneMarkup(level, cellWidth, cellHeight) {
    if (!(state.levelIndex === 0 && level.mode === 'wide' && level.cols === 17 && level.rows === 7)) return '';

    const place = (id, col, row, scale = 1, offsetX = 0, offsetY = 0, opacity = 0.97) => svgUse(
      id,
      ((col - 0.5) * cellWidth) + offsetX,
      ((row - 0.18) * cellHeight) + offsetY,
      scale,
      opacity,
    );

    return [
      place('tree', 2.2, 1.15, 0.9),
      place('bird', 4.2, 1.1, 0.68),
      place('bird', 5.0, 1.15, 0.68, 2, -2),
      place('orchard', 6.1, 1.2, 0.88),
      place('tree', 8.0, 1.35, 1.02),
      place('sheepGroup', 10.1, 1.18, 1.02),
      place('tree', 13.0, 1.42, 1.08),
      place('birdsFlying', 13.7, 1.3, 0.86),
      place('goat', 15.05, 1.95, 0.9),
      place('goat', 16.1, 1.95, 0.9),
      place('horse', 1.9, 2.55, 0.98),
      place('goat', 3.4, 2.55, 0.78),
      place('fenceSection', 4.15, 2.95, 0.88),
      place('bird', 5.7, 2.72, 0.74),
      place('tree', 8.4, 3.05, 0.98),
      place('horse', 15.0, 2.85, 0.95),
      place('horse', 16.0, 3.05, 0.92),
      place('tree', 1.05, 4.1, 0.92),
      place('hayBale', 2.0, 4.95, 0.92),
      place('goatGroup', 1.2, 4.95, 0.95, -10, 4),
      place('tree', 6.0, 4.6, 0.88),
      place('sheepGroup', 10.2, 4.55, 1.02),
      place('tree', 16.1, 4.85, 1.14),
      place('tree', 4.6, 6.0, 1.16),
      place('bird', 6.95, 5.75, 0.82),
      place('bird', 7.35, 5.95, 0.82),
      place('horse', 1.9, 6.15, 0.9),
      place('fenceSection', 1.55, 6.85, 1.02),
      place('duckPair', 2.85, 6.75, 0.98),
      place('tree', 11.2, 6.25, 0.92),
      place('stump', 11.0, 6.9, 0.76),
      place('bird', 11.45, 6.9, 0.76),
      place('houseGarden', 15.55, 6.55, 1.18),
      place('flowers', 2.2, 3.95, 0.76),
      place('flowers', 7.2, 4.05, 0.72),
      place('flowers', 12.8, 2.9, 0.7),
      place('flowers', 16.5, 3.85, 0.78),
    ].join('');
  }

  function isReferenceLevel(level = currentLevel()) {
    return Boolean(level && level.mode === 'wide' && level.rows === 7 && level.cols === 17 && state.levelIndex === 0);
  }

  function buildReferencePathMarkup(level, cellWidth, cellHeight) {
    if (!isReferenceLevel(level) || !Array.isArray(level.referenceRoute) || level.referenceRoute.length === 0) return '';

    const points = level.referenceRoute
      .map(({ row, col }) => `${((col - 0.5) * cellWidth).toFixed(1)},${((row - 0.5) * cellHeight).toFixed(1)}`)
      .join(' L ');
    const strokeWidth = (Math.min(cellWidth, cellHeight) * 0.82).toFixed(1);
    const innerWidth = (Math.min(cellWidth, cellHeight) * 0.62).toFixed(1);

    return `
      <path d="M ${points}" fill="none" stroke="rgba(156, 120, 42, 0.18)" stroke-width="${(Number(strokeWidth) + 6).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M ${points}" fill="none" stroke="#efdc8a" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M ${points}" fill="none" stroke="#fff4c2" stroke-width="${innerWidth}" stroke-linecap="round" stroke-linejoin="round" opacity="0.82" />
    `.trim();
  }

  function buildBoardPathOverlaySvg(level) {
    const cellSize = 100;
    const width = level.cols * cellSize;
    const height = level.rows * cellSize;
    const route = Array.isArray(level.referenceRoute) && level.referenceRoute.length
      ? level.referenceRoute
      : [...level.openCells].map((key) => {
        const [row, col] = key.split(',').map(Number);
        return { row, col };
      });

    if (!route.length) return '';

    const points = route
      .map(({ row, col }) => `${((col - 0.5) * cellSize).toFixed(1)},${((row - 0.5) * cellSize).toFixed(1)}`)
      .join(' L ');

    const outerWidth = (cellSize * 0.34).toFixed(1);
    const innerWidth = (cellSize * 0.22).toFixed(1);

    return `
      <svg class="path-overlay__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
        <path d="M ${points}" fill="none" stroke="rgba(105, 83, 30, 0.18)" stroke-width="${(Number(outerWidth) + 8).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M ${points}" fill="none" stroke="rgba(233, 205, 110, 0.78)" stroke-width="${outerWidth}" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M ${points}" fill="none" stroke="rgba(255, 243, 187, 0.54)" stroke-width="${innerWidth}" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    `.trim();
  }

  function renderPathOverlay() {
    if (!elements.pathOverlay) {
      elements.pathOverlay = document.createElement('div');
      elements.pathOverlay.className = 'path-overlay';
      elements.pathOverlay.setAttribute('aria-hidden', 'true');
      elements.board.append(elements.pathOverlay);
    }

    elements.pathOverlay.innerHTML = buildBoardPathOverlaySvg(currentLevel());
  }

  function buildForegroundDecorationMarkup(level) {
    if (!Array.isArray(level.decorations) || level.decorations.length === 0) return '';

    return level.decorations.map((decoration) => {
      const left = (((decoration.col - 1) / level.cols) * 100).toFixed(4);
      const top = (((decoration.row - 1) / level.rows) * 100).toFixed(4);
      const width = ((decoration.width / level.cols) * 100).toFixed(4);
      const height = ((decoration.height / level.rows) * 100).toFixed(4);

      return `
        <span
          class="foreground-decoration foreground-decoration--${decoration.size}"
          style="
            left:${left}%;
            top:${top}%;
            width:${width}%;
            height:${height}%;
            --decor-offset-x:${decoration.offsetX ?? 0}px;
            --decor-offset-y:${decoration.offsetY ?? 0}px;
            --decor-image:url('../images/decor/${decoration.file}');
          "
          aria-hidden="true"
        ></span>
      `.replace(/\s+/g, ' ').trim();
    }).join('');
  }

  function renderForegroundOverlay() {
    if (!elements.foregroundOverlay) {
      elements.foregroundOverlay = document.createElement('div');
      elements.foregroundOverlay.className = 'foreground-overlay';
      elements.foregroundOverlay.setAttribute('aria-hidden', 'true');
      elements.board.append(elements.foregroundOverlay);
    }

    elements.foregroundOverlay.innerHTML = buildForegroundDecorationMarkup(currentLevel());
  }

  function buildBoardSceneSvg(level) {
    const cellSize = 100;
    const width = level.cols * cellSize;
    const height = level.rows * cellSize;
    const cellWidth = cellSize;
    const cellHeight = cellSize;

    const decorationCells = [...level.terrainMap.entries()]
      .map(([key, terrain]) => ({ key, terrain, point: key.split(',').map(Number) }));

    const fieldLineMarkup = Array.from({ length: Math.max(7, level.rows + 3) }, (_, index) => {
      const y = ((index + 1) * height) / (Math.max(7, level.rows + 3) + 1);
      const wave = 18 + ((index % 4) * 7);
      return `<path d="M0 ${y.toFixed(1)} C ${(width * 0.22).toFixed(1)} ${(y - wave).toFixed(1)} ${(width * 0.38).toFixed(1)} ${(y + wave).toFixed(1)} ${(width * 0.58).toFixed(1)} ${(y - wave * 0.3).toFixed(1)} C ${(width * 0.76).toFixed(1)} ${(y - wave).toFixed(1)} ${(width * 0.9).toFixed(1)} ${(y + wave * 0.7).toFixed(1)} ${width} ${(y - wave * 0.2).toFixed(1)}" fill="none" stroke="#85b85c" stroke-width="3.2" opacity="0.18" />`;
    }).join('');

    const flowerMarkup = decorationCells.map(({ point: [row, col] }) => {
      const score = stableCellScore(row, col, level.letterCount + 111);
      if (score % 5 !== 0) return '';

      const x = (col - 0.18 - ((score % 3) * 0.16)) * cellWidth;
      const y = (row - 0.2 - ((score % 4) * 0.09)) * cellHeight;
      const scale = (0.62 + ((score % 4) * 0.08)).toFixed(2);
      return `<use href="#flowers" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale})" opacity="0.9" />`;
    }).join('');

    const decorationMarkup = decorationCells.map(({ terrain, point: [row, col] }, index) => {
      const score = stableCellScore(row, col, level.letterCount + (level.mode === 'tall' ? 17 : 0));
      const baseX = (col - 0.5) * cellWidth;
      const baseY = (row - 0.16) * cellHeight;
      const x = baseX + (((score % 11) - 5) * 2.2);
      const y = baseY + (((score % 9) - 4) * 1.8);
      const scale = (0.76 + ((score % 7) * 0.05)).toFixed(2);

      const pastureVariants = [
        'sheepGroup', 'goatGroup', 'horse', 'birdsGround',
        'tree', 'tree', 'tree', 'pine', 'bush', 'orchard',
      ];
      const groveVariants = [
        'tree', 'tree', 'tree', 'pine', 'orchard', 'bush',
        'sheepGroup', 'goatGroup', 'birdsGround', 'horse',
      ];
      const variants = terrain.type === 'trees' ? groveVariants : pastureVariants;
      const id = variants[(score + index) % variants.length];
      const opacity = id === 'tree' || id === 'pine' || id === 'orchard' || id === 'bush' ? 0.98 : 0.94;
      const main = `<use href="#${id}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${scale})" opacity="${opacity}" />`;

      if (score % 6 === 0) {
        const birdX = baseX + (((score % 7) - 3) * 4.5);
        const birdY = Math.max(18, baseY - cellHeight * (0.52 + ((score % 3) * 0.08)));
        return `${main}<use href="#birdsFlying" transform="translate(${birdX.toFixed(1)} ${birdY.toFixed(1)}) scale(${(0.72 + ((score % 4) * 0.06)).toFixed(2)})" opacity="0.86" />`;
      }

      if (score % 8 === 0 && id !== 'tree') {
        const treeX = baseX - 28 + (score % 13);
        const treeY = baseY + 4;
        return `${main}<use href="#tree" transform="translate(${treeX.toFixed(1)} ${treeY.toFixed(1)}) scale(0.58)" opacity="0.86" />`;
      }

      return main;
    }).join('');

    const referenceSceneMarkup = buildReferenceSceneMarkup(level, cellWidth, cellHeight);
    const referencePathMarkup = buildReferencePathMarkup(level, cellWidth, cellHeight);

    const borderGroves = Array.from({ length: Math.max(12, level.cols) }, (_, index) => {
      const x = ((index + 0.35) / Math.max(12, level.cols)) * width;
      const topScore = stableCellScore(index + 1, level.cols, level.letterCount + 37);
      const bottomScore = stableCellScore(level.rows, index + 1, level.letterCount + 53);
      const topId = topScore % 3 === 0 ? 'pine' : 'tree';
      const bottomId = bottomScore % 4 === 0 ? 'orchard' : 'tree';
      return `
        <use href="#${topId}" transform="translate(${x.toFixed(1)} ${(cellHeight * 0.78).toFixed(1)}) scale(${(0.48 + ((topScore % 5) * 0.05)).toFixed(2)})" opacity="0.86" />
        <use href="#${bottomId}" transform="translate(${x.toFixed(1)} ${(height - cellHeight * 0.12).toFixed(1)}) scale(${(0.54 + ((bottomScore % 4) * 0.06)).toFixed(2)})" opacity="0.9" />
      `.trim();
    }).join('');

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="fieldBase" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#cfe8a0" />
            <stop offset="45%" stop-color="#aad372" />
            <stop offset="100%" stop-color="#78b84d" />
          </linearGradient>
          <linearGradient id="fieldNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#b9dd84" />
            <stop offset="100%" stop-color="#69aa42" />
          </linearGradient>
          <g id="tree">
            <rect x="-4" y="17" width="8" height="17" rx="2" fill="#7b5230" />
            <circle cx="0" cy="12" r="13" fill="#4f9141" />
            <circle cx="-10" cy="18" r="11" fill="#5aa64b" />
            <circle cx="10" cy="18" r="11" fill="#43893b" />
            <circle cx="1" cy="5" r="9" fill="#66ad52" opacity="0.95" />
          </g>
          <g id="pine">
            <rect x="-3.5" y="20" width="7" height="13" rx="1.5" fill="#77512f" />
            <path d="M0 0 L-16 22 L16 22 Z" fill="#3f7f3f" />
            <path d="M0 8 L-18 31 L18 31 Z" fill="#2f7238" />
          </g>
          <g id="orchard">
            <use href="#tree" transform="translate(-13 2) scale(0.7)" />
            <use href="#tree" transform="translate(9 0) scale(0.76)" />
            <use href="#bush" transform="translate(0 14) scale(0.72)" />
          </g>
          <g id="bush">
            <circle cx="0" cy="16" r="11" fill="#6ca94d" />
            <circle cx="-10" cy="19" r="8" fill="#78b95a" />
            <circle cx="10" cy="19" r="8" fill="#5c9b43" />
          </g>
          <g id="flowers">
            <circle cx="0" cy="0" r="2.7" fill="#fff4a7" />
            <circle cx="6" cy="4" r="2.4" fill="#f3a1b5" />
            <circle cx="-7" cy="5" r="2.2" fill="#f8f6ff" />
            <circle cx="3" cy="9" r="2" fill="#c55c8d" />
            <path d="M -10 12 C -4 8 4 8 11 12" stroke="#4f9141" stroke-width="2" fill="none" opacity="0.75" />
          </g>
          <g id="sheep">
            <ellipse cx="0" cy="17" rx="14" ry="10" fill="#fffdf8" />
            <circle cx="-8" cy="14" r="6" fill="#fffdf8" />
            <circle cx="6" cy="12" r="7" fill="#fffdf8" />
            <circle cx="12" cy="17" r="5.5" fill="#6d5a45" />
            <circle cx="14" cy="16" r="1" fill="#20242a" />
            <rect x="-8" y="23" width="2.4" height="7" rx="1" fill="#6d5a45" />
            <rect x="1" y="23" width="2.4" height="7" rx="1" fill="#6d5a45" />
            <rect x="8" y="23" width="2.4" height="7" rx="1" fill="#6d5a45" />
          </g>
          <g id="sheepGroup">
            <use href="#sheep" transform="translate(-15 0) scale(0.74)" />
            <use href="#sheep" transform="translate(5 -3) scale(0.86)" />
            <use href="#sheep" transform="translate(22 7) scale(0.58)" />
          </g>
          <g id="goat">
            <ellipse cx="0" cy="17" rx="13" ry="8" fill="#f3ead8" />
            <circle cx="12" cy="12" r="5.5" fill="#efe3ce" />
            <path d="M9 7 L6 0 M14 7 L18 0" stroke="#8a6a42" stroke-width="2" fill="none" stroke-linecap="round" />
            <path d="M -12 15 L -20 11" stroke="#efe3ce" stroke-width="4" stroke-linecap="round" />
            <circle cx="14" cy="12" r="1" fill="#20242a" />
            <rect x="-8" y="22" width="2.2" height="8" rx="1" fill="#7a6047" />
            <rect x="4" y="22" width="2.2" height="8" rx="1" fill="#7a6047" />
          </g>
          <g id="goatGroup">
            <use href="#goat" transform="translate(-13 2) scale(0.82)" />
            <use href="#goat" transform="translate(13 -3) scale(0.72)" />
            <use href="#goat" transform="translate(1 11) scale(0.56)" />
          </g>
          <g id="horse">
            <ellipse cx="0" cy="16" rx="19" ry="10" fill="#9a5f32" />
            <path d="M13 11 Q22 0 29 9 L22 18 Z" fill="#8a512c" />
            <path d="M -18 12 Q -29 10 -31 1" stroke="#4d2d1f" stroke-width="5" fill="none" stroke-linecap="round" />
            <path d="M 18 6 L 23 0" stroke="#4d2d1f" stroke-width="5" stroke-linecap="round" />
            <circle cx="24" cy="9" r="1.3" fill="#1d2228" />
            <rect x="-10" y="23" width="3" height="13" rx="1.3" fill="#5f3b25" />
            <rect x="6" y="23" width="3" height="13" rx="1.3" fill="#5f3b25" />
          </g>
          <g id="bird">
            <ellipse cx="0" cy="0" rx="6" ry="4" fill="#2d88c8" />
            <circle cx="5" cy="-2" r="3" fill="#2b79b5" />
            <path d="M7 -2 L13 -4 L8 1 Z" fill="#f4a839" />
            <path d="M-2 -1 Q-8 -8 -13 -3" stroke="#23689e" stroke-width="3" fill="none" stroke-linecap="round" />
          </g>
          <g id="birdsGround">
            <use href="#bird" transform="translate(-11 10) scale(0.78)" />
            <use href="#bird" transform="translate(11 5) scale(0.64)" />
          </g>
          <g id="birdsFlying">
            <path d="M -22 0 Q -14 -9 -6 0" stroke="#327eb8" stroke-width="4" fill="none" stroke-linecap="round" />
            <path d="M -5 0 Q 3 -9 11 0" stroke="#327eb8" stroke-width="4" fill="none" stroke-linecap="round" />
            <path d="M 18 6 Q 26 -3 34 6" stroke="#d35442" stroke-width="4" fill="none" stroke-linecap="round" />
          </g>
          <g id="fenceSection">
            <path d="M-24 18 H24" stroke="#7f5a2e" stroke-width="4" stroke-linecap="round"/>
            <path d="M-18 8 V28 M0 8 V28 M18 8 V28" stroke="#b88546" stroke-width="5" stroke-linecap="round"/>
            <path d="M-24 9 H24" stroke="#cc9b58" stroke-width="3" stroke-linecap="round"/>
          </g>
          <g id="stump">
            <ellipse cx="0" cy="21" rx="12" ry="8" fill="#b98343"/>
            <ellipse cx="0" cy="19" rx="12" ry="7" fill="#d8b06c" stroke="#906535" stroke-width="2"/>
            <path d="M-6 18c2-2 8-2 10 1" fill="none" stroke="#906535" stroke-width="1.5"/>
          </g>
          <g id="hayBale">
            <rect x="-18" y="10" width="20" height="16" rx="3" fill="#e3c05f" stroke="#b68b24" stroke-width="2"/>
            <rect x="-2" y="6" width="20" height="20" rx="3" fill="#edd06e" stroke="#b68b24" stroke-width="2"/>
            <path d="M-14 14 H-2 M-14 20 H-2 M4 12 H16 M4 18 H16" stroke="#c69a2d" stroke-width="2" opacity="0.9"/>
          </g>
          <g id="duckPair">
            <g transform="translate(-12 0)">
              <ellipse cx="0" cy="20" rx="10" ry="7" fill="#ffffff"/>
              <circle cx="9" cy="16" r="4.5" fill="#ffffff"/>
              <path d="M12 16h4" stroke="#e09a2d" stroke-width="2.5" stroke-linecap="round"/>
            </g>
            <g transform="translate(14 -3)">
              <ellipse cx="0" cy="22" rx="11" ry="8" fill="#4fa15a"/>
              <circle cx="9" cy="17" r="5" fill="#3f7fb8"/>
              <path d="M13 17h4" stroke="#e09a2d" stroke-width="2.5" stroke-linecap="round"/>
            </g>
          </g>
          <g id="houseGarden">
            <use href="#house" />
            <use href="#fenceSection" transform="translate(-18 38) scale(0.72)" />
            <use href="#fenceSection" transform="translate(20 38) scale(0.72)" />
          </g>
          <g id="house">
            <path d="M-28 6 L0 -18 L28 6" fill="#d94f26" stroke="#b34c23" stroke-width="3" stroke-linejoin="round"/>
            <rect x="-22" y="4" width="44" height="36" rx="6" fill="#fff4df" stroke="#b67d37" stroke-width="3"/>
            <rect x="-8" y="18" width="16" height="22" rx="5" fill="#895b2c"/>
            <rect x="-18" y="14" width="9" height="9" rx="2" fill="#93d5fb" stroke="#548ec3" stroke-width="2"/>
            <rect x="10" y="14" width="9" height="9" rx="2" fill="#93d5fb" stroke="#548ec3" stroke-width="2"/>
            <rect x="10" y="-10" width="6" height="12" fill="#906a42"/>
          </g>
        </defs>
        <rect width="${width}" height="${height}" fill="url(#fieldBase)" />
        <path d="M0 ${(height * 0.6).toFixed(1)} C ${(width * 0.21).toFixed(1)} ${(height * 0.5).toFixed(1)} ${(width * 0.38).toFixed(1)} ${(height * 0.71).toFixed(1)} ${(width * 0.58).toFixed(1)} ${(height * 0.57).toFixed(1)} C ${(width * 0.76).toFixed(1)} ${(height * 0.44).toFixed(1)} ${(width * 0.88).toFixed(1)} ${(height * 0.63).toFixed(1)} ${width} ${(height * 0.53).toFixed(1)} L ${width} ${height} L 0 ${height} Z" fill="#b5dc80" opacity="0.72" />
        <path d="M0 ${(height * 0.78).toFixed(1)} C ${(width * 0.22).toFixed(1)} ${(height * 0.68).toFixed(1)} ${(width * 0.42).toFixed(1)} ${(height * 0.86).toFixed(1)} ${(width * 0.64).toFixed(1)} ${(height * 0.74).toFixed(1)} C ${(width * 0.81).toFixed(1)} ${(height * 0.65).toFixed(1)} ${(width * 0.9).toFixed(1)} ${(height * 0.77).toFixed(1)} ${width} ${(height * 0.7).toFixed(1)} L ${width} ${height} L 0 ${height} Z" fill="url(#fieldNear)" opacity="0.78" />
        ${referencePathMarkup}
        ${fieldLineMarkup}
        ${flowerMarkup}
        <g>${referenceSceneMarkup ? "" : borderGroves}</g>
        <g>${referenceSceneMarkup || decorationMarkup}</g>
      </svg>
    `.trim();
  }

  function renderBoardScene() {
    const level = currentLevel();
    elements.board.style.removeProperty('--board-scene-image');
    elements.board.classList.toggle('board--reference', isReferenceLevel(level));
  }

  function renderAxis(container, count) {
    const fragment = document.createDocumentFragment();

    for (let number = 1; number <= count; number += 1) {
      const item = document.createElement('span');
      item.textContent = String(number);
      fragment.append(item);
    }

    container.replaceChildren(fragment);
  }

  function getNeighborSidesByType(row, col, type) {
    const level = currentLevel();
    const directions = [
      ['n', -1, 0],
      ['s', 1, 0],
      ['w', 0, -1],
      ['e', 0, 1],
    ];

    return directions.reduce((sides, [side, rowDelta, colDelta]) => {
      const nextRow = row + rowDelta;
      const nextCol = col + colDelta;

      if (!isInsideBoard(nextRow, nextCol)) return sides;

      const nextKey = coordinateKey(nextRow, nextCol);
      const isPathNeighbor = level.openCells.has(nextKey);

      if (type === 'path' && isPathNeighbor) {
        sides.push(side);
      }

      if (type !== 'path' && !isPathNeighbor && getTerrainAt(nextRow, nextCol).type === type) {
        sides.push(side);
      }

      return sides;
    }, []);
  }

  function createEdgeSpan(side) {
    const edge = document.createElement('span');
    edge.className = `land-edge land-edge--${side}`;
    edge.setAttribute('aria-hidden', 'true');
    return edge;
  }

  function getPathNeighborSides(row, col) {
    const directions = [
      ['n', -1, 0],
      ['s', 1, 0],
      ['w', 0, -1],
      ['e', 0, 1],
    ];

    return directions.reduce((sides, [side, rowDelta, colDelta]) => {
      const nextRow = row + rowDelta;
      const nextCol = col + colDelta;

      if (!isInsideBoard(nextRow, nextCol)) return sides;
      if (currentLevel().openCells.has(coordinateKey(nextRow, nextCol))) sides.push(side);
      return sides;
    }, []);
  }

  function renderPathTrail(cell, row, col) {
    const sides = getPathNeighborSides(row, col);

    cell.classList.add(...sides.map((side) => `cell--path-${side}`));

    const center = document.createElement('span');
    center.className = 'path-trail path-trail--center';
    center.setAttribute('aria-hidden', 'true');
    cell.append(center);

    sides.forEach((side) => {
      const arm = document.createElement('span');
      arm.className = `path-trail path-trail--arm path-trail--${side}`;
      arm.setAttribute('aria-hidden', 'true');
      cell.append(arm);
    });
  }

  function renderOuterPathFences(cell, row, col) {
    const pathSides = getPathNeighborSides(row, col);
    pathSides.forEach((side) => cell.append(createEdgeSpan(side)));
  }

  function renderBlockedLandscape(cell, row, col) {
    const terrain = getTerrainAt(row, col);
    cell.classList.add('cell--landscape', `cell--terrain-${terrain.type}`);
    renderOuterPathFences(cell, row, col);
  }

  function renderBoardDecoration(cell, row, col) {
    const decoration = currentLevel().decorationAnchors?.get(coordinateKey(row, col));
    if (!decoration) return;

    const sprite = document.createElement('span');
    sprite.className = `board-decoration board-decoration--${decoration.size}`;
    sprite.style.setProperty('--decor-width', String(decoration.width));
    sprite.style.setProperty('--decor-height', String(decoration.height));
    sprite.style.setProperty('--decor-offset-x', `${decoration.offsetX ?? 0}px`);
    sprite.style.setProperty('--decor-offset-y', `${decoration.offsetY ?? 0}px`);
    sprite.style.setProperty('--decor-image', `url("../images/decor/${decoration.file}")`);
    sprite.setAttribute('aria-hidden', 'true');
    cell.append(sprite);
  }

  function getBridgeOrientation(row, col) {
    const left = currentLevel().openCells.has(coordinateKey(row, col - 1));
    const right = currentLevel().openCells.has(coordinateKey(row, col + 1));
    const up = currentLevel().openCells.has(coordinateKey(row - 1, col));
    const down = currentLevel().openCells.has(coordinateKey(row + 1, col));

    return (left || right) ? 'horizontal' : (up || down ? 'vertical' : 'horizontal');
  }

  function getBackgroundSlicePosition(index, total) {
    if (total <= 1) return '50%';
    return `${(((index - 1) / (total - 1)) * 100).toFixed(6)}%`;
  }

  function renderBoard() {
    const level = currentLevel();
    const fragment = document.createDocumentFragment();

    elements.board.style.setProperty('--grass-bg-size-x', `${level.cols * 100}%`);
    elements.board.style.setProperty('--grass-bg-size-y', `${level.rows * 100}%`);

    for (let row = 1; row <= level.rows; row += 1) {
      for (let col = 1; col <= level.cols; col += 1) {
        const cell = document.createElement('div');
        const item = getItemAt(row, col);
        const isCurrent = state.panda.row === row && state.panda.col === col;
        const isHome = level.home.row === row && level.home.col === col;
        const isOpen = level.openCells.has(coordinateKey(row, col));

        cell.className = 'cell';
        cell.style.setProperty('--cell-bg-x', getBackgroundSlicePosition(col, level.cols));
        cell.style.setProperty('--cell-bg-y', getBackgroundSlicePosition(row, level.rows));
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-label', buildCellLabel(row, col, item, isHome));

        if (isOpen) {
          cell.classList.add('cell--path');

          if (currentLevel().bridgeCells?.has(coordinateKey(row, col))) {
            cell.classList.add('cell--bridge', `cell--bridge-${getBridgeOrientation(row, col)}`);
          }
        } else {
          renderBlockedLandscape(cell, row, col);
        }

        if (isHome) {
          cell.classList.add('cell--home');
          cell.innerHTML = '<span class="cell__item cell__item--house cell__item--house-footprint" aria-hidden="true"></span>';
        }

        if (item) {
          cell.classList.add('cell--has-item');
          if (state.collected.has(item.id)) cell.classList.add('cell--collected');
          const labelText = item.label ? String(item.label).toLocaleUpperCase('es-ES') : '';
          const label = labelText ? `<span class="cell__label">${labelText}</span>` : '';
          const itemClass = item.type === 'letter' ? 'cell__item cell__item--letter' : 'cell__item';
          const itemStyle = item.type === 'letter' ? ` style="--letter-accent:${getLetterColor(item)}"` : '';
          cell.innerHTML = `<span class="${itemClass}"${itemStyle} aria-hidden="true">${item.icon}</span>${label}`;
        }

        if (isCurrent) {
          cell.classList.add('cell--current');
          const amandaName = document.createElement('span');
          amandaName.className = 'cell__amanda-name';
          amandaName.textContent = getProfileLabel().toLocaleUpperCase('es-ES');
          amandaName.setAttribute('aria-hidden', 'true');
          cell.append(amandaName);
        }

        fragment.append(cell);
      }
    }

    elements.board.replaceChildren(fragment);
    elements.pathOverlay = null;
    elements.foregroundOverlay = null;
    renderPathOverlay();
    renderForegroundOverlay();
  }

  function buildCellLabel(row, col, item, isHome) {
    const parts = [`Fila ${row}`, `columna ${col}`];

    if (item) parts.push(item.name);
    if (isHome) parts.push('Casa');

    if (isBlocked(row, col)) {
      parts.push(getTerrainAt(row, col).label);
      parts.push('bloqueada');
    }

    return parts.join(', ');
  }

  function colorizeLetters(letters) {
    return letters
      .map((letter, index) => `<span style="color: ${LETTER_PALETTE[index % LETTER_PALETTE.length]}">${letter}</span>`)
      .join('<span class="objective-letters__dash"> - </span>');
  }

  function getTargetLetters() {
    return currentLevel().items
      .filter((item) => item.type === 'letter')
      .sort((left, right) => left.order - right.order)
      .map((item) => item.icon);
  }

  function getLetterColor(item) {
    const order = Math.max(0, Number(item?.order ?? 1) - 1);
    return LETTER_PALETTE[order % LETTER_PALETTE.length];
  }

  function renderObjectiveLetters() {
    if (!elements.objectiveLetters) return;
    elements.objectiveLetters.innerHTML = colorizeLetters(getTargetLetters());
  }

  function renderStatusFooter() {
    const level = currentLevel();
    const collectedLetters = level.items
      .filter((item) => item.type === 'letter' && state.collected.has(item.id))
      .length;

    if (elements.footerLevel) elements.footerLevel.textContent = `Nivel ${state.levelIndex + 1}`;
    if (elements.footerLevelName) elements.footerLevelName.textContent = getProfileLabel();
    if (elements.footerLetters) elements.footerLetters.textContent = `${collectedLetters} / ${level.letterCount}`;
    if (elements.footerSteps) elements.footerSteps.textContent = String(state.steps ?? 0);
    if (elements.footerBest) elements.footerBest.textContent = state.hasWon ? `${state.steps ?? 0} pasos` : '--';
  }

  function getCommandPresentation(command) {
    const presentations = {
      up: { icon: '⬆', label: 'AVANZAR' },
      left: { icon: '⬅', label: 'GIRAR A LA IZQUIERDA' },
      right: { icon: '➡', label: 'GIRAR A LA DERECHA' },
      down: { icon: '⬇', label: 'DAR LA VUELTA' },
      loop3: { icon: '↻', label: 'REPETIR ×3' },
    };

    return presentations[command] ?? { icon: DIRECTIONS[command]?.symbol ?? '?', label: DIRECTIONS[command]?.label ?? 'Comando' };
  }

  function renderInventory() {
    const fragment = document.createDocumentFragment();

    COMMAND_ORDER.forEach((command) => {
      const count = state.inventory[command] ?? 0;
      const presentation = getCommandPresentation(command);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'command-button';
      button.disabled = count <= 0 || state.isRunning || state.hasWon;
      button.dataset.command = command;
      button.setAttribute('aria-label', `${presentation.label}. Disponibles: ${count}`);
      button.innerHTML = `
        <span class="command-button__symbol" aria-hidden="true">${presentation.icon}</span>
        <span class="command-button__label">${presentation.label}</span>
        <span class="command-button__count">${count}</span>
      `;
      fragment.append(button);
    });

    elements.inventory.replaceChildren(fragment);
  }

  function renderProgram() {
    const fragment = document.createDocumentFragment();

    state.program.forEach((command, index) => {
      const item = document.createElement('li');
      item.textContent = DIRECTIONS[command].symbol;
      if (index === state.currentProgramIndex) item.classList.add('is-running');
      fragment.append(item);
    });

    elements.programList.replaceChildren(fragment);
    const stepCount = state.program.length;
    elements.programCount.textContent = `${stepCount} ${stepCount === 1 ? 'PASO' : 'PASOS'}`;
  }

  function renderProgress() {
    if (!elements.progress) return;

    const fragment = document.createDocumentFragment();

    currentLevel().items.forEach((item) => {
      const progressItem = document.createElement('div');
      progressItem.className = 'progress-item';
      if (state.collected.has(item.id)) progressItem.classList.add('is-done');
      progressItem.textContent = item.type === 'letter' ? item.name : `${item.icon} ${item.label || item.name}`;
      fragment.append(progressItem);
    });

    elements.progress.replaceChildren(fragment);
  }

  function getCollectedLetterItems() {
    const collectedLetterIds = state.collectedLetterIds ?? [];
    const latestLetterId = collectedLetterIds[collectedLetterIds.length - 1];
    if (!latestLetterId) return [];

    const latestItem = currentLevel().items.find((item) => item.id === latestLetterId);
    return latestItem && latestItem.type === 'letter' ? [latestItem] : [];
  }

  function getPronounceableSyllable(letter, vowel) {
    const normalizedLetter = String(letter ?? '').trim().toLowerCase();
    const normalizedVowel = String(vowel ?? '').trim().toLowerCase();
    const vowels = new Set(['a', 'e', 'i', 'o', 'u']);

    if (!normalizedLetter || !vowels.has(normalizedVowel)) return '';

    if (vowels.has(normalizedLetter)) {
      return normalizedLetter === normalizedVowel ? normalizedLetter.toUpperCase() : '';
    }

    const specialLetters = {
      q: { e: 'que', i: 'qui', o: 'quo' },
      c: { a: 'ca', e: 'ce', i: 'ci', o: 'co', u: 'cu' },
      g: { a: 'ga', e: 'ge', i: 'gi', o: 'go', u: 'gu' },
      y: { a: 'ya', e: 'ye', i: 'yi', o: 'yo', u: 'yu' },
      ñ: { a: 'ña', e: 'ñe', i: 'ñi', o: 'ño', u: 'ñu' },
      r: { a: 'ra', e: 're', i: 'ri', o: 'ro', u: 'ru' },
    };

    const syllable = specialLetters[normalizedLetter]
      ? specialLetters[normalizedLetter][normalizedVowel] ?? ''
      : `${normalizedLetter}${normalizedVowel}`;

    return syllable.toUpperCase();
  }

  function supportsSpeechSynthesis() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  function getSpeechVoices() {
    return supportsSpeechSynthesis() ? window.speechSynthesis.getVoices() : [];
  }

  function normalizeVoiceLang(language) {
    return String(language ?? '').trim().replace('_', '-').toLowerCase();
  }

  function isSpanishVoice(voice) {
    return /^es(?:-|$)/i.test(normalizeVoiceLang(voice?.lang));
  }

  function isCastilianVoice(voice) {
    const language = normalizeVoiceLang(voice?.lang);
    const name = String(voice?.name ?? '').toLowerCase();

    return language === 'es-es'
      || /españa|spain|castellano|castilian|mónica|monica|helena|elvira|jorge|google español/i.test(name);
  }

  function getVoicePriority(voice) {
    const language = normalizeVoiceLang(voice?.lang);
    const name = String(voice?.name ?? '').toLowerCase();

    if (language === 'es-es' && /google|microsoft|apple|mónica|monica|helena|elvira|jorge/i.test(name)) return 1;
    if (language === 'es-es') return 2;
    if (/españa|spain|castellano|castilian/i.test(name)) return 3;
    if (isSpanishVoice(voice)) return 4;
    return 99;
  }

  function selectCastilianVoice() {
    if (!supportsSpeechSynthesis()) return null;

    const voices = getSpeechVoices();
    const castilianVoices = voices.filter(isCastilianVoice);
    const spanishVoices = voices.filter(isSpanishVoice);
    const preferredVoices = castilianVoices.length > 0 ? castilianVoices : spanishVoices;

    return preferredVoices
      .sort((left, right) => getVoicePriority(left) - getVoicePriority(right))
      .at(0)
      ?? null;
  }

  function waitForSpeechVoices(timeoutMs = 900) {
    if (!supportsSpeechSynthesis()) return Promise.resolve([]);

    const currentVoices = getSpeechVoices();
    if (currentVoices.length > 0) return Promise.resolve(currentVoices);
    if (speechVoiceLoadPromise) return speechVoiceLoadPromise;

    speechVoiceLoadPromise = new Promise((resolve) => {
      let isSettled = false;

      const finish = () => {
        if (isSettled) return;
        isSettled = true;
        window.speechSynthesis.removeEventListener?.('voiceschanged', finish);
        resolve(getSpeechVoices());
      };

      window.speechSynthesis.addEventListener?.('voiceschanged', finish, { once: true });
      window.setTimeout(finish, timeoutMs);
    }).finally(() => {
      speechVoiceLoadPromise = null;
    });

    return speechVoiceLoadPromise;
  }

  function prepareSpeechVoices() {
    if (!USE_SPEECH_SYNTHESIS_FALLBACK || !supportsSpeechSynthesis()) return;
    window.speechSynthesis.getVoices();
    waitForSpeechVoices(1200);
  }

  function getLetterSpeechName(letter) {
    const normalizedLetter = String(letter ?? '').trim().toUpperCase();
    return SPANISH_LETTER_NAMES[normalizedLetter] ?? normalizedLetter.toLowerCase();
  }

  function toAudioKey(value) {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/ñ/g, 'ny')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function getSolfegeDetuneForVowel(vowel) {
    const notes = {
      A: 0,   // DO
      E: 200, // RE
      I: 400, // MI
      O: 500, // FA
      U: 700, // SOL
    };

    return notes[String(vowel ?? '').trim().toUpperCase()] ?? 0;
  }

  function getSolfegePlaybackRateForVowel(vowel) {
    const rates = {
      A: 1,
      E: 1.122462,
      I: 1.259921,
      O: 1.33484,
      U: 1.498307,
    };

    return rates[String(vowel ?? '').trim().toUpperCase()] ?? 1;
  }

  function getSolfegeFrequencyForVowel(vowel) {
    const notes = {
      A: 261.63, // DO4
      E: 293.66, // RE4
      I: 329.63, // MI4
      O: 349.23, // FA4
      U: 392.0,  // SOL4
    };

    return notes[String(vowel ?? '').trim().toUpperCase()] ?? 0;
  }

  function stretchFinalVowelForSinging(text) {
    const value = String(text ?? '').trim();
    const match = value.match(/^(.*?)([aeiouáéíóú])$/i);
    if (!match) return value;

    const [, prefix, finalVowel] = match;
    return `${prefix}${finalVowel}${finalVowel}`;
  }

  function createSingingSpeechPart(text, index, vowel = '', audioPath = '') {
    const hasVowelNote = Boolean(vowel);
    const normalizedVowel = hasVowelNote ? String(vowel).toUpperCase() : '';

    return {
      text,
      audioPath,
      detune: hasVowelNote ? getSolfegeDetuneForVowel(vowel) : 0,
      fallbackPlaybackRate: hasVowelNote ? getSolfegePlaybackRateForVowel(vowel) : 1,
      pitch: hasVowelNote ? 1 : 0.86,
      rate: index === 0 ? 0.96 : 0.94,
      volume: 1,
      vowel: normalizedVowel,
      tableVowel: normalizedVowel,
    };
  }

  function createLetterNameSpeechPart(letter) {
    const normalizedLetter = String(letter ?? '').trim().toUpperCase();
    const spokenName = getLetterSpeechName(normalizedLetter);
    return createSingingSpeechPart(spokenName, 0, '', getLetterAudioPath(normalizedLetter));
  }

  function getLetterAudioFilename(letter) {
    const normalizedLetter = String(letter ?? '').trim().toUpperCase();
    return LETTER_AUDIO_FILENAMES[normalizedLetter] ?? `${normalizedLetter.toLowerCase()}.${LETTER_AUDIO_EXTENSION}`;
  }

  function getLetterAudioPath(letter) {
    return `${LETTER_AUDIO_BASE_PATH}/${encodeURIComponent(getLetterAudioFilename(letter))}`;
  }

  function createSyllableSpeechPart(syllable, index, vowel) {
    const spokenSyllable = stretchFinalVowelForSinging(String(syllable ?? '').trim().toLowerCase());
    return createSingingSpeechPart(spokenSyllable, index, vowel);
  }

  function buildStandardLetterSpeechParts(letter) {
    const normalizedLetter = String(letter ?? '').trim().toUpperCase();
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    const parts = [createLetterNameSpeechPart(normalizedLetter)];

    vowels.forEach((vowel, index) => {
      const syllables = getPronounceableSyllable(normalizedLetter, vowel)
        .split('/')
        .map((part) => part.trim())
        .filter(Boolean);

      syllables.forEach((syllable) => {
        parts.push(createSyllableSpeechPart(syllable, index + 1, vowel));
      });
    });

    return parts;
  }

  function buildRLetterSpeechParts() {
    const parts = [createLetterNameSpeechPart('R')];
    const softR = [
      ['RA', 'A'],
      ['RE', 'E'],
      ['RI', 'I'],
      ['RO', 'O'],
      ['RU', 'U'],
    ];
    const strongR = [
      ['RRA', 'A'],
      ['RRE', 'E'],
      ['RRI', 'I'],
      ['RRO', 'O'],
      ['RRU', 'U'],
    ];

    [...softR, ...strongR].forEach(([syllable, vowel], index) => {
      parts.push(createSyllableSpeechPart(syllable, index + 1, vowel));
    });

    return parts;
  }

  function buildLetterTableSpeechParts(letter) {
    const normalizedLetter = String(letter ?? '').trim().toUpperCase();
    if (normalizedLetter === 'R') return buildRLetterSpeechParts();
    return buildStandardLetterSpeechParts(normalizedLetter);
  }

  function getSyllableAudioContext() {
    if (typeof window === 'undefined') return null;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!syllableAudioContext) {
      syllableAudioContext = new AudioContextClass();
    }

    return syllableAudioContext;
  }

  function resumeSyllableAudio() {
    const audioContext = getSyllableAudioContext();
    if (audioContext?.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }
  }

  async function loadSyllableAudioBuffer(audioPath) {
    if (!audioPath) return null;
    if (syllableAudioCache.has(audioPath)) return syllableAudioCache.get(audioPath);

    const audioContext = getSyllableAudioContext();
    if (!audioContext) return null;

    const bufferPromise = fetch(audioPath)
      .then((response) => {
        if (!response.ok) throw new Error(`No se pudo cargar el audio: ${audioPath}`);
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer.slice(0)))
      .catch(() => null);

    syllableAudioCache.set(audioPath, bufferPromise);
    return bufferPromise;
  }

  function stopCurrentSyllableAudio() {
    if (!syllableAudioSource) return;

    try {
      syllableAudioSource.stop();
    } catch (error) {
      // The node may already be stopped.
    }

    syllableAudioSource = null;
  }

  function playAudioBufferPart(buffer, part, requestId) {
    return new Promise((resolve) => {
      if (requestId !== speechRequestId || !buffer) {
        resolve(false);
        return;
      }

      const audioContext = getSyllableAudioContext();
      if (!audioContext) {
        resolve(false);
        return;
      }

      const source = audioContext.createBufferSource();
      const gain = audioContext.createGain();
      source.buffer = buffer;
      gain.gain.value = part.volume ?? 1;

      if ('detune' in source) {
        source.detune.value = part.detune ?? 0;
      } else {
        source.playbackRate.value = part.fallbackPlaybackRate ?? 1;
      }

      source.connect(gain);
      gain.connect(audioContext.destination);
      syllableAudioSource = source;

      source.onended = () => {
        if (syllableAudioSource === source) syllableAudioSource = null;
        if (part.tableVowel) clearActiveSyllableCell(part.tableVowel);
        resolve(true);
      };

      if (part.vowel) playSolfegeTone(part.vowel);

      try {
        source.start();
      } catch (error) {
        if (part.tableVowel) clearActiveSyllableCell(part.tableVowel);
        resolve(false);
      }
    });
  }

  async function playSyllableAudioSequence(parts, requestId) {
    stopCurrentSyllableAudio();
    clearActiveSyllableCell();
    resumeSyllableAudio();

    for (const part of parts) {
      if (requestId !== speechRequestId) break;

      const buffer = await loadSyllableAudioBuffer(part.audioPath);
      if (!buffer) return false;

      await playAudioBufferPart(buffer, part, requestId);
      await new Promise((resolve) => window.setTimeout(resolve, 18));
    }

    return true;
  }

  function playSolfegeTone(vowel) {
    const frequency = getSolfegeFrequencyForVowel(vowel);
    if (!frequency || typeof window === 'undefined') return;

    const audioContext = getSyllableAudioContext();
    if (!audioContext) return;

    try {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const startedAt = audioContext.currentTime;
      const duration = 0.16;

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, startedAt);
      gain.gain.setValueAtTime(0.0001, startedAt);
      gain.gain.exponentialRampToValueAtTime(0.06, startedAt + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startedAt + duration);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(startedAt);
      oscillator.stop(startedAt + duration + 0.02);
    } catch (error) {
      // Some browsers restrict audio until the user interacts.
    }
  }

  function clearActiveSyllableCell(vowel = '') {
    if (!elements.syllableTableWrap) return;
    const normalizedVowel = String(vowel ?? '').trim().toUpperCase();

    if (normalizedVowel && activeSyllableVowel && activeSyllableVowel !== normalizedVowel) return;

    elements.syllableTableWrap
      .querySelectorAll('.syllable-table__cell.is-speaking')
      .forEach((cell) => cell.classList.remove('is-speaking'));

    if (!normalizedVowel || activeSyllableVowel === normalizedVowel) {
      activeSyllableVowel = '';
    }
  }

  function highlightSyllableCell() {
    clearActiveSyllableCell();
  }

  function speakSingingSequenceNow(parts, requestId) {
    if (!USE_SPEECH_SYNTHESIS_FALLBACK || requestId !== speechRequestId || !supportsSpeechSynthesis()) return;

    const voice = selectCastilianVoice();
    window.speechSynthesis.cancel();
    clearActiveSyllableCell();

    parts.forEach((part) => {
      const utterance = new SpeechSynthesisUtterance(part.text);
      utterance.lang = voice ? voice.lang : 'es-ES';
      utterance.rate = part.rate;
      utterance.pitch = part.pitch;
      utterance.volume = part.volume;
      if (voice) utterance.voice = voice;

      utterance.onstart = () => {
        if (part.vowel) playSolfegeTone(part.vowel);
      };
      utterance.onend = () => {
        if (part.tableVowel) clearActiveSyllableCell(part.tableVowel);
      };
      utterance.onerror = () => {
        if (part.tableVowel) clearActiveSyllableCell(part.tableVowel);
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  function speakSingingSequence(parts) {
    if (!Array.isArray(parts) || parts.length === 0) return;

    const requestId = speechRequestId + 1;
    speechRequestId = requestId;
    stopCurrentSyllableAudio();
    stopCurrentLetterAudio();
    clearActiveSyllableCell();
    if (supportsSpeechSynthesis()) window.speechSynthesis.cancel();

    playSyllableAudioSequence(parts, requestId).then((playedFromFiles) => {
      if (playedFromFiles || !USE_SPEECH_SYNTHESIS_FALLBACK || requestId !== speechRequestId) return;
      waitForSpeechVoices().then(() => {
        speakSingingSequenceNow(parts, requestId);
      });
    });
  }

  function stopCurrentLetterAudio() {
    if (letterAudioCancelPlayback) {
      const cancelPlayback = letterAudioCancelPlayback;
      letterAudioCancelPlayback = null;
      cancelPlayback();
      return;
    }

    if (!letterAudioElement) return;

    letterAudioElement.pause();
    letterAudioElement.currentTime = 0;
    letterAudioElement = null;
  }

  function getAudioDurationMs(audio) {
    return Number.isFinite(audio?.duration) && audio.duration > 0
      ? audio.duration * 1000
      : 0;
  }

  function getNowMs() {
    return window.performance?.now?.() ?? Date.now();
  }

  function playLetterAudioFile(audioPath, requestId) {
    return new Promise((resolve) => {
      if (!audioPath || requestId !== speechRequestId) {
        resolve({ played: false, durationMs: 0, elapsedMs: 0 });
        return;
      }

      const audio = new Audio(audioPath);
      let startedAt = 0;
      let isSettled = false;

      const markStarted = () => {
        if (!startedAt) startedAt = getNowMs();
      };

      const finish = (played) => {
        if (isSettled) return;
        isSettled = true;

        audio.removeEventListener('playing', handlePlaying);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);

        if (letterAudioElement === audio) letterAudioElement = null;
        if (letterAudioCancelPlayback === cancelPlayback) letterAudioCancelPlayback = null;

        const durationMs = getAudioDurationMs(audio);
        const elapsedMs = startedAt ? Math.max(0, getNowMs() - startedAt) : durationMs;
        resolve({ played, durationMs, elapsedMs });
      };

      const cancelPlayback = () => {
        audio.pause();
        audio.currentTime = 0;
        finish(false);
      };

      const handlePlaying = () => markStarted();
      const handleEnded = () => finish(true);
      const handleError = () => finish(false);

      audio.preload = 'auto';
      audio.addEventListener('playing', handlePlaying);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);

      letterAudioElement = audio;
      letterAudioCancelPlayback = cancelPlayback;

      audio.play()
        .then(markStarted)
        .catch(() => finish(false));
    });
  }

  function getCollectedLetterConfettiDelayMs(letterPlayback) {
    const playbackTimeMs = letterPlayback.durationMs || letterPlayback.elapsedMs || 0;
    if (playbackTimeMs <= 0) return 0;

    // Tras reproducir la letra, espera 0.8 veces su tiempo de reproducción antes del confeti.
    return Math.max(0, playbackTimeMs * COLLECTED_LETTER_POST_LETTER_DELAY_MULTIPLIER);
  }

  async function playCollectedLetterAudio(letter, { includeRepeatPrompt = true } = {}) {
    const requestId = speechRequestId + 1;
    speechRequestId = requestId;

    stopCurrentSyllableAudio();
    stopCurrentLetterAudio();
    clearActiveSyllableCell();
    if (supportsSpeechSynthesis()) window.speechSynthesis.cancel();

    showCollectedLetterOverlay(letter, requestId);

    try {
      if (includeRepeatPrompt) {
        await playLetterAudioFile(COLLECTED_LETTER_REPEAT_AUDIO_PATH, requestId);
        if (requestId !== speechRequestId) return;

        await delay(COLLECTED_LETTER_REPEAT_DELAY_MS);
        if (requestId !== speechRequestId) return;
      }

      const letterPlayback = await playLetterAudioFile(getLetterAudioPath(letter), requestId);
      if (requestId !== speechRequestId) return;

      await delay(getCollectedLetterConfettiDelayMs(letterPlayback));
      if (requestId !== speechRequestId) return;

      await playLetterAudioFile(COLLECTED_LETTER_CONFETTI_AUDIO_PATH, requestId);
    } finally {
      hideCollectedLetterOverlay(requestId);
    }
  }

  function speakLetterTable(letter, options) {
    return playCollectedLetterAudio(letter, options);
  }

  function renderSyllableTable() {
    if (!elements.syllablePanel || !elements.syllableTableWrap) return;

    const letterItems = getCollectedLetterItems();
    elements.syllablePanel.hidden = false;

    const vowels = ['A', 'E', 'I', 'O', 'U'];
    const table = document.createElement('table');
    table.className = 'syllable-table';
    table.style.minWidth = letterItems.length > 0 ? '150px' : '112px';
    table.setAttribute('aria-label', 'Tabla de letras recogidas y sílabas con vocales');

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const vowelHeader = document.createElement('th');
    vowelHeader.scope = 'col';
    vowelHeader.textContent = 'VOCAL';
    headerRow.append(vowelHeader);

    letterItems.forEach((item) => {
      const header = document.createElement('th');
      header.scope = 'col';
      header.textContent = String(item.icon).toUpperCase();
      header.title = item.name;
      headerRow.append(header);
    });

    thead.append(headerRow);
    table.append(thead);

    const tbody = document.createElement('tbody');
    vowels.forEach((vowel) => {
      const row = document.createElement('tr');
      const vowelCell = document.createElement('th');
      vowelCell.scope = 'row';
      vowelCell.textContent = vowel;
      row.append(vowelCell);

      if (letterItems.length === 0) {
        const cell = document.createElement('td');
        cell.textContent = '—';
        cell.className = 'syllable-table__empty syllable-table__placeholder';
        row.append(cell);
      } else {
        letterItems.forEach((item) => {
          const cell = document.createElement('td');
          const syllable = getPronounceableSyllable(item.icon, vowel);
          cell.classList.add('syllable-table__cell');
          cell.dataset.vowel = vowel;
          cell.dataset.letter = String(item.icon).toUpperCase();
          cell.dataset.syllable = syllable;
          cell.textContent = syllable || '—';
          if (!syllable) cell.classList.add('syllable-table__empty');
          row.append(cell);
        });
      }

      tbody.append(row);
    });

    table.append(tbody);
    elements.syllableTableWrap.replaceChildren(table);
    requestLayoutFit();
  }

  function renderControls() {
    const hasExecutableProgram = expandProgramCommands(state.program).length > 0;
    const hasProgram = state.program.length > 0;
    elements.runButton.disabled = !hasExecutableProgram || state.isRunning || state.hasWon;
    elements.undoButton.disabled = !hasProgram || state.isRunning || state.hasWon;
    elements.resetButton.disabled = state.isRunning;
    elements.moreCommandsButton.disabled = state.isRunning || state.hasWon;
    renderCustomPlayerControls();
  }

  function renderSolution() {
    elements.solutionText.textContent = currentLevel().solution;
  }

  function getNumericStyle(element, property) {
    return Number.parseFloat(window.getComputedStyle(element).getPropertyValue(property)) || 0;
  }

  function requestLayoutFit() {
    window.cancelAnimationFrame(layoutFitFrame);
    layoutFitFrame = window.requestAnimationFrame(fitBoardToViewport);
  }

  function fitBoardToViewport() {
    const level = currentLevel();
    const isTallBoard = level.mode === 'tall';
    const hardMaxWidth = isTallBoard ? 560 : 1280;
    const minimumWidth = isTallBoard ? 110 : 180;

    document.documentElement.style.setProperty('--board-max-width', `${hardMaxWidth}px`);

    const viewportWidth = window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight;
    const isPortraitViewport = viewportHeight >= viewportWidth;
    const enlargeTallMobileBoard = isTallBoard && isPortraitViewport && viewportWidth <= 680;
    const layoutRect = elements.layout.getBoundingClientRect();
    const gameRect = elements.gamePanel.getBoundingClientRect();
    const controlsRect = elements.controlsPanel.getBoundingClientRect();
    const boardShell = document.querySelector('.board-shell');
    const boardShellStyles = boardShell ? window.getComputedStyle(boardShell) : null;
    const layoutStyles = window.getComputedStyle(elements.layout);
    const layoutColumns = layoutStyles.gridTemplateColumns.split(' ').filter(Boolean).length;
    const controlsBelowBoard = layoutColumns === 1 || controlsRect.top > gameRect.top + 24;

    const layoutGap = getNumericStyle(elements.layout, controlsBelowBoard ? 'row-gap' : 'column-gap')
      || getNumericStyle(elements.layout, 'gap');
    const gamePaddingY = getNumericStyle(elements.gamePanel, 'padding-top') + getNumericStyle(elements.gamePanel, 'padding-bottom');
    const shellRowGap = boardShell ? getNumericStyle(boardShell, 'row-gap') || getNumericStyle(boardShell, 'gap') : 0;
    const axisHeight = elements.axisColumns?.offsetHeight || 0;
    const shellBorderY = boardShellStyles
      ? (Number.parseFloat(boardShellStyles.borderTopWidth) || 0) + (Number.parseFloat(boardShellStyles.borderBottomWidth) || 0)
      : 0;
    const shellBorderX = boardShellStyles
      ? (Number.parseFloat(boardShellStyles.borderLeftWidth) || 0) + (Number.parseFloat(boardShellStyles.borderRightWidth) || 0)
      : 0;

    // En móvil vertical es preferible que el tablero 7×17 sea táctil y legible,
    // aunque el usuario tenga que hacer scroll para llegar a los controles.
    const reservedByControls = controlsBelowBoard && !enlargeTallMobileBoard ? controlsRect.height + layoutGap : 0;
    const availableGameHeight = Math.max(
      140,
      viewportHeight - layoutRect.top - reservedByControls - getNumericStyle(elements.layout, 'padding-bottom') - 2,
    );

    const availableBoardHeight = Math.max(
      90,
      availableGameHeight - gamePaddingY - axisHeight - shellRowGap - shellBorderY,
    );

    const maxWidthByHeight = Math.floor(availableBoardHeight * (level.cols / level.rows));
    const maxWidthByContainer = Math.max(0, elements.boardWrap.clientWidth || gameRect.width);
    const mobileAxisWidth = elements.rowAxis?.offsetWidth || 0;
    const mobileShellGap = boardShell ? getNumericStyle(boardShell, 'column-gap') || getNumericStyle(boardShell, 'gap') : 0;
    const mobileViewportWidth = Math.max(
      minimumWidth,
      viewportWidth - mobileAxisWidth - mobileShellGap - shellBorderX - 18,
    );

    const boardWidth = enlargeTallMobileBoard
      ? Math.max(
        minimumWidth,
        Math.min(hardMaxWidth, maxWidthByContainer || mobileViewportWidth, mobileViewportWidth, 380),
      )
      : Math.max(
        minimumWidth,
        Math.min(hardMaxWidth, maxWidthByContainer, maxWidthByHeight),
      );

    document.documentElement.style.setProperty('--board-max-width', `${Math.floor(boardWidth)}px`);
    window.requestAnimationFrame(() => {
      renderPandaActor();
      positionCollectedLetterOverlay();
    });
  }

  function addCommand(command) {
    if (state.isRunning || state.hasWon) return;
    if ((state.inventory[command] ?? 0) <= 0) return;

    state.inventory[command] -= 1;
    state.program.push(command);
    setStatus('Comando añadido');
    render();
  }

  function undoLastCommand() {
    if (state.isRunning || state.program.length === 0) return;

    const command = state.program.pop();
    state.inventory[command] = (state.inventory[command] ?? 0) + 1;
    setStatus('Último comando retirado');
    render();
  }

  function addOneCommandToEachCrucetaButton() {
    if (state.isRunning || state.hasWon) return;

    addCommandsToInventory(COMMAND_ORDER);
    setStatus('Comandos extra: +1 en cada botón de la cruceta');
    render();
  }

  async function collectCurrentItem() {
    const item = getItemAt(state.panda.row, state.panda.col);
    if (!item || state.collected.has(item.id)) return null;

    state.collected.add(item.id);
    if (item.type === 'letter') state.collectedLetterIds.push(item.id);
    addCommandsToInventory(item.reward);
    renderSyllableTable();

    const rewardText = item.reward.map((command) => DIRECTIONS[command].symbol).join(' ');
    const statusType = item.type === 'key' ? 'success' : 'default';
    setStatus(`${item.name}: + ${rewardText}`, statusType);

    if (item.type === 'letter') {
      await speakLetterTable(item.icon, { includeRepeatPrompt: item.order === 1 });
    }

    return item;
  }

  async function runCommand(command) {
    if (!isBasicCommand(command)) {
      return { ok: false, message: 'El bucle necesita flechas detrás para repetirse.' };
    }

    const config = DIRECTIONS[command];
    const nextRow = state.panda.row + config.delta.row;
    const nextCol = state.panda.col + config.delta.col;

    if (!isInsideBoard(nextRow, nextCol)) {
      return { ok: false, message: 'Amanda salió del tablero.' };
    }

    if (isBlocked(nextRow, nextCol)) {
      return { ok: false, message: `Casilla bloqueada en fila ${nextRow}, columna ${nextCol}.` };
    }

    await animatePandaMove(command, nextRow, nextCol);
    state.steps = (state.steps ?? 0) + 1;
    return { ok: true };
  }

  function validateWinCondition() {
    const level = currentLevel();
    const isAtHome = state.panda.row === level.home.row && state.panda.col === level.home.col;
    const hasAllItems = level.items.every((item) => state.collected.has(item.id));

    if (isAtHome && hasAllItems) {
      state.hasWon = true;
      setStatus(getSuccessMessageText(), 'success');
      return;
    }

    if (isAtHome && !hasAllItems) {
      const needsKey = level.items.some((item) => item.type === 'key');
      setStatus(needsKey
        ? 'Llegaste a casa, pero faltan letras o la llave.'
        : 'Llegaste a casa, pero faltan letras.', 'error');
    }
  }

  async function runProgram() {
    if (state.isRunning || state.program.length === 0 || state.hasWon) return;

    const runtimeCommands = expandProgramCommands(state.program);

    if (runtimeCommands.length === 0) {
      setStatus('Añade flechas detrás del bucle para repetirlas.', 'error');
      return;
    }

    state.isRunning = true;
    state.program = [...runtimeCommands];
    renderControls();

    while (state.program.length > 0) {
      state.currentProgramIndex = 0;
      render();
      await delay(RUN_DELAY_MS);

      const command = state.program.shift();
      const result = await runCommand(command);
      state.currentProgramIndex = -1;
      render();

      if (!result.ok) {
        setStatus(result.message, 'error');
        state.program = [];
        break;
      }

      if (state.hasWon) break;
      await delay(RUN_DELAY_MS);
    }

    state.isRunning = false;
    state.currentProgramIndex = -1;
    state.program = [];
    render();
  }

  function delay(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  function resetGame() {
    const levelIndex = state.levelIndex;
    state = createInitialState(levelIndex);
    setStatus(`${currentLevel().title} reiniciado`);
    render();
  }

  function selectLevel(levelIndex) {
    if (!Number.isInteger(levelIndex) || levelIndex < 0 || levelIndex >= availableLevels().length) return;
    if (state.isRunning || state.levelIndex === levelIndex) return;

    state = createInitialState(levelIndex);
    setStatus(`${currentLevel().title} seleccionado`);
    render();
  }

  function renderCustomPlayerControls() {
    if (!elements.customPlayerForm) return;

    const isCustomOptionSelected = elements.profileSelect?.value === CUSTOM_PLAYER_OPTION;
    elements.customPlayerForm.hidden = !isCustomOptionSelected;
    document.body.classList.toggle('has-custom-player', isCustomOptionSelected);

    if (elements.customPlayerInput && elements.customPlayerInput.value !== customPlayerName) {
      elements.customPlayerInput.value = customPlayerName;
    }

    if (elements.customPlayerButton) {
      elements.customPlayerButton.disabled = state.isRunning || sanitizeCustomPlayerName(elements.customPlayerInput?.value).length === 0;
    }
  }

  function populateProfileSelect() {
    if (!elements.profileSelect) return;

    const fragment = document.createDocumentFragment();
    PLAYER_OPTIONS.forEach((optionValue) => {
      const option = document.createElement('option');
      option.value = optionValue;
      option.textContent = optionValue;
      option.selected = getProfileSelectValue() === optionValue;
      fragment.append(option);
    });

    const customOption = document.createElement('option');
    customOption.value = CUSTOM_PLAYER_OPTION;
    customOption.textContent = CUSTOM_PLAYER_LABEL;
    customOption.selected = getProfileSelectValue() === CUSTOM_PLAYER_OPTION;
    fragment.append(customOption);

    elements.profileSelect.replaceChildren(fragment);
    elements.profileSelect.value = getProfileSelectValue();
    renderCustomPlayerControls();
  }

  function applyProfileSelection(selection) {
    const normalizedSelection = sanitizeDisplayedWord(selection);
    if (normalizedSelection === currentSelection) {
      populateProfileSelect();
      return;
    }

    currentSelection = normalizedSelection;
    levelsByMode = buildLevelsByMode();
    state = createInitialState(0, state.boardMode);
    populateProfileSelect();
    setStatus(`Palabra seleccionada: ${getProfileLabel()}`);
    render();
  }

  function applyCustomPlayerName(value) {
    const normalizedName = sanitizeCustomPlayerName(value);

    if (elements.customPlayerInput) elements.customPlayerInput.value = normalizedName;
    if (!normalizedName) {
      renderCustomPlayerControls();
      setStatus('Escribe un nombre de hasta 15 letras', 'error');
      return;
    }

    customPlayerName = normalizedName;
    applyProfileSelection(normalizedName);
  }

  function selectProfile(selection) {
    if (selection === CUSTOM_PLAYER_OPTION) {
      elements.profileSelect.value = CUSTOM_PLAYER_OPTION;
      renderCustomPlayerControls();
      elements.customPlayerInput?.focus();
      return;
    }

    const normalizedSelection = sanitizeDisplayedWord(selection);
    if (!isPredefinedPlayerOption(normalizedSelection)) {
      populateProfileSelect();
      return;
    }

    applyProfileSelection(normalizedSelection);
  }

  function isKeyboardShortcutTarget(target) {
    if (!(target instanceof Element)) return true;

    return !target.closest('input, select, textarea, button, a[href], [contenteditable="true"]');
  }

  function getKeyboardCommand(event) {
    const keyCommandMap = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    };

    if (event.code === 'Space' || event.key === ' ' || event.key === 'Spacebar') {
      return 'loop3';
    }

    return keyCommandMap[event.key] ?? null;
  }

  function handleKeyboardShortcuts(event) {
    if (event.defaultPrevented || event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    if (!isKeyboardShortcutTarget(event.target)) return;

    const command = getKeyboardCommand(event);
    if (command) {
      event.preventDefault();
      resumeSyllableAudio();
      addCommand(command);
      return;
    }

    if (event.key === 'Enter' || event.code === 'NumpadEnter') {
      event.preventDefault();
      resumeSyllableAudio();
      runProgram();
      return;
    }

    if (event.key === 'Delete' || event.key === 'Del' || event.key === 'Backspace') {
      event.preventDefault();
      undoLastCommand();
    }
  }

  function bindEvents() {
    elements.levelTabs?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-level-index]');
      if (!button) return;
      selectLevel(Number.parseInt(button.dataset.levelIndex, 10));
    });

    elements.inventory.addEventListener('click', (event) => {
      resumeSyllableAudio();
      const button = event.target.closest('[data-command]');
      if (!button) return;
      addCommand(button.dataset.command);
    });

    elements.runButton.addEventListener('click', () => {
      resumeSyllableAudio();
      runProgram();
    });
    elements.undoButton.addEventListener('click', undoLastCommand);
    elements.moreCommandsButton.addEventListener('click', () => {
      resumeSyllableAudio();
      addOneCommandToEachCrucetaButton();
    });
    elements.resetButton.addEventListener('click', () => {
      resumeSyllableAudio();
      resetGame();
    });

    elements.profileSelect?.addEventListener('change', (event) => {
      selectProfile(event.target.value);
    });

    elements.customPlayerInput?.addEventListener('input', (event) => {
      const normalizedName = sanitizeCustomPlayerName(event.target.value);
      if (event.target.value !== normalizedName) event.target.value = normalizedName;
      customPlayerName = normalizedName;
      renderCustomPlayerControls();
    });

    elements.customPlayerForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      resumeSyllableAudio();
      applyCustomPlayerName(elements.customPlayerInput?.value);
    });

    document.addEventListener('keydown', handleKeyboardShortcuts);
  }

  prepareSpeechVoices();
  if (supportsSpeechSynthesis() && window.speechSynthesis.addEventListener) {
    window.speechSynthesis.addEventListener('voiceschanged', prepareSpeechVoices);
  }

  populateProfileSelect();
  bindEvents();
  window.addEventListener('resize', () => {
    if (!syncBoardModeWithViewport()) requestLayoutFit();
  }, { passive: true });

  window.addEventListener('orientationchange', () => {
    window.setTimeout(() => {
      if (!syncBoardModeWithViewport()) requestLayoutFit();
    }, 120);
  }, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
      if (!syncBoardModeWithViewport()) requestLayoutFit();
    }, { passive: true });
  }

  render();
})();
