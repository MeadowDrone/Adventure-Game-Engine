// Plugin
export const id = "EVENT_C3_DIALOGUE";
export const groups = ["EVENT_GROUP_DIALOGUE"];
export const name = "Dialogue - Character 3";

// Portrait
/*
Mapping:
Chars:
32 - 47
48 - 63
64 - 79
80 - 95
96 - 111
112 - 127
128 - 143
144 - 159
Portraits:
160 - 175
176 - 191
192 - 207
208 - 223
224 - 239
240 - 255
*/
var normalCharsWide = "あえいおう\nかけきこく\nたてちとつ\nられりろる\nはへひほふ\nばべびぼぶ";

var normalChars = "あÑÒ\nàáâ\nðñò";
var smileChars = "ÓÔÕ\nおえå\nóôõ";
var expressionlessChars = "Ö×Ø\næçè\nö÷ø";
var blushChars = "ÙÚÛ\néêë\nùúû";
var fifthChars = "ÜÝÞ\nìíî\nüýþ"

export const avatarOrientation = "left";
export const avatarX = 1;
export const avatarY = 1;
export const avatarWidth = 6;

// Text
export const textSpeed = 3;
// Font prefix: "\\002\\00x", where x is the font in load order.
// Load order can be forced with a basic dialog: type !F, then load fonts.
export const fontPrefix = "\\002\\003";

// Name Tag
export const nameTag = fontPrefix + "しそす";
export const nameX = 16;

// UI
// Get string from "args": { "palette": "..."} in scene.gbres
export const paletteName = "348c1cc5-4ac3-4a16-b20d-8759f4d80dd7";

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
