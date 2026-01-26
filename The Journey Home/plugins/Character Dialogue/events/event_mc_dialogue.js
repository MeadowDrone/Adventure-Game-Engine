// Plugin
export const id = "EVENT_DIALOGUE_MC_NEW";
export const groups = ["EVENT_GROUP_DIALOGUE"];
export const name = "Dialogue - MC";

// Portrait
var normalCharsWide = "あÑÑÑÑÒ\nàááááâ\nàááááâ\nàááááâ\nàááááâ\nðñòòòò";

var normalChars = "あÑÒ\nàáâ\nðñò";
var smileChars = "ÓÔÕ\nおえå\nóôõ";
var expressionlessChars = "Ö×Ø\næçè\nö÷ø";
var blushChars = "ÙÚÛ\néêë\nùúû";
var fifthChars = "ÜÝÞ\nìíî\nüýþ"

export const avatarOrientation = "left";
export const avatarX = 1;
export const avatarY = 1;
export const avatarWidth = 7;

// Text
export const textSpeed = 3;
export const fontPrefix = "\\002\\001";

// Name Tag
export const nameTag = fontPrefix + "ÀÁÂÃ";
export const nameX = 16;

// UI
export const paletteName = "1324742a-e662-4182-9ee2-970af8c3cd6f";

// Event Box
export const fields = [].concat(
  [
    {
      key: "text",
      type: "textarea",
      placeholder: "Text...",
      multiple: true,
      defaultValue: "",
      flexBasis: "100%",
    },
    {
      key: "portraitType",
      label: "Portrait",
      type: "select",
      options: [
        ["normal", "Normal"],
        ["smile", "Smile"],
        ["expressionless", "Expressionless"],
        ["blush", "Blush"],
      ],
      defaultValue: "normal",
    },
  ],
);

export const compile = (input, helpers) => {
  const { textDialogue, _getMemInt8, _addComment, _stackPushConst, _stackPop, _set, getVariableAlias, paletteSetUI} = helpers;
  _addComment("Dialogue - MC");
  _stackPushConst(0);
  _getMemInt8(".ARG0", "text_draw_speed")
  _set(getVariableAlias("T2"), ".ARG0");
  _stackPop(1);
  paletteSetUI(paletteName);

  var avatarMap = {
    normal: normalCharsWide,
    smile: smileChars,
    expressionless: expressionlessChars,
    blush: blushChars,
  };
  var avatarChars = fontPrefix + avatarMap[input.portraitType];

  // Add new line characters
  input.text.forEach((e, i) => {
    if (i === input.text.length - 1) return;
    input.text[i] += "\n".repeat(
      Math.max((avatarChars.match(/\n/g) || []).length - (e.match(/\n/g) || []).length, 0)
    );
  });

  // Pad extra new lines to enforce dialog height
  input.text.forEach((e, i) => {
    var newLineCount = input.text[i].split("\n").length;
    while(newLineCount < 4) {
      input.text[i] += "\n";
      newLineCount += 1;
    }
  });

  // Replace new lines with octant codes
  [...avatarChars.matchAll(/\n/g)].forEach((e, i) => {
    avatarChars = avatarChars.replace(
      "\n",
      `\\003\\${oct(avatarX)}\\${oct(avatarY + i + 1)}`
    );
  });

  // Select font by prepending prefix
  input.text[0] = fontPrefix + input.text[0];

  // Display dialog
  textDialogue(
    input.text.map(
      (e) =>
        `\\001\\001\\003\\${oct(nameX)}\\001${nameTag}\\003\\${oct(
          avatarX
        )}\\${oct(avatarY)}${avatarChars}\\003\\${oct(
          avatarOrientation == "left" ? avatarWidth + avatarX : 2
        )}\\002\\001\\${oct(textSpeed)}${e || " "}`
    )
  );
};

module.exports = {
  id,
  name,
  groups,
  fields,
  compile,
  waitUntilAfterInitFade: true,
};

// Convert to octant code
const oct = num => ((256 + (num % 256)) % 256).toString(8).padStart(3, "0");
