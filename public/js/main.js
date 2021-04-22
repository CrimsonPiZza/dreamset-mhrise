const JsonURLS = {
  Head: "Data/Head.json",
  Torso: "Data/Torso.json",
  Arms: "Data/Arms.json",
  Waist: "Data/Waist.json",
  Legs: "Data/Legs.json",
  Skills: "Data/Skills.json",
  Decos: "Data/Decorations.json",
};

const Decoration_Level_IMG = [
  "Assets/deco1.png",
  "Assets/deco2.png",
  "Assets/deco3.png",
];

let Jsons = {};

let charmTable;

let ResultSkills = {
  Weapon: {},
  Head: {},
  Torso: {},
  Arms: {},
  Waist: {},
  Legs: {},
  Charm: {},
  HeadDeco: {},
  TorsoDeco: {},
  ArmsDeco: {},
  WaistDeco: {},
  LegsDeco: {},
  CharmDeco: {},
  WeaponDeco: {},
};

// Utilities

async function fetchJson(name) {
  hasKey = name in Jsons;
  if (!hasKey) {
    return fetch(JsonURLS[name]).then((response) => {
      Jsons[name] = response.json();
      return Jsons[name];
    });
  }
  return Jsons[name];
}

async function getJson(name, isCharm) {
  if (typeof isCharm != undefined && isCharm != true) {
    return fetchJson(name);
  }
  return getCharmJson();
}

function getCharmJson() {
  let charmJsonString = localStorage.getItem("charms", "");
  if (
    charmJsonString == null ||
    charmJsonString == "" ||
    typeof charmJsonString == undefined
  )
    return {};
  return JSON.parse(charmJsonString);
}

function setCharmJson(charmJson) {
  localStorage.setItem("charms", JSON.stringify(charmJson));
}

function removeCharm(charmName) {
  let charms = getCharmJson();
  delete charms[charmName];
  setCharmJson(charms);
}

function decorationSlotStringify(slots) {
  if (Object.keys(slots).length == 0) return `0`;
  if (Object.keys(slots).length == 1) return `${slots["Slot_1"]}`;
  if (Object.keys(slots).length == 2)
    return `${slots["Slot_1"]} - ${slots["Slot_2"]}`;
  if (Object.keys(slots).length == 3)
    return `${slots["Slot_1"]} - ${slots["Slot_2"]} - ${slots["Slot_3"]}`;
}

function parseDecorationSlots(slots) {
  let decoSlots = {};
  if (slots[0] == "0") {
    return decoSlots;
  } else decoSlots["Slot_1"] = parseInt(slots[0]);
  if (slots[1] == "0") {
    return decoSlots;
  } else decoSlots["Slot_2"] = parseInt(slots[1]);
  if (slots[2] == "0") {
    return decoSlots;
  } else decoSlots["Slot_3"] = parseInt(slots[2]);
  return decoSlots;
}

async function injectSkillToSkillsDisplayer(displayer, skill) {
  const SkillJson = await getJson("Skills");
  let div = document.createElement("div");
  div.setAttribute(
    "class",
    "input-group input-group-sm mb-3 col-md-6 col-sm-12 w-auto mx-auto"
  );
  //   Switch color depends on if the skill is at max level or not
  let span = document.createElement("span");
  span.setAttribute(
    "class",
    skill[1] >= SkillJson[skill[0]]["Max_Level"]
      ? "input-group-text text-success fw-bold"
      : "input-group-text text-danger fw-bold"
  );
  span.textContent = skill[1];

  let input = document.createElement("input");
  input.setAttribute("class", "form-control");
  input.setAttribute("disabled", "");
  input.setAttribute("value", skill[0]);

  div.appendChild(span);
  div.appendChild(input);
  displayer.appendChild(div);
}

async function injectOptionToSelector(selector, value, item) {
  let option = document.createElement("option");
  option.setAttribute("value", value);
  option.textContent = item;
  selector.appendChild(option);
}

