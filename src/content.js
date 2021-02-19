import store from './store';
global.browser = require('webextension-polyfill');

const BASE = 'https://eclass.doshisha.ac.jp';
const REPORT = 'レポート';
const QUIZ = '一問一答';

/**
 * e-classのホーム画面を開いている時に
 * 科目名とurlを取得する
 * 取得した値はVuexにlectureInfoとして格納
 */

const getTimeTable = () => {
  return document.getElementById('schedule-table');
};

const isNotTakingLecture = cell => {
  const colAttr = cell.getAttribute('class');
  return colAttr.indexOf('blank') > -1 || colAttr === 'schedule-table-class_order';
};

const isLectureNameNotFound = (lectureNamesAndUrls, lectureName) => {
  return !lectureNamesAndUrls.find(lectureNamesAndUrl => {
    return lectureNamesAndUrl.name === lectureName;
  });
};

// 時間割をパース　-> セルに分割
const parseTimeTable = timeTable => {
  const lectureNamesAndUrls = [];

  // [tr, tr, ..., tr]
  const tableRows = timeTable.children[1].children;
  for (const tableRow of tableRows) {
    const squares = tableRow.children;
    for (const square of squares) {
      if (isNotTakingLecture(square)) {
        continue;
      } else {
        const lectureName = square.children[0].children[0].innerText;
        const url = square.children[0].children[0].getAttribute('href');

        if (isLectureNameNotFound(lectureNamesAndUrls, lectureName)) {
          lectureNamesAndUrls.push({
            name: lectureName,
            url: BASE + url,
          });
        }
      }
    }
  }

  return lectureNamesAndUrls;
};

const getPanels = () => {
  return document.getElementsByClassName('panel');
};

const parseSection = section => {
  const panelHeader = section.children[0];
  // const panelTitle = panelHeader.children[0].innerText;

  const listGroup = section.children[1];
  const listGroupItems = listGroup.children;

  const res = [];
  for (let item of listGroupItems) {
    const content = item.children[0];
    const contentInfo = content.children[0];
    // const contentDetail = content.children[1]

    const contentCategory = contentInfo.children[1].innerText;
    // クイズでもレポートでもないもの
    if (contentCategory.indexOf(REPORT) === -1 && contentCategory.indexOf(QUIZ) === -1) {
      continue;
    }

    let title = contentInfo.children[0].children[0].innerText;

    if (title === 'New') {
      title = contentInfo.children[0].children[1].innerText;
    }
    const periodOfAvailable = contentInfo.children[2].children[1].innerText;
    const [start, end] = periodOfAvailable.split(' - ');

    // TODO: 利用可能期間を過ぎているものは追加しない
    // 2020/12/19 23:57
    const [ymd, t] = end.split(' ');
    const [y, m, d] = ymd.split('/');
    const [h, min] = t.split(':');
    const endDate = new Date(y, parseInt(m) - 1, d, h, min);
    const now = new Date();

    if (endDate - now > 0) {
      res.push({
        title,
        end,
        isDone: false,
      });
    }
  }

  return res;
};

const getPrevBtn = () => {
  const prevBtn = document.querySelector('body > header > nav > div:nth-child(1) > div > div > a.hidden-xs.course-webclass');
  return prevBtn;
};

const main = async () => {
  const items = await browser.storage.local.get(['canParsed', 'alreadyParsed', 'lectureCount']);
  let alreadyParsed = items.alreadyParsed;
  let canParsed = items.canParsed;

  // 時間割をパース ・・・　①
  if (!alreadyParsed && canParsed) {
    // await browser.storage.local.remove('homeworks');
    // await browser.storage.local.set({'homeworks': []})

    const timeTable = getTimeTable();
    const lectureInfo = parseTimeTable(timeTable);

    alreadyParsed = true;
    await browser.storage.local.set({ timetables: lectureInfo });
    await browser.storage.local.set({ lectures: lectureInfo });
    await browser.storage.local.set({ alreadyParsed: true });
    await browser.storage.local.set({ lectureCount: lectureInfo.length });

    const { homeworks } = await browser.storage.local.get('homeworks');
    await browser.storage.local.set({ oldHomeWorks: homeworks });
    await browser.storage.local.set({ homeworks: [] });
  }

  // ページ遷移→課題を取得
  if (alreadyParsed && canParsed) {
    const { beforeGetHW } = await browser.storage.local.get(['beforeGetHW']);

    if (beforeGetHW) {
      const { lectures, lectureCount } = await browser.storage.local.get(['lectures', 'lectureCount']);

      if (lectureCount <= 0) {
        // 終了の処理を記述
        await browser.storage.local.set({ canParsed: false });
        await browser.storage.local.set({ alreadyParsed: false });
        canParsed = false;
        alreadyParsed = false;

        const { homeworks, oldHomeWorks } = await browser.storage.local.get(['homeworks', 'oldHomeWorks']);
        for (let i = 0; i < homeworks.length; i++) {
          const lecName = homeworks[i].lectureName;
          for (let j = 0; j < homeworks[i].homeworks.length; j++) {
            const title = homeworks[i].homeworks[j].title;
            for (let k = 0; k < oldHomeWorks.length; k++) {
              if (oldHomeWorks[k].lectureName !== lecName) {
                continue;
              }
              for (let l = 0; l < oldHomeWorks[k].homeworks.length; l++) {
                if (oldHomeWorks[k].homeworks[l].title !== title) {
                  continue;
                }
                homeworks[i].homeworks[j].isDone = oldHomeWorks[k].homeworks[l].isDone;
              }
            }
          }
        }

        await browser.storage.local.set({ homeworks: homeworks });
        alert('課題一覧の取得が終了しました');
        return;
      } else {
        const lecture = lectures.pop();
        await browser.storage.local.set({ lectures: lectures });
        await browser.storage.local.set({ lectureCount: lectureCount - 1 });
        await browser.storage.local.set({ beforeGetHW: false });

        window.location.href = lecture.url;
      }
    } else {
      // 課題を追加
      const res = {
        lectureName: '',
        homeworks: [],
      };
      let lectureName = document.getElementsByClassName('course-name')[0].innerText;
      res.lectureName = lectureName.substring(1).split(' ')[0];

      const panels = getPanels();
      for (let panel of panels) {
        res.homeworks.push(...parseSection(panel));
      }

      const { homeworks: stragedHomeworks } = await browser.storage.local.get(['homeworks']);
      stragedHomeworks.push(res);

      await browser.storage.local.set({ homeworks: stragedHomeworks });
      await browser.storage.local.set({ beforeGetHW: true });
      const prevBtn = getPrevBtn();
      console.log('残り数' + (await browser.storage.local.get(['lectureCount'])).lectureCount);
      prevBtn.click();
    }
  }
};

main();
