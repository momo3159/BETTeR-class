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

const getPanels = () => {
  return document.getElementsByClassName('panel');
};

const isNotTakingLecture = square => {
  const colAttr = square.getAttribute('class');
  return colAttr.indexOf('blank') > -1 || colAttr === 'schedule-table-class_order';
};

const isLectureNameFound = (lectureNamesAndUrls, lectureName) => {
  return lectureNamesAndUrls.find(lectureNamesAndUrl => {
    return lectureNamesAndUrl.name === lectureName;
  });
};

const withinDeadline = (date, deadline) => {
  // format: 2020/12/19 23:57
  const [ymd, t] = deadline.split(' ');
  const [y, m, d] = ymd.split('/');
  const [h, min] = t.split(':');
  const endDate = new Date(y, parseInt(m) - 1, d, h, min);

  return endDate - date > 0;
};

const isNotReportAndQuiz = category => {
  return category.indexOf(REPORT) === -1 && category.indexOf(QUIZ) === -1;
};
const getLectureNamesAndUrls = timeTable => {
  const lectureNamesAndUrls = [];

  // [tr, tr, ..., tr]
  const tableRows = timeTable.children[1].children;
  for (const tableRow of tableRows) {
    const squares = tableRow.children;
    for (const square of squares) {
      if (isNotTakingLecture(square)) {
        continue;
      }

      const lectureName = square.children[0].children[0].innerText;
      const url = square.children[0].children[0].getAttribute('href');

      if (isLectureNameFound(lectureNamesAndUrls, lectureName)) {
        continue;
      }

      lectureNamesAndUrls.push({
        name: lectureName,
        url: BASE + url,
      });
    }
  }

  return lectureNamesAndUrls;
};

const getHomeWorksOfSession = session => {
  // const panelHeader = session.children[0];
  // const panelTitle = panelHeader.children[0].innerText;

  const ItemsOfSession = session.children[1].children;

  const res = [];
  for (const item of ItemsOfSession) {
    const content = item.children[0];
    const contentInfo = content.children[0];
    // const contentDetail = content.children[1]

    const contentCategory = contentInfo.children[1].innerText;
    if (isNotReportAndQuiz(contentCategory)) {
      continue;
    }

    let title = contentInfo.children[0].children[0].innerText;
    if (title === 'New') {
      title = contentInfo.children[0].children[1].innerText;
    }

    const periodOfAvailable = contentInfo.children[2].children[1].innerText;
    const [, deadline] = periodOfAvailable.split(' - ');

    if (withinDeadline(new Date(), deadline)) {
      res.push({
        title,
        deadline,
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
    const lectureInfo = getLectureNamesAndUrls(timeTable);

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
        res.homeworks.push(...getHomeWorksOfSession(panel));
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