async function injectDecoInputToDecoSelector(
  displayer,
  selectorId,
  decorationSlots,
  isCharm
) {
  const DecoJson = await getJson("Decos");
  Object.entries(decorationSlots).forEach((slot) => {
    const Slot_Name = slot[0];
    const Slot_Level = slot[1];

    let mainDiv = document.createElement("div");
    mainDiv.setAttribute("class", "mt-2 d-flex");

    let innerDiv_1 = document.createElement("div");
    innerDiv_1.setAttribute("class", "me-2");

    let innerDiv_2 = document.createElement("div");
    innerDiv_2.setAttribute("class", "flex-grow-1");

    let img = document.createElement("img");
    img.setAttribute("width", "31px");
    img.setAttribute("src", Decoration_Level_IMG[Slot_Level - 1]);

    let select = document.createElement("select");
    select.setAttribute("style", "width: 100%;");
    select.setAttribute("class", "form-select form-select-sm");
    select.setAttribute(
      "id",
      `${selectorId.replace("PieceSelector", "")}DecoSelector_${Slot_Name}`
    );

    // Injecting Options
    injectOptionToSelector(select, "None", "None");
    Object.entries(DecoJson).forEach((deco) => {
      const Deco_Name = deco[0];
      const Deco_Level = deco[1]["Level"];
      const Deco_Skill = deco[1]["Skill"];
      if (Slot_Level >= Deco_Level) {
        injectOptionToSelector(
          select,
          Deco_Name,
          Deco_Skill + ` - ${Deco_Level}`
        );
      }
    });

    innerDiv_1.appendChild(img);
    innerDiv_2.appendChild(select);

    mainDiv.appendChild(innerDiv_1);
    mainDiv.appendChild(innerDiv_2);

    displayer.appendChild(mainDiv);

    $(
      `#${selectorId.replace("PieceSelector", "")}DecoSelector_${Slot_Name}`
    ).on("select2:select", () => {
      onNewDecoSelected(
        selectorId
          .replace(selectorId.charAt(0), selectorId.charAt(0).toUpperCase())
          .replace("PieceSelector", ""),
        isCharm
      );
    });

    $(
      `#${selectorId.replace("PieceSelector", "")}DecoSelector_${Slot_Name}`
    ).select2();
  });

  // img.setAttribute()
  // <div class="mt-2 d-flex">
  //   <div class="me-2">
  //     <img
  //       width="31"
  //       src="https://cdn.kiranico.net/file/kiranico/mhrise-web/images/ui/deco3.png"
  //       alt=""
  //     />
  //   </div>
  //   <div class="flex-grow-1">
  //     <select
  //       style="width: 100%;"
  //       class="form-select form-select-sm"
  //       aria-label=".form-select-sm example"
  //     >
  //       <option selected>Open this select menu</option>
  //       <option value="1">Ones</option>
  //       <option value="2">Two</option>
  //       <option value="3">Three</option>
  //     </select>
  //   </div>
  // </div>;
}

function injectCharmToCharmTable(charmName, charmSkills, decorationSlots) {
  //const table = $("#charmTable")
  charmTable.row
    .add([
      charmName,
      charmSkills[0],
      charmSkills[1],
      charmSkills[2],
      decorationSlots,
    ])
    .draw();
}

// Functional

async function showPieceSelectionItems(selectorId, pieceName, isCharm) {
  let PieceSelector = document.getElementById(selectorId);
  PieceSelector.textContent = "";
  const Json = await getJson(pieceName, isCharm);
  Object.entries(Json).forEach((item) => {
    injectOptionToSelector(PieceSelector, item[0], item[0]);
  });
  await onNewPieceSelected(selectorId, pieceName, isCharm);
}

