export const numberToWords = (function n2w_wrapper(){

let numbers = [	{f : "אפס"}, 	{f : "אחת", m: "אחד"}, 	{f : "שתיים", m: "שניים", fconstruct: "שתי", mconstruct: "שני"},
                {f : "שלוש", m: "שלושה", mconstruct: "שלושת"}, 	{f : "ארבע", m: "ארבעה", mconstruct: "ארבעת"},
                {f : "חמש", m: "חמישה", mconstruct: "חמשת"}, 	{f : "שש", m: "שישה", mconstruct: "ששת"},
                {f : "שבע", m: "שבעה", mconstruct: "שבעת"}, 	{f : "שמונה", mconstruct: "שמונת"},
                {f : "תשע", m: "תשעה", mconstruct: "תשעת"}, 	{f : "עשר", m: "עשרה", mconstruct: "עשרת"}, 	];
let exp = [[""], ["", "", "עשרים", "שלושים", "ארבעים", "חמישים", "שישים", "שבעים", "שמונים", "תשעים"],
          ["", "מאה", "מאתיים", "מאות"],
          ["", "אלף", "אלפיים", "אלפים"],
          [""], [""], ["", "מיליון"], [""], [""], ["", "מיליארד"], [""], [""], ["", "טריליון"]];
let expSuppressNumTxt = [-1, 9, 2, 2, 0, 0, 1, 0, 0, 1, 0, 0, 1];
let expGender = ["", "", "f", "m", "", "", "m", "", "", "m", "", "", "m"];
let expConstructIdx = [null, null, 3, 3, null, null, null, null, null, null, null, null, null]
let expLargeIdx = [null, null, 3, 1, null, null, 1, null, null, 1, null, null, 1]

function getNumObj(n){
  let pos = n.toString().length;
  return (n.toLocaleString("EN-us").split(",")
         .map((seg, i) => {
           pos -= seg.length;
           return (parseInt(seg) > 0 || n === 0 ? ({num: parseInt(seg), digits: splitSeg(parseInt(seg)), pos: pos}) : null)
         }).filter(Boolean));
}

function splitSeg(n, seg=[]){
  let numStr = n.toString()
  if(parseInt(numStr) > 19){
    seg.push({num: parseInt(numStr[0]), pos: numStr.length - 1})
    let numStrNxt = numStr.slice(1)
    if(parseInt(numStrNxt) !== 0) splitSeg(numStr.slice(1), seg)
  }
  else seg.push({num: parseInt(numStr), pos: 0})

  return seg;
}

function getHebrewNumObj(n, gender="f"){
  let numObj = getNumObj(n);
  for(let [i, segObj] of numObj.entries()){
    let andUsed = false;

    if(segObj.num <= expSuppressNumTxt[segObj.pos]){
        segObj.suppressNumTxt = true;
    } else {
      if(segObj.pos === 0){
        segObj.gender = gender;
      }
      else if(segObj.pos === 3 && segObj.num >= 3 && 
        segObj.num <= 10){
        segObj.gender = expGender[segObj.pos] + "construct";
        segObj.constructState = true;
      }
      else{
        segObj.gender = expGender[segObj.pos];
      }
    }

    for(let [j, digObj] of segObj.digits.entries()){
      if(digObj.num <= expSuppressNumTxt[digObj.pos] || segObj.suppressNumTxt){
        digObj.suppressNumTxt = true;
      }

      if(!digObj.suppressNumTxt){
        if(digObj.pos === 0){
          digObj.gender = segObj.gender;
          if(segObj.constructState) digObj.constructState = true;
        }
        else digObj.gender = expGender[digObj.pos];
      }

      if((j === segObj.digits.length - 1 && segObj.digits.length > 1) ||
         (j === segObj.digits.length - 1 && i === numObj.length - 1 && numObj.length > 1 && ! andUsed)){
        digObj.andRequired = true;
        andUsed = true;
      }
    }
  }
  return numObj;
}

function args2Str(...args){
  return args.filter(Boolean).join(" ");
}

function hebrewNumObjToWords(numObj){
  return (numObj.map(segObj => args2Str(segObj.digits.map(hebrewDigitToWords).join(" "),
                                  getExp(segObj.num, segObj.pos, segObj.constructState)))
                .join(" "))
}

function n2w(n, gender="f"){
  let hebrewNumObj = getHebrewNumObj(n, gender);
  //console.log(JSON.stringify(hebrewNumObj, null, 4))
  return hebrewNumObjToWords(hebrewNumObj);
}

function hebrewDigitToWords(digObj){
  let digTxt = digObj.suppressNumTxt ? "" : getNum(digObj.num, digObj.gender)
  let expTxt = getExp(digObj.num, digObj.pos, digObj.constructState);
  return ((digObj.andRequired ? "ו" : "") + args2Str(digTxt, expTxt));
}

function getExp(d, pos, constructState=false){
  let expEntry = exp[pos];
  let expIdx;

  if(constructState) expIdx = expConstructIdx[pos];
  else if(d > expEntry.length - 1) expIdx = expLargeIdx[pos];
  else expIdx = d;

  return expEntry[expIdx];
}

function getNum(n, gender){
  if(n <= 10) return getNum0To10(n, gender);
  else if(n < 20) return getNum11To19(n, gender);
}


function getNum0To10(n, gender="f"){
  return numbers[n][gender] || numbers[n][gender[0]] || numbers[n]["f"]
}

function getNum11To19(n, gender="f"){
  return getNum0To10(n % 10, gender) + " " + getNum0To10(10, gender === "f" ? "m" : "f")
}

return n2w;
})();