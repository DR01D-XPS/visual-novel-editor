
const STORAGE_KEY = "vn_builder_project_v2";

function uid(prefix) {
  return prefix + "-" + Math.random().toString(36).slice(2, 8);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function normOptionalNumber(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return clamp(num, min, max);
}

function animClass(type) {
  if (type === "fade") return "anim-fade";
  if (type === "left") return "anim-left";
  if (type === "right") return "anim-right";
  if (type === "pop") return "anim-pop";
  return "";
}

function cleanId(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9а-яА-ЯёЁ_-]/g, "");
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });
}

function createMainUi() {
  return {
    leftLabel: "Назад",
    rightLabel: "Далее",
    leftImage: "",
    rightImage: ""
  };
}

function createChoice() {
  return {
    id: uid("choice"),
    label: "Вариант",
    targetScene: "",
    targetStep: "",
    setKey: "",
    setValue: ""
  };
}

function createStep() {
  return {
    id: uid("step"),
    text: "Новая реплика",
    requiredKey: "",
    requiredValue: "",
    isChoicePoint: true,
    choices: []
  };
}

function createCharacter() {
  return {
    id: uid("char"),
    name: "Персонаж",
    image: "",
    x: 50,
    y: 86,
    scale: 100,
    phoneX: null,
    phoneY: null,
    phoneScale: null,
    z: 10,
    animation: "none"
  };
}

function createTextBlock() {
  return {
    id: uid("txt"),
    content: "Текст",
    x: 50,
    y: 20,
    size: 28,
    phoneX: null,
    phoneY: null,
    phoneSize: null,
    color: "#ffffff",
    z: 20,
    animation: "none"
  };
}

function createSceneButton() {
  return {
    id: uid("btn"),
    label: "Кнопка",
    image: "",
    x: 50,
    y: 72,
    scale: 100,
    phoneX: null,
    phoneY: null,
    phoneScale: null,
    z: 30,
    animation: "none",
    targetScene: "",
    targetStep: "",
    setKey: "",
    setValue: "",
    openChoices: false
  };
}

function createScene(sceneId) {
  return {
    id: sceneId,
    title: "Новая сцена",
    background: "",
    ui: createMainUi(),
    characters: [],
    texts: [],
    buttons: [],
    steps: [createStep()]
  };
}

function normalizeChoice(choice) {
  return {
    id: String(choice && choice.id ? choice.id : uid("choice")),
    label: String(choice && choice.label ? choice.label : "Вариант"),
    targetScene: cleanId(choice && choice.targetScene ? choice.targetScene : ""),
    targetStep: cleanId(choice && choice.targetStep ? choice.targetStep : ""),
    setKey: String(choice && choice.setKey ? choice.setKey : "").trim(),
    setValue: String(choice && choice.setValue ? choice.setValue : "")
  };
}

function normalizeStep(step, index) {
  const safeId = cleanId(step && step.id ? step.id : "") || "step-" + (index + 1);
  const choices = Array.isArray(step && step.choices) ? step.choices.map(normalizeChoice) : [];

  return {
    id: safeId,
    text: String(step && step.text ? step.text : ""),
    requiredKey: String(step && step.requiredKey ? step.requiredKey : "").trim(),
    requiredValue: String(step && step.requiredValue ? step.requiredValue : ""),
    isChoicePoint:
      step && typeof step.isChoicePoint === "boolean"
        ? step.isChoicePoint
        : true,
    choices
  };
}

function normalizeCharacter(char) {
  return {
    id: String(char && char.id ? char.id : uid("char")),
    name: String(char && char.name ? char.name : "Персонаж"),
    image: String(char && char.image ? char.image : ""),
    x: clamp(normNumber(char && char.x, 50), 0, 100),
    y: clamp(normNumber(char && char.y, 86), 0, 100),
    scale: clamp(normNumber(char && char.scale, 100), 20, 340),
    phoneX: normOptionalNumber(char && char.phoneX, 0, 100),
    phoneY: normOptionalNumber(char && char.phoneY, 0, 100),
    phoneScale: normOptionalNumber(char && char.phoneScale, 20, 340),
    z: clamp(normNumber(char && char.z, 10), 1, 99),
    animation: String(char && char.animation ? char.animation : "none")
  };
}

function normalizeTextBlock(text) {
  return {
    id: String(text && text.id ? text.id : uid("txt")),
    content: String(text && text.content ? text.content : ""),
    x: clamp(normNumber(text && text.x, 50), 0, 100),
    y: clamp(normNumber(text && text.y, 20), 0, 100),
    size: clamp(normNumber(text && text.size, 28), 12, 160),
    phoneX: normOptionalNumber(text && text.phoneX, 0, 100),
    phoneY: normOptionalNumber(text && text.phoneY, 0, 100),
    phoneSize: normOptionalNumber(text && text.phoneSize, 12, 160),
    color: String(text && text.color ? text.color : "#ffffff"),
    z: clamp(normNumber(text && text.z, 20), 1, 99),
    animation: String(text && text.animation ? text.animation : "none")
  };
}
function normalizeSceneButton(button) {
  return {
    id: String(button && button.id ? button.id : uid("btn")),
    label: String(button && button.label ? button.label : "Кнопка"),
    image: String(button && button.image ? button.image : ""),
    x: clamp(normNumber(button && button.x, 50), 0, 100),
    y: clamp(normNumber(button && button.y, 72), 0, 100),
    scale: clamp(normNumber(button && button.scale, 100), 20, 340),
    phoneX: normOptionalNumber(button && button.phoneX, 0, 100),
    phoneY: normOptionalNumber(button && button.phoneY, 0, 100),
    phoneScale: normOptionalNumber(button && button.phoneScale, 20, 340),
    z: clamp(normNumber(button && button.z, 30), 1, 99),
    animation: String(button && button.animation ? button.animation : "none"),
    targetScene: cleanId(button && button.targetScene ? button.targetScene : ""),
    targetStep: cleanId(button && button.targetStep ? button.targetStep : ""),
    setKey: String(button && button.setKey ? button.setKey : "").trim(),
    setValue: String(button && button.setValue ? button.setValue : ""),
    openChoices: Boolean(button && button.openChoices)
  };
}

function normalizeScene(scene, index) {
  const id = cleanId(scene && scene.id ? scene.id : "") || "scene-" + (index + 1);
  const ui = scene && scene.ui ? scene.ui : {};
  const stepsRaw = Array.isArray(scene && scene.steps)
    ? scene.steps
    : [
        {
          id: uid("step"),
          text: String(scene && scene.text ? scene.text : "Начало истории"),
          choices: []
        }
      ];

  const steps = stepsRaw.map((step, idx) => normalizeStep(step, idx));
  if (steps.length === 0) steps.push(createStep());

  return {
    id,
    title: String(scene && scene.title ? scene.title : "Сцена"),
    background: String(scene && scene.background ? scene.background : ""),
    ui: {
      leftLabel: String(ui.leftLabel || "Назад"),
      rightLabel: String(ui.rightLabel || "Далее"),
      leftImage: String(ui.leftImage || ""),
      rightImage: String(ui.rightImage || "")
    },
    characters: Array.isArray(scene && scene.characters) ? scene.characters.map(normalizeCharacter) : [],
    texts: Array.isArray(scene && scene.texts) ? scene.texts.map(normalizeTextBlock) : [],
    buttons: Array.isArray(scene && scene.buttons) ? scene.buttons.map(normalizeSceneButton) : [],
    steps
  };
}

function defaultState() {
  const first = createScene("scene-1");
  first.title = "Начало";
  first.steps[0].text = "Добро пожаловать в новеллу.";
  return {
    scenes: [first],
    currentSceneId: first.id,
    playSceneId: first.id,
    mode: "editor",
    previewDevice: "desktop",
    stepCursorByScene: {
      [first.id]: first.steps[0].id
    },
    memory: {},
    choiceOverlay: null,
    selectedObject: null
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("vn_builder_project_v1");
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.scenes) || parsed.scenes.length === 0) {
      return defaultState();
    }

    const scenes = parsed.scenes.map((scene, i) => normalizeScene(scene, i));
    const firstSceneId = scenes[0].id;
    const currentSceneId = scenes.some((scene) => scene.id === parsed.currentSceneId)
      ? parsed.currentSceneId
      : firstSceneId;

    const cursorByScene = {};
    for (const scene of scenes) {
      const fromStorage =
        parsed.stepCursorByScene && typeof parsed.stepCursorByScene === "object"
          ? cleanId(parsed.stepCursorByScene[scene.id] || "")
          : "";
      if (fromStorage && scene.steps.some((step) => step.id === fromStorage)) {
        cursorByScene[scene.id] = fromStorage;
      } else {
        cursorByScene[scene.id] = scene.steps[0].id;
      }
    }

    return {
      scenes,
      currentSceneId,
      playSceneId: currentSceneId,
      mode: "editor",
      previewDevice: parsed.previewDevice === "phone" ? "phone" : "desktop",
      stepCursorByScene: cursorByScene,
      memory: {},
      choiceOverlay: null,
      selectedObject: null
    };
  } catch {
    return defaultState();
  }
}

const state = loadState();