async function onNewPieceSelected(selectorId, pieceName, isCharm) {
  const PieceSelector = document.getElementById(selectorId);
  const selectedItem = PieceSelector.value;
  const Json = await getJson(pieceName, isCharm);
  const pieceDetail = await Json[selectedItem];
  let PieceSkillsDisplayer = document.getElementById(
    selectorId.replace("PieceSelector", "") + "SkillsDisplayer"
  );
  let PieceDecorationsDisplayer = document.getElementById(
    selectorId.replace("PieceSelector", "") + "DecorationsDisplayer"
  );

  PieceSkillsDisplayer.innerHTML = "";
  PieceDecorationsDisplayer.innerHTML = "";

  ResultSkills[pieceName] = {};
  ResultSkills[pieceName + "Deco"] = {};
  if (selectedItem == "") {
    await displaySetResult();
    return;
  }
  if (pieceDetail["Skills"].length <= 0) {
    return;
  }
  Object.entries(pieceDetail["Skills"]).forEach((skill) => {
    const Skill_Name = skill[0];
    const Skill_Level = parseInt(skill[1]);
    if (ResultSkills[pieceName][Skill_Name] === undefined) {
      ResultSkills[pieceName][Skill_Name] = Skill_Level;
    } else {
      ResultSkills[pieceName][Skill_Name] += Skill_Level;
    }
  });

  injectDecoInputToDecoSelector(
    PieceDecorationsDisplayer,
    selectorId,
    pieceDetail["Decoration_Slots"],
    isCharm
  );

  await displaySelectedPieceDetails(pieceName, PieceSkillsDisplayer);
}

async function onNewDecoSelected(pieceName, isCharm) {
  const DecoJson = await getJson("Decos");
  const DecoSelectors = document.querySelectorAll(
    `[id^='${pieceName.toLowerCase()}DecoSelector_Slot']`
  );
  //await onNewPieceSelected(pieceName.toLowerCase()+"PieceSelector", pieceName, isCookie)
  ResultSkills[pieceName + "Deco"] = {};
  DecoSelectors.forEach((selector) => {
    const selectedJewel = selector.value;
    if (
      selectedJewel == "None" ||
      typeof selectedItem == undefined ||
      typeof selectedItem == null
    )
      return;

    const selectedSkill = DecoJson[selectedJewel]["Skill"];

    if (ResultSkills[pieceName + "Deco"][selectedSkill] === undefined) {
      ResultSkills[pieceName + "Deco"][selectedSkill] = 1;
    } else {
      ResultSkills[pieceName + "Deco"][selectedSkill] += 1;
    }
  });

  let PieceSkillsDisplayer = document.getElementById(
    pieceName.toLowerCase() + "SkillsDisplayer"
  );

  PieceSkillsDisplayer.innerHTML = "";

  await displaySelectedPieceDetails(pieceName, PieceSkillsDisplayer);
}

async function displaySelectedPieceDetails(pieceName, PieceSkillsDisplayer) {
  const SkillFromPiece = ResultSkills[pieceName];
  const SkillFromDeco = ResultSkills[pieceName + "Deco"];
  let totalSkill = {};
  Object.entries(SkillFromPiece).forEach((skill) => {
    if (skill[0] == "null") return;
    if (totalSkill[skill[0]] === undefined) {
      totalSkill[skill[0]] = skill[1];
    } else {
      totalSkill[skill[0]] += skill[1];
    }
  });
  Object.entries(SkillFromDeco).forEach((skill) => {
    if (skill[0] == "null") return;
    if (totalSkill[skill[0]] === undefined) {
      totalSkill[skill[0]] = skill[1];
    } else {
      totalSkill[skill[0]] += skill[1];
    }
  });

  Object.entries(totalSkill).forEach((skill) => {
    injectSkillToSkillsDisplayer(PieceSkillsDisplayer, skill);
  });

  await displaySetResult();
}

async function displaySetResult() {
  let setResultSkillDisplayer = document.getElementById(
    "setresultSkillDisplayer"
  );
  setResultSkillDisplayer.innerHTML = "";
  let totalSkill = {};

  Object.entries(ResultSkills).forEach((item) => {
    Object.entries(item[1]).forEach((skill) => {
      if (totalSkill[skill[0]] === undefined) {
        totalSkill[skill[0]] = skill[1];
      } else {
        totalSkill[skill[0]] += skill[1];
      }
    });
  });

  // Extra step just to make sure the skill is being display at the correct sorting order
  const SkillJson = await getJson("Skills");
  Object.entries(SkillJson).forEach((skill) => {
    //logMe(skill[0])
    if (totalSkill[skill[0]] == undefined) return;
    injectSkillToSkillsDisplayer(setResultSkillDisplayer, [
      skill[0],
      totalSkill[skill[0]],
    ]);
  });
  //logMe(totalSkill)
}

