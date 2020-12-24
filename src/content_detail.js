import store from './store'

const REPORT = 'レポート'
const QUIZ = '一問一答'


const getPanels = () => {
  return document.getElementsByClassName("panel");
};

const parsePanel = (panel) => {
  const listGroup = panel.children[1];
  const sections = listGroup.children;

  return sections;
};

const getPrevBtn = () => {
  const prevBtn = document.querySelector("body > header > nav > div:nth-child(1) > div > div > a.hidden-xs.course-webclass");
  return prevBtn
}

const parseSection = section => {
  const content = section.children[0];
  const contentInfo = content.children[0]
  // const contentDetail = content.children[1];
  
  const contentCategory = contentInfo.children[1].innerText;
  // クイズでもレポートでもないもの
  if (    contentCategory.indexOf(REPORT) === -1 
      &&  contentCategory.indexOf(QUIZ) === -1
  ) return;

  const title = contentInfo.children[0].children[0].innerText;
  const periodOfAvailable = contentInfo.children[2].children[1];
  const [start, end] = periodOfAvailable.split(' - ');

  return {
    title,
    start,
    end,
  }
}


const main = async () => {
    const flag = await browser.storage.local.get('canParsed');
    if(flag) {
        const res = [];
        const panels = Array.from(getPanels());
        for (let panel of panels) {
            const sections = parsePanel(panel);
            for (let section of sections) {
            res.push(parseSection(section))
            }
        }

        browser.storage.local.set({'homeworks': res}, function() {
            console.log('homeworks stored')
        })

        const prevBtn = getPrevBtn();
        prevBtn.click();
    }
}

main();

// chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

//   switch(request.message) {
//       case '課題を取得':
//         alert("課題を取得")
//         const res = [];
//         const panels = Array.from(getPanels());
//         for (let panel of panels) {
//             const sections = parsePanel(panel);
//             for (let section of sections) {
//             res.push(parseSection(section))
//             }
//         }
//         console.log(res)
//         sendResponse(res);
//         break;
//       case '戻る':
//           const prevBtn = getPrevBtn();
//           prevBtn.click();
//           sendResponse({})
//           break;
//   }
  
//   return true;
// });