const dom = {
  modeToggle: document.getElementById("modeToggle"),
  exportBtn: document.getElementById("exportBtn"),
  addSceneBtn: document.getElementById("addSceneBtn"),
  sceneList: document.getElementById("sceneList"),
  sceneId: document.getElementById("sceneId"),
  sceneTitle: document.getElementById("sceneTitle"),
  sceneBackgroundFile: document.getElementById("sceneBackgroundFile"),
  clearBackgroundBtn: document.getElementById("clearBackgroundBtn"),
  backgroundHint: document.getElementById("backgroundHint"),
  mainLeftLabel: document.getElementById("mainLeftLabel"),
  mainLeftImageFile: document.getElementById("mainLeftImageFile"),
  mainRightLabel: document.getElementById("mainRightLabel"),
  mainRightImageFile: document.getElementById("mainRightImageFile"),
  addCharacterBtn: document.getElementById("addCharacterBtn"),
  addTextBtn: document.getElementById("addTextBtn"),
  addButtonBtn: document.getElementById("addButtonBtn"),
  addStepBtn: document.getElementById("addStepBtn"),
  characterEditor: document.getElementById("characterEditor"),
  textEditor: document.getElementById("textEditor"),
  buttonEditor: document.getElementById("buttonEditor"),
  stepEditor: document.getElementById("stepEditor"),
  modeHint: document.getElementById("modeHint"),
  stageWrap: document.getElementById("stageWrap"),
  desktopTab: document.getElementById("desktopTab"),
  mobileTab: document.getElementById("mobileTab"),
  stage: document.getElementById("stage")
};

const interaction = {
  active: false,
  pointerId: null,
  kind: "",
  objId: "",
  mode: "",
  startX: 0,
  startY: 0,
  startStageX: 0,
  startStageY: 0,
  originX: 0,
  originY: 0,
  originScale: 100,
  originSize: 28,
  element: null
};

let storageWarned = false;

function saveState() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        scenes: state.scenes,
        currentSceneId: state.currentSceneId,
        previewDevice: state.previewDevice,
        stepCursorByScene: state.stepCursorByScene
      })
    );
  } catch {
    if (!storageWarned) {
      storageWarned = true;
      alert("Проект слишком большой для автосохранения. Экспорт в HTML продолжит работать.");
    }
  }
}

function getSceneById(sceneId) {
  return state.scenes.find((scene) => scene.id === sceneId);
}

function getCurrentScene() {
  return getSceneById(state.currentSceneId) || state.scenes[0];
}

function getActiveScene() {
  if (state.mode === "play") {
    return getSceneById(state.playSceneId) || state.scenes[0];
  }
  return getCurrentScene();
}

function ensureSceneCursor(scene) {
  if (!scene || !scene.steps.length) return "";
  const cursor = cleanId(state.stepCursorByScene[scene.id] || "");
  if (cursor && scene.steps.some((step) => step.id === cursor)) {
    return cursor;
  }
  state.stepCursorByScene[scene.id] = scene.steps[0].id;
  return scene.steps[0].id;
}

function setSceneCursor(sceneId, stepId) {
  state.stepCursorByScene[sceneId] = stepId;
}

function getStepById(scene, stepId) {
  if (!scene) return null;
  return scene.steps.find((step) => step.id === stepId) || null;
}
function sceneOptionsHtml(selected) {
  return state.scenes
    .map((scene) => {
      const mark = scene.id === selected ? "selected" : "";
      return `<option value="${escapeHtml(scene.id)}" ${mark}>${escapeHtml(scene.id)}</option>`;
    })
    .join("");
}

function stepPassesCondition(step) {
  if (!step) return false;
  if (state.mode !== "play") return true;
  if (!step.requiredKey) return true;
  const value = state.memory[step.requiredKey];
  return String(value == null ? "" : value) === String(step.requiredValue || "");
}

function getCurrentStepPayload(scene) {
  if (!scene || !scene.steps.length) return null;
  const cursorId = ensureSceneCursor(scene);
  let index = scene.steps.findIndex((step) => step.id === cursorId);
  if (index < 0) index = 0;

  if (!stepPassesCondition(scene.steps[index])) {
    const visible = scene.steps.find((step) => stepPassesCondition(step));
    if (visible) {
      index = scene.steps.findIndex((step) => step.id === visible.id);
      setSceneCursor(scene.id, visible.id);
    }
  }

  return {
    step: scene.steps[index],
    index
  };
}

function findAdjacentStepIndex(scene, startIndex, direction) {
  const step = direction >= 0 ? 1 : -1;
  let index = startIndex + step;
  while (index >= 0 && index < scene.steps.length) {
    if (stepPassesCondition(scene.steps[index])) {
      return index;
    }
    index += step;
  }
  return -1;
}

function resolveMemoryTemplate(text) {
  return String(text || "").replace(/\{\{\s*([a-zA-Z0-9а-яА-ЯёЁ_-]+)\s*\}\}/g, (_, key) => {
    const value = state.memory[key];
    return value == null ? "" : String(value);
  });
}

function currentLayoutDevice() {
  return state.previewDevice === "phone" ? "phone" : "desktop";
}

function getLayoutNumber(desktopValue, phoneValue, fallback, min, max, device = currentLayoutDevice()) {
  const desktop = clamp(normNumber(desktopValue, fallback), min, max);
  if (device !== "phone") return desktop;
  if (phoneValue == null || phoneValue === "") return desktop;
  return clamp(normNumber(phoneValue, desktop), min, max);
}

function setLayoutNumber(object, desktopKey, phoneKey, value, fallback, min, max, device = currentLayoutDevice()) {
  const safeValue = clamp(normNumber(value, fallback), min, max);
  if (device === "phone") {
    object[phoneKey] = safeValue;
  } else {
    object[desktopKey] = safeValue;
  }
  return safeValue;
}

function isSelected(kind, id) {
  return Boolean(state.selectedObject && state.selectedObject.kind === kind && state.selectedObject.id === id);
}

function renderSceneList() {
  dom.sceneList.innerHTML = "";
  for (const scene of state.scenes) {
    const item = document.createElement("div");
    item.className = "scene-item" + (scene.id === state.currentSceneId ? " active" : "");
    item.dataset.sceneId = scene.id;

    const title = document.createElement("span");
    title.className = "scene-item-title";
    title.textContent = (scene.title || "Без названия") + " (" + scene.id + ")";

    const remove = document.createElement("button");
    remove.className = "scene-remove";
    remove.type = "button";
    remove.dataset.removeId = scene.id;
    remove.textContent = "x";

    item.append(title, remove);
    dom.sceneList.appendChild(item);
  }
}

function renderSceneFields() {
  const scene = getCurrentScene();
  if (!scene) return;

  dom.sceneId.value = scene.id;
  dom.sceneTitle.value = scene.title;
  dom.backgroundHint.textContent = scene.background ? "Фон загружен" : "Фон не выбран";

  dom.mainLeftLabel.value = scene.ui.leftLabel;
  dom.mainRightLabel.value = scene.ui.rightLabel;

  if (dom.sceneBackgroundFile) dom.sceneBackgroundFile.value = "";
  if (dom.mainLeftImageFile) dom.mainLeftImageFile.value = "";
  if (dom.mainRightImageFile) dom.mainRightImageFile.value = "";
}