function displayCharmsToTable() {
  const charmJSON = getCharmJson();
  charmTable.clear().draw();
  Object.entries(charmJSON).forEach((charm) => {
    const charmName = charm[0];
    const charmDetails = Object.entries(charm[1]);
    let decorationSlots = charmDetails[0][1];
    decorationSlots = decorationSlotStringify(decorationSlots);
    const charmSkills = ["", "", ""];
    for (i = 0; i < Object.keys(charmDetails[1][1]).length; i++) {
      const skillName = Object.keys(charmDetails[1][1])[i];
      charmSkills[i] = skillName + " - " + charmDetails[1][1][skillName];
    }
    injectCharmToCharmTable(charmName, charmSkills, decorationSlots);
  });
}

async function initCharmMaker() {
  const selectors = document.querySelectorAll(
    "[id^='charmMakingSkillSelector']"
  );
  const JsonSkill = await getJson("Skills");
  selectors.forEach((selector) => {
    injectOptionToSelector(selector, "None", "None");
  });
  Object.entries(JsonSkill).forEach((skill) => {
    injectOptionToSelector(selectors[0], skill[0], skill[0]);
    injectOptionToSelector(selectors[1], skill[0], skill[0]);
    injectOptionToSelector(selectors[2], skill[0], skill[0]);
  });
  $("[id^='charmMakingSkillSelector']").select2();
}

async function createCharm(name, skills, slots) {
  let charms = getCharmJson();
  if (charms[name] != undefined) return alert("Charm's name must be unique");

  let slotsJson = {};
  for (var i = 0; i < slots.length; i++) {
    let slot = slots.charAt(i);
    if (slot == "0") {
      break;
    }
    if (slot != "1" && slot != "2" && slot != "3") {
      break;
    }
    slotsJson[`Slot_${i + 1}`] = parseInt(slot);
  }
  const charmSkills = ["", "", ""];
  for (i = 0; i < Object.keys(skills).length; i++) {
    const skillName = Object.keys(skills)[i];
    charmSkills[i] = skillName + " - " + skills[skillName];
  }
  charms[name] = {};
  charms[name]["Decoration_Slots"] = slotsJson;
  charms[name]["Skills"] = skills;

  //let charmPieceSelector = document.getElementById("charmPieceSelector");

  injectCharmToCharmTable(
    name,
    charmSkills,
    decorationSlotStringify(slotsJson)
  );

  setCharmJson(charms);
  await showPieceSelectionItems("charmPieceSelector", "Charm", true);
  alert(`${name} charm is created as successfully!`);
}

async function onNewWeaponSelected() {
  let weaponSlotSelector = document.getElementById("weaponSlotSelector");
  let weaponDecorationDisplayer = document.getElementById(
    "weaponDecorationsDisplayer"
  );
  let decorationSlots = parseDecorationSlots(weaponSlotSelector.value);
  weaponDecorationDisplayer.innerHTML = "";
  injectDecoInputToDecoSelector(
    weaponDecorationDisplayer,
    "weaponPieceSelector",
    decorationSlots
  );
}

async function main() {
  await showPieceSelectionItems("headPieceSelector", "Head");
  await showPieceSelectionItems("torsoPieceSelector", "Torso");
  await showPieceSelectionItems("armsPieceSelector", "Arms");
  await showPieceSelectionItems("waistPieceSelector", "Waist");
  await showPieceSelectionItems("legsPieceSelector", "Legs");
  await showPieceSelectionItems("charmPieceSelector", "Charm", true);
  await displayCharmsToTable();
  await onNewWeaponSelected();
  $("[id$='Selector']").select2();
  await initCharmMaker();
}