function renderCharacterEditor() {
  const scene = getCurrentScene();
  if (!scene) return;
  const layoutDevice = currentLayoutDevice();

  if (scene.characters.length === 0) {
    dom.characterEditor.innerHTML = `<div class="empty">Персонажей пока нет</div>`;
    return;
  }

  dom.characterEditor.innerHTML = scene.characters
    .map((char, index) => {
      const xValue = getLayoutNumber(char.x, char.phoneX, 50, 0, 100, layoutDevice);
      const yValue = getLayoutNumber(char.y, char.phoneY, 86, 0, 100, layoutDevice);
      const scaleValue = getLayoutNumber(char.scale, char.phoneScale, 100, 20, 340, layoutDevice);
      return `
        <article class="card" data-index="${index}">
          <div class="card-head">
            <strong>${escapeHtml(char.name || "Персонаж")}</strong>
            <button class="btn btn-danger" type="button" data-action="remove">Удалить</button>
          </div>
          <div class="field">
            <label>Имя</label>
            <input type="text" name="name" value="${escapeHtml(char.name)}" />
          </div>
          <div class="field">
            <label>Файл персонажа</label>
            <input type="file" name="imageFile" accept="image/*" />
            ${char.image ? '<button class="btn btn-small" type="button" data-action="clear-image">Очистить изображение</button>' : ""}
          </div>
          <div class="row">
            <div class="field">
              <label>X (%)</label>
              <input type="number" name="x" min="0" max="100" value="${xValue}" />
            </div>
            <div class="field">
              <label>Y (%)</label>
              <input type="number" name="y" min="0" max="100" value="${yValue}" />
            </div>
          </div>
          <div class="row">
            <div class="field">
              <label>Размер (%)</label>
              <input type="number" name="scale" min="20" max="340" value="${scaleValue}" />
            </div>
            <div class="field">
              <label>Слой</label>
              <input type="number" name="z" min="1" max="99" value="${char.z}" />
            </div>
          </div>
          <div class="field">
            <label>Анимация</label>
            <select name="animation">
              <option value="none" ${char.animation === "none" ? "selected" : ""}>Без анимации</option>
              <option value="fade" ${char.animation === "fade" ? "selected" : ""}>Плавно</option>
              <option value="left" ${char.animation === "left" ? "selected" : ""}>Слева</option>
              <option value="right" ${char.animation === "right" ? "selected" : ""}>Справа</option>
              <option value="pop" ${char.animation === "pop" ? "selected" : ""}>Появление</option>
            </select>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderTextEditor() {
  const scene = getCurrentScene();
  if (!scene) return;
  const layoutDevice = currentLayoutDevice();

  if (scene.texts.length === 0) {
    dom.textEditor.innerHTML = `<div class="empty">Текстовых блоков пока нет</div>`;
    return;
  }

  dom.textEditor.innerHTML = scene.texts
    .map((text, index) => {
      const xValue = getLayoutNumber(text.x, text.phoneX, 50, 0, 100, layoutDevice);
      const yValue = getLayoutNumber(text.y, text.phoneY, 20, 0, 100, layoutDevice);
      const sizeValue = getLayoutNumber(text.size, text.phoneSize, 28, 12, 160, layoutDevice);
      return `
        <article class="card" data-index="${index}">
          <div class="card-head">
            <strong>Текст #${index + 1}</strong>
            <button class="btn btn-danger" type="button" data-action="remove">Удалить</button>
          </div>
          <div class="field">
            <label>Содержимое</label>
            <textarea rows="2" name="content">${escapeHtml(text.content)}</textarea>
          </div>
          <div class="row">
            <div class="field">
              <label>X (%)</label>
              <input type="number" name="x" min="0" max="100" value="${xValue}" />
            </div>
            <div class="field">
              <label>Y (%)</label>
              <input type="number" name="y" min="0" max="100" value="${yValue}" />
            </div>
          </div>
          <div class="row">
            <div class="field">
              <label>Размер (px)</label>
              <input type="number" name="size" min="12" max="160" value="${sizeValue}" />
            </div>
            <div class="field">
              <label>Слой</label>
              <input type="number" name="z" min="1" max="99" value="${text.z}" />
            </div>
          </div>
          <div class="row">
            <div class="field">
              <label>Цвет</label>
              <input type="color" name="color" value="${escapeHtml(text.color)}" />
            </div>
            <div class="field">
              <label>Анимация</label>
              <select name="animation">
                <option value="none" ${text.animation === "none" ? "selected" : ""}>Без анимации</option>
                <option value="fade" ${text.animation === "fade" ? "selected" : ""}>Плавно</option>
                <option value="left" ${text.animation === "left" ? "selected" : ""}>Слева</option>
                <option value="right" ${text.animation === "right" ? "selected" : ""}>Справа</option>
                <option value="pop" ${text.animation === "pop" ? "selected" : ""}>Появление</option>
              </select>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}
function renderButtonEditor() {
  const scene = getCurrentScene();
  if (!scene) return;
  const layoutDevice = currentLayoutDevice();

  if (scene.buttons.length === 0) {
    dom.buttonEditor.innerHTML = `<div class="empty">Кнопок развилки пока нет</div>`;
    return;
  }

  dom.buttonEditor.innerHTML = scene.buttons
    .map((button, index) => {
      const xValue = getLayoutNumber(button.x, button.phoneX, 50, 0, 100, layoutDevice);
      const yValue = getLayoutNumber(button.y, button.phoneY, 72, 0, 100, layoutDevice);
      const scaleValue = getLayoutNumber(button.scale, button.phoneScale, 100, 20, 340, layoutDevice);
      return `
        <article class="card" data-index="${index}">
          <div class="card-head">
            <strong>Кнопка #${index + 1}</strong>
            <button class="btn btn-danger" type="button" data-action="remove">Удалить</button>
          </div>
          <div class="field">
            <label>Надпись</label>
            <input type="text" name="label" value="${escapeHtml(button.label)}" />
          </div>
          <div class="field">
            <label>Изображение кнопки (файл)</label>
            <input type="file" name="imageFile" accept="image/*" />
            ${button.image ? '<button class="btn btn-small" type="button" data-action="clear-image">Очистить изображение</button>' : ""}
          </div>
          <div class="row">
            <div class="field">
              <label>X (%)</label>
              <input type="number" name="x" min="0" max="100" value="${xValue}" />
            </div>
            <div class="field">
              <label>Y (%)</label>
              <input type="number" name="y" min="0" max="100" value="${yValue}" />
            </div>
          </div>
          <div class="row">
            <div class="field">
              <label>Размер (%)</label>
              <input type="number" name="scale" min="20" max="340" value="${scaleValue}" />
            </div>
            <div class="field">
              <label>Слой</label>
              <input type="number" name="z" min="1" max="99" value="${button.z}" />
            </div>
          </div>
          <div class="field">
            <label>Анимация</label>
            <select name="animation">
              <option value="none" ${button.animation === "none" ? "selected" : ""}>Без анимации</option>
              <option value="fade" ${button.animation === "fade" ? "selected" : ""}>Плавно</option>
              <option value="left" ${button.animation === "left" ? "selected" : ""}>Слева</option>
              <option value="right" ${button.animation === "right" ? "selected" : ""}>Справа</option>
              <option value="pop" ${button.animation === "pop" ? "selected" : ""}>Появление</option>
            </select>
          </div>
          <div class="field">
            <label>Переход в сцену</label>
            <input type="text" name="targetScene" list="scene-id-list" value="${escapeHtml(button.targetScene)}" placeholder="scene-2" />
          </div>
          <div class="field">
            <label>Переход к реплике (ID)</label>
            <input type="text" name="targetStep" value="${escapeHtml(button.targetStep)}" placeholder="step-1" />
          </div>
          <div class="row">
            <div class="field">
              <label>Ключ памяти</label>
              <input type="text" name="setKey" value="${escapeHtml(button.setKey)}" placeholder="flag" />
            </div>
            <div class="field">
              <label>Значение памяти</label>
              <input type="text" name="setValue" value="${escapeHtml(button.setValue)}" placeholder="1" />
            </div>
          </div>
          <div class="field">
            <label><input type="checkbox" name="openChoices" ${button.openChoices ? "checked" : ""} /> Открывать окно выбора текущей реплики</label>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderStepEditor() {
  const scene = getCurrentScene();
  if (!scene) return;

  if (scene.steps.length === 0) {
    dom.stepEditor.innerHTML = `<div class="empty">Диалогов пока нет</div>`;
    return;
  }

  dom.stepEditor.innerHTML = scene.steps
    .map((step, stepIndex) => {
      const choicesHtml =
        step.choices.length === 0
          ? `<div class="empty">Выборов нет</div>`
          : step.choices
              .map((choice, choiceIndex) => {
                return `
                  <div class="card choice-card" data-choice-index="${choiceIndex}">
                    <div class="card-head">
                      <strong>Вариант #${choiceIndex + 1}</strong>
                      <button class="btn btn-danger" type="button" data-action="remove-choice">Удалить</button>
                    </div>
                    <div class="field">
                      <label>Текст варианта</label>
                      <input type="text" name="choiceLabel" value="${escapeHtml(choice.label)}" />
                    </div>
                    <div class="field">
                      <label>Переход в сцену</label>
                      <input type="text" name="choiceTargetScene" list="scene-id-list" value="${escapeHtml(choice.targetScene)}" placeholder="scene-2" />
                    </div>
                    <div class="field">
                      <label>Переход к реплике (ID)</label>
                      <input type="text" name="choiceTargetStep" value="${escapeHtml(choice.targetStep)}" placeholder="step-1" />
                    </div>
                    <div class="row">
                      <div class="field">
                        <label>Ключ памяти</label>
                        <input type="text" name="choiceSetKey" value="${escapeHtml(choice.setKey)}" placeholder="flag" />
                      </div>
                      <div class="field">
                        <label>Значение памяти</label>
                        <input type="text" name="choiceSetValue" value="${escapeHtml(choice.setValue)}" placeholder="1" />
                      </div>
                    </div>
                  </div>
                `;
              })
              .join("");

      return `
        <article class="card step-card" data-step-index="${stepIndex}">
          <div class="card-head">
            <strong>Реплика #${stepIndex + 1}</strong>
            <button class="btn btn-danger" type="button" data-action="remove-step">Удалить</button>
          </div>
          <div class="field">
            <label>ID реплики</label>
            <input type="text" name="stepId" value="${escapeHtml(step.id)}" />
          </div>
          <div class="field">
            <label>Текст (можно {{ключ}} из памяти)</label>
            <textarea rows="3" name="stepText">${escapeHtml(step.text)}</textarea>
          </div>
          <div class="row">
            <div class="field">
              <label>Показывать только если ключ памяти</label>
              <input type="text" name="stepReqKey" value="${escapeHtml(step.requiredKey)}" placeholder="flag" />
            </div>
            <div class="field">
              <label>равен значению</label>
              <input type="text" name="stepReqValue" value="${escapeHtml(step.requiredValue)}" placeholder="1" />
            </div>
          </div>
          <div class="field">
            <label>
              <input type="checkbox" name="stepChoicePoint" ${step.isChoicePoint !== false ? "checked" : ""} />
              Это точка выбора (варианты откроются по кнопке "Далее")
            </label>
          </div>
          <div class="field">
            <button class="btn btn-small" type="button" data-action="add-choice">+ Вариант выбора</button>
          </div>
          <div class="stack">${choicesHtml}</div>
        </article>
      `;
    })
    .join("");

  let datalist = document.getElementById("scene-id-list");
  if (!datalist) {
    datalist = document.createElement("datalist");
    datalist.id = "scene-id-list";
    document.body.appendChild(datalist);
  }
  datalist.innerHTML = sceneOptionsHtml("");
}

function applyCharacterStyle(node, char, device = currentLayoutDevice()) {
  const x = getLayoutNumber(char.x, char.phoneX, 50, 0, 100, device);
  const y = getLayoutNumber(char.y, char.phoneY, 86, 0, 100, device);
  const scale = getLayoutNumber(char.scale, char.phoneScale, 100, 20, 340, device);
  node.style.left = x + "%";
  node.style.top = y + "%";
  node.style.zIndex = String(20 + clamp(normNumber(char.z, 10), 1, 99));
  node.style.transform = "translate(-50%, -100%) scale(" + scale / 100 + ")";
}

function applyTextStyle(node, text, device = currentLayoutDevice()) {
  const x = getLayoutNumber(text.x, text.phoneX, 50, 0, 100, device);
  const y = getLayoutNumber(text.y, text.phoneY, 20, 0, 100, device);
  const size = getLayoutNumber(text.size, text.phoneSize, 28, 12, 160, device);
  node.style.left = x + "%";
  node.style.top = y + "%";
  node.style.zIndex = String(30 + clamp(normNumber(text.z, 20), 1, 99));
  node.style.transform = "translate(-50%, -50%)";
  node.style.fontSize = size + "px";
  node.style.color = text.color || "#ffffff";
}

function applyButtonStyle(node, button, device = currentLayoutDevice()) {
  const x = getLayoutNumber(button.x, button.phoneX, 50, 0, 100, device);
  const y = getLayoutNumber(button.y, button.phoneY, 72, 0, 100, device);
  const scale = getLayoutNumber(button.scale, button.phoneScale, 100, 20, 340, device);
  node.style.left = x + "%";
  node.style.top = y + "%";
  node.style.zIndex = String(40 + clamp(normNumber(button.z, 30), 1, 99));
  node.style.transform = "translate(-50%, -50%) scale(" + scale / 100 + ")";
}

function addResizeHandle(node) {
  const handle = document.createElement("div");
  handle.className = "resize-handle";
  node.appendChild(handle);
}
function renderPreview() {
  const scene = getActiveScene();
  dom.stage.innerHTML = "";

  if (!scene) {
    dom.stage.innerHTML = `<div class="stage-note">Нет сцены</div>`;
    return;
  }

  if (scene.background) {
    const bg = document.createElement("img");
    bg.className = "stage-bg";
    bg.src = scene.background;
    bg.alt = "Фон";
    dom.stage.appendChild(bg);
  }

  const chars = [...scene.characters].sort((a, b) => a.z - b.z);
  for (const char of chars) {
    const node = document.createElement("div");
    node.className = "stage-object vn-character " + animClass(char.animation);
    node.dataset.kind = "character";
    node.dataset.objId = char.id;
    if (state.mode === "editor") node.classList.add("editable");
    if (isSelected("character", char.id)) node.classList.add("selected");
    applyCharacterStyle(node, char);

    if (char.image) {
      const img = document.createElement("img");
      img.src = char.image;
      img.alt = char.name || "Персонаж";
      node.appendChild(img);
    } else {
      const fallback = document.createElement("div");
      fallback.style.padding = "0.5rem 0.7rem";
      fallback.style.background = "rgba(0,0,0,0.6)";
      fallback.style.borderRadius = "8px";
      fallback.style.color = "#fff";
      fallback.textContent = char.name || "Персонаж";
      node.appendChild(fallback);
    }

    if (state.mode === "editor") addResizeHandle(node);
    dom.stage.appendChild(node);
  }

  const texts = [...scene.texts].sort((a, b) => a.z - b.z);
  for (const text of texts) {
    const node = document.createElement("div");
    node.className = "stage-object vn-text " + animClass(text.animation);
    node.dataset.kind = "text";
    node.dataset.objId = text.id;
    if (state.mode === "editor") node.classList.add("editable");
    if (isSelected("text", text.id)) node.classList.add("selected");
    applyTextStyle(node, text);
    node.textContent = text.content;
    if (state.mode === "editor") addResizeHandle(node);
    dom.stage.appendChild(node);
  }

  const buttons = [...scene.buttons].sort((a, b) => a.z - b.z);
  for (const button of buttons) {
    const node = document.createElement("button");
    node.className = "stage-object vn-button " + animClass(button.animation);
    node.type = "button";
    node.dataset.kind = "button";
    node.dataset.objId = button.id;
    if (state.mode === "editor") node.classList.add("editable");
    if (isSelected("button", button.id)) node.classList.add("selected");
    applyButtonStyle(node, button);

    if (button.image) {
      const img = document.createElement("img");
      img.src = button.image;
      img.alt = button.label || "Кнопка";
      node.appendChild(img);
    } else {
      node.textContent = button.label || "Кнопка";
    }

    if (state.mode === "editor") {
      addResizeHandle(node);
    } else {
      node.addEventListener("click", () => {
        runAction(button, scene);
        renderAll();
      });
    }

    dom.stage.appendChild(node);
  }

  const payload = getCurrentStepPayload(scene);
  const step = payload ? payload.step : null;

  if (step) {
    const dialog = document.createElement("div");
    dialog.className = "dialog-box";
    const resolvedText = resolveMemoryTemplate(step.text);
    dialog.innerHTML = "<p>" + escapeHtml(resolvedText).replace(/\n/g, "<br>") + "</p>";
    dom.stage.appendChild(dialog);
  } else {
    const note = document.createElement("div");
    note.className = "stage-note";
    note.textContent = "Добавь реплику, чтобы увидеть диалог";
    dom.stage.appendChild(note);
  }

  renderMainButtons(scene, step, payload ? payload.index : 0);
  renderChoiceOverlay(scene, step);
}

function renderMainButtons(scene, step, stepIndex) {
  const left = document.createElement("button");
  left.type = "button";
  left.className = "main-nav-btn left";
  if (scene.ui.leftImage) {
    const img = document.createElement("img");
    img.src = scene.ui.leftImage;
    img.alt = scene.ui.leftLabel || "Назад";
    left.appendChild(img);
  } else {
    left.textContent = scene.ui.leftLabel || "Назад";
  }
  left.addEventListener("click", () => {
    state.choiceOverlay = null;
    const prev = findAdjacentStepIndex(scene, stepIndex, -1);
    if (prev >= 0) {
      setSceneCursor(scene.id, scene.steps[prev].id);
      renderPreview();
      saveState();
    }
  });

  const right = document.createElement("button");
  right.type = "button";
  right.className = "main-nav-btn right";
  if (scene.ui.rightImage) {
    const img = document.createElement("img");
    img.src = scene.ui.rightImage;
    img.alt = scene.ui.rightLabel || "Далее";
    right.appendChild(img);
  } else {
    right.textContent = scene.ui.rightLabel || "Далее";
  }
  right.addEventListener("click", () => {
    if (canOpenChoicesOnStep(step)) {
      state.choiceOverlay = {
        sceneId: scene.id,
        stepId: step.id
      };
      renderPreview();
      return;
    }

    const next = findAdjacentStepIndex(scene, stepIndex, 1);
    if (next >= 0) {
      setSceneCursor(scene.id, scene.steps[next].id);
      renderPreview();
      saveState();
    }
  });

  dom.stage.append(left, right);
}

function renderChoiceOverlay(scene, step) {
  if (!step || !state.choiceOverlay) return;
  if (state.choiceOverlay.sceneId !== scene.id || state.choiceOverlay.stepId !== step.id) return;

  const dim = document.createElement("div");
  dim.className = "choice-dim";
  dim.addEventListener("click", () => {
    state.choiceOverlay = null;
    renderPreview();
  });

  const modal = document.createElement("div");
  modal.className = "choice-modal";
  modal.innerHTML = `<h3 class="choice-title">Сделайте выбор</h3>`;

  if (!Array.isArray(step.choices) || step.choices.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Вариантов пока нет";
    modal.appendChild(empty);
  } else {
    for (const choice of step.choices) {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "choice-option";
      option.textContent = choice.label || "Вариант";
      option.addEventListener("click", () => {
        applyChoice(choice, scene);
      });
      modal.appendChild(option);
    }
  }

  dom.stage.append(dim, modal);
}

function applyMemoryAction(action) {
  if (!action || !action.setKey) return;
  state.memory[action.setKey] = action.setValue || "1";
}

function canOpenChoicesOnStep(step) {
  return Boolean(step && step.isChoicePoint !== false && Array.isArray(step.choices) && step.choices.length > 0);
}

function runAction(action, originScene) {
  if (!action || !originScene) return;
  applyMemoryAction(action);

  let targetScene = originScene;
  if (action.targetScene) {
    const byId = getSceneById(action.targetScene);
    if (byId) {
      targetScene = byId;
      if (state.mode === "play") {
        state.playSceneId = byId.id;
      } else {
        state.currentSceneId = byId.id;
      }
    }
  }

  if (action.targetStep) {
    const step = getStepById(targetScene, action.targetStep);
    if (step) {
      setSceneCursor(targetScene.id, step.id);
    }
  } else {
    ensureSceneCursor(targetScene);
  }

  if (action.openChoices) {
    const payload = getCurrentStepPayload(targetScene);
    if (payload && canOpenChoicesOnStep(payload.step)) {
      state.choiceOverlay = {
        sceneId: targetScene.id,
        stepId: payload.step.id
      };
    }
  } else {
    state.choiceOverlay = null;
  }
}

function applyChoice(choice, originScene) {
  const hadTarget = Boolean(choice.targetScene || choice.targetStep);
  runAction(choice, originScene);
  const activeScene = getActiveScene();
  if (!hadTarget && activeScene) {
    const payload = getCurrentStepPayload(activeScene);
    if (payload) {
      const next = findAdjacentStepIndex(activeScene, payload.index, 1);
      if (next >= 0) {
        setSceneCursor(activeScene.id, activeScene.steps[next].id);
      }
    }
  }
  state.choiceOverlay = null;
  renderAll();
}

function renderMode() {
  const isPlay = state.mode === "play";
  dom.modeToggle.textContent = isPlay ? "Режим: Проигрывание" : "Режим: Редактор";
  dom.modeHint.textContent = isPlay
    ? "Память очищена. Двигайся главными кнопками, выборы открываются справа."
    : "Тяни объекты мышкой. Позиция и размер для ПК/телефона редактируются отдельно.";
}

function renderPreviewDevice() {
  const isPhone = state.previewDevice === "phone";
  dom.stageWrap.classList.toggle("phone", isPhone);
  dom.desktopTab.classList.toggle("active", !isPhone);
  dom.mobileTab.classList.toggle("active", isPhone);
}

function renderAll() {
  renderMode();
  renderPreviewDevice();
  renderSceneList();
  renderSceneFields();
  renderCharacterEditor();
  renderTextEditor();
  renderButtonEditor();
  renderStepEditor();
  renderPreview();
  saveState();
}
function setCurrentScene(sceneId) {
  const scene = getSceneById(sceneId);
  if (!scene) return;
  state.currentSceneId = scene.id;
  state.choiceOverlay = null;
  ensureSceneCursor(scene);
}

function addScene() {
  const nextId = "scene-" + (state.scenes.length + 1);
  const id = state.scenes.some((scene) => scene.id === nextId) ? uid("scene") : nextId;
  const scene = createScene(id);
  state.scenes.push(scene);
  state.stepCursorByScene[scene.id] = scene.steps[0].id;
  setCurrentScene(scene.id);
  if (state.mode === "play") {
    state.playSceneId = scene.id;
  }
  renderAll();
}

function clearSceneTargets(sceneId) {
  for (const scene of state.scenes) {
    for (const button of scene.buttons) {
      if (button.targetScene === sceneId) {
        button.targetScene = "";
      }
    }
    for (const step of scene.steps) {
      for (const choice of step.choices) {
        if (choice.targetScene === sceneId) {
          choice.targetScene = "";
        }
      }
    }
  }
}

function removeScene(sceneId) {
  if (state.scenes.length <= 1) return;
  state.scenes = state.scenes.filter((scene) => scene.id !== sceneId);
  delete state.stepCursorByScene[sceneId];
  clearSceneTargets(sceneId);

  if (!getSceneById(state.currentSceneId)) {
    state.currentSceneId = state.scenes[0].id;
  }
  if (!getSceneById(state.playSceneId)) {
    state.playSceneId = state.currentSceneId;
  }

  renderAll();
}

function renameSceneId(scene, nextValue) {
  const cleaned = cleanId(nextValue);
  if (!cleaned) return;
  if (cleaned !== scene.id && state.scenes.some((s) => s.id === cleaned)) return;

  const oldId = scene.id;
  scene.id = cleaned;

  if (state.currentSceneId === oldId) state.currentSceneId = cleaned;
  if (state.playSceneId === oldId) state.playSceneId = cleaned;

  if (state.stepCursorByScene[oldId]) {
    state.stepCursorByScene[cleaned] = state.stepCursorByScene[oldId];
    delete state.stepCursorByScene[oldId];
  }

  for (const item of state.scenes) {
    for (const button of item.buttons) {
      if (button.targetScene === oldId) button.targetScene = cleaned;
    }
    for (const step of item.steps) {
      for (const choice of step.choices) {
        if (choice.targetScene === oldId) choice.targetScene = cleaned;
      }
    }
  }
}

function updateStepTargetReferences(sceneId, oldStepId, newStepId) {
  for (const ownerScene of state.scenes) {
    for (const button of ownerScene.buttons) {
      const effectiveScene = button.targetScene || ownerScene.id;
      if (effectiveScene === sceneId && button.targetStep === oldStepId) {
        button.targetStep = newStepId;
      }
    }
    for (const step of ownerScene.steps) {
      for (const choice of step.choices) {
        const effectiveScene = choice.targetScene || ownerScene.id;
        if (effectiveScene === sceneId && choice.targetStep === oldStepId) {
          choice.targetStep = newStepId;
        }
      }
    }
  }
}

function renameStepId(scene, step, nextValue) {
  const cleaned = cleanId(nextValue);
  if (!cleaned) return;
  if (cleaned !== step.id && scene.steps.some((item) => item.id === cleaned)) return;

  const oldId = step.id;
  step.id = cleaned;
  if (state.stepCursorByScene[scene.id] === oldId) {
    state.stepCursorByScene[scene.id] = cleaned;
  }
  updateStepTargetReferences(scene.id, oldId, cleaned);
}

function clearStepTargetReferences(sceneId, stepId) {
  for (const ownerScene of state.scenes) {
    for (const button of ownerScene.buttons) {
      const effectiveScene = button.targetScene || ownerScene.id;
      if (effectiveScene === sceneId && button.targetStep === stepId) {
        button.targetStep = "";
      }
    }
    for (const step of ownerScene.steps) {
      for (const choice of step.choices) {
        const effectiveScene = choice.targetScene || ownerScene.id;
        if (effectiveScene === sceneId && choice.targetStep === stepId) {
          choice.targetStep = "";
        }
      }
    }
  }
}

function getCardIndex(target) {
  const card = target.closest(".card");
  if (!card) return -1;
  const index = Number(card.dataset.index);
  return Number.isFinite(index) ? index : -1;
}

function handleCharacterEditorEvent(event) {
  const index = getCardIndex(event.target);
  if (index < 0) return;

  const scene = getCurrentScene();
  const char = scene.characters[index];
  if (!char) return;
  const layoutDevice = currentLayoutDevice();

  if (event.target.dataset.action === "remove") {
    scene.characters.splice(index, 1);
    renderAll();
    return;
  }

  if (event.target.dataset.action === "clear-image") {
    char.image = "";
    renderAll();
    return;
  }

  if (!event.target.name || event.type === "click") return;

  if (event.target.name === "imageFile") {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    readFileAsDataUrl(file)
      .then((url) => {
        char.image = url;
        renderAll();
      })
      .catch(() => {});
    return;
  }

  const value = event.target.value;
  if (event.target.name === "x" || event.target.name === "y") {
    setLayoutNumber(
      char,
      event.target.name,
      event.target.name === "x" ? "phoneX" : "phoneY",
      value,
      event.target.name === "x" ? 50 : 86,
      0,
      100,
      layoutDevice
    );
  } else if (event.target.name === "scale") {
    setLayoutNumber(char, "scale", "phoneScale", value, 100, 20, 340, layoutDevice);
  } else if (event.target.name === "z") {
    char.z = clamp(normNumber(value, char.z), 1, 99);
  } else {
    char[event.target.name] = value;
  }

  if (event.type === "input") {
    renderPreview();
    saveState();
  } else {
    renderAll();
  }
}

function handleTextEditorEvent(event) {
  const index = getCardIndex(event.target);
  if (index < 0) return;

  const scene = getCurrentScene();
  const text = scene.texts[index];
  if (!text) return;
  const layoutDevice = currentLayoutDevice();

  if (event.target.dataset.action === "remove") {
    scene.texts.splice(index, 1);
    renderAll();
    return;
  }

  if (!event.target.name || event.type === "click") return;
  const value = event.target.value;

  if (event.target.name === "x" || event.target.name === "y") {
    setLayoutNumber(
      text,
      event.target.name,
      event.target.name === "x" ? "phoneX" : "phoneY",
      value,
      event.target.name === "x" ? 50 : 20,
      0,
      100,
      layoutDevice
    );
  } else if (event.target.name === "size") {
    setLayoutNumber(text, "size", "phoneSize", value, 28, 12, 160, layoutDevice);
  } else if (event.target.name === "z") {
    text.z = clamp(normNumber(value, text.z), 1, 99);
  } else {
    text[event.target.name] = value;
  }

  if (event.type === "input") {
    renderPreview();
    saveState();
  } else {
    renderAll();
  }
}
function handleButtonEditorEvent(event) {
  const index = getCardIndex(event.target);
  if (index < 0) return;

  const scene = getCurrentScene();
  const button = scene.buttons[index];
  if (!button) return;
  const layoutDevice = currentLayoutDevice();

  if (event.target.dataset.action === "remove") {
    scene.buttons.splice(index, 1);
    renderAll();
    return;
  }

  if (event.target.dataset.action === "clear-image") {
    button.image = "";
    renderAll();
    return;
  }

  if (!event.target.name || event.type === "click") return;

  if (event.target.name === "imageFile") {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    readFileAsDataUrl(file)
      .then((url) => {
        button.image = url;
        renderAll();
      })
      .catch(() => {});
    return;
  }

  if (event.target.name === "openChoices") {
    button.openChoices = Boolean(event.target.checked);
    renderPreview();
    saveState();
    return;
  }

  const value = event.target.value;
  if (event.target.name === "x" || event.target.name === "y") {
    setLayoutNumber(
      button,
      event.target.name,
      event.target.name === "x" ? "phoneX" : "phoneY",
      value,
      event.target.name === "x" ? 50 : 72,
      0,
      100,
      layoutDevice
    );
  } else if (event.target.name === "scale") {
    setLayoutNumber(button, "scale", "phoneScale", value, 100, 20, 340, layoutDevice);
  } else if (event.target.name === "z") {
    button.z = clamp(normNumber(value, button.z), 1, 99);
  } else if (event.target.name === "targetScene" || event.target.name === "targetStep") {
    button[event.target.name] = cleanId(value);
  } else {
    button[event.target.name] = value;
  }

  if (event.type === "input") {
    renderPreview();
    saveState();
  } else {
    renderAll();
  }
}

function handleStepEditorEvent(event) {
  const stepCard = event.target.closest(".step-card");
  if (!stepCard) return;

  const scene = getCurrentScene();
  const stepIndex = Number(stepCard.dataset.stepIndex);
  const step = scene.steps[stepIndex];
  if (!step) return;

  if (event.target.dataset.action === "remove-step") {
    if (scene.steps.length === 1) {
      scene.steps[0] = createStep();
      setSceneCursor(scene.id, scene.steps[0].id);
    } else {
      const removedStepId = step.id;
      scene.steps.splice(stepIndex, 1);
      clearStepTargetReferences(scene.id, removedStepId);
      if (state.stepCursorByScene[scene.id] === removedStepId) {
        setSceneCursor(scene.id, scene.steps[0].id);
      }
    }
    renderAll();
    return;
  }

  if (event.target.dataset.action === "add-choice") {
    step.choices.push(createChoice());
    renderAll();
    return;
  }

  const choiceCard = event.target.closest(".choice-card");
  if (choiceCard) {
    const choiceIndex = Number(choiceCard.dataset.choiceIndex);
    const choice = step.choices[choiceIndex];
    if (!choice) return;

    if (event.target.dataset.action === "remove-choice") {
      step.choices.splice(choiceIndex, 1);
      renderAll();
      return;
    }

    if (!event.target.name || event.type === "click") return;
    const value = event.target.value;
    if (event.target.name === "choiceTargetScene" || event.target.name === "choiceTargetStep") {
      choice[event.target.name === "choiceTargetScene" ? "targetScene" : "targetStep"] = cleanId(value);
    } else if (event.target.name === "choiceLabel") {
      choice.label = value;
    } else if (event.target.name === "choiceSetKey") {
      choice.setKey = value.trim();
    } else if (event.target.name === "choiceSetValue") {
      choice.setValue = value;
    }

    if (event.type === "input") {
      renderPreview();
      saveState();
    } else {
      renderAll();
    }
    return;
  }

  if (!event.target.name || event.type === "click") return;
  if (event.target.name === "stepChoicePoint") {
    step.isChoicePoint = Boolean(event.target.checked);
    renderPreview();
    saveState();
    return;
  }
  const value = event.target.value;
  if (event.target.name === "stepId") {
    renameStepId(scene, step, value);
    renderAll();
    return;
  }

  if (event.target.name === "stepText") {
    step.text = value;
  } else if (event.target.name === "stepReqKey") {
    step.requiredKey = value.trim();
  } else if (event.target.name === "stepReqValue") {
    step.requiredValue = value;
  }

  if (event.type === "input") {
    renderPreview();
    saveState();
  } else {
    renderAll();
  }
}

function setPreviewDevice(device) {
  const next = device === "phone" ? "phone" : "desktop";
  if (state.previewDevice === next) return;
  state.previewDevice = next;
  renderAll();
}

function toggleMode() {
  if (state.mode === "editor") {
    state.mode = "play";
    state.playSceneId = state.currentSceneId;
    state.memory = {};
    state.choiceOverlay = null;
    const scene = getSceneById(state.playSceneId);
    if (scene && scene.steps.length > 0) {
      setSceneCursor(scene.id, scene.steps[0].id);
    }
  } else {
    state.mode = "editor";
    state.choiceOverlay = null;
  }
  renderAll();
}

function pointerToStagePercent(event) {
  const rect = dom.stage.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  return {
    x: clamp(x, 0, 100),
    y: clamp(y, 0, 100)
  };
}

function clampPositionForKind(kind, x, y) {
  if (kind === "character") {
    return {
      x: clamp(x, 2, 98),
      y: clamp(y, 10, 100)
    };
  }
  return {
    x: clamp(x, 0, 100),
    y: clamp(y, 0, 100)
  };
}

function getObjectByKind(scene, kind, objId) {
  if (!scene) return null;
  if (kind === "character") return scene.characters.find((item) => item.id === objId) || null;
  if (kind === "text") return scene.texts.find((item) => item.id === objId) || null;
  if (kind === "button") return scene.buttons.find((item) => item.id === objId) || null;
  return null;
}

function applyLiveStyle(kind, element, object) {
  if (!element || !object) return;
  if (kind === "character") applyCharacterStyle(element, object);
  if (kind === "text") applyTextStyle(element, object);
  if (kind === "button") applyButtonStyle(element, object);
}

function stopInteraction(forceRender) {
  if (!interaction.active) return;
  interaction.active = false;
  interaction.pointerId = null;
  interaction.kind = "";
  interaction.objId = "";
  interaction.mode = "";
  interaction.startStageX = 0;
  interaction.startStageY = 0;
  interaction.element = null;
  if (forceRender) renderAll();
}

function setupStageInteractions() {
  dom.stage.addEventListener("pointerdown", (event) => {
    if (state.mode !== "editor") return;
    if (event.button !== 0) return;

    const handle = event.target.closest(".resize-handle");
    const objectEl = handle
      ? handle.parentElement.closest(".stage-object.editable")
      : event.target.closest(".stage-object.editable");
    if (!objectEl) return;

    const scene = getActiveScene();
    const kind = objectEl.dataset.kind;
    const objId = objectEl.dataset.objId;
    const object = getObjectByKind(scene, kind, objId);
    if (!object) return;

    state.selectedObject = { kind, id: objId };
    interaction.active = true;
    interaction.pointerId = event.pointerId;
    interaction.kind = kind;
    interaction.objId = objId;
    interaction.mode = handle ? "scale" : "move";
    interaction.startX = event.clientX;
    interaction.startY = event.clientY;
    const layoutDevice = currentLayoutDevice();
    const startPos = pointerToStagePercent(event);
    interaction.startStageX = startPos.x;
    interaction.startStageY = startPos.y;
    if (kind === "character") {
      interaction.originX = getLayoutNumber(object.x, object.phoneX, 50, 0, 100, layoutDevice);
      interaction.originY = getLayoutNumber(object.y, object.phoneY, 86, 0, 100, layoutDevice);
      interaction.originScale = getLayoutNumber(object.scale, object.phoneScale, 100, 20, 340, layoutDevice);
      interaction.originSize = 28;
    } else if (kind === "text") {
      interaction.originX = getLayoutNumber(object.x, object.phoneX, 50, 0, 100, layoutDevice);
      interaction.originY = getLayoutNumber(object.y, object.phoneY, 20, 0, 100, layoutDevice);
      interaction.originScale = 100;
      interaction.originSize = getLayoutNumber(object.size, object.phoneSize, 28, 12, 160, layoutDevice);
    } else {
      interaction.originX = getLayoutNumber(object.x, object.phoneX, 50, 0, 100, layoutDevice);
      interaction.originY = getLayoutNumber(object.y, object.phoneY, 72, 0, 100, layoutDevice);
      interaction.originScale = getLayoutNumber(object.scale, object.phoneScale, 100, 20, 340, layoutDevice);
      interaction.originSize = 28;
    }
    interaction.element = objectEl;

    dom.stage.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  dom.stage.addEventListener("pointermove", (event) => {
    if (!interaction.active || interaction.pointerId !== event.pointerId) return;

    const scene = getActiveScene();
    const object = getObjectByKind(scene, interaction.kind, interaction.objId);
    if (!object) return;
    const layoutDevice = currentLayoutDevice();

    if (interaction.mode === "move") {
      const pos = pointerToStagePercent(event);
      const deltaX = pos.x - interaction.startStageX;
      const deltaY = pos.y - interaction.startStageY;
      const targetX = interaction.originX + deltaX;
      const targetY = interaction.originY + deltaY;
      const clampedPos = clampPositionForKind(interaction.kind, targetX, targetY);
      if (interaction.kind === "character") {
        setLayoutNumber(object, "x", "phoneX", clampedPos.x, 50, 0, 100, layoutDevice);
        setLayoutNumber(object, "y", "phoneY", clampedPos.y, 86, 0, 100, layoutDevice);
      } else if (interaction.kind === "text") {
        setLayoutNumber(object, "x", "phoneX", clampedPos.x, 50, 0, 100, layoutDevice);
        setLayoutNumber(object, "y", "phoneY", clampedPos.y, 20, 0, 100, layoutDevice);
      } else {
        setLayoutNumber(object, "x", "phoneX", clampedPos.x, 50, 0, 100, layoutDevice);
        setLayoutNumber(object, "y", "phoneY", clampedPos.y, 72, 0, 100, layoutDevice);
      }
    } else {
      const delta = event.clientX - interaction.startX - (event.clientY - interaction.startY);
      const ratio = 1 + delta / 220;
      if (interaction.kind === "text") {
        setLayoutNumber(object, "size", "phoneSize", interaction.originSize * ratio, 28, 12, 160, layoutDevice);
      } else {
        setLayoutNumber(object, "scale", "phoneScale", interaction.originScale * ratio, 100, 20, 340, layoutDevice);
      }
    }

    applyLiveStyle(interaction.kind, interaction.element, object);
    saveState();
  });

  dom.stage.addEventListener("pointerup", (event) => {
    if (!interaction.active || interaction.pointerId !== event.pointerId) return;
    stopInteraction(true);
  });

  dom.stage.addEventListener("pointercancel", () => stopInteraction(true));

  dom.stage.addEventListener(
    "wheel",
    (event) => {
      if (state.mode !== "editor") return;
      const objectEl = event.target.closest(".stage-object.editable");
      if (!objectEl) return;

      const scene = getActiveScene();
      const kind = objectEl.dataset.kind;
      const objId = objectEl.dataset.objId;
      const object = getObjectByKind(scene, kind, objId);
      if (!object) return;
      const layoutDevice = currentLayoutDevice();

      event.preventDefault();
      const delta = event.deltaY < 0 ? 6 : -6;

      if (kind === "text") {
        const baseSize = getLayoutNumber(object.size, object.phoneSize, 28, 12, 160, layoutDevice);
        setLayoutNumber(object, "size", "phoneSize", baseSize + delta, 28, 12, 160, layoutDevice);
      } else {
        const baseScale = getLayoutNumber(object.scale, object.phoneScale, 100, 20, 340, layoutDevice);
        setLayoutNumber(object, "scale", "phoneScale", baseScale + delta, 100, 20, 340, layoutDevice);
      }

      state.selectedObject = { kind, id: objId };
      renderAll();
    },
    { passive: false }
  );
}
function createExportHtml(project) {
  const payload = JSON.stringify(project).replace(/</g, "\\u003c");
  const css = "body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0e141b;color:#e5edf6;font-family:Rubik,sans-serif}.stage-wrap{width:min(1200px,calc(100% - 2rem))}.stage{position:relative;overflow:hidden;width:100%;aspect-ratio:16/9;border-radius:16px;border:1px solid #325071;background:#151f2f}.stage-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.vn-character{position:absolute;transform-origin:bottom center}.vn-character img{display:block;max-height:72vh;max-width:46vw}.vn-text{position:absolute;font-family:'PT Serif',serif;text-shadow:0 2px 5px rgba(0,0,0,.5);max-width:82%;line-height:1.28;z-index:32}.vn-button{position:absolute;border:1px solid #49698e;border-radius:10px;padding:.48rem .7rem;background:rgba(12,26,38,.9);color:#d3eeff;font-size:.9rem;cursor:pointer;z-index:40}.vn-button img{width:150px;height:56px;object-fit:cover;border-radius:8px}.dialog-box{position:absolute;left:12%;right:12%;bottom:3.2%;min-height:80px;background:rgba(10,17,25,.82);border:1px solid #436080;border-radius:14px;padding:.9rem 1rem;z-index:44}.dialog-box p{margin:0;font-family:'PT Serif',serif;font-size:1.04rem;color:#ecf4ff}.main-nav-btn{position:absolute;bottom:3.5%;width:108px;min-height:66px;border:1px solid #4a6e96;border-radius:14px;background:rgba(15,26,39,.95);color:#def3ff;font-size:.95rem;font-weight:600;cursor:pointer;z-index:52}.main-nav-btn.left{left:2.8%}.main-nav-btn.right{right:2.8%}.main-nav-btn img{width:100%;height:100%;object-fit:cover;border-radius:12px}.choice-dim{position:absolute;inset:0;background:rgba(3,8,12,.58);z-index:70}.choice-modal{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(520px,90%);border-radius:14px;border:1px solid #4d6b8f;background:rgba(14,21,31,.95);padding:1rem;z-index:82;display:grid;gap:.55rem}.choice-title{margin:0 0 .35rem;font-size:1rem;color:#dbeaff}.choice-option{border:1px solid #4c6f93;border-radius:11px;background:#1d2d40;color:#e4f2ff;text-align:left;font-size:.92rem;padding:.66rem .75rem;cursor:pointer}.empty{border:1px dashed #46617c;border-radius:10px;padding:.6rem;text-align:center;color:#8f9fb3;font-size:.85rem}.error{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)}@media (max-width:900px),(orientation:portrait){.stage-wrap{width:min(430px,calc(100% - 1rem))}.stage{aspect-ratio:9/16;max-height:92vh}}";

  const runtime = `
(function(){
var stage=document.getElementById('stage');
var project={};
try{project=JSON.parse((document.getElementById('vn-data')||{}).textContent||'{}')}catch(e){stage.innerHTML='<div class="error">Ошибка чтения данных</div>';return}
var scenes=Array.isArray(project.scenes)?project.scenes:[];
if(!scenes.length){stage.innerHTML='<div class="error">Нет сцен</div>';return}
var state={sceneId:project.startSceneId||scenes[0].id,stepByScene:{},memory:{},choice:null};
function esc(t){return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#39;')}
function anim(v){if(v==='fade')return'anim-fade';if(v==='left')return'anim-left';if(v==='right')return'anim-right';if(v==='pop')return'anim-pop';return''}
function clamp(v,min,max){v=Number(v);if(!isFinite(v))v=min;return Math.min(max,Math.max(min,v))}
function isPhone(){return window.matchMedia('(max-width: 900px), (orientation: portrait)').matches}
function pick(base,mobile,min,max,def){var b=clamp(base==null?def:base,min,max);if(!isPhone())return b;if(mobile==null||mobile==='')return b;return clamp(mobile,min,max)}
function sceneById(id){for(var i=0;i<scenes.length;i++){if(scenes[i].id===id)return scenes[i]}return scenes[0]}
function pass(step){if(!step||!step.requiredKey)return true;var val=state.memory[step.requiredKey];return String(val==null?'':val)===String(step.requiredValue||'')}
function ensureCursor(scene){var cur=state.stepByScene[scene.id];if(cur){for(var i=0;i<scene.steps.length;i++){if(scene.steps[i].id===cur)return cur}}cur=scene.steps[0]?scene.steps[0].id:'';state.stepByScene[scene.id]=cur;return cur}
function stepPayload(scene){if(!scene||!Array.isArray(scene.steps)||!scene.steps.length)return null;var cur=ensureCursor(scene);var idx=0;for(var i=0;i<scene.steps.length;i++){if(scene.steps[i].id===cur){idx=i;break}}if(!pass(scene.steps[idx])){for(var j=0;j<scene.steps.length;j++){if(pass(scene.steps[j])){idx=j;state.stepByScene[scene.id]=scene.steps[j].id;break}}}return{step:scene.steps[idx],index:idx}}
function findStep(scene,start,dir){var i=start+(dir>=0?1:-1);while(i>=0&&i<scene.steps.length){if(pass(scene.steps[i]))return i;i+=dir>=0?1:-1}return-1}
function tpl(t){return String(t||'').replace(/\\{\\{\\s*([a-zA-Z0-9а-яА-ЯёЁ_-]+)\\s*\\}\\}/g,function(_,k){var v=state.memory[k];return v==null?'':String(v)})}
function canChoice(step){return !!(step&&step.isChoicePoint!==false&&step.choices&&step.choices.length)}
function applyAction(a,origin){if(!a||!origin)return;if(a.setKey)state.memory[a.setKey]=a.setValue||'1';var target=origin;if(a.targetScene){target=sceneById(a.targetScene);if(target)state.sceneId=target.id}if(a.targetStep&&target&&Array.isArray(target.steps)){for(var i=0;i<target.steps.length;i++){if(target.steps[i].id===a.targetStep){state.stepByScene[target.id]=target.steps[i].id;break}}}else if(target&&target.steps&&target.steps[0]){ensureCursor(target)}if(a.openChoices){var p=stepPayload(target);if(p&&canChoice(p.step)){state.choice={sceneId:target.id,stepId:p.step.id}}}else{state.choice=null}}
function applyChoice(c,origin){var hasTarget=Boolean(c.targetScene||c.targetStep);applyAction(c,origin);var sc=sceneById(state.sceneId);if(!hasTarget){var p=stepPayload(sc);if(p){var next=findStep(sc,p.index,1);if(next>=0)state.stepByScene[sc.id]=sc.steps[next].id}}state.choice=null;render()}
`;
  const runtime2 = `
function render(){
stage.innerHTML='';var scene=sceneById(state.sceneId);if(!scene){stage.innerHTML='<div class="error">Сцена не найдена</div>';return}
if(scene.background){var bg=document.createElement('img');bg.className='stage-bg';bg.src=scene.background;bg.alt='Фон';stage.appendChild(bg)}
var chars=Array.isArray(scene.characters)?scene.characters.slice():[];chars.sort(function(a,b){return(a.z||10)-(b.z||10)});chars.forEach(function(ch){var n=document.createElement('div');n.className='vn-character '+anim(ch.animation||'none');n.style.left=pick(ch.x,ch.phoneX,0,100,50)+'%';n.style.top=pick(ch.y,ch.phoneY,0,100,86)+'%';n.style.zIndex=String(20+clamp(ch.z||10,1,99));n.style.transform='translate(-50%,-100%) scale('+pick(ch.scale,ch.phoneScale,20,340,100)/100+')';if(ch.image){var i=document.createElement('img');i.src=ch.image;i.alt=ch.name||'Персонаж';n.appendChild(i)}stage.appendChild(n)})
var texts=Array.isArray(scene.texts)?scene.texts.slice():[];texts.sort(function(a,b){return(a.z||20)-(b.z||20)});texts.forEach(function(tx){var n=document.createElement('div');n.className='vn-text '+anim(tx.animation||'none');n.style.left=pick(tx.x,tx.phoneX,0,100,50)+'%';n.style.top=pick(tx.y,tx.phoneY,0,100,20)+'%';n.style.transform='translate(-50%,-50%)';n.style.color=tx.color||'#ffffff';n.style.fontSize=pick(tx.size,tx.phoneSize,12,160,28)+'px';n.style.zIndex=String(30+clamp(tx.z||20,1,99));n.textContent=tx.content||'';stage.appendChild(n)})
var buttons=Array.isArray(scene.buttons)?scene.buttons.slice():[];buttons.sort(function(a,b){return(a.z||30)-(b.z||30)});buttons.forEach(function(bt){var n=document.createElement('button');n.type='button';n.className='vn-button '+anim(bt.animation||'none');n.style.left=pick(bt.x,bt.phoneX,0,100,50)+'%';n.style.top=pick(bt.y,bt.phoneY,0,100,72)+'%';n.style.transform='translate(-50%,-50%) scale('+pick(bt.scale,bt.phoneScale,20,340,100)/100+')';n.style.zIndex=String(40+clamp(bt.z||30,1,99));if(bt.image){var i=document.createElement('img');i.src=bt.image;i.alt=bt.label||'Кнопка';n.appendChild(i)}else{n.textContent=bt.label||'Кнопка'}n.onclick=function(){applyAction(bt,scene);render()};stage.appendChild(n)})
var p=stepPayload(scene);var step=p?p.step:null;var idx=p?p.index:0;
if(step){var box=document.createElement('div');box.className='dialog-box';box.innerHTML='<p>'+esc(tpl(step.text)).replace(/\\n/g,'<br>')+'</p>';stage.appendChild(box)}
`;
  const runtime3 = `
var left=document.createElement('button');left.type='button';left.className='main-nav-btn left';if(scene.ui&&scene.ui.leftImage){var li=document.createElement('img');li.src=scene.ui.leftImage;li.alt=scene.ui.leftLabel||'Назад';left.appendChild(li)}else{left.textContent=(scene.ui&&scene.ui.leftLabel)||'Назад'}left.onclick=function(){state.choice=null;var prev=findStep(scene,idx,-1);if(prev>=0){state.stepByScene[scene.id]=scene.steps[prev].id;render()}};stage.appendChild(left)
var right=document.createElement('button');right.type='button';right.className='main-nav-btn right';if(scene.ui&&scene.ui.rightImage){var ri=document.createElement('img');ri.src=scene.ui.rightImage;ri.alt=scene.ui.rightLabel||'Далее';right.appendChild(ri)}else{right.textContent=(scene.ui&&scene.ui.rightLabel)||'Далее'}right.onclick=function(){if(canChoice(step)){state.choice={sceneId:scene.id,stepId:step.id};render();return}var next=findStep(scene,idx,1);if(next>=0){state.stepByScene[scene.id]=scene.steps[next].id;render()}};stage.appendChild(right)
if(state.choice&&state.choice.sceneId===scene.id&&step&&state.choice.stepId===step.id){var dim=document.createElement('div');dim.className='choice-dim';dim.onclick=function(){state.choice=null;render()};stage.appendChild(dim);var modal=document.createElement('div');modal.className='choice-modal';modal.innerHTML='<h3 class="choice-title">Сделайте выбор</h3>';if(!step.choices||!step.choices.length){var e=document.createElement('div');e.className='empty';e.textContent='Вариантов пока нет';modal.appendChild(e)}else{step.choices.forEach(function(c){var o=document.createElement('button');o.type='button';o.className='choice-option';o.textContent=c.label||'Вариант';o.onclick=function(){applyChoice(c,scene)};modal.appendChild(o)})}stage.appendChild(modal)}
}
render();
window.addEventListener('resize',render);
})();
`;

  const runtimeAll = runtime + runtime2 + runtime3;
  return `<!doctype html><html lang="ru"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Визуальная новелла</title><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin /><link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&family=PT+Serif:wght@400;700&display=swap" rel="stylesheet" /><style>${css}</style></head><body><div class="stage-wrap"><div id="stage" class="stage"></div></div><script id="vn-data" type="application/json">${payload}</script><script>${runtimeAll}</script></body></html>`;
}

function exportStandalone() {
  const project = {
    scenes: state.scenes,
    startSceneId: state.currentSceneId
  };
  const html = createExportHtml(project);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "vn-final.html";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(link.href);
}
function setupEvents() {
  dom.addSceneBtn.addEventListener("click", addScene);
  dom.modeToggle.addEventListener("click", toggleMode);
  dom.exportBtn.addEventListener("click", exportStandalone);
  dom.desktopTab.addEventListener("click", () => setPreviewDevice("desktop"));
  dom.mobileTab.addEventListener("click", () => setPreviewDevice("phone"));

  dom.sceneList.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-id]");
    if (removeButton) {
      removeScene(removeButton.dataset.removeId);
      return;
    }

    const sceneItem = event.target.closest("[data-scene-id]");
    if (!sceneItem) return;
    setCurrentScene(sceneItem.dataset.sceneId);
    renderAll();
  });

  dom.sceneId.addEventListener("change", () => {
    const scene = getCurrentScene();
    if (!scene) return;
    renameSceneId(scene, dom.sceneId.value);
    renderAll();
  });

  dom.sceneTitle.addEventListener("input", () => {
    const scene = getCurrentScene();
    if (!scene) return;
    scene.title = dom.sceneTitle.value;
    renderSceneList();
    saveState();
  });

  dom.sceneBackgroundFile.addEventListener("change", () => {
    const scene = getCurrentScene();
    const file = dom.sceneBackgroundFile.files && dom.sceneBackgroundFile.files[0];
    if (!scene || !file) return;
    readFileAsDataUrl(file)
      .then((url) => {
        scene.background = url;
        dom.sceneBackgroundFile.value = "";
        renderAll();
      })
      .catch(() => {});
  });

  dom.clearBackgroundBtn.addEventListener("click", () => {
    const scene = getCurrentScene();
    if (!scene) return;
    scene.background = "";
    renderAll();
  });

  dom.mainLeftLabel.addEventListener("input", () => {
    const scene = getCurrentScene();
    if (!scene) return;
    scene.ui.leftLabel = dom.mainLeftLabel.value;
    renderPreview();
    saveState();
  });

  dom.mainRightLabel.addEventListener("input", () => {
    const scene = getCurrentScene();
    if (!scene) return;
    scene.ui.rightLabel = dom.mainRightLabel.value;
    renderPreview();
    saveState();
  });

  dom.mainLeftImageFile.addEventListener("change", () => {
    const scene = getCurrentScene();
    const file = dom.mainLeftImageFile.files && dom.mainLeftImageFile.files[0];
    if (!scene || !file) return;
    readFileAsDataUrl(file)
      .then((url) => {
        scene.ui.leftImage = url;
        dom.mainLeftImageFile.value = "";
        renderAll();
      })
      .catch(() => {});
  });

  dom.mainRightImageFile.addEventListener("change", () => {
    const scene = getCurrentScene();
    const file = dom.mainRightImageFile.files && dom.mainRightImageFile.files[0];
    if (!scene || !file) return;
    readFileAsDataUrl(file)
      .then((url) => {
        scene.ui.rightImage = url;
        dom.mainRightImageFile.value = "";
        renderAll();
      })
      .catch(() => {});
  });

  dom.addCharacterBtn.addEventListener("click", () => {
    const scene = getCurrentScene();
    scene.characters.push(createCharacter());
    renderAll();
  });

  dom.addTextBtn.addEventListener("click", () => {
    const scene = getCurrentScene();
    scene.texts.push(createTextBlock());
    renderAll();
  });

  dom.addButtonBtn.addEventListener("click", () => {
    const scene = getCurrentScene();
    scene.buttons.push(createSceneButton());
    renderAll();
  });

  dom.addStepBtn.addEventListener("click", () => {
    const scene = getCurrentScene();
    const step = createStep();
    scene.steps.push(step);
    setSceneCursor(scene.id, step.id);
    renderAll();
  });

  dom.characterEditor.addEventListener("input", handleCharacterEditorEvent);
  dom.characterEditor.addEventListener("change", handleCharacterEditorEvent);
  dom.characterEditor.addEventListener("click", handleCharacterEditorEvent);

  dom.textEditor.addEventListener("input", handleTextEditorEvent);
  dom.textEditor.addEventListener("change", handleTextEditorEvent);
  dom.textEditor.addEventListener("click", handleTextEditorEvent);

  dom.buttonEditor.addEventListener("input", handleButtonEditorEvent);
  dom.buttonEditor.addEventListener("change", handleButtonEditorEvent);
  dom.buttonEditor.addEventListener("click", handleButtonEditorEvent);

  dom.stepEditor.addEventListener("input", handleStepEditorEvent);
  dom.stepEditor.addEventListener("change", handleStepEditorEvent);
  dom.stepEditor.addEventListener("click", handleStepEditorEvent);

  setupStageInteractions();
}

setupEvents();
renderAll();