$(document).ready(async function () {
  charmTable = $("#charmTable").DataTable({
    columnDefs: [
      {
        targets: -1,
        data: null,
        defaultContent: `<button type="button" class="btn btn-sm btn-danger"> <span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
      </svg> </span>Delete</button>`,
      },
    ],
  });
  $("#charmTable tbody").on("click", "button", async function () {
    let data = charmTable.row($(this).parents("tr")[0]).data();
    let isMobile = false;
    if (data == undefined) {
      // If in mobile view
      data = charmTable.row($(this).parents("tr")[1]).data();
      isMobile = true;
    }
    let decision = confirm("Are you sure you want to delete this charm?");
    if (decision) {
      removeCharm(data[0]);
      await showPieceSelectionItems("charmPieceSelector", "Charm", true);
      if (isMobile) {
        charmTable.row($(this).parents("tr")[1]).remove().draw();
      } else {
        charmTable.row($(this).parents("tr")[0]).remove().draw();
      }
    }
  });
  await main();
});

$("[id$='PieceSelector']").each((ind, selector) => {
  const id = selector.getAttribute("id");
  $(`#${id}`).on("select2:select", () => {
    const pieceName = id
      .replace(id.charAt(0), id.charAt(0).toUpperCase())
      .replace("PieceSelector", "");
    if (pieceName == "Charm") {
      onNewPieceSelected(id, pieceName, true);
    } else {
      onNewPieceSelected(id, pieceName);
    }
  });
});

$("#weaponSlotSelector").on("select2:select", () => {
  onNewWeaponSelected();
});

document
  .getElementById("createCharmBtn")
  .addEventListener("click", async (e) => {
    let charmName = document.getElementById("charmMakingName").value;

    if (charmName == "") {
      return alert("Charm name can't be empty");
    }
    if (charmName.length > 16) {
      return alert("Charm name must be less then 16 characters");
    }

    let skillSelector1 = document.getElementById("charmMakingSkillSelector1");
    let levelSelector1 = document.getElementById("charmMakingLevelSelector1");
    let skillSelector2 = document.getElementById("charmMakingSkillSelector2");
    let levelSelector2 = document.getElementById("charmMakingLevelSelector2");
    let skillSelector3 = document.getElementById("charmMakingSkillSelector3");
    let levelSelector3 = document.getElementById("charmMakingLevelSelector3");
    let slotSelector = document.getElementById("charmMakingSlotSelector");

    skills = {};
    if (skillSelector1.value != "None" && levelSelector1.value != "0") {
      skills[skillSelector1.value] = parseInt(levelSelector1.value);
    }
    if (
      skillSelector2.value != "None" &&
      levelSelector2.value != "0" &&
      skillSelector2.value != skillSelector1.value
    ) {
      skills[skillSelector2.value] = parseInt(levelSelector2.value);
    }
    if (
      skillSelector3.value != "None" &&
      levelSelector3.value != "0" &&
      skillSelector3.value != skillSelector1.value &&
      skillSelector3.value != skillSelector2.value
    ) {
      skills[skillSelector3.value] = parseInt(levelSelector3.value);
    }

    await createCharm(charmName, skills, slotSelector.value);
  });

// document.getElementById("headPieceSelector").addEventListener("change", (e) => {
//   onNewPieceSelected("headPieceSelector", "Head");
// });
// document
//   .getElementById("torsoPieceSelector")
//   .addEventListener("change", (e) => {
//     onNewPieceSelected("torsoPieceSelector", "Torso");
//   });
// document.getElementById("armsPieceSelector").addEventListener("change", (e) => {
//   onNewPieceSelected("armsPieceSelector", "Arms");
// });
// document
//   .getElementById("waistPieceSelector")
//   .addEventListener("change", (e) => {
//     onNewPieceSelected("waistPieceSelector", "Waist");
//   });
// document.getElementById("legsPieceSelector").addEventListener("change", (e) => {
//   onNewPieceSelected("legsPieceSelector", "Legs");
// });
